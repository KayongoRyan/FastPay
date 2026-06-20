import { createHash, randomUUID } from 'crypto';

import {
  ConflictException,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import * as bcrypt from 'bcrypt';
import { Model } from 'mongoose';

import { User, UserDocument } from '@fastpay/schemas';

import {
  AUTH_AUDIT_ACTIONS,
  AuditContext,
} from './audit/audit.constants';
import { AuditLogService } from './audit/audit-log.service';
import { BiometricEnrollDto } from './dto/biometric-enroll.dto';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import {
  JwtAccessPayload,
  JwtRefreshPayload,
} from './interfaces/jwt-payload.interface';
import { LoginRateLimiterService } from './rate-limit/login-rate-limiter.service';

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: string;
}

export interface AuthUserResponse {
  id: string;
  fullName: string;
  phone?: string;
  email?: string;
  kycLevel: number;
  kycStatus: string;
  biometricEnabled: boolean;
  isActive: boolean;
}

@Injectable()
export class AuthService {
  private readonly bcryptRounds: number;
  private readonly accessExpiresIn: string;
  private readonly refreshExpiresIn: string;

  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly rateLimiter: LoginRateLimiterService,
    private readonly auditLog: AuditLogService,
  ) {
    this.bcryptRounds = this.configService.getOrThrow<number>('auth.bcryptRounds');
    this.accessExpiresIn = this.configService.getOrThrow<string>(
      'auth.jwtAccessExpiresIn',
    );
    this.refreshExpiresIn = this.configService.getOrThrow<string>(
      'auth.jwtRefreshExpiresIn',
    );
  }

  async register(
    dto: RegisterDto,
    context?: AuditContext,
  ): Promise<{ user: AuthUserResponse; tokens: AuthTokens }> {
    await this.rateLimiter.assertRegisterAllowed(context?.ipAddress);

    if (!dto.phone && !dto.email) {
      throw new ConflictException('Phone or email is required');
    }

    if (dto.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(dto.email.trim())) {
      throw new ConflictException('Invalid email address');
    }

    const passwordHash = await bcrypt.hash(dto.password, this.bcryptRounds);
    const nationalIdHash = dto.nationalId
      ? this.hashValue(dto.nationalId)
      : undefined;

    try {
      const user = await this.userModel.create({
        fullName: dto.fullName.trim(),
        phone: dto.phone?.trim(),
        email: dto.email?.trim().toLowerCase(),
        passwordHash,
        nationalIdHash,
      });

      const tokens = await this.issueTokens(user);

      await this.auditLog.record({
        action: AUTH_AUDIT_ACTIONS.REGISTER,
        userId: user._id.toString(),
        context,
        details: {
          email: user.email,
          phone: user.phone,
        },
      });

      return { user: this.toAuthUser(user), tokens };
    } catch (error) {
      if (this.isDuplicateKeyError(error)) {
        throw new ConflictException('Phone, email, or national ID already registered');
      }
      throw error;
    }
  }

  async login(
    dto: LoginDto,
    context?: AuditContext,
  ): Promise<{ user: AuthUserResponse; tokens: AuthTokens }> {
    const trimmed = dto.identifier.trim();
    await this.rateLimiter.assertLoginAllowed(trimmed);

    const user = await this.userModel
      .findOne({
        $or: [{ email: trimmed.toLowerCase() }, { phone: trimmed }],
      })
      .select('+passwordHash')
      .exec();

    if (!user?.passwordHash) {
      await this.handleLoginFailure(trimmed, context, 'invalid_credentials');
      throw new UnauthorizedException('Invalid credentials');
    }

    this.assertAccountUsable(user);

    const valid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!valid) {
      await this.handleLoginFailure(trimmed, context, 'invalid_credentials', user._id.toString());
      throw new UnauthorizedException('Invalid credentials');
    }

    await this.rateLimiter.clearLoginFailures(trimmed);

    const tokens = await this.issueTokens(user);

    await this.auditLog.record({
      action: AUTH_AUDIT_ACTIONS.LOGIN_SUCCESS,
      userId: user._id.toString(),
      context,
    });

    return { user: this.toAuthUser(user), tokens };
  }

  async refresh(
    refreshToken: string,
    context?: AuditContext,
  ): Promise<AuthTokens> {
    let payload: JwtRefreshPayload;

    try {
      payload = await this.jwtService.verifyAsync<JwtRefreshPayload>(refreshToken, {
        secret: this.configService.getOrThrow<string>('auth.jwtRefreshSecret'),
      });
    } catch {
      await this.auditLog.record({
        action: AUTH_AUDIT_ACTIONS.REFRESH_FAILED,
        context,
        details: { reason: 'invalid_token' },
      });
      throw new UnauthorizedException('Invalid refresh token');
    }

    if (payload.type !== 'refresh') {
      await this.auditLog.record({
        action: AUTH_AUDIT_ACTIONS.REFRESH_FAILED,
        userId: payload.sub,
        context,
        details: { reason: 'wrong_token_type' },
      });
      throw new UnauthorizedException('Invalid refresh token');
    }

    const user = await this.userModel
      .findById(payload.sub)
      .select('+refreshTokenHash')
      .exec();

    if (!user?.refreshTokenHash) {
      await this.auditLog.record({
        action: AUTH_AUDIT_ACTIONS.REFRESH_FAILED,
        userId: payload.sub,
        context,
        details: { reason: 'no_stored_refresh' },
      });
      throw new UnauthorizedException('Invalid refresh token');
    }

    this.assertAccountUsable(user);

    const tokenHash = this.hashValue(refreshToken);
    if (tokenHash !== user.refreshTokenHash) {
      await this.auditLog.record({
        action: AUTH_AUDIT_ACTIONS.REFRESH_FAILED,
        userId: user._id.toString(),
        context,
        details: { reason: 'hash_mismatch' },
      });
      throw new UnauthorizedException('Invalid refresh token');
    }

    const tokens = await this.issueTokens(user);

    await this.auditLog.record({
      action: AUTH_AUDIT_ACTIONS.REFRESH,
      userId: user._id.toString(),
      context,
    });

    return tokens;
  }

  async logout(userId: string, context?: AuditContext): Promise<{ success: true }> {
    await this.userModel
      .findByIdAndUpdate(userId, { $unset: { refreshTokenHash: 1 } })
      .exec();

    await this.auditLog.record({
      action: AUTH_AUDIT_ACTIONS.LOGOUT,
      userId,
      context,
    });

    return { success: true };
  }

  async enrollBiometric(
    userId: string,
    dto: BiometricEnrollDto,
    context?: AuditContext,
  ): Promise<AuthUserResponse> {
    const user = await this.userModel
      .findByIdAndUpdate(
        userId,
        { biometricEnabled: dto.enabled },
        { new: true },
      )
      .exec();

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    await this.auditLog.record({
      action: AUTH_AUDIT_ACTIONS.BIOMETRIC_ENROLL,
      userId,
      context,
      details: { enabled: dto.enabled },
    });

    return this.toAuthUser(user);
  }

  async getProfile(userId: string): Promise<AuthUserResponse> {
    const user = await this.userModel.findById(userId).exec();
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return this.toAuthUser(user);
  }

  async validateAccessToken(userId: string): Promise<AuthUserResponse> {
    const user = await this.userModel.findById(userId).exec();
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    this.assertAccountUsable(user);
    return this.toAuthUser(user);
  }

  private async handleLoginFailure(
    identifier: string,
    context: AuditContext | undefined,
    reason: string,
    userId?: string,
  ): Promise<void> {
    const result = await this.rateLimiter.recordLoginFailure(identifier);

    await this.auditLog.record({
      action: AUTH_AUDIT_ACTIONS.LOGIN_FAILED,
      userId,
      context,
      details: {
        reason,
        attemptsRemaining: result.attemptsRemaining,
        locked: result.locked,
      },
    });

    if (result.locked) {
      await this.auditLog.record({
        action: AUTH_AUDIT_ACTIONS.LOGIN_LOCKED,
        userId,
        context,
        details: { identifier: this.normalizeIdentifier(identifier) },
      });
    }
  }

  private async issueTokens(user: UserDocument): Promise<AuthTokens> {
    const userId = user._id.toString();
    const accessPayload: JwtAccessPayload = { sub: userId, type: 'access' };
    const refreshPayload: JwtRefreshPayload = {
      sub: userId,
      type: 'refresh',
      jti: randomUUID(),
    };

    const accessExpiresSec = this.parseExpiresIn(this.accessExpiresIn);
    const refreshExpiresSec = this.parseExpiresIn(this.refreshExpiresIn);

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(accessPayload, {
        secret: this.configService.getOrThrow<string>('auth.jwtAccessSecret'),
        expiresIn: accessExpiresSec,
      }),
      this.jwtService.signAsync(refreshPayload, {
        secret: this.configService.getOrThrow<string>('auth.jwtRefreshSecret'),
        expiresIn: refreshExpiresSec,
      }),
    ]);

    user.refreshTokenHash = this.hashValue(refreshToken);
    await user.save();

    return {
      accessToken,
      refreshToken,
      expiresIn: this.accessExpiresIn,
    };
  }

  private assertAccountUsable(user: UserDocument): void {
    if (!user.isActive) {
      throw new ForbiddenException('Account is deactivated');
    }

    if (user.frozenUntil && user.frozenUntil.getTime() > Date.now()) {
      throw new ForbiddenException('Account is temporarily frozen');
    }
  }

  private toAuthUser(user: UserDocument): AuthUserResponse {
    return {
      id: user._id.toString(),
      fullName: user.fullName,
      phone: user.phone,
      email: user.email,
      kycLevel: user.kycLevel,
      kycStatus: user.kycStatus,
      biometricEnabled: user.biometricEnabled,
      isActive: user.isActive,
    };
  }

  private hashValue(value: string): string {
    return createHash('sha256').update(value).digest('hex');
  }

  private normalizeIdentifier(identifier: string): string {
    return identifier.trim().toLowerCase();
  }

  private parseExpiresIn(value: string): number {
    const match = /^(\d+)([smhd])$/.exec(value.trim());
    if (!match) {
      return 900;
    }

    const amount = Number(match[1]);
    switch (match[2]) {
      case 's':
        return amount;
      case 'm':
        return amount * 60;
      case 'h':
        return amount * 3600;
      case 'd':
        return amount * 86400;
      default:
        return 900;
    }
  }

  private isDuplicateKeyError(error: unknown): boolean {
    return (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      (error as { code?: number }).code === 11000
    );
  }
}

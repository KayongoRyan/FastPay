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
  JwtAccessPayload,
  JwtRefreshPayload,
} from './interfaces/jwt-payload.interface';
import { BiometricEnrollDto } from './dto/biometric-enroll.dto';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

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
  ) {
    this.bcryptRounds = this.configService.getOrThrow<number>('auth.bcryptRounds');
    this.accessExpiresIn = this.configService.getOrThrow<string>(
      'auth.jwtAccessExpiresIn',
    );
    this.refreshExpiresIn = this.configService.getOrThrow<string>(
      'auth.jwtRefreshExpiresIn',
    );
  }

  async register(dto: RegisterDto): Promise<{ user: AuthUserResponse; tokens: AuthTokens }> {
    if (!dto.phone && !dto.email) {
      throw new ConflictException('Phone or email is required');
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
      return { user: this.toAuthUser(user), tokens };
    } catch (error) {
      if (this.isDuplicateKeyError(error)) {
        throw new ConflictException('Phone, email, or national ID already registered');
      }
      throw error;
    }
  }

  async login(dto: LoginDto): Promise<{ user: AuthUserResponse; tokens: AuthTokens }> {
    const trimmed = dto.identifier.trim();
    const user = await this.userModel
      .findOne({
        $or: [{ email: trimmed.toLowerCase() }, { phone: trimmed }],
      })
      .select('+passwordHash')
      .exec();

    if (!user?.passwordHash) {
      throw new UnauthorizedException('Invalid credentials');
    }

    this.assertAccountUsable(user);

    const valid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!valid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const tokens = await this.issueTokens(user);
    return { user: this.toAuthUser(user), tokens };
  }

  async refresh(refreshToken: string): Promise<AuthTokens> {
    let payload: JwtRefreshPayload;

    try {
      payload = await this.jwtService.verifyAsync<JwtRefreshPayload>(refreshToken, {
        secret: this.configService.getOrThrow<string>('auth.jwtRefreshSecret'),
      });
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }

    if (payload.type !== 'refresh') {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const user = await this.userModel
      .findById(payload.sub)
      .select('+refreshTokenHash')
      .exec();

    if (!user?.refreshTokenHash) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    this.assertAccountUsable(user);

    const tokenHash = this.hashValue(refreshToken);
    if (tokenHash !== user.refreshTokenHash) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    return this.issueTokens(user);
  }

  async enrollBiometric(
    userId: string,
    dto: BiometricEnrollDto,
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

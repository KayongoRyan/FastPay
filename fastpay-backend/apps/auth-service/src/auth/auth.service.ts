import { createHash, randomUUID } from 'crypto';

import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import * as bcrypt from 'bcrypt';
import { Model } from 'mongoose';

import { User, UserDocument, AccountType } from '@fastpay/schemas';
import { SecurityAlertType } from '@fastpay/schemas';

import {
  AUTH_AUDIT_ACTIONS,
  AuditContext,
} from './audit/audit.constants';
import { AuditLogService } from './audit/audit-log.service';
import { BiometricEnrollDto } from './dto/biometric-enroll.dto';
import { BiometricLoginDto } from './dto/biometric-login.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { RegisterMerchantDto } from './dto/register-merchant.dto';
import {
  JwtAccessPayload,
  JwtRefreshPayload,
} from './interfaces/jwt-payload.interface';
import { LoginRateLimiterService } from './rate-limit/login-rate-limiter.service';
import { BiometricChallengeService } from './rate-limit/biometric-challenge.service';
import { SecurityAlertService } from './security/security-alert.service';
import { SessionService } from './security/session.service';
import { verifyEd25519Signature } from './utils/ed25519.util';
import { WalletClient } from '../clients/wallet.client';
import { MerchantClient } from '../clients/merchant.client';
import { BusinessClient } from '../clients/business.client';
import { RegisterBusinessDto } from './dto/register-business.dto';

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: string;
  sessionId: string;
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
  accountType: AccountType;
  merchantOrgId?: string;
  merchantCode?: string;
  businessName?: string;
  businessOrgId?: string;
  businessCode?: string;
  companyName?: string;
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
    private readonly biometricChallenge: BiometricChallengeService,
    private readonly auditLog: AuditLogService,
    private readonly sessionService: SessionService,
    private readonly securityAlert: SecurityAlertService,
    private readonly walletClient: WalletClient,
    private readonly merchantClient: MerchantClient,
    private readonly businessClient: BusinessClient,
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

      const tokens = await this.issueTokens(user, context);

      await this.auditLog.record({
        action: AUTH_AUDIT_ACTIONS.REGISTER,
        userId: user._id.toString(),
        context,
        details: {
          email: user.email,
          phone: user.phone,
        },
      });

      await this.walletClient.provisionForUser(user._id.toString());

      return { user: this.toAuthUser(user), tokens };
    } catch (error) {
      if (this.isDuplicateKeyError(error)) {
        throw new ConflictException('Phone, email, or national ID already registered');
      }
      throw error;
    }
  }

  async registerMerchant(
    dto: RegisterMerchantDto,
    context?: AuditContext,
  ): Promise<{ user: AuthUserResponse; tokens: AuthTokens }> {
    await this.rateLimiter.assertRegisterAllowed(context?.ipAddress);

    if (!dto.phone && !dto.email) {
      throw new ConflictException('Phone or email is required');
    }

    const passwordHash = await bcrypt.hash(dto.password, this.bcryptRounds);

    try {
      const user = await this.userModel.create({
        fullName: dto.fullName.trim(),
        phone: dto.phone?.trim(),
        email: dto.email?.trim().toLowerCase(),
        passwordHash,
        accountType: AccountType.MERCHANT,
      });

      const org = await this.merchantClient.createOrg({
        ownerUserId: user._id.toString(),
        businessName: dto.businessName.trim(),
        category: dto.category,
        businessEmail: dto.businessEmail?.trim() || dto.email?.trim().toLowerCase(),
        businessPhone: dto.businessPhone?.trim() || dto.phone?.trim(),
        address: dto.address?.trim(),
        city: dto.city?.trim(),
        taxId: dto.taxId?.trim(),
      });

      if (org) {
        user.merchantOrgId = org.orgId;
        await user.save();
      }

      const tokens = await this.issueTokens(user, context);

      await this.auditLog.record({
        action: AUTH_AUDIT_ACTIONS.REGISTER,
        userId: user._id.toString(),
        context,
        details: {
          email: user.email,
          phone: user.phone,
          accountType: AccountType.MERCHANT,
          merchantCode: org?.merchantCode,
        },
      });

      return { user: this.toAuthUser(user, org?.merchantCode, dto.businessName), tokens };
    } catch (error) {
      if (this.isDuplicateKeyError(error)) {
        throw new ConflictException('Phone or email already registered');
      }
      throw error;
    }
  }

  async registerBusiness(
    dto: RegisterBusinessDto,
    context?: AuditContext,
  ): Promise<{ user: AuthUserResponse; tokens: AuthTokens }> {
    await this.rateLimiter.assertRegisterAllowed(context?.ipAddress);

    if (!dto.phone && !dto.email) {
      throw new ConflictException('Phone or email is required');
    }

    const passwordHash = await bcrypt.hash(dto.password, this.bcryptRounds);

    try {
      const user = await this.userModel.create({
        fullName: dto.fullName.trim(),
        phone: dto.phone?.trim(),
        email: dto.email?.trim().toLowerCase(),
        passwordHash,
        accountType: AccountType.BUSINESS,
      });

      const org = await this.businessClient.createOrg({
        ownerUserId: user._id.toString(),
        companyName: dto.companyName.trim(),
        businessType: dto.businessType,
        industry: dto.industry?.trim(),
        companyEmail: dto.companyEmail?.trim() || dto.email?.trim().toLowerCase(),
        companyPhone: dto.companyPhone?.trim() || dto.phone?.trim(),
        address: dto.address?.trim(),
        city: dto.city?.trim(),
        country: dto.country?.trim(),
        taxId: dto.taxId?.trim(),
        registrationNumber: dto.registrationNumber?.trim(),
        website: dto.website?.trim(),
        description: dto.description?.trim(),
      });

      if (org) {
        user.businessOrgId = org.orgId;
        await user.save();
      }

      const tokens = await this.issueTokens(user, context);

      await this.auditLog.record({
        action: AUTH_AUDIT_ACTIONS.REGISTER,
        userId: user._id.toString(),
        context,
        details: {
          email: user.email,
          phone: user.phone,
          accountType: AccountType.BUSINESS,
          businessCode: org?.businessCode,
        },
      });

      return {
        user: this.toAuthUser(
          user,
          undefined,
          undefined,
          org?.businessCode,
          org?.companyName ?? dto.companyName,
        ),
        tokens,
      };
    } catch (error) {
      if (this.isDuplicateKeyError(error)) {
        throw new ConflictException('Phone or email already registered');
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

    const tokens = await this.issueTokens(user, context);

    await this.auditLog.record({
      action: AUTH_AUDIT_ACTIONS.LOGIN_SUCCESS,
      userId: user._id.toString(),
      context,
    });

    await this.securityAlert.create(
      user._id.toString(),
      SecurityAlertType.NEW_LOGIN,
      'New sign-in',
      'Your account was accessed successfully.',
      { ipAddress: context?.ipAddress },
    );

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
    const session = await this.sessionService.validateRefreshSession(
      payload.jti,
      tokenHash,
    );

    const legacyMatch = tokenHash === user.refreshTokenHash;
    if (!session && !legacyMatch) {
      await this.auditLog.record({
        action: AUTH_AUDIT_ACTIONS.REFRESH_FAILED,
        userId: user._id.toString(),
        context,
        details: { reason: 'hash_mismatch' },
      });
      throw new UnauthorizedException('Invalid refresh token');
    }

    const tokens = await this.issueTokens(user, context, payload.jti);

    if (session) {
      await this.sessionService.rotateSession(
        payload.jti,
        tokens.sessionId,
        this.hashValue(tokens.refreshToken),
        context,
      );
    }

    await this.auditLog.record({
      action: AUTH_AUDIT_ACTIONS.REFRESH,
      userId: user._id.toString(),
      context: { ...context, sessionId: tokens.sessionId },
    });

    return tokens;
  }

  async logout(
    userId: string,
    context?: AuditContext,
  ): Promise<{ success: true }> {
    if (context?.sessionId) {
      await this.sessionService.revokeSession(context.sessionId);
    }

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
    if (dto.enabled) {
      if (!dto.deviceId || !dto.publicKey) {
        throw new ConflictException(
          'deviceId and publicKey are required when enabling biometric auth',
        );
      }

      if (Buffer.from(dto.publicKey, 'base64').length !== 32) {
        throw new ConflictException('publicKey must be a base64-encoded Ed25519 key');
      }
    }

    const update = dto.enabled
      ? {
          biometricEnabled: true,
          biometricDeviceId: dto.deviceId,
          biometricPublicKey: dto.publicKey,
        }
      : {
          biometricEnabled: false,
          $unset: { biometricDeviceId: 1, biometricPublicKey: 1 },
        };

    const user = await this.userModel
      .findByIdAndUpdate(userId, update, { new: true })
      .exec();

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    await this.auditLog.record({
      action: AUTH_AUDIT_ACTIONS.BIOMETRIC_ENROLL,
      userId,
      context,
      details: {
        enabled: dto.enabled,
        deviceId: dto.enabled ? dto.deviceId : undefined,
      },
    });

    if (dto.enabled && dto.deviceId && dto.publicKey) {
      await this.sessionService.upsertTrustedDevice({
        userId,
        deviceId: dto.deviceId,
        publicKey: dto.publicKey,
        platform: context?.platform,
      });
      await this.securityAlert.create(
        userId,
        SecurityAlertType.DEVICE_ENROLLED,
        'Biometric device enrolled',
        'A new trusted device was added to your account.',
        { deviceId: dto.deviceId },
      );
    } else if (!dto.enabled && dto.deviceId) {
      await this.sessionService.revokeTrustedDevice(userId, dto.deviceId);
    }

    return this.toAuthUser(user);
  }

  async createBiometricChallenge(deviceId: string): Promise<{
    challenge: string;
    expiresIn: number;
  }> {
    const user = await this.userModel
      .findOne({ biometricDeviceId: deviceId, biometricEnabled: true })
      .exec();

    if (!user?.biometricPublicKey) {
      throw new NotFoundException('Biometric device not enrolled');
    }

    this.assertAccountUsable(user);

    const challenge = await this.biometricChallenge.createChallenge(
      user._id.toString(),
      deviceId,
    );

    return {
      challenge,
      expiresIn: this.biometricChallenge.expiresInSeconds,
    };
  }

  async biometricLogin(
    dto: BiometricLoginDto,
    context?: AuditContext,
  ): Promise<{ user: AuthUserResponse; tokens: AuthTokens }> {
    const user = await this.userModel
      .findOne({ biometricDeviceId: dto.deviceId, biometricEnabled: true })
      .exec();

    if (!user?.biometricPublicKey) {
      await this.auditLog.record({
        action: AUTH_AUDIT_ACTIONS.BIOMETRIC_LOGIN_FAILED,
        context,
        details: { reason: 'device_not_enrolled', deviceId: dto.deviceId },
      });
      throw new UnauthorizedException('Biometric login failed');
    }

    const stored = await this.biometricChallenge.consumeChallenge(dto.deviceId);
    if (!stored || stored.userId !== user._id.toString()) {
      await this.auditLog.record({
        action: AUTH_AUDIT_ACTIONS.BIOMETRIC_LOGIN_FAILED,
        userId: user._id.toString(),
        context,
        details: { reason: 'invalid_or_expired_challenge', deviceId: dto.deviceId },
      });
      throw new UnauthorizedException('Biometric login failed');
    }

    const valid = verifyEd25519Signature(
      user.biometricPublicKey,
      stored.nonce,
      dto.signature,
    );

    if (!valid) {
      await this.auditLog.record({
        action: AUTH_AUDIT_ACTIONS.BIOMETRIC_LOGIN_FAILED,
        userId: user._id.toString(),
        context,
        details: { reason: 'invalid_signature', deviceId: dto.deviceId },
      });
      throw new UnauthorizedException('Biometric login failed');
    }

    this.assertAccountUsable(user);

    const tokens = await this.issueTokens(user, context);

    await this.auditLog.record({
      action: AUTH_AUDIT_ACTIONS.BIOMETRIC_LOGIN_SUCCESS,
      userId: user._id.toString(),
      context,
      details: { deviceId: dto.deviceId },
    });

    return { user: this.toAuthUser(user), tokens };
  }

  async verifyPassword(
    userId: string,
    password: string,
    context?: AuditContext,
  ): Promise<{ verified: true }> {
    const user = await this.userModel
      .findById(userId)
      .select('+passwordHash')
      .exec();

    if (!user?.passwordHash) {
      await this.auditLog.record({
        action: AUTH_AUDIT_ACTIONS.PASSCODE_RESET_FAILED,
        userId,
        context,
        details: { reason: 'no_password' },
      });
      throw new UnauthorizedException('Invalid password');
    }

    this.assertAccountUsable(user);

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      await this.auditLog.record({
        action: AUTH_AUDIT_ACTIONS.PASSCODE_RESET_FAILED,
        userId,
        context,
        details: { reason: 'invalid_password' },
      });
      throw new UnauthorizedException('Invalid password');
    }

    await this.auditLog.record({
      action: AUTH_AUDIT_ACTIONS.PASSCODE_RESET_VERIFY,
      userId,
      context,
    });

    return { verified: true };
  }

  async changePassword(
    userId: string,
    dto: ChangePasswordDto,
    context?: AuditContext,
  ): Promise<{ success: true }> {
    const user = await this.userModel
      .findById(userId)
      .select('+passwordHash')
      .exec();

    if (!user?.passwordHash) {
      throw new UnauthorizedException('Invalid password');
    }

    this.assertAccountUsable(user);

    const valid = await bcrypt.compare(dto.currentPassword, user.passwordHash);
    if (!valid) {
      throw new UnauthorizedException('Invalid password');
    }

    user.passwordHash = await bcrypt.hash(dto.newPassword, this.bcryptRounds);
    await user.save();

    await this.auditLog.record({
      action: AUTH_AUDIT_ACTIONS.PASSWORD_CHANGE,
      userId,
      context,
    });

    return { success: true };
  }

  async freezeAccount(
    userId: string,
    context?: AuditContext,
  ): Promise<{ success: true; frozenUntil: string }> {
    const frozenUntil = new Date(Date.now() + 24 * 60 * 60 * 1000);
    await this.userModel
      .findByIdAndUpdate(userId, { $set: { frozenUntil } })
      .exec();

    await this.sessionService.revokeAllForUser(userId);

    await this.auditLog.record({
      action: AUTH_AUDIT_ACTIONS.ACCOUNT_FREEZE,
      userId,
      context,
      severity: 'critical',
    });

    await this.securityAlert.create(
      userId,
      SecurityAlertType.ACCOUNT_FROZEN,
      'Account frozen',
      'Your account was temporarily frozen for security.',
      { frozenUntil: frozenUntil.toISOString() },
    );

    return { success: true, frozenUntil: frozenUntil.toISOString() };
  }

  async unfreezeAccount(
    userId: string,
    context?: AuditContext,
  ): Promise<{ success: true }> {
    await this.userModel
      .findByIdAndUpdate(userId, { $unset: { frozenUntil: 1 } })
      .exec();

    await this.auditLog.record({
      action: AUTH_AUDIT_ACTIONS.ACCOUNT_UNFREEZE,
      userId,
      context,
    });

    return { success: true };
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

  private async issueTokens(
    user: UserDocument,
    context?: AuditContext,
    rotateFromSessionId?: string,
  ): Promise<AuthTokens> {
    const userId = user._id.toString();
    const sessionId = randomUUID();
    const accessPayload: JwtAccessPayload = {
      sub: userId,
      type: 'access',
      accountType: user.accountType ?? AccountType.CONSUMER,
      ...(user.merchantOrgId ? { merchantOrgId: user.merchantOrgId } : {}),
      ...(user.businessOrgId ? { businessOrgId: user.businessOrgId } : {}),
    };
    const refreshPayload: JwtRefreshPayload = {
      sub: userId,
      type: 'refresh',
      jti: sessionId,
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

    const refreshHash = this.hashValue(refreshToken);
    user.refreshTokenHash = refreshHash;
    await user.save();

    if (!rotateFromSessionId) {
      await this.sessionService.createSession({
        userId,
        sessionId,
        refreshTokenHash: refreshHash,
        context,
      });
    }

    return {
      accessToken,
      refreshToken,
      expiresIn: this.accessExpiresIn,
      sessionId,
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

  private toAuthUser(
    user: UserDocument,
    merchantCode?: string,
    businessName?: string,
    businessCode?: string,
    companyName?: string,
  ): AuthUserResponse {
    return {
      id: user._id.toString(),
      fullName: user.fullName,
      phone: user.phone,
      email: user.email,
      kycLevel: user.kycLevel,
      kycStatus: user.kycStatus,
      biometricEnabled: user.biometricEnabled,
      isActive: user.isActive,
      accountType: user.accountType ?? AccountType.CONSUMER,
      merchantOrgId: user.merchantOrgId,
      merchantCode,
      businessName,
      businessOrgId: user.businessOrgId,
      businessCode,
      companyName,
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

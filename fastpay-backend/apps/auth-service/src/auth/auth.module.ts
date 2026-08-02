import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { PassportModule } from '@nestjs/passport';

import {
  AuditLog,
  AuditLogSchema,
  SecurityAlert,
  SecurityAlertSchema,
  TrustedDevice,
  TrustedDeviceSchema,
  User,
  UserSchema,
  UserSession,
  UserSessionSchema,
} from '@fastpay/schemas';

import authConfig from '../config/auth.config';
import servicesConfig from '../config/services.config';
import { AuditLogService } from './audit/audit-log.service';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './jwt.strategy';
import { BiometricChallengeService } from './rate-limit/biometric-challenge.service';
import { LoginRateLimiterService } from './rate-limit/login-rate-limiter.service';
import { SecurityAlertService } from './security/security-alert.service';
import { SessionService } from './security/session.service';

import { VerificationService } from './verification/verification.service';
import { WalletClient } from '../clients/wallet.client';
import { MerchantClient } from '../clients/merchant.client';
import { BusinessClient } from '../clients/business.client';

@Module({
  imports: [
    ConfigModule.forFeature(authConfig),
    ConfigModule.forFeature(servicesConfig),
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: AuditLog.name, schema: AuditLogSchema },
      { name: UserSession.name, schema: UserSessionSchema },
      { name: TrustedDevice.name, schema: TrustedDeviceSchema },
      { name: SecurityAlert.name, schema: SecurityAlertSchema },
    ]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule.forFeature(authConfig)],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.getOrThrow<string>('auth.jwtAccessSecret'),
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy,
    LoginRateLimiterService,
    BiometricChallengeService,
    AuditLogService,
    VerificationService,
    SessionService,
    SecurityAlertService,
    WalletClient,
    MerchantClient,
    BusinessClient,
  ],
  exports: [AuthService, JwtModule, PassportModule],
})
export class AuthModule {}

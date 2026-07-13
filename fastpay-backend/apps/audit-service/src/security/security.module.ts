import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

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

import { AuthModule } from '../auth/auth.module';
import { AuditController, SecurityController } from './security.controller';
import { SecurityService } from './security.service';

@Module({
  imports: [
    AuthModule,
    MongooseModule.forFeature([
      { name: UserSession.name, schema: UserSessionSchema },
      { name: TrustedDevice.name, schema: TrustedDeviceSchema },
      { name: SecurityAlert.name, schema: SecurityAlertSchema },
      { name: AuditLog.name, schema: AuditLogSchema },
      { name: User.name, schema: UserSchema },
    ]),
  ],
  controllers: [SecurityController, AuditController],
  providers: [SecurityService],
})
export class SecurityModule {}

import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';

import {
  KycDocument,
  KycDocumentSchema,
  User,
  UserSchema,
} from '@fastpay/schemas';

import authConfig from '../config/auth.config';
import { JwtVerifierService } from '../auth/jwt-verifier.service';
import { KycController } from './kyc.controller';
import { KycService } from './kyc.service';

@Module({
  imports: [
    ConfigModule.forFeature(authConfig),
    JwtModule.registerAsync({
      imports: [ConfigModule.forFeature(authConfig)],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.getOrThrow<string>('auth.jwtAccessSecret'),
      }),
    }),
    MongooseModule.forFeature([
      { name: KycDocument.name, schema: KycDocumentSchema },
      { name: User.name, schema: UserSchema },
    ]),
  ],
  controllers: [KycController],
  providers: [KycService, JwtVerifierService],
})
export class KycModule {}

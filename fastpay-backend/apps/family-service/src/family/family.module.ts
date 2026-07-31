import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';

import { FastpayAuthModule } from '@fastpay/common';
import {
  ApprovalRequest,
  ApprovalRequestSchema,
  Family,
  FamilyInvite,
  FamilyInviteSchema,
  FamilyMember,
  FamilyMemberSchema,
  FamilySavingsGoal,
  FamilySavingsGoalSchema,
  FamilySchema,
  SavingsContribution,
  SavingsContributionSchema,
  User,
  UserSchema,
} from '@fastpay/schemas';

import { WalletClient } from '../clients/wallet.client';
import authConfig from '../config/auth.config';
import servicesConfig from '../config/services.config';
import { FamilyAccessService } from './family-access.service';
import { FamilyApprovalService } from './family-approval.service';
import { FamilyMemberService } from './family-member.service';
import { FamilySavingsService } from './family-savings.service';
import { FamilyController } from './family.controller';
import { FamilyService } from './family.service';

@Module({
  imports: [
    ConfigModule.forFeature(authConfig),
    ConfigModule.forFeature(servicesConfig),
    FastpayAuthModule,
    MongooseModule.forFeature([
      { name: Family.name, schema: FamilySchema },
      { name: FamilyMember.name, schema: FamilyMemberSchema },
      { name: FamilyInvite.name, schema: FamilyInviteSchema },
      { name: FamilySavingsGoal.name, schema: FamilySavingsGoalSchema },
      { name: SavingsContribution.name, schema: SavingsContributionSchema },
      { name: ApprovalRequest.name, schema: ApprovalRequestSchema },
      { name: User.name, schema: UserSchema },
    ]),
  ],
  controllers: [FamilyController],
  providers: [
    WalletClient,
    FamilyAccessService,
    FamilyService,
    FamilyMemberService,
    FamilySavingsService,
    FamilyApprovalService,
  ],
})
export class FamilyModule {}

import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';

import { createHealthController } from '@fastpay/common';
import { FastpayMongoModule } from '@fastpay/mongo';
import {
  ApprovalRequest,
  ApprovalRequestSchema,
  Family,
  FamilyMember,
  FamilyMemberSchema,
  FamilySavingsGoal,
  FamilySavingsGoalSchema,
  FamilySchema,
  SavingsContribution,
  SavingsContributionSchema,
} from '@fastpay/schemas';

const HealthController = createHealthController('family-service');

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: ['.env', '../../.env'] }),
    FastpayMongoModule.forRoot(),
    MongooseModule.forFeature([
      { name: Family.name, schema: FamilySchema },
      { name: FamilyMember.name, schema: FamilyMemberSchema },
      { name: FamilySavingsGoal.name, schema: FamilySavingsGoalSchema },
      { name: SavingsContribution.name, schema: SavingsContributionSchema },
      { name: ApprovalRequest.name, schema: ApprovalRequestSchema },
    ]),
  ],
  controllers: [HealthController],
})
export class AppModule {}

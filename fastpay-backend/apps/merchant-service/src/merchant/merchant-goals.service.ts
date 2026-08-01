import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import {
  MerchantGoal,
  MerchantGoalDocument,
  MerchantGoalHorizon,
  MerchantGoalKind,
  MerchantGoalStatus,
} from '@fastpay/schemas';

import { MerchantOrgService } from './merchant-org.service';

@Injectable()
export class MerchantGoalsService {
  constructor(
    @InjectModel(MerchantGoal.name)
    private readonly goalModel: Model<MerchantGoalDocument>,
    private readonly orgService: MerchantOrgService,
  ) {}

  async listGoals(ownerUserId: string) {
    const org = await this.requireOrg(ownerUserId);
    const goals = await this.goalModel
      .find({ merchantOrgId: new Types.ObjectId(org.orgId) })
      .sort({ status: 1, deadline: 1, createdAt: -1 })
      .limit(100)
      .exec();
    return goals.map((g) => this.toView(g));
  }

  async createGoal(
    ownerUserId: string,
    input: {
      title: string;
      description?: string;
      horizon?: MerchantGoalHorizon;
      kind?: MerchantGoalKind;
      targetValue: number;
      currentValue?: number;
      deadline?: string;
    },
  ) {
    const org = await this.requireOrg(ownerUserId);
    if (!Number.isFinite(input.targetValue) || input.targetValue <= 0) {
      throw new BadRequestException('targetValue must be greater than 0');
    }

    const goal = await this.goalModel.create({
      merchantOrgId: new Types.ObjectId(org.orgId),
      title: input.title.trim(),
      description: input.description?.trim(),
      horizon: input.horizon ?? MerchantGoalHorizon.SHORT,
      kind: input.kind ?? MerchantGoalKind.CUSTOM,
      targetValue: input.targetValue,
      currentValue: Math.max(0, input.currentValue ?? 0),
      deadline: input.deadline ? new Date(input.deadline) : undefined,
      status: MerchantGoalStatus.ACTIVE,
    });

    return this.toView(goal);
  }

  async updateGoal(
    ownerUserId: string,
    goalId: string,
    patch: {
      title?: string;
      description?: string;
      horizon?: MerchantGoalHorizon;
      kind?: MerchantGoalKind;
      targetValue?: number;
      currentValue?: number;
      deadline?: string | null;
      status?: MerchantGoalStatus;
    },
  ) {
    const org = await this.requireOrg(ownerUserId);
    const goal = await this.goalModel
      .findOne({
        _id: goalId,
        merchantOrgId: new Types.ObjectId(org.orgId),
      })
      .exec();
    if (!goal) throw new NotFoundException('Goal not found');

    if (patch.title !== undefined) goal.title = patch.title.trim();
    if (patch.description !== undefined) goal.description = patch.description.trim();
    if (patch.horizon !== undefined) goal.horizon = patch.horizon;
    if (patch.kind !== undefined) goal.kind = patch.kind;
    if (patch.targetValue !== undefined) {
      if (patch.targetValue <= 0) {
        throw new BadRequestException('targetValue must be greater than 0');
      }
      goal.targetValue = patch.targetValue;
    }
    if (patch.currentValue !== undefined) {
      goal.currentValue = Math.max(0, patch.currentValue);
    }
    if (patch.deadline !== undefined) {
      goal.deadline =
        patch.deadline === null || patch.deadline === ''
          ? undefined
          : new Date(patch.deadline);
    }
    if (patch.status !== undefined) goal.status = patch.status;

    if (
      goal.status === MerchantGoalStatus.ACTIVE &&
      goal.currentValue >= goal.targetValue
    ) {
      goal.status = MerchantGoalStatus.COMPLETED;
    }

    await goal.save();
    return this.toView(goal);
  }

  async bumpProgress(
    ownerUserId: string,
    goalId: string,
    amount: number,
  ) {
    if (!Number.isFinite(amount) || amount === 0) {
      throw new BadRequestException('Progress amount must be a non-zero number');
    }
    const org = await this.requireOrg(ownerUserId);
    const goal = await this.goalModel
      .findOne({
        _id: goalId,
        merchantOrgId: new Types.ObjectId(org.orgId),
      })
      .exec();
    if (!goal) throw new NotFoundException('Goal not found');
    if (goal.status !== MerchantGoalStatus.ACTIVE) {
      throw new BadRequestException('Only active goals can be updated');
    }

    goal.currentValue = Math.max(0, goal.currentValue + amount);
    if (goal.currentValue >= goal.targetValue) {
      goal.status = MerchantGoalStatus.COMPLETED;
      goal.currentValue = goal.targetValue;
    }
    await goal.save();
    return this.toView(goal);
  }

  private async requireOrg(ownerUserId: string) {
    const org = await this.orgService.getOrgForOwner(ownerUserId);
    if (!org) throw new NotFoundException('Merchant organization not found');
    return org;
  }

  private toView(goal: MerchantGoalDocument) {
    const progressPct =
      goal.targetValue > 0
        ? Math.min(100, Math.round((goal.currentValue / goal.targetValue) * 100))
        : 0;
    return {
      id: goal._id.toString(),
      title: goal.title,
      description: goal.description,
      horizon: goal.horizon,
      kind: goal.kind,
      targetValue: goal.targetValue,
      currentValue: goal.currentValue,
      progressPct,
      deadline: goal.deadline?.toISOString(),
      status: goal.status,
      createdAt: goal.createdAt?.toISOString(),
    };
  }
}

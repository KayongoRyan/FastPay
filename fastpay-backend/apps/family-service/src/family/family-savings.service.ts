import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import {
  FamilySavingsGoal,
  FamilySavingsGoalDocument,
  SavingsContribution,
  SavingsContributionDocument,
  SavingsGoalStatus,
} from '@fastpay/schemas';

import { FamilyAccessService } from './family-access.service';

@Injectable()
export class FamilySavingsService {
  constructor(
    @InjectModel(FamilySavingsGoal.name)
    private readonly goalModel: Model<FamilySavingsGoalDocument>,
    @InjectModel(SavingsContribution.name)
    private readonly contributionModel: Model<SavingsContributionDocument>,
    private readonly access: FamilyAccessService,
  ) {}

  async listGoals(userId: string, familyId: string) {
    await this.access.getActiveMembership(familyId, userId);
    const goals = await this.goalModel
      .find({ familyId: new Types.ObjectId(familyId) })
      .sort({ createdAt: -1 })
      .exec();

    return goals.map((g) => this.toView(g));
  }

  async createGoal(
    userId: string,
    familyId: string,
    input: { name: string; targetAmount: number; token?: string; deadline?: string },
  ) {
    await this.access.getActiveMembership(familyId, userId);

    const goal = await this.goalModel.create({
      familyId: new Types.ObjectId(familyId),
      name: input.name.trim(),
      targetAmount: input.targetAmount,
      token: input.token ?? 'XLM',
      deadline: input.deadline ? new Date(input.deadline) : undefined,
      status: SavingsGoalStatus.ACTIVE,
      currentAmount: 0,
    });

    return this.toView(goal);
  }

  async contribute(
    userId: string,
    familyId: string,
    goalId: string,
    amount: number,
    transactionHash?: string,
  ) {
    await this.access.getActiveMembership(familyId, userId);

    const goal = await this.goalModel
      .findOne({
        _id: new Types.ObjectId(goalId),
        familyId: new Types.ObjectId(familyId),
      })
      .exec();

    if (!goal) {
      throw new NotFoundException('Savings goal not found');
    }
    if (goal.status !== SavingsGoalStatus.ACTIVE) {
      throw new BadRequestException('Goal is not active');
    }

    await this.contributionModel.create({
      goalId: goal._id,
      userId: new Types.ObjectId(userId),
      amount,
      transactionHash,
    });

    goal.currentAmount += amount;
    if (goal.currentAmount >= goal.targetAmount) {
      goal.status = SavingsGoalStatus.COMPLETED;
    }
    await goal.save();

    return this.toView(goal);
  }

  private toView(goal: FamilySavingsGoalDocument) {
    return {
      id: goal._id.toString(),
      familyId: goal.familyId.toString(),
      name: goal.name,
      targetAmount: goal.targetAmount,
      currentAmount: goal.currentAmount,
      token: goal.token,
      deadline: goal.deadline,
      status: goal.status,
      progressPct: Math.min(
        100,
        Math.round((goal.currentAmount / goal.targetAmount) * 100),
      ),
    };
  }
}

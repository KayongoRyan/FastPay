import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import {
  ApprovalRequest,
  ApprovalRequestDocument,
  ApprovalRequestStatus,
  Family,
  FamilyDocument,
  FamilyMember,
  FamilyMemberDocument,
  FamilyRole,
  User,
  UserDocument,
} from '@fastpay/schemas';

import { WalletClient } from '../clients/wallet.client';
import { FamilyAccessService } from './family-access.service';

function startOfMonth(date = new Date()) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function startOfDay(date = new Date()) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

@Injectable()
export class FamilyService {
  constructor(
    @InjectModel(Family.name)
    private readonly familyModel: Model<FamilyDocument>,
    @InjectModel(FamilyMember.name)
    private readonly memberModel: Model<FamilyMemberDocument>,
    @InjectModel(ApprovalRequest.name)
    private readonly approvalModel: Model<ApprovalRequestDocument>,
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
    private readonly access: FamilyAccessService,
    private readonly walletClient: WalletClient,
  ) {}

  async createFamily(userId: string, name: string) {
    const wallet = await this.walletClient.provisionForUser(userId);

    const family = await this.familyModel.create({
      name: name.trim(),
      createdBy: new Types.ObjectId(userId),
      walletAddress: wallet?.publicKey,
    });

    await this.memberModel.create({
      familyId: family._id,
      userId: new Types.ObjectId(userId),
      role: FamilyRole.PARENT,
      spendingLimitMonthly: 500_000,
      requiresApprovalAbove: 0,
    });

    return this.getFamilyDashboard(userId, family._id.toString());
  }

  async listFamilies(userId: string) {
    const memberships = await this.access.listMemberships(userId);
    if (!memberships.length) return [];

    const familyIds = memberships.map((m) => m.familyId);
    const families = await this.familyModel.find({ _id: { $in: familyIds } }).exec();
    const familyMap = new Map(families.map((f) => [f._id.toString(), f]));

    return memberships.map((m) => {
      const family = familyMap.get(m.familyId.toString());
      return {
        id: m.familyId.toString(),
        name: family?.name ?? 'Family',
        role: m.role,
        walletAddress: family?.walletAddress,
      };
    });
  }

  async getFamilyDashboard(userId: string, familyId: string) {
    const membership = await this.access.getActiveMembership(familyId, userId);
    const family = await this.familyModel.findById(familyId).exec();
    if (!family) {
      throw new NotFoundException('Family not found');
    }

    const members = await this.memberModel
      .find({ familyId: family._id, isActive: true })
      .exec();
    const userIds = members.map((m) => m.userId);
    const users = await this.userModel.find({ _id: { $in: userIds } }).exec();
    const userMap = new Map(users.map((u) => [u._id.toString(), u]));

    const monthStart = startOfMonth();
    const dayStart = startOfDay();
    const approved = await this.approvalModel
      .find({
        familyId: family._id,
        status: ApprovalRequestStatus.APPROVED,
        resolvedAt: { $gte: monthStart },
      })
      .exec();

    const memberViews = await Promise.all(
      members.map(async (m) => {
        const uid = m.userId.toString();
        const user = userMap.get(uid);
        const spentMonth = approved
          .filter((a) => a.requesterId.toString() === uid)
          .reduce(
            (sum, a) =>
              sum + Number((a.transactionData as { amountRwf?: number }).amountRwf ?? 0),
            0,
          );

        const spentToday = approved
          .filter(
            (a) =>
              a.requesterId.toString() === uid &&
              a.resolvedAt &&
              a.resolvedAt >= dayStart,
          )
          .reduce(
            (sum, a) =>
              sum + Number((a.transactionData as { amountRwf?: number }).amountRwf ?? 0),
            0,
          );

        return {
          id: m._id.toString(),
          userId: uid,
          name: user?.fullName ?? 'Member',
          role: m.role,
          spendingLimitDaily: m.spendingLimitDaily,
          spendingLimitMonthly: m.spendingLimitMonthly ?? 0,
          requiresApprovalAbove: m.requiresApprovalAbove,
          spentMonth,
          spentToday,
          joinedAt: m.joinedAt,
        };
      }),
    );

    const poolLimit = memberViews.reduce((s, m) => s + (m.spendingLimitMonthly ?? 0), 0);
    const poolUsed = memberViews.reduce((s, m) => s + m.spentMonth, 0);

    const pendingApprovals =
      membership.role === FamilyRole.PARENT
        ? await this.approvalModel
            .countDocuments({
              familyId: family._id,
              status: ApprovalRequestStatus.PENDING,
            })
            .exec()
        : 0;

    return {
      id: family._id.toString(),
      name: family.name,
      walletAddress: family.walletAddress,
      myRole: membership.role,
      poolLimit,
      poolUsed,
      pendingApprovals,
      members: memberViews,
    };
  }

  async updateFamily(userId: string, familyId: string, name?: string) {
    await this.access.requireParent(familyId, userId);
    if (name) {
      await this.familyModel
        .updateOne({ _id: familyId }, { $set: { name: name.trim() } })
        .exec();
    }
    return this.getFamilyDashboard(userId, familyId);
  }
}

import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import {
  ApprovalRequest,
  ApprovalRequestDocument,
  ApprovalRequestStatus,
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
export class FamilyApprovalService {
  constructor(
    @InjectModel(ApprovalRequest.name)
    private readonly approvalModel: Model<ApprovalRequestDocument>,
    @InjectModel(FamilyMember.name)
    private readonly memberModel: Model<FamilyMemberDocument>,
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
    private readonly access: FamilyAccessService,
    private readonly walletClient: WalletClient,
  ) {}

  async listApprovals(
    userId: string,
    familyId: string,
    status?: ApprovalRequestStatus,
  ) {
    const membership = await this.access.getActiveMembership(familyId, userId);

    const filter: Record<string, unknown> = {
      familyId: new Types.ObjectId(familyId),
    };

    if (status) {
      filter.status = status;
    }

    if (membership.role !== FamilyRole.PARENT) {
      filter.requesterId = new Types.ObjectId(userId);
    }

    const rows = await this.approvalModel
      .find(filter)
      .sort({ createdAt: -1 })
      .limit(50)
      .exec();

    const userIds = [
      ...new Set([
        ...rows.map((r) => r.requesterId.toString()),
        ...rows.map((r) => r.approverId?.toString()).filter(Boolean),
      ]),
    ] as string[];

    const users = await this.userModel
      .find({ _id: { $in: userIds.map((id) => new Types.ObjectId(id)) } })
      .exec();
    const userMap = new Map(users.map((u) => [u._id.toString(), u.fullName]));

    return rows.map((r) => this.toView(r, userMap));
  }

  async createApproval(
    userId: string,
    familyId: string,
    input: {
      destination: string;
      amountRwf: number;
      memo?: string;
      description?: string;
    },
  ) {
    const member = await this.access.getActiveMembership(familyId, userId);
    await this.assertSpendingAllowed(member, input.amountRwf);

    const needsApproval =
      member.role !== FamilyRole.PARENT &&
      input.amountRwf > (member.requiresApprovalAbove ?? 0);

    if (!needsApproval && member.role === FamilyRole.PARENT) {
      const result = await this.walletClient.transferForUser({
        userId,
        destination: input.destination,
        amountRwf: input.amountRwf,
        memo: input.memo,
      });

      return {
        autoApproved: true,
        transfer: result,
      };
    }

    if (!needsApproval) {
      const result = await this.walletClient.transferForUser({
        userId,
        destination: input.destination,
        amountRwf: input.amountRwf,
        memo: input.memo,
      });
      return { autoApproved: true, transfer: result };
    }

    const request = await this.approvalModel.create({
      familyId: new Types.ObjectId(familyId),
      requesterId: new Types.ObjectId(userId),
      transactionData: {
        destination: input.destination,
        amountRwf: input.amountRwf,
        memo: input.memo,
        description: input.description,
      },
      status: ApprovalRequestStatus.PENDING,
      expiresAt: new Date(Date.now() + 48 * 60 * 60 * 1000),
    });

    return {
      autoApproved: false,
      request: this.toView(request, new Map()),
    };
  }

  async resolveApproval(
    userId: string,
    familyId: string,
    requestId: string,
    status: ApprovalRequestStatus.APPROVED | ApprovalRequestStatus.REJECTED,
    parentSignature?: string,
  ) {
    await this.access.requireParent(familyId, userId);

    const request = await this.approvalModel
      .findOne({
        _id: new Types.ObjectId(requestId),
        familyId: new Types.ObjectId(familyId),
      })
      .exec();

    if (!request) {
      throw new NotFoundException('Approval request not found');
    }
    if (request.status !== ApprovalRequestStatus.PENDING) {
      throw new BadRequestException('Request already resolved');
    }
    if (request.expiresAt && request.expiresAt < new Date()) {
      request.status = ApprovalRequestStatus.EXPIRED;
      await request.save();
      throw new BadRequestException('Request has expired');
    }

    if (status === ApprovalRequestStatus.REJECTED) {
      request.status = ApprovalRequestStatus.REJECTED;
      request.approverId = new Types.ObjectId(userId);
      request.resolvedAt = new Date();
      request.parentSignature = parentSignature;
      await request.save();
      return this.toView(request, new Map());
    }

    const tx = request.transactionData as {
      destination: string;
      amountRwf: number;
      memo?: string;
    };

    const requesterMember = await this.memberModel
      .findOne({
        familyId: new Types.ObjectId(familyId),
        userId: request.requesterId,
        isActive: true,
      })
      .exec();

    if (!requesterMember) {
      throw new BadRequestException('Requester is no longer an active member');
    }

    await this.assertSpendingAllowed(requesterMember, tx.amountRwf);

    const transfer = await this.walletClient.transferForUser({
      userId: request.requesterId.toString(),
      destination: tx.destination,
      amountRwf: tx.amountRwf,
      memo: tx.memo,
    });

    request.status = ApprovalRequestStatus.APPROVED;
    request.approverId = new Types.ObjectId(userId);
    request.resolvedAt = new Date();
    request.parentSignature = parentSignature;
    request.transactionData = { ...tx, transfer };
    await request.save();

    return this.toView(request, new Map());
  }

  private async assertSpendingAllowed(
    member: FamilyMemberDocument,
    amountRwf: number,
  ) {
    const monthStart = startOfMonth();
    const dayStart = startOfDay();

    const approved = await this.approvalModel
      .find({
        requesterId: member.userId,
        status: ApprovalRequestStatus.APPROVED,
        resolvedAt: { $gte: monthStart },
      })
      .exec();

    const spentMonth = approved.reduce(
      (sum, a) =>
        sum + Number((a.transactionData as { amountRwf?: number }).amountRwf ?? 0),
      0,
    );

    const spentToday = approved
      .filter((a) => a.resolvedAt && a.resolvedAt >= dayStart)
      .reduce(
        (sum, a) =>
          sum + Number((a.transactionData as { amountRwf?: number }).amountRwf ?? 0),
        0,
      );

    if (
      member.spendingLimitMonthly != null &&
      spentMonth + amountRwf > member.spendingLimitMonthly
    ) {
      throw new BadRequestException('Monthly spending limit exceeded');
    }

    if (
      member.spendingLimitDaily != null &&
      spentToday + amountRwf > member.spendingLimitDaily
    ) {
      throw new BadRequestException('Daily spending limit exceeded');
    }
  }

  private toView(
    request: ApprovalRequestDocument,
    userMap: Map<string, string | undefined>,
  ) {
    const tx = request.transactionData as Record<string, unknown>;
    return {
      id: request._id.toString(),
      familyId: request.familyId.toString(),
      requesterId: request.requesterId.toString(),
      requesterName: userMap.get(request.requesterId.toString()),
      approverId: request.approverId?.toString(),
      approverName: request.approverId
        ? userMap.get(request.approverId.toString())
        : undefined,
      transactionData: tx,
      status: request.status,
      expiresAt: request.expiresAt,
      resolvedAt: request.resolvedAt,
    };
  }
}

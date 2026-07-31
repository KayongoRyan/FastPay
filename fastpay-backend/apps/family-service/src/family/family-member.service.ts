import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { randomBytes } from 'crypto';
import { Model, Types } from 'mongoose';

import {
  FamilyInvite,
  FamilyInviteDocument,
  FamilyInviteStatus,
  FamilyMember,
  FamilyMemberDocument,
  FamilyRole,
  User,
  UserDocument,
} from '@fastpay/schemas';

import { FamilyAccessService } from './family-access.service';

function normalizeIdentifier(raw: string) {
  const trimmed = raw.trim();
  if (trimmed.includes('@')) {
    return { email: trimmed.toLowerCase(), phone: undefined as string | undefined };
  }
  const digits = trimmed.replace(/\D/g, '');
  return { email: undefined as string | undefined, phone: digits || trimmed };
}

@Injectable()
export class FamilyMemberService {
  constructor(
    @InjectModel(FamilyMember.name)
    private readonly memberModel: Model<FamilyMemberDocument>,
    @InjectModel(FamilyInvite.name)
    private readonly inviteModel: Model<FamilyInviteDocument>,
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
    private readonly access: FamilyAccessService,
  ) {}

  async inviteMember(
    userId: string,
    familyId: string,
    input: {
      identifier: string;
      role?: FamilyRole;
      spendingLimitDaily?: number;
      spendingLimitMonthly?: number;
      requiresApprovalAbove?: number;
    },
  ) {
    await this.access.requireParent(familyId, userId);

    const { email, phone } = normalizeIdentifier(input.identifier);
    if (!email && !phone) {
      throw new BadRequestException('Enter a valid email or phone number');
    }

    const invitee = await this.userModel
      .findOne({
        $or: [
          ...(email ? [{ email }] : []),
          ...(phone ? [{ phone }] : []),
        ],
      })
      .exec();

    if (!invitee) {
      throw new NotFoundException(
        'No FastPay account found for that email or phone. They need to sign up first.',
      );
    }

    if (invitee._id.toString() === userId) {
      throw new BadRequestException('You are already in this family');
    }

    const existing = await this.memberModel
      .findOne({
        familyId: new Types.ObjectId(familyId),
        userId: invitee._id,
        isActive: true,
      })
      .exec();
    if (existing) {
      throw new BadRequestException('User is already a family member');
    }

    const role = input.role ?? FamilyRole.CHILD;
    const token = randomBytes(24).toString('hex');
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    const invite = await this.inviteModel.create({
      familyId: new Types.ObjectId(familyId),
      invitedBy: new Types.ObjectId(userId),
      inviteeUserId: invitee._id,
      inviteeEmail: email,
      inviteePhone: phone,
      role,
      spendingLimitDaily: input.spendingLimitDaily,
      spendingLimitMonthly:
        input.spendingLimitMonthly ??
        (role === FamilyRole.CHILD ? 50_000 : 250_000),
      requiresApprovalAbove:
        input.requiresApprovalAbove ??
        (role === FamilyRole.CHILD ? 20_000 : 0),
      token,
      status: FamilyInviteStatus.PENDING,
      expiresAt,
    });

    return {
      id: invite._id.toString(),
      token: invite.token,
      inviteeName: invitee.fullName,
      role: invite.role,
      status: invite.status,
      expiresAt: invite.expiresAt,
    };
  }

  async listPendingInvites(userId: string) {
    const now = new Date();
    const invites = await this.inviteModel
      .find({
        inviteeUserId: new Types.ObjectId(userId),
        status: FamilyInviteStatus.PENDING,
        expiresAt: { $gt: now },
      })
      .sort({ createdAt: -1 })
      .exec();

    return invites.map((i) => ({
      id: i._id.toString(),
      familyId: i.familyId.toString(),
      token: i.token,
      role: i.role,
      expiresAt: i.expiresAt,
    }));
  }

  async acceptInvite(userId: string, token: string) {
    const invite = await this.findPendingInvite(token, userId);

    await this.memberModel.create({
      familyId: invite.familyId,
      userId: new Types.ObjectId(userId),
      role: invite.role,
      spendingLimitDaily: invite.spendingLimitDaily,
      spendingLimitMonthly: invite.spendingLimitMonthly,
      requiresApprovalAbove: invite.requiresApprovalAbove,
    });

    invite.status = FamilyInviteStatus.ACCEPTED;
    await invite.save();

    return {
      familyId: invite.familyId.toString(),
      role: invite.role,
      status: invite.status,
    };
  }

  async declineInvite(userId: string, token: string) {
    const invite = await this.findPendingInvite(token, userId);
    invite.status = FamilyInviteStatus.DECLINED;
    await invite.save();
    return { status: invite.status };
  }

  async updateMember(
    userId: string,
    familyId: string,
    memberId: string,
    patch: {
      role?: FamilyRole;
      spendingLimitDaily?: number;
      spendingLimitMonthly?: number;
      requiresApprovalAbove?: number;
      isActive?: boolean;
    },
  ) {
    await this.access.requireParent(familyId, userId);
    const member = await this.access.getMemberById(memberId, familyId);

    if (member.userId.toString() === userId && patch.isActive === false) {
      throw new BadRequestException('Cannot remove yourself as the only parent');
    }

    if (patch.role !== undefined) member.role = patch.role;
    if (patch.spendingLimitDaily !== undefined) {
      member.spendingLimitDaily = patch.spendingLimitDaily;
    }
    if (patch.spendingLimitMonthly !== undefined) {
      member.spendingLimitMonthly = patch.spendingLimitMonthly;
    }
    if (patch.requiresApprovalAbove !== undefined) {
      member.requiresApprovalAbove = patch.requiresApprovalAbove;
    }
    if (patch.isActive !== undefined) member.isActive = patch.isActive;

    await member.save();

    return {
      id: member._id.toString(),
      userId: member.userId.toString(),
      role: member.role,
      spendingLimitDaily: member.spendingLimitDaily,
      spendingLimitMonthly: member.spendingLimitMonthly,
      requiresApprovalAbove: member.requiresApprovalAbove,
      isActive: member.isActive,
    };
  }

  private async findPendingInvite(token: string, userId: string) {
    const invite = await this.inviteModel.findOne({ token }).exec();
    if (!invite) {
      throw new NotFoundException('Invite not found');
    }
    if (invite.inviteeUserId?.toString() !== userId) {
      throw new BadRequestException('This invite is not for your account');
    }
    if (invite.status !== FamilyInviteStatus.PENDING) {
      throw new BadRequestException('Invite is no longer pending');
    }
    if (invite.expiresAt < new Date()) {
      invite.status = FamilyInviteStatus.EXPIRED;
      await invite.save();
      throw new BadRequestException('Invite has expired');
    }
    return invite;
  }
}

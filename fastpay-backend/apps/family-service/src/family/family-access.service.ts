import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import {
  FamilyMember,
  FamilyMemberDocument,
  FamilyRole,
} from '@fastpay/schemas';

@Injectable()
export class FamilyAccessService {
  constructor(
    @InjectModel(FamilyMember.name)
    private readonly memberModel: Model<FamilyMemberDocument>,
  ) {}

  async getActiveMembership(familyId: string, userId: string) {
    const member = await this.memberModel
      .findOne({
        familyId: new Types.ObjectId(familyId),
        userId: new Types.ObjectId(userId),
        isActive: true,
      })
      .exec();

    if (!member) {
      throw new ForbiddenException('Not a member of this family');
    }

    return member;
  }

  async requireParent(familyId: string, userId: string) {
    const member = await this.getActiveMembership(familyId, userId);
    if (member.role !== FamilyRole.PARENT) {
      throw new ForbiddenException('Parent role required');
    }
    return member;
  }

  async listMemberships(userId: string) {
    return this.memberModel
      .find({ userId: new Types.ObjectId(userId), isActive: true })
      .exec();
  }

  async getMemberById(memberId: string, familyId: string) {
    const member = await this.memberModel
      .findOne({
        _id: new Types.ObjectId(memberId),
        familyId: new Types.ObjectId(familyId),
      })
      .exec();

    if (!member) {
      throw new NotFoundException('Member not found');
    }

    return member;
  }
}

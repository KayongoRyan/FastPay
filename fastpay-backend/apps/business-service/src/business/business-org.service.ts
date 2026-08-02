import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import {
  BusinessMember,
  BusinessMemberDocument,
  BusinessMemberRole,
  BusinessMemberStatus,
  BusinessOrg,
  BusinessOrgDocument,
  BusinessOrgStatus,
} from '@fastpay/schemas';

import { MerchantBridgeClient } from './merchant-bridge.client';

function randomBusinessCode(): string {
  const n = Math.floor(100 + Math.random() * 900);
  return `BIZ${n}`;
}

@Injectable()
export class BusinessOrgService {
  constructor(
    @InjectModel(BusinessOrg.name)
    private readonly orgModel: Model<BusinessOrgDocument>,
    @InjectModel(BusinessMember.name)
    private readonly memberModel: Model<BusinessMemberDocument>,
    private readonly merchantBridge: MerchantBridgeClient,
  ) {}

  async createOrg(input: {
    ownerUserId: string;
    companyName: string;
    industry?: string;
    companyEmail?: string;
    companyPhone?: string;
    address?: string;
    country?: string;
  }) {
    let businessCode = randomBusinessCode();
    for (let attempt = 0; attempt < 8; attempt++) {
      const exists = await this.orgModel.exists({ businessCode }).exec();
      if (!exists) break;
      businessCode = randomBusinessCode();
    }

    const org = await this.orgModel.create({
      ownerUserId: input.ownerUserId,
      businessCode,
      companyName: input.companyName.trim(),
      industry: input.industry?.trim(),
      companyEmail: input.companyEmail?.trim().toLowerCase(),
      companyPhone: input.companyPhone?.trim(),
      address: input.address?.trim(),
      country: input.country?.trim() || 'RW',
      status: BusinessOrgStatus.ACTIVE,
    });

    await this.memberModel.create({
      businessOrgId: org._id,
      userId: new Types.ObjectId(input.ownerUserId),
      fullName: input.companyName.trim(),
      email: input.companyEmail?.trim().toLowerCase(),
      role: BusinessMemberRole.OWNER,
      status: BusinessMemberStatus.ACTIVE,
    });

    return this.toView(org);
  }

  async getOrgForOwner(ownerUserId: string) {
    const org = await this.orgModel.findOne({ ownerUserId }).exec();
    if (!org) return null;
    return this.toView(org);
  }

  async requireOrgForOwner(ownerUserId: string) {
    const org = await this.getOrgForOwner(ownerUserId);
    if (!org) throw new NotFoundException('Business organization not found');
    return org;
  }

  async updateOrg(
    ownerUserId: string,
    patch: {
      companyName?: string;
      industry?: string;
      companyEmail?: string;
      companyPhone?: string;
      address?: string;
      country?: string;
    },
  ) {
    const org = await this.orgModel
      .findOneAndUpdate({ ownerUserId }, { $set: patch }, { new: true })
      .exec();
    if (!org) throw new NotFoundException('Business organization not found');
    return this.toView(org);
  }

  async getDashboard(ownerUserId: string) {
    const org = await this.requireOrgForOwner(ownerUserId);
    const branches = await this.merchantBridge.listByBusiness(org.orgId);
    const members = await this.memberModel
      .countDocuments({
        businessOrgId: new Types.ObjectId(org.orgId),
        status: BusinessMemberStatus.ACTIVE,
      })
      .exec();

    const totalReceivedRwf = branches.reduce(
      (sum, b) => sum + (b.totalReceivedRwf || 0),
      0,
    );

    return {
      org,
      branchCount: branches.length,
      activeBranches: branches.filter((b) => b.status === 'active').length,
      memberCount: members,
      totalReceivedRwf,
      branches,
    };
  }

  async listBranches(ownerUserId: string) {
    const org = await this.requireOrgForOwner(ownerUserId);
    return this.merchantBridge.listByBusiness(org.orgId);
  }

  async linkMerchant(ownerUserId: string, merchantCode: string) {
    const org = await this.requireOrgForOwner(ownerUserId);
    const result = await this.merchantBridge.linkMerchant({
      merchantCode: merchantCode.trim().toUpperCase(),
      businessOrgId: org.orgId,
      ownerUserId,
    });
    if (!result.ok) {
      throw new BadRequestException(
        result.message || 'Could not link merchant branch',
      );
    }
    return result.org;
  }

  async createBranch(
    ownerUserId: string,
    input: {
      branchName: string;
      category?: string;
      businessEmail?: string;
      businessPhone?: string;
    },
  ) {
    const org = await this.requireOrgForOwner(ownerUserId);
    const created = await this.merchantBridge.createBranch({
      ownerUserId,
      businessOrgId: org.orgId,
      businessName: input.branchName.trim(),
      category: input.category?.trim(),
      businessEmail: input.businessEmail?.trim(),
      businessPhone: input.businessPhone?.trim(),
    });
    if (!created) {
      throw new BadRequestException(
        'Could not create merchant branch. Is merchant-service running?',
      );
    }
    return created;
  }

  async listMembers(ownerUserId: string) {
    const org = await this.requireOrgForOwner(ownerUserId);
    const members = await this.memberModel
      .find({ businessOrgId: new Types.ObjectId(org.orgId) })
      .sort({ createdAt: -1 })
      .limit(100)
      .exec();
    return members.map((m) => this.toMemberView(m));
  }

  async addMember(
    ownerUserId: string,
    input: {
      fullName: string;
      email?: string;
      role?: BusinessMemberRole;
    },
  ) {
    const org = await this.requireOrgForOwner(ownerUserId);
    if (input.role === BusinessMemberRole.OWNER) {
      throw new BadRequestException('Cannot invite another owner this way');
    }

    if (input.email) {
      const exists = await this.memberModel
        .exists({
          businessOrgId: new Types.ObjectId(org.orgId),
          email: input.email.trim().toLowerCase(),
          status: { $ne: BusinessMemberStatus.REVOKED },
        })
        .exec();
      if (exists) throw new ConflictException('Member email already on roster');
    }

    const member = await this.memberModel.create({
      businessOrgId: new Types.ObjectId(org.orgId),
      fullName: input.fullName.trim(),
      email: input.email?.trim().toLowerCase(),
      role: input.role ?? BusinessMemberRole.VIEWER,
      status: BusinessMemberStatus.INVITED,
    });

    return this.toMemberView(member);
  }

  private toView(org: BusinessOrgDocument) {
    return {
      orgId: org._id.toString(),
      businessCode: org.businessCode,
      companyName: org.companyName,
      industry: org.industry,
      companyEmail: org.companyEmail,
      companyPhone: org.companyPhone,
      address: org.address,
      country: org.country,
      status: org.status,
      createdAt: org.createdAt?.toISOString(),
    };
  }

  private toMemberView(member: BusinessMemberDocument) {
    return {
      id: member._id.toString(),
      fullName: member.fullName,
      email: member.email,
      role: member.role,
      status: member.status,
      createdAt: member.createdAt?.toISOString(),
    };
  }
}

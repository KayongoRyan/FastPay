import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import {
  BUSINESS_TYPE_LABELS,
  BusinessMember,
  BusinessMemberDocument,
  BusinessMemberRole,
  BusinessMemberStatus,
  BusinessOrg,
  BusinessOrgDocument,
  BusinessOrgStatus,
  BusinessType,
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
    businessType: BusinessType;
    industry?: string;
    companyEmail?: string;
    companyPhone?: string;
    address?: string;
    city?: string;
    country?: string;
    taxId?: string;
    registrationNumber?: string;
    website?: string;
    description?: string;
  }) {
    let businessCode = randomBusinessCode();
    for (let attempt = 0; attempt < 8; attempt++) {
      const exists = await this.orgModel.exists({ businessCode }).exec();
      if (!exists) break;
      businessCode = randomBusinessCode();
    }

    const industry =
      input.industry?.trim() ||
      BUSINESS_TYPE_LABELS[input.businessType] ||
      input.businessType;

    const org = await this.orgModel.create({
      ownerUserId: input.ownerUserId,
      businessCode,
      companyName: input.companyName.trim(),
      businessType: input.businessType,
      industry,
      companyEmail: input.companyEmail?.trim().toLowerCase(),
      companyPhone: input.companyPhone?.trim(),
      address: input.address?.trim(),
      city: input.city?.trim(),
      country: input.country?.trim() || 'RW',
      taxId: input.taxId?.trim().toUpperCase(),
      registrationNumber: input.registrationNumber?.trim().toUpperCase(),
      website: input.website?.trim(),
      description: input.description?.trim(),
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
      businessType?: BusinessType;
      industry?: string;
      companyEmail?: string;
      companyPhone?: string;
      address?: string;
      city?: string;
      country?: string;
      taxId?: string;
      registrationNumber?: string;
      website?: string;
      description?: string;
    },
  ) {
    const $set: Record<string, unknown> = { ...patch };
    if (patch.taxId !== undefined) {
      $set.taxId = patch.taxId.trim().toUpperCase();
    }
    if (patch.registrationNumber !== undefined) {
      $set.registrationNumber = patch.registrationNumber.trim().toUpperCase();
    }
    if (patch.businessType && !patch.industry) {
      $set.industry = BUSINESS_TYPE_LABELS[patch.businessType];
    }
    if (patch.companyEmail !== undefined) {
      $set.companyEmail = patch.companyEmail.trim().toLowerCase();
    }

    const org = await this.orgModel
      .findOneAndUpdate({ ownerUserId }, { $set }, { new: true })
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
      category?: BusinessType | string;
      businessEmail?: string;
      businessPhone?: string;
    },
  ) {
    const org = await this.requireOrgForOwner(ownerUserId);
    const created = await this.merchantBridge.createBranch({
      ownerUserId,
      businessOrgId: org.orgId,
      businessName: input.branchName.trim(),
      category: input.category,
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
      businessType: org.businessType,
      industry: org.industry,
      companyEmail: org.companyEmail,
      companyPhone: org.companyPhone,
      address: org.address,
      city: org.city,
      country: org.country,
      taxId: org.taxId,
      registrationNumber: org.registrationNumber,
      website: org.website,
      description: org.description,
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

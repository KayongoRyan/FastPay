import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import {
  MerchantOrg,
  MerchantOrgDocument,
  MerchantOrgStatus,
} from '@fastpay/schemas';

function randomMerchantCode(): string {
  const n = Math.floor(100 + Math.random() * 900);
  return `MRC${n}`;
}

@Injectable()
export class MerchantOrgService {
  constructor(
    @InjectModel(MerchantOrg.name)
    private readonly orgModel: Model<MerchantOrgDocument>,
  ) {}

  async createOrg(input: {
    ownerUserId: string;
    businessName: string;
    category?: string;
    businessEmail?: string;
    businessPhone?: string;
    businessOrgId?: string;
  }) {
    let merchantCode = randomMerchantCode();
    for (let attempt = 0; attempt < 8; attempt++) {
      const exists = await this.orgModel.exists({ merchantCode }).exec();
      if (!exists) break;
      merchantCode = randomMerchantCode();
    }

    const org = await this.orgModel.create({
      ownerUserId: input.ownerUserId,
      merchantCode,
      businessName: input.businessName,
      category: input.category,
      businessEmail: input.businessEmail,
      businessPhone: input.businessPhone,
      businessOrgId: input.businessOrgId
        ? new Types.ObjectId(input.businessOrgId)
        : undefined,
      status: MerchantOrgStatus.ACTIVE,
      totalReceivedRwf: 0,
    });

    return this.toView(org);
  }

  async getOrgForOwner(ownerUserId: string) {
    // Prefer a standalone shop (no parent business) for the merchant portal.
    const standalone = await this.orgModel
      .findOne({
        ownerUserId,
        $or: [{ businessOrgId: { $exists: false } }, { businessOrgId: null }],
      })
      .exec();
    if (standalone) return this.toView(standalone);

    const any = await this.orgModel.findOne({ ownerUserId }).exec();
    if (!any) return null;
    return this.toView(any);
  }

  async getOrgById(orgId: string) {
    const org = await this.orgModel.findById(orgId).exec();
    if (!org) return null;
    return this.toView(org);
  }

  async lookupByCode(code: string) {
    const org = await this.orgModel
      .findOne({ merchantCode: code.trim().toUpperCase(), status: MerchantOrgStatus.ACTIVE })
      .exec();
    if (!org) return null;
    return {
      code: org.merchantCode,
      name: org.businessName,
      orgId: org._id.toString(),
      category: org.category,
    };
  }

  async listByBusinessOrgId(businessOrgId: string) {
    const orgs = await this.orgModel
      .find({ businessOrgId: new Types.ObjectId(businessOrgId) })
      .sort({ createdAt: -1 })
      .exec();
    return orgs.map((o) => this.toView(o));
  }

  async linkToBusiness(input: {
    merchantCode: string;
    businessOrgId: string;
    ownerUserId: string;
  }) {
    const org = await this.orgModel
      .findOne({ merchantCode: input.merchantCode.trim().toUpperCase() })
      .exec();
    if (!org) throw new NotFoundException('Merchant code not found');

    if (org.ownerUserId.toString() !== input.ownerUserId) {
      throw new ForbiddenException(
        'Only the merchant owner can link this shop to a business',
      );
    }

    if (
      org.businessOrgId &&
      org.businessOrgId.toString() !== input.businessOrgId
    ) {
      throw new ConflictException('Merchant already linked to another business');
    }

    org.businessOrgId = new Types.ObjectId(input.businessOrgId);
    await org.save();
    return this.toView(org);
  }

  async updateOrg(
    ownerUserId: string,
    patch: {
      businessName?: string;
      category?: string;
      businessEmail?: string;
      businessPhone?: string;
      address?: string;
    },
  ) {
    const current = await this.getOrgForOwner(ownerUserId);
    if (!current) return null;
    const org = await this.orgModel
      .findByIdAndUpdate(current.orgId, { $set: patch }, { new: true })
      .exec();
    if (!org) return null;
    return this.toView(org);
  }

  async recordPayment(orgId: string, amountRwf: number) {
    if (!amountRwf || amountRwf < 0) {
      throw new BadRequestException('Invalid payment amount');
    }
    await this.orgModel
      .updateOne({ _id: orgId }, { $inc: { totalReceivedRwf: amountRwf } })
      .exec();
  }

  private toView(org: MerchantOrgDocument) {
    return {
      orgId: org._id.toString(),
      merchantCode: org.merchantCode,
      businessName: org.businessName,
      category: org.category,
      businessEmail: org.businessEmail,
      businessPhone: org.businessPhone,
      address: org.address,
      status: org.status,
      totalReceivedRwf: org.totalReceivedRwf,
      businessOrgId: org.businessOrgId?.toString(),
      createdAt: org.createdAt?.toISOString(),
    };
  }
}

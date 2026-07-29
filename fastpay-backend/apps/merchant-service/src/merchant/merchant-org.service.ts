import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

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
      status: MerchantOrgStatus.ACTIVE,
      totalReceivedRwf: 0,
    });

    return this.toView(org);
  }

  async getOrgForOwner(ownerUserId: string) {
    const org = await this.orgModel.findOne({ ownerUserId }).exec();
    if (!org) return null;
    return this.toView(org);
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
    const org = await this.orgModel.findOneAndUpdate(
      { ownerUserId },
      { $set: patch },
      { new: true },
    );
    if (!org) return null;
    return this.toView(org);
  }

  async recordPayment(orgId: string, amountRwf: number) {
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
      createdAt: org.createdAt?.toISOString(),
    };
  }
}

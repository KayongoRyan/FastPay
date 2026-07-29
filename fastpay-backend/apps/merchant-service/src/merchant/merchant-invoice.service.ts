import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import {
  MerchantInvoice,
  MerchantInvoiceDocument,
  MerchantInvoiceStatus,
  MerchantTransaction,
  MerchantTransactionDocument,
  MerchantPaymentChannel,
} from '@fastpay/schemas';

import { MerchantOrgService } from './merchant-org.service';

@Injectable()
export class MerchantInvoiceService {
  constructor(
    @InjectModel(MerchantInvoice.name)
    private readonly invoiceModel: Model<MerchantInvoiceDocument>,
    @InjectModel(MerchantTransaction.name)
    private readonly txModel: Model<MerchantTransactionDocument>,
    private readonly orgService: MerchantOrgService,
  ) {}

  async createInvoice(
    ownerUserId: string,
    input: { amountRwf: number; description?: string; expiresInHours?: number },
  ) {
    const org = await this.orgService.getOrgForOwner(ownerUserId);
    if (!org) throw new NotFoundException('Merchant organization not found');

    const invoiceNumber = `INV-${Date.now().toString(36).toUpperCase()}`;
    const expiresAt = input.expiresInHours
      ? new Date(Date.now() + input.expiresInHours * 3600000)
      : new Date(Date.now() + 24 * 3600000);

    const invoice = await this.invoiceModel.create({
      merchantOrgId: new Types.ObjectId(org.orgId),
      invoiceNumber,
      amountRwf: input.amountRwf,
      description: input.description,
      status: MerchantInvoiceStatus.OPEN,
      expiresAt,
    });

    return this.toInvoiceView(invoice, org.merchantCode);
  }

  async listInvoices(ownerUserId: string) {
    const org = await this.orgService.getOrgForOwner(ownerUserId);
    if (!org) return [];

    const invoices = await this.invoiceModel
      .find({ merchantOrgId: org.orgId })
      .sort({ createdAt: -1 })
      .limit(50)
      .exec();

    return invoices.map((inv) => this.toInvoiceView(inv, org.merchantCode));
  }

  async getQrPayload(ownerUserId: string, invoiceId: string) {
    const org = await this.orgService.getOrgForOwner(ownerUserId);
    if (!org) throw new NotFoundException('Merchant organization not found');

    const invoice = await this.invoiceModel
      .findOne({ _id: invoiceId, merchantOrgId: org.orgId })
      .exec();
    if (!invoice) throw new NotFoundException('Invoice not found');

    return {
      v: 1,
      type: 'fastpay_invoice',
      merchantCode: org.merchantCode,
      invoiceNumber: invoice.invoiceNumber,
      amountRwf: invoice.amountRwf,
      description: invoice.description,
    };
  }

  async recordPayment(input: {
    orgId: string;
    amountRwf: number;
    channel: MerchantPaymentChannel;
    consumerUserId?: string;
    invoiceId?: string;
    merchantCode?: string;
    paymentRef?: string;
    txHash?: string;
    beneficiaryLabel?: string;
  }) {
    await this.orgService.recordPayment(input.orgId, input.amountRwf);

    if (input.invoiceId) {
      await this.invoiceModel
        .updateOne(
          { _id: input.invoiceId },
          {
            $set: {
              status: MerchantInvoiceStatus.PAID,
              paidAt: new Date(),
              paidByUserId: input.consumerUserId
                ? new Types.ObjectId(input.consumerUserId)
                : undefined,
              paymentRef: input.paymentRef,
            },
          },
        )
        .exec();
    }

    const tx = await this.txModel.create({
      merchantOrgId: new Types.ObjectId(input.orgId),
      amountRwf: input.amountRwf,
      channel: input.channel,
      consumerUserId: input.consumerUserId
        ? new Types.ObjectId(input.consumerUserId)
        : undefined,
      invoiceId: input.invoiceId ? new Types.ObjectId(input.invoiceId) : undefined,
      merchantCode: input.merchantCode,
      paymentRef: input.paymentRef,
      txHash: input.txHash,
      beneficiaryLabel: input.beneficiaryLabel,
      status: 'confirmed',
    });

    return {
      id: tx._id.toString(),
      amountRwf: tx.amountRwf,
      status: tx.status,
    };
  }

  async listTransactions(ownerUserId: string) {
    const org = await this.orgService.getOrgForOwner(ownerUserId);
    if (!org) return [];

    const txs = await this.txModel
      .find({ merchantOrgId: org.orgId })
      .sort({ createdAt: -1 })
      .limit(50)
      .exec();

    return txs.map((tx) => ({
      id: tx._id.toString(),
      amountRwf: tx.amountRwf,
      channel: tx.channel,
      merchantCode: tx.merchantCode,
      paymentRef: tx.paymentRef,
      txHash: tx.txHash,
      beneficiaryLabel: tx.beneficiaryLabel,
      status: tx.status,
      createdAt: tx.createdAt?.toISOString(),
    }));
  }

  async getDashboard(ownerUserId: string) {
    const org = await this.orgService.getOrgForOwner(ownerUserId);
    if (!org) throw new NotFoundException('Merchant organization not found');

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const [todayTxs, openInvoices, recentTxs] = await Promise.all([
      this.txModel
        .find({ merchantOrgId: org.orgId, createdAt: { $gte: startOfDay } })
        .exec(),
      this.invoiceModel
        .countDocuments({
          merchantOrgId: org.orgId,
          status: MerchantInvoiceStatus.OPEN,
        })
        .exec(),
      this.txModel
        .find({ merchantOrgId: org.orgId })
        .sort({ createdAt: -1 })
        .limit(5)
        .exec(),
    ]);

    const todayTotal = todayTxs.reduce((sum, tx) => sum + tx.amountRwf, 0);

    return {
      org,
      todayTotalRwf: todayTotal,
      todayCount: todayTxs.length,
      openInvoices,
      totalReceivedRwf: org.totalReceivedRwf,
      recentTransactions: recentTxs.map((tx) => ({
        id: tx._id.toString(),
        amountRwf: tx.amountRwf,
        channel: tx.channel,
        createdAt: tx.createdAt?.toISOString(),
      })),
    };
  }

  private toInvoiceView(invoice: MerchantInvoiceDocument, merchantCode: string) {
    return {
      id: invoice._id.toString(),
      invoiceNumber: invoice.invoiceNumber,
      merchantCode,
      amountRwf: invoice.amountRwf,
      description: invoice.description,
      status: invoice.status,
      expiresAt: invoice.expiresAt?.toISOString(),
      paidAt: invoice.paidAt?.toISOString(),
      createdAt: invoice.createdAt?.toISOString(),
    };
  }
}

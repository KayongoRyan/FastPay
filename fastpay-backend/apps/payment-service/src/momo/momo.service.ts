import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import {
  MomoPayment,
  MomoPaymentDocument,
  MomoPaymentStatus,
} from '@fastpay/schemas/payment/momo-payment.schema';

export interface InitiateMomoDto {
  provider: 'mtn' | 'airtel';
  phone: string;
  amountRwf: number;
  walletPublicKey: string;
}

@Injectable()
export class MomoService {
  constructor(
    @InjectModel(MomoPayment.name)
    private readonly momoPaymentModel: Model<MomoPaymentDocument>,
  ) {}

  async initiate(dto: InitiateMomoDto) {
    const payment = await this.momoPaymentModel.create({
      provider: dto.provider,
      phone: dto.phone,
      amountRwf: dto.amountRwf,
      walletPublicKey: dto.walletPublicKey,
      status: MomoPaymentStatus.PENDING,
      message: 'Awaiting mobile money approval',
    });

    void this.simulateProviderFlow(payment._id.toString());

    return {
      paymentId: payment._id.toString(),
      status: payment.status,
      message: payment.message,
    };
  }

  async getStatus(paymentId: string) {
    const payment = await this.momoPaymentModel.findById(paymentId).exec();
    if (!payment) {
      throw new NotFoundException(`MoMo payment ${paymentId} not found`);
    }

    return {
      paymentId: payment._id.toString(),
      provider: payment.provider,
      phone: payment.phone,
      amountRwf: payment.amountRwf,
      status: payment.status,
      usdtCredited: payment.usdtCredited,
      message: payment.message,
    };
  }

  async getHistory(walletPublicKey: string) {
    const payments = await this.momoPaymentModel
      .find({
        walletPublicKey,
        status: MomoPaymentStatus.COMPLETED,
      })
      .sort({ createdAt: -1 })
      .limit(50)
      .exec();

    return payments.map((payment) => ({
      paymentId: payment._id.toString(),
      provider: payment.provider,
      phone: payment.phone,
      amountRwf: payment.amountRwf,
      status: payment.status,
      usdtCredited: payment.usdtCredited,
      createdAt:
        (payment as MomoPayment & { createdAt?: Date }).createdAt?.toISOString() ??
        new Date().toISOString(),
    }));
  }

  private async simulateProviderFlow(paymentId: string) {
    await this.delay(1500);
    await this.momoPaymentModel.findByIdAndUpdate(paymentId, {
      status: MomoPaymentStatus.PROCESSING,
      message: 'Processing mobile money payment',
    });

    await this.delay(2500);

    const payment = await this.momoPaymentModel.findById(paymentId).exec();
    if (!payment) {
      return;
    }

    const usdtCredited = Number(
      (payment.amountRwf * 0.0000108245).toFixed(6),
    );

    await this.momoPaymentModel.findByIdAndUpdate(paymentId, {
      status: MomoPaymentStatus.COMPLETED,
      usdtCredited,
      message: 'USDT credited to your wallet',
    });
  }

  private delay(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

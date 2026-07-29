import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { MerchantPaymentChannel } from '@fastpay/schemas';

import { MerchantClient } from '../clients/merchant.client';
import { WalletClient } from '../clients/wallet.client';
import { BankPayDto } from './dto/bank-pay.dto';

@Injectable()
export class BankPayService {
  private readonly settlementKey: string;

  constructor(
    private readonly merchantClient: MerchantClient,
    private readonly walletClient: WalletClient,
    private readonly configService: ConfigService,
  ) {
    this.settlementKey =
      process.env.MERCHANT_SETTLEMENT_PUBLIC_KEY ??
      'GCKFBEIYTKPBJRAQDJQHEQUXHPIKUPZOIDFFQPCCVRFHTEYSAVP7SFXM';
  }

  async lookup(code: string) {
    const merchant = await this.merchantClient.lookup(code);
    if (!merchant) {
      throw new NotFoundException('Merchant not found');
    }
    return merchant;
  }

  async pay(accessToken: string, userId: string, dto: BankPayDto) {
    const merchant = await this.merchantClient.lookup(dto.merchantCode);
    if (!merchant) {
      throw new NotFoundException('Merchant not found');
    }

    if (dto.amountRwf < 100) {
      throw new BadRequestException('Minimum payment is RWF 100');
    }

    const memo = [
      `MERCHANT:${merchant.code}`,
      dto.beneficiaryLabel ? `FOR:${dto.beneficiaryLabel}` : null,
      dto.memo,
    ]
      .filter(Boolean)
      .join(' | ')
      .slice(0, 28);

    const transfer = await this.walletClient.transfer(accessToken, {
      destination: this.settlementKey,
      amountRwf: dto.amountRwf,
      memo,
    });

    await this.merchantClient.recordPayment({
      orgId: merchant.orgId,
      amountRwf: dto.amountRwf,
      channel: MerchantPaymentChannel.BANK_PAY,
      consumerUserId: userId,
      merchantCode: merchant.code,
      paymentRef: transfer.queueId,
      txHash: transfer.txHash,
      beneficiaryLabel: dto.beneficiaryLabel,
    });

    return {
      merchant: { code: merchant.code, name: merchant.name },
      amountRwf: dto.amountRwf,
      txHash: transfer.txHash,
      queueId: transfer.queueId,
      estimatedSeconds: transfer.estimatedSeconds,
    };
  }
}

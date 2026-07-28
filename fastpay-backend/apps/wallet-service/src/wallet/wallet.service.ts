import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { Wallet, WalletDocument } from '@fastpay/schemas';

import { BlockchainClient } from '../clients/blockchain.client';
import { PaymentClient } from '../clients/payment.client';
import { TransferDto } from './dto/transfer.dto';
import {
  decodeSecret,
  encodeSecret,
  formatAccountNumber,
} from './wallet.util';

export interface WalletView {
  id: string;
  accountNumber: string;
  publicKey: string;
  balance: number;
  currency: string;
  balances: Record<string, string>;
  xlmBalance: number;
}

@Injectable()
export class WalletService {
  private readonly rwfPerXlm: number;

  constructor(
    @InjectModel(Wallet.name)
    private readonly walletModel: Model<WalletDocument>,
    private readonly blockchainClient: BlockchainClient,
    private readonly paymentClient: PaymentClient,
    private readonly configService: ConfigService,
  ) {
    this.rwfPerXlm = this.configService.getOrThrow<number>('wallet.rwfPerXlm');
  }

  async provisionForUser(userId: string): Promise<WalletView> {
    const existing = await this.walletModel
      .findOne({ userId: new Types.ObjectId(userId), isDefault: true })
      .exec();

    if (existing) {
      return this.toView(existing);
    }

    const keys = await this.blockchainClient.createAccount();
    const xlmBalances = await this.blockchainClient.getBalance(keys.publicKey);
    const xlm =
      xlmBalances.find((b) => b.assetType === 'native')?.balance ?? '0';

    const wallet = await this.walletModel.create({
      userId: new Types.ObjectId(userId),
      chain: 'stellar',
      address: formatAccountNumber(keys.publicKey),
      publicKey: keys.publicKey,
      encryptedKeyShardB: encodeSecret(keys.secretKey),
      balances: new Map([['XLM', xlm]]),
      isDefault: true,
      lastActivityAt: new Date(),
    });

    return this.toView(wallet);
  }

  async getWalletForUser(userId: string): Promise<WalletView> {
    const wallet = await this.findDefaultWallet(userId);
    return this.toView(wallet, true);
  }

  async getHistoryForUser(userId: string) {
    const wallet = await this.findDefaultWallet(userId);
    return this.paymentClient.getHistory(wallet.publicKey);
  }

  async transfer(userId: string, dto: TransferDto) {
    const wallet = await this.findDefaultWallet(userId);
    if (!wallet.encryptedKeyShardB) {
      throw new BadRequestException('Wallet signing key unavailable');
    }

    const destination = await this.resolveDestination(dto.destination);
    const amountXlm = (dto.amountRwf / this.rwfPerXlm).toFixed(7);

    const view = await this.toView(wallet, true);
    if (dto.amountRwf > view.balance) {
      throw new BadRequestException('Insufficient balance');
    }

    const secretKey = decodeSecret(wallet.encryptedKeyShardB);
    const built = await this.blockchainClient.buildPayment({
      sourceSecret: secretKey,
      destination,
      amount: amountXlm,
      memo: dto.memo,
    });

    const relay = await this.paymentClient.relay(built.xdr);

    await this.walletModel
      .updateOne(
        { _id: wallet._id },
        { $set: { lastActivityAt: new Date() } },
      )
      .exec();

    return {
      txHash: relay.txHash,
      queueId: relay.queueId,
      estimatedSeconds: relay.estimatedSeconds,
      amountRwf: dto.amountRwf,
      destination,
    };
  }

  async resolveDestination(destination: string): Promise<string> {
    const trimmed = destination.trim();
    if (trimmed.startsWith('G') && trimmed.length >= 56) {
      return trimmed;
    }

    if (trimmed.toUpperCase().startsWith('FP-')) {
      const wallet = await this.walletModel
        .findOne({ address: trimmed.toUpperCase() })
        .exec();
      if (!wallet) {
        throw new NotFoundException('Recipient account not found');
      }
      return wallet.publicKey;
    }

    throw new BadRequestException(
      'Destination must be a FastPay account (FP-...) or Stellar public key (G...)',
    );
  }

  private async findDefaultWallet(userId: string): Promise<WalletDocument> {
    let wallet = await this.walletModel
      .findOne({ userId: new Types.ObjectId(userId), isDefault: true })
      .exec();

    if (!wallet) {
      await this.provisionForUser(userId);
      wallet = await this.walletModel
        .findOne({ userId: new Types.ObjectId(userId), isDefault: true })
        .exec();
    }

    if (!wallet) {
      throw new NotFoundException('Wallet not found');
    }

    return wallet;
  }

  private async toView(
    wallet: WalletDocument,
    refreshBalance = false,
  ): Promise<WalletView> {
    let xlmBalance = wallet.balances?.get('XLM') ?? '0';

    if (refreshBalance) {
      try {
        const balances = await this.blockchainClient.getBalance(wallet.publicKey);
        xlmBalance =
          balances.find((b) => b.assetType === 'native')?.balance ?? xlmBalance;
        wallet.balances = new Map([['XLM', xlmBalance]]);
        await wallet.save();
      } catch {
        /* keep cached balance */
      }
    }

    const xlm = Number.parseFloat(xlmBalance);
    const balanceRwf = Math.round(xlm * this.rwfPerXlm);

    return {
      id: wallet._id.toString(),
      accountNumber: wallet.address,
      publicKey: wallet.publicKey,
      balance: balanceRwf,
      currency: 'RWF',
      balances: { XLM: xlmBalance },
      xlmBalance: xlm,
    };
  }
}

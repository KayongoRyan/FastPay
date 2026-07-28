import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { Wallet, WalletDocument } from '@fastpay/schemas';

@Injectable()
export class WalletOwnerGuard implements CanActivate {
  constructor(
    @InjectModel(Wallet.name)
    private readonly walletModel: Model<WalletDocument>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<{
      user?: { userId: string };
      params: Record<string, string>;
    }>();

    const userId = request.user?.userId;
    const publicKey = request.params.publicKey;

    if (!userId || !publicKey) {
      throw new ForbiddenException('Wallet access denied');
    }

    const wallet = await this.walletModel
      .findOne({
        userId: new Types.ObjectId(userId),
        publicKey,
        isDefault: true,
      })
      .exec();

    if (!wallet) {
      throw new ForbiddenException('Wallet access denied');
    }

    return true;
  }
}

import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { JwtAccessPayload } from '@fastpay/common';
import { Wallet, WalletDocument } from '@fastpay/schemas';

@Injectable()
export class PaymentHistoryGuard implements CanActivate {
  constructor(
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
    @InjectModel(Wallet.name)
    private readonly walletModel: Model<WalletDocument>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<{
      headers: Record<string, string | undefined>;
      user?: { userId: string };
      params: Record<string, string>;
    }>();

    const secret = request.headers['x-internal-secret'];
    const expected =
      this.configService.get<string>('auth.internalServiceSecret') ??
      process.env.INTERNAL_SERVICE_SECRET ??
      'dev-internal-secret-change-in-production';

    if (secret && secret === expected) {
      return true;
    }

    const authorization = request.headers.authorization;
    if (!authorization?.startsWith('Bearer ')) {
      throw new UnauthorizedException('Missing bearer token');
    }

    const token = authorization.slice('Bearer '.length);
    let payload: JwtAccessPayload;

    try {
      payload = this.jwtService.verify<JwtAccessPayload>(token, {
        secret:
          this.configService.get<string>('auth.jwtAccessSecret') ??
          process.env.JWT_ACCESS_SECRET ??
          'dev-access-secret-change-in-production',
      });
    } catch {
      throw new UnauthorizedException('Invalid access token');
    }

    if (payload.type !== 'access' || !payload.sub) {
      throw new UnauthorizedException('Invalid access token');
    }

    request.user = { userId: payload.sub };

    const publicKey = request.params.publicKey;
    const wallet = await this.walletModel
      .findOne({
        userId: new Types.ObjectId(payload.sub),
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

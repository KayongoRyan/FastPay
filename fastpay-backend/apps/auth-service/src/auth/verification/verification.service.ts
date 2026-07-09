import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { User, UserDocument } from '@fastpay/schemas';

interface OtpEntry {
  code: string;
  expiresAt: number;
}

@Injectable()
export class VerificationService {
  private readonly otpByUser = new Map<string, OtpEntry>();
  private readonly verifiedUsers = new Set<string>();

  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
  ) {}

  async sendEmailOtp(userId: string) {
    const user = await this.userModel.findById(userId).exec();
    if (!user?.email) {
      throw new BadRequestException('No email on file for this account');
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    this.otpByUser.set(userId, {
      code,
      expiresAt: Date.now() + 10 * 60 * 1000,
    });

    return {
      sent: true,
      expiresInSeconds: 600,
      // Dev-only hint for local testing without notification service.
      debugCode: process.env.NODE_ENV === 'production' ? undefined : code,
    };
  }

  async verifyEmailOtp(userId: string, code: string) {
    const entry = this.otpByUser.get(userId);
    if (!entry) {
      throw new UnauthorizedException('No OTP requested');
    }

    if (Date.now() > entry.expiresAt) {
      this.otpByUser.delete(userId);
      throw new UnauthorizedException('OTP expired');
    }

    if (entry.code !== code.trim()) {
      throw new UnauthorizedException('Invalid OTP');
    }

    this.otpByUser.delete(userId);
    this.verifiedUsers.add(userId);

    return { verified: true };
  }
}

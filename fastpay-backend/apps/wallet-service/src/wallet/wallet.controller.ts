import {
  Body,
  Controller,
  Get,
  Headers,
  Post,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { CurrentUserId, JwtAuthGuard } from '@fastpay/common';

import { InternalProvisionDto } from './dto/internal-provision.dto';
import { InternalTransferDto } from './dto/internal-transfer.dto';
import { TransferDto } from './dto/transfer.dto';
import { WalletService } from './wallet.service';

@Controller('wallet')
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  @Get('me')
  @UseGuards(JwtAuthGuard)
  getMe(@CurrentUserId() userId: string) {
    return this.walletService.getWalletForUser(userId);
  }

  @Post('provision')
  @UseGuards(JwtAuthGuard)
  provision(@CurrentUserId() userId: string) {
    return this.walletService.provisionForUser(userId);
  }

  @Get('me/history')
  @UseGuards(JwtAuthGuard)
  history(@CurrentUserId() userId: string) {
    return this.walletService.getHistoryForUser(userId);
  }

  @Post('me/transfer')
  @UseGuards(JwtAuthGuard)
  transfer(@CurrentUserId() userId: string, @Body() dto: TransferDto) {
    return this.walletService.transfer(userId, dto);
  }
}

@Controller('internal')
export class InternalWalletController {
  constructor(
    private readonly walletService: WalletService,
    private readonly configService: ConfigService,
  ) {}

  @Post('provision')
  provision(
    @Headers('x-internal-secret') secret: string | undefined,
    @Body() dto: InternalProvisionDto,
  ) {
    this.assertSecret(secret);
    return this.walletService.provisionForUser(dto.userId);
  }

  @Post('transfer')
  transfer(
    @Headers('x-internal-secret') secret: string | undefined,
    @Body() dto: InternalTransferDto,
  ) {
    this.assertSecret(secret);
    return this.walletService.transfer(dto.userId, {
      destination: dto.destination,
      amountRwf: dto.amountRwf,
      memo: dto.memo,
    });
  }

  private assertSecret(secret: string | undefined) {
    const expected = this.configService.getOrThrow<string>(
      'auth.internalServiceSecret',
    );
    if (!secret || secret !== expected) {
      throw new UnauthorizedException('Invalid internal secret');
    }
  }
}

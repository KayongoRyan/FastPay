import {
  Body,
  Controller,
  createParamDecorator,
  ExecutionContext,
  Get,
  Headers,
  Param,
  Post,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import {
  CurrentUserId,
  JwtAuthGuard,
  MerchantAuthGuard,
} from '@fastpay/common';
import type { AuthenticatedRequestUser } from '@fastpay/common';

import {
  CreateEscrowDto,
  DisputeEscrowDto,
  FundEscrowDto,
  ShipEscrowDto,
} from './dto/escrow.dto';
import { EscrowService } from './escrow.service';

const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): AuthenticatedRequestUser => {
    const request = ctx
      .switchToHttp()
      .getRequest<{ user?: AuthenticatedRequestUser }>();
    return request.user as AuthenticatedRequestUser;
  },
);

@Controller('escrow')
export class EscrowController {
  constructor(private readonly escrowService: EscrowService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@CurrentUserId() userId: string, @Body() dto: CreateEscrowDto) {
    return this.escrowService.create(userId, dto);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  listMine(@CurrentUserId() userId: string) {
    return this.escrowService.listForBuyer(userId);
  }

  @Get('merchant')
  @UseGuards(MerchantAuthGuard)
  listMerchant(@CurrentUser() user: AuthenticatedRequestUser) {
    if (!user?.merchantOrgId) {
      return [];
    }
    return this.escrowService.listForMerchant(user.merchantOrgId);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  getOne(
    @CurrentUserId() userId: string,
    @CurrentUser() user: AuthenticatedRequestUser,
    @Param('id') id: string,
  ) {
    return this.escrowService.getById(id, userId, user?.merchantOrgId);
  }

  @Post(':id/fund')
  @UseGuards(JwtAuthGuard)
  fund(
    @CurrentUserId() userId: string,
    @Param('id') id: string,
    @Body() dto: FundEscrowDto,
  ) {
    return this.escrowService.fund(userId, id, dto);
  }

  @Post(':id/ship')
  @UseGuards(MerchantAuthGuard)
  ship(
    @CurrentUser() user: AuthenticatedRequestUser,
    @Param('id') id: string,
    @Body() dto: ShipEscrowDto,
  ) {
    if (!user?.merchantOrgId) {
      throw new UnauthorizedException('Merchant organization required');
    }
    return this.escrowService.ship(user.merchantOrgId, id, dto);
  }

  @Post(':id/deliver')
  @UseGuards(JwtAuthGuard)
  deliver(
    @CurrentUserId() userId: string,
    @CurrentUser() user: AuthenticatedRequestUser,
    @Param('id') id: string,
  ) {
    return this.escrowService.deliver(id, userId, user?.merchantOrgId);
  }

  @Post(':id/confirm')
  @UseGuards(JwtAuthGuard)
  confirm(@CurrentUserId() userId: string, @Param('id') id: string) {
    return this.escrowService.confirm(userId, id);
  }

  @Post(':id/dispute')
  @UseGuards(JwtAuthGuard)
  dispute(
    @CurrentUserId() userId: string,
    @CurrentUser() user: AuthenticatedRequestUser,
    @Param('id') id: string,
    @Body() dto: DisputeEscrowDto,
  ) {
    return this.escrowService.dispute(id, userId, dto, user?.merchantOrgId);
  }

  @Post(':id/cancel')
  @UseGuards(JwtAuthGuard)
  cancel(@CurrentUserId() userId: string, @Param('id') id: string) {
    return this.escrowService.cancel(userId, id);
  }
}

@Controller('internal')
export class InternalEscrowController {
  constructor(
    private readonly escrowService: EscrowService,
    private readonly configService: ConfigService,
  ) {}

  private assertSecret(secret: string | undefined) {
    const expected =
      this.configService.get<string>('auth.internalServiceSecret') ??
      'dev-internal-secret-change-in-production';
    if (!secret || secret !== expected) {
      throw new UnauthorizedException('Invalid internal secret');
    }
  }

  @Get('escrows/by-merchant/:merchantOrgId')
  listByMerchant(
    @Headers('x-internal-secret') secret: string | undefined,
    @Param('merchantOrgId') merchantOrgId: string,
  ) {
    this.assertSecret(secret);
    return this.escrowService.listForMerchant(merchantOrgId);
  }
}

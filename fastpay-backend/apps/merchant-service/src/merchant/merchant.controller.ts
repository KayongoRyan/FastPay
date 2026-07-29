import { Body, Controller, Get, Headers, Param, Patch, Post, UnauthorizedException, UseGuards } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { CurrentUserId, JwtAuthGuard, MerchantAuthGuard } from '@fastpay/common';

import { CreateInvoiceDto, CreateOrgInternalDto, RecordPaymentInternalDto, UpdateOrgDto } from './dto/merchant.dto';
import { MerchantInvoiceService } from './merchant-invoice.service';
import { MerchantOrgService } from './merchant-org.service';

@Controller('merchant')
export class MerchantController {
  constructor(
    private readonly orgService: MerchantOrgService,
    private readonly invoiceService: MerchantInvoiceService,
  ) {}

  @Get('lookup/:code')
  async lookup(@Param('code') code: string) {
    const result = await this.orgService.lookupByCode(code);
    if (!result) {
      return { found: false };
    }
    return { found: true, ...result };
  }

  @Get('orgs/me')
  @UseGuards(MerchantAuthGuard)
  getMyOrg(@CurrentUserId() userId: string) {
    return this.orgService.getOrgForOwner(userId);
  }

  @Patch('orgs/me')
  @UseGuards(MerchantAuthGuard)
  updateMyOrg(@CurrentUserId() userId: string, @Body() dto: UpdateOrgDto) {
    return this.orgService.updateOrg(userId, dto);
  }

  @Get('dashboard')
  @UseGuards(MerchantAuthGuard)
  dashboard(@CurrentUserId() userId: string) {
    return this.invoiceService.getDashboard(userId);
  }

  @Post('invoices')
  @UseGuards(MerchantAuthGuard)
  createInvoice(@CurrentUserId() userId: string, @Body() dto: CreateInvoiceDto) {
    return this.invoiceService.createInvoice(userId, dto);
  }

  @Get('invoices')
  @UseGuards(MerchantAuthGuard)
  listInvoices(@CurrentUserId() userId: string) {
    return this.invoiceService.listInvoices(userId);
  }

  @Get('invoices/:id/qr')
  @UseGuards(MerchantAuthGuard)
  invoiceQr(@CurrentUserId() userId: string, @Param('id') id: string) {
    return this.invoiceService.getQrPayload(userId, id);
  }

  @Get('transactions')
  @UseGuards(MerchantAuthGuard)
  transactions(@CurrentUserId() userId: string) {
    return this.invoiceService.listTransactions(userId);
  }
}

@Controller('internal')
export class InternalMerchantController {
  constructor(
    private readonly orgService: MerchantOrgService,
    private readonly invoiceService: MerchantInvoiceService,
    private readonly configService: ConfigService,
  ) {}

  private assertSecret(secret: string | undefined) {
    const expected = this.configService.getOrThrow<string>('auth.internalServiceSecret');
    if (!secret || secret !== expected) {
      throw new UnauthorizedException('Invalid internal secret');
    }
  }

  @Post('orgs')
  createOrg(
    @Headers('x-internal-secret') secret: string | undefined,
    @Body() dto: CreateOrgInternalDto,
  ) {
    this.assertSecret(secret);
    return this.orgService.createOrg(dto);
  }

  @Post('payments')
  recordPayment(
    @Headers('x-internal-secret') secret: string | undefined,
    @Body() dto: RecordPaymentInternalDto,
  ) {
    this.assertSecret(secret);
    return this.invoiceService.recordPayment(dto);
  }

  @Get('lookup/:code')
  lookupInternal(@Param('code') code: string) {
    return this.orgService.lookupByCode(code);
  }
}

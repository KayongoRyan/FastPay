import {
  Body,
  Controller,
  Get,
  Headers,
  Param,
  Patch,
  Post,
  Query,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { CurrentUserId, MerchantAuthGuard } from '@fastpay/common';

import {
  BumpGoalDto,
  CreateEmployeeDto,
  CreateGoalDto,
  CreateInvoiceDto,
  CreateOrgInternalDto,
  CreatePayrollDto,
  CreateProductDto,
  RecordPaymentInternalDto,
  StockMovementDto,
  UpdateEmployeeDto,
  UpdateGoalDto,
  UpdateOrgDto,
  UpdateProductDto,
} from './dto/merchant.dto';
import { MerchantGoalsService } from './merchant-goals.service';
import { MerchantHrService } from './merchant-hr.service';
import { MerchantInventoryService } from './merchant-inventory.service';
import { MerchantInvoiceService } from './merchant-invoice.service';
import { MerchantOrgService } from './merchant-org.service';

@Controller('merchant')
export class MerchantController {
  constructor(
    private readonly orgService: MerchantOrgService,
    private readonly invoiceService: MerchantInvoiceService,
    private readonly inventoryService: MerchantInventoryService,
    private readonly hrService: MerchantHrService,
    private readonly goalsService: MerchantGoalsService,
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

  // ── Inventory ──────────────────────────────────────────────

  @Get('inventory/summary')
  @UseGuards(MerchantAuthGuard)
  inventorySummary(@CurrentUserId() userId: string) {
    return this.inventoryService.inventorySummary(userId);
  }

  @Get('products')
  @UseGuards(MerchantAuthGuard)
  listProducts(@CurrentUserId() userId: string) {
    return this.inventoryService.listProducts(userId);
  }

  @Post('products')
  @UseGuards(MerchantAuthGuard)
  createProduct(@CurrentUserId() userId: string, @Body() dto: CreateProductDto) {
    return this.inventoryService.createProduct(userId, dto);
  }

  @Patch('products/:id')
  @UseGuards(MerchantAuthGuard)
  updateProduct(
    @CurrentUserId() userId: string,
    @Param('id') id: string,
    @Body() dto: UpdateProductDto,
  ) {
    return this.inventoryService.updateProduct(userId, id, dto);
  }

  @Post('stock-movements')
  @UseGuards(MerchantAuthGuard)
  recordStockMovement(
    @CurrentUserId() userId: string,
    @Body() dto: StockMovementDto,
  ) {
    return this.inventoryService.recordMovement(userId, dto);
  }

  @Get('stock-movements')
  @UseGuards(MerchantAuthGuard)
  listStockMovements(
    @CurrentUserId() userId: string,
    @Query('productId') productId?: string,
  ) {
    return this.inventoryService.listMovements(userId, productId);
  }

  // ── Team / payroll ─────────────────────────────────────────

  @Get('hr/summary')
  @UseGuards(MerchantAuthGuard)
  hrSummary(@CurrentUserId() userId: string) {
    return this.hrService.hrSummary(userId);
  }

  @Get('employees')
  @UseGuards(MerchantAuthGuard)
  listEmployees(@CurrentUserId() userId: string) {
    return this.hrService.listEmployees(userId);
  }

  @Post('employees')
  @UseGuards(MerchantAuthGuard)
  createEmployee(@CurrentUserId() userId: string, @Body() dto: CreateEmployeeDto) {
    return this.hrService.createEmployee(userId, dto);
  }

  @Patch('employees/:id')
  @UseGuards(MerchantAuthGuard)
  updateEmployee(
    @CurrentUserId() userId: string,
    @Param('id') id: string,
    @Body() dto: UpdateEmployeeDto,
  ) {
    return this.hrService.updateEmployee(userId, id, dto);
  }

  @Get('payroll')
  @UseGuards(MerchantAuthGuard)
  listPayroll(@CurrentUserId() userId: string) {
    return this.hrService.listPayroll(userId);
  }

  @Post('payroll')
  @UseGuards(MerchantAuthGuard)
  createPayroll(@CurrentUserId() userId: string, @Body() dto: CreatePayrollDto) {
    return this.hrService.createPayrollEntry(userId, dto);
  }

  @Post('payroll/:id/pay')
  @UseGuards(MerchantAuthGuard)
  markPayrollPaid(@CurrentUserId() userId: string, @Param('id') id: string) {
    return this.hrService.markPayrollPaid(userId, id);
  }

  // ── Goals / missions ───────────────────────────────────────

  @Get('goals')
  @UseGuards(MerchantAuthGuard)
  listGoals(@CurrentUserId() userId: string) {
    return this.goalsService.listGoals(userId);
  }

  @Post('goals')
  @UseGuards(MerchantAuthGuard)
  createGoal(@CurrentUserId() userId: string, @Body() dto: CreateGoalDto) {
    return this.goalsService.createGoal(userId, dto);
  }

  @Patch('goals/:id')
  @UseGuards(MerchantAuthGuard)
  updateGoal(
    @CurrentUserId() userId: string,
    @Param('id') id: string,
    @Body() dto: UpdateGoalDto,
  ) {
    return this.goalsService.updateGoal(userId, id, dto);
  }

  @Post('goals/:id/progress')
  @UseGuards(MerchantAuthGuard)
  bumpGoal(
    @CurrentUserId() userId: string,
    @Param('id') id: string,
    @Body() dto: BumpGoalDto,
  ) {
    return this.goalsService.bumpProgress(userId, id, dto.amount);
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

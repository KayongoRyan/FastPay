import {
  Body,
  Controller,
  Get,
  Headers,
  Param,
  Post,
  Query,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { CurrentUserId, JwtAuthGuard } from '@fastpay/common';

import {
  EnableInsuranceDto,
  ReviewClaimDto,
  SubmitClaimDto,
} from './dto/insurance.dto';
import { InsuranceService } from './insurance.service';

@Controller('insurance')
export class InsuranceController {
  constructor(private readonly insuranceService: InsuranceService) {}

  @Get('dashboard')
  @UseGuards(JwtAuthGuard)
  dashboard(@CurrentUserId() userId: string) {
    return this.insuranceService.dashboard(userId);
  }

  @Get('quote')
  @UseGuards(JwtAuthGuard)
  quote(
    @CurrentUserId() userId: string,
    @Query('coverageLimitRwf') coverageLimitRwf?: string,
  ) {
    const limit = coverageLimitRwf ? Number(coverageLimitRwf) : 500_000;
    return this.insuranceService.quote(
      userId,
      Number.isFinite(limit) ? limit : 500_000,
    );
  }

  @Post('enable')
  @UseGuards(JwtAuthGuard)
  enable(@CurrentUserId() userId: string, @Body() dto: EnableInsuranceDto) {
    return this.insuranceService.enable(userId, dto);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  me(@CurrentUserId() userId: string) {
    return this.insuranceService.getMyPolicy(userId);
  }

  @Post('cancel')
  @UseGuards(JwtAuthGuard)
  cancel(@CurrentUserId() userId: string) {
    return this.insuranceService.cancel(userId);
  }

  @Post('claims')
  @UseGuards(JwtAuthGuard)
  submitClaim(@CurrentUserId() userId: string, @Body() dto: SubmitClaimDto) {
    return this.insuranceService.submitClaim(userId, dto);
  }

  @Get('claims')
  @UseGuards(JwtAuthGuard)
  listClaims(@CurrentUserId() userId: string) {
    return this.insuranceService.listClaims(userId);
  }

  @Get('claims/:id')
  @UseGuards(JwtAuthGuard)
  getClaim(@CurrentUserId() userId: string, @Param('id') id: string) {
    return this.insuranceService.getClaim(userId, id);
  }
}

@Controller('internal')
export class InternalInsuranceController {
  constructor(
    private readonly insuranceService: InsuranceService,
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

  @Post('claims/:id/review')
  review(
    @Headers('x-internal-secret') secret: string | undefined,
    @Param('id') id: string,
    @Body() dto: ReviewClaimDto,
  ) {
    this.assertSecret(secret);
    return this.insuranceService.reviewClaim(id, dto);
  }

  @Post('claims/:id/payout')
  payout(
    @Headers('x-internal-secret') secret: string | undefined,
    @Param('id') id: string,
  ) {
    this.assertSecret(secret);
    return this.insuranceService.payoutClaim(id);
  }
}

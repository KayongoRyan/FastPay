import {
  Body,
  Controller,
  Get,
  Headers,
  Post,
  Patch,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { BusinessAuthGuard, CurrentUserId } from '@fastpay/common';

import {
  AddMemberDto,
  CreateBranchDto,
  CreateBusinessInternalDto,
  LinkMerchantDto,
  UpdateBusinessDto,
} from './dto/business.dto';
import { BusinessOrgService } from './business-org.service';

@Controller('business')
export class BusinessController {
  constructor(private readonly orgService: BusinessOrgService) {}

  @Get('orgs/me')
  @UseGuards(BusinessAuthGuard)
  getMyOrg(@CurrentUserId() userId: string) {
    return this.orgService.getOrgForOwner(userId);
  }

  @Patch('orgs/me')
  @UseGuards(BusinessAuthGuard)
  updateMyOrg(@CurrentUserId() userId: string, @Body() dto: UpdateBusinessDto) {
    return this.orgService.updateOrg(userId, dto);
  }

  @Get('dashboard')
  @UseGuards(BusinessAuthGuard)
  dashboard(@CurrentUserId() userId: string) {
    return this.orgService.getDashboard(userId);
  }

  @Get('branches')
  @UseGuards(BusinessAuthGuard)
  branches(@CurrentUserId() userId: string) {
    return this.orgService.listBranches(userId);
  }

  @Post('branches/link')
  @UseGuards(BusinessAuthGuard)
  linkBranch(@CurrentUserId() userId: string, @Body() dto: LinkMerchantDto) {
    return this.orgService.linkMerchant(userId, dto.merchantCode);
  }

  @Post('branches')
  @UseGuards(BusinessAuthGuard)
  createBranch(@CurrentUserId() userId: string, @Body() dto: CreateBranchDto) {
    return this.orgService.createBranch(userId, dto);
  }

  @Get('members')
  @UseGuards(BusinessAuthGuard)
  members(@CurrentUserId() userId: string) {
    return this.orgService.listMembers(userId);
  }

  @Post('members')
  @UseGuards(BusinessAuthGuard)
  addMember(@CurrentUserId() userId: string, @Body() dto: AddMemberDto) {
    return this.orgService.addMember(userId, dto);
  }
}

@Controller('internal')
export class InternalBusinessController {
  constructor(
    private readonly orgService: BusinessOrgService,
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
    @Body() dto: CreateBusinessInternalDto,
  ) {
    this.assertSecret(secret);
    return this.orgService.createOrg(dto);
  }
}

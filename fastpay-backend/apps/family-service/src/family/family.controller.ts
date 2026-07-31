import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';

import { CurrentUserId, JwtAuthGuard } from '@fastpay/common';
import { ApprovalRequestStatus } from '@fastpay/schemas';

import {
  ContributeGoalDto,
  CreateApprovalDto,
  CreateFamilyDto,
  CreateSavingsGoalDto,
  InviteMemberDto,
  ResolveApprovalDto,
  UpdateFamilyDto,
  UpdateMemberDto,
} from './dto/family.dto';
import { FamilyApprovalService } from './family-approval.service';
import { FamilyMemberService } from './family-member.service';
import { FamilySavingsService } from './family-savings.service';
import { FamilyService } from './family.service';

@Controller('family')
@UseGuards(JwtAuthGuard)
export class FamilyController {
  constructor(
    private readonly familyService: FamilyService,
    private readonly memberService: FamilyMemberService,
    private readonly savingsService: FamilySavingsService,
    private readonly approvalService: FamilyApprovalService,
  ) {}

  @Post()
  create(@CurrentUserId() userId: string, @Body() dto: CreateFamilyDto) {
    return this.familyService.createFamily(userId, dto.name);
  }

  @Get()
  list(@CurrentUserId() userId: string) {
    return this.familyService.listFamilies(userId);
  }

  @Get('invites/pending')
  pendingInvites(@CurrentUserId() userId: string) {
    return this.memberService.listPendingInvites(userId);
  }

  @Post('invites/:token/accept')
  acceptInvite(@CurrentUserId() userId: string, @Param('token') token: string) {
    return this.memberService.acceptInvite(userId, token);
  }

  @Post('invites/:token/decline')
  declineInvite(@CurrentUserId() userId: string, @Param('token') token: string) {
    return this.memberService.declineInvite(userId, token);
  }

  @Get(':familyId')
  dashboard(@CurrentUserId() userId: string, @Param('familyId') familyId: string) {
    return this.familyService.getFamilyDashboard(userId, familyId);
  }

  @Patch(':familyId')
  updateFamily(
    @CurrentUserId() userId: string,
    @Param('familyId') familyId: string,
    @Body() dto: UpdateFamilyDto,
  ) {
    return this.familyService.updateFamily(userId, familyId, dto.name);
  }

  @Post(':familyId/invites')
  invite(
    @CurrentUserId() userId: string,
    @Param('familyId') familyId: string,
    @Body() dto: InviteMemberDto,
  ) {
    return this.memberService.inviteMember(userId, familyId, dto);
  }

  @Patch(':familyId/members/:memberId')
  updateMember(
    @CurrentUserId() userId: string,
    @Param('familyId') familyId: string,
    @Param('memberId') memberId: string,
    @Body() dto: UpdateMemberDto,
  ) {
    return this.memberService.updateMember(userId, familyId, memberId, dto);
  }

  @Get(':familyId/goals')
  listGoals(@CurrentUserId() userId: string, @Param('familyId') familyId: string) {
    return this.savingsService.listGoals(userId, familyId);
  }

  @Post(':familyId/goals')
  createGoal(
    @CurrentUserId() userId: string,
    @Param('familyId') familyId: string,
    @Body() dto: CreateSavingsGoalDto,
  ) {
    return this.savingsService.createGoal(userId, familyId, dto);
  }

  @Post(':familyId/goals/:goalId/contribute')
  contribute(
    @CurrentUserId() userId: string,
    @Param('familyId') familyId: string,
    @Param('goalId') goalId: string,
    @Body() dto: ContributeGoalDto,
  ) {
    return this.savingsService.contribute(
      userId,
      familyId,
      goalId,
      dto.amount,
      dto.transactionHash,
    );
  }

  @Get(':familyId/approvals')
  listApprovals(
    @CurrentUserId() userId: string,
    @Param('familyId') familyId: string,
    @Query('status') status?: ApprovalRequestStatus,
  ) {
    return this.approvalService.listApprovals(userId, familyId, status);
  }

  @Post(':familyId/approvals')
  createApproval(
    @CurrentUserId() userId: string,
    @Param('familyId') familyId: string,
    @Body() dto: CreateApprovalDto,
  ) {
    return this.approvalService.createApproval(userId, familyId, dto);
  }

  @Patch(':familyId/approvals/:requestId')
  resolveApproval(
    @CurrentUserId() userId: string,
    @Param('familyId') familyId: string,
    @Param('requestId') requestId: string,
    @Body() dto: ResolveApprovalDto,
  ) {
    return this.approvalService.resolveApproval(
      userId,
      familyId,
      requestId,
      dto.status,
      dto.parentSignature,
    );
  }
}

import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import {
  InsuranceClaim,
  InsuranceClaimDocument,
  InsuranceClaimStatus,
  InsurancePolicy,
  InsurancePolicyDocument,
  InsurancePolicyStatus,
} from '@fastpay/schemas';

import {
  EnableInsuranceDto,
  ReviewClaimDto,
  SubmitClaimDto,
} from './dto/insurance.dto';
import { RiskEngineService } from './risk-engine.service';

function policyNumber(): string {
  return `WIP-${Date.now().toString(36).toUpperCase()}`;
}

function claimNumber(): string {
  return `CLM-${Date.now().toString(36).toUpperCase()}`;
}

@Injectable()
export class InsuranceService {
  constructor(
    @InjectModel(InsurancePolicy.name)
    private readonly policyModel: Model<InsurancePolicyDocument>,
    @InjectModel(InsuranceClaim.name)
    private readonly claimModel: Model<InsuranceClaimDocument>,
    private readonly riskEngine: RiskEngineService,
  ) {}

  /** Quote without issuing — Risk Engine + Premium Calculation. */
  async quote(userId: string, coverageLimitRwf = 500_000) {
    const scores = this.riskEngine.score({
      userId,
      kycLevel: 1,
      biometricEnabled: false,
      trustedDeviceCount: 0,
      recentTxCount: 5,
      openFraudFlags: 0,
    });
    const premiumRwf = this.riskEngine.calculatePremium(
      scores.overall,
      coverageLimitRwf,
    );
    return {
      coverageLimitRwf,
      premiumRwf,
      riskScores: scores,
      flow: [
        'User Enables Insurance',
        'Risk Engine Scores Wallet',
        'Monthly Premium Calculated',
        'Policy Issued',
      ],
    };
  }

  /**
   * Insurance Flow: enable → score → premium → issue policy.
   */
  async enable(userId: string, dto: EnableInsuranceDto) {
    const existing = await this.policyModel.findOne({ userId }).exec();
    if (existing && existing.status === InsurancePolicyStatus.ACTIVE) {
      throw new ConflictException('Wallet insurance already active');
    }

    const coverageLimitRwf = dto.desiredCoverageLimitRwf ?? 500_000;
    const scores = this.riskEngine.score({
      userId,
      kycLevel: 2,
      biometricEnabled: true,
      trustedDeviceCount: 1,
      recentTxCount: 12,
      openFraudFlags: 0,
    });
    const premiumRwf = this.riskEngine.calculatePremium(
      scores.overall,
      coverageLimitRwf,
    );

    if (existing) {
      existing.status = InsurancePolicyStatus.ACTIVE;
      existing.premiumRwf = premiumRwf;
      existing.coverageLimitRwf = coverageLimitRwf;
      existing.riskScores = scores;
      existing.issuedAt = new Date();
      existing.nextBillingAt = new Date(Date.now() + 30 * 24 * 3600_000);
      existing.cancelledAt = undefined;
      await existing.save();
      return this.toPolicyView(existing);
    }

    const policy = await this.policyModel.create({
      userId: new Types.ObjectId(userId),
      policyNumber: policyNumber(),
      status: InsurancePolicyStatus.ACTIVE,
      premiumRwf,
      coverageLimitRwf,
      riskScores: scores,
      issuedAt: new Date(),
      nextBillingAt: new Date(Date.now() + 30 * 24 * 3600_000),
    });

    return this.toPolicyView(policy);
  }

  async getMyPolicy(userId: string) {
    const policy = await this.policyModel.findOne({ userId }).exec();
    if (!policy) return null;
    return this.toPolicyView(policy);
  }

  async cancel(userId: string) {
    const policy = await this.requireActivePolicy(userId);
    policy.status = InsurancePolicyStatus.CANCELLED;
    policy.cancelledAt = new Date();
    await policy.save();
    return this.toPolicyView(policy);
  }

  /**
   * Claim Process: Wallet Drained → Claim Submitted → …
   */
  async submitClaim(userId: string, dto: SubmitClaimDto) {
    const policy = await this.requireActivePolicy(userId);
    if (dto.amountRwf > policy.coverageLimitRwf) {
      throw new BadRequestException(
        `Claim exceeds coverage limit of ${policy.coverageLimitRwf} RWF`,
      );
    }

    const open = await this.claimModel
      .exists({
        userId,
        status: {
          $in: [
            InsuranceClaimStatus.SUBMITTED,
            InsuranceClaimStatus.INVESTIGATING,
            InsuranceClaimStatus.APPROVED,
          ],
        },
      })
      .exec();
    if (open) {
      throw new ConflictException('You already have an open claim');
    }

    const fraudRiskScore = Math.max(
      10,
      100 - (policy.riskScores?.overall ?? 50),
    );

    const claim = await this.claimModel.create({
      policyId: policy._id,
      userId: new Types.ObjectId(userId),
      claimNumber: claimNumber(),
      amountRwf: dto.amountRwf,
      status: InsuranceClaimStatus.SUBMITTED,
      reason: dto.reason.trim(),
      drainTxRef: dto.drainTxRef?.trim(),
      evidenceNote: dto.evidenceNote?.trim(),
      submittedAt: new Date(),
      fraudRiskScore,
    });

    // Auto-start fraud investigation
    claim.status = InsuranceClaimStatus.INVESTIGATING;
    claim.investigationStartedAt = new Date();
    await claim.save();

    return this.toClaimView(claim);
  }

  async listClaims(userId: string) {
    const claims = await this.claimModel
      .find({ userId })
      .sort({ createdAt: -1 })
      .limit(50)
      .exec();
    return claims.map((c) => this.toClaimView(c));
  }

  async getClaim(userId: string, id: string) {
    const claim = await this.requireClaim(id);
    if (claim.userId.toString() !== userId) {
      throw new ForbiddenException('Not your claim');
    }
    return this.toClaimView(claim);
  }

  /** Claim Review (internal / ops). */
  async reviewClaim(id: string, dto: ReviewClaimDto) {
    const claim = await this.requireClaim(id);
    if (claim.status !== InsuranceClaimStatus.INVESTIGATING) {
      throw new BadRequestException('Claim is not under investigation');
    }
    if (dto.status !== 'approved' && dto.status !== 'rejected') {
      throw new BadRequestException('Review must approve or reject');
    }

    claim.status =
      dto.status === 'approved'
        ? InsuranceClaimStatus.APPROVED
        : InsuranceClaimStatus.REJECTED;
    claim.reviewedAt = new Date();
    claim.reviewNote = dto.reviewNote?.trim();
    await claim.save();
    return this.toClaimView(claim);
  }

  /** Payout after approval. */
  async payoutClaim(id: string) {
    const claim = await this.requireClaim(id);
    if (claim.status !== InsuranceClaimStatus.APPROVED) {
      throw new BadRequestException('Claim must be approved before payout');
    }

    claim.status = InsuranceClaimStatus.PAID;
    claim.paidAt = new Date();
    claim.payoutRef = `PAY-${claim.claimNumber}-${Date.now().toString(36).toUpperCase()}`;
    await claim.save();
    return this.toClaimView(claim);
  }

  /** Dashboard modules for the Insurance Service surface. */
  async dashboard(userId: string) {
    const policy = await this.getMyPolicy(userId);
    const claims = await this.listClaims(userId);
    return {
      modules: [
        'Policy Creation',
        'Premium Calculation',
        'Coverage Management',
        'Claim Submission',
        'Claim Review',
        'Payouts',
      ],
      insuranceFlow: [
        'User Enables Insurance',
        'Risk Engine Scores Wallet',
        'Monthly Premium Calculated',
        'Policy Issued',
      ],
      claimProcess: [
        'Wallet Drained',
        'Claim Submitted',
        'Fraud Investigation',
        'Claim Approved',
        'Insurance Payout',
      ],
      riskEngine: [
        'Device Reputation',
        'Transaction History',
        'KYC Score',
        'Security Score',
        'Fraud Detection',
      ],
      policy,
      claims,
    };
  }

  private async requireActivePolicy(userId: string) {
    const policy = await this.policyModel.findOne({ userId }).exec();
    if (!policy || policy.status !== InsurancePolicyStatus.ACTIVE) {
      throw new NotFoundException('No active wallet insurance policy');
    }
    return policy;
  }

  private async requireClaim(id: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException('Claim not found');
    }
    const claim = await this.claimModel.findById(id).exec();
    if (!claim) throw new NotFoundException('Claim not found');
    return claim;
  }

  private toPolicyView(policy: InsurancePolicyDocument) {
    return {
      id: policy._id.toString(),
      policyNumber: policy.policyNumber,
      status: policy.status,
      premiumRwf: policy.premiumRwf,
      coverageLimitRwf: policy.coverageLimitRwf,
      riskScores: policy.riskScores,
      issuedAt: policy.issuedAt?.toISOString(),
      nextBillingAt: policy.nextBillingAt?.toISOString(),
      cancelledAt: policy.cancelledAt?.toISOString(),
      createdAt: policy.createdAt?.toISOString(),
    };
  }

  private toClaimView(claim: InsuranceClaimDocument) {
    return {
      id: claim._id.toString(),
      claimNumber: claim.claimNumber,
      policyId: claim.policyId.toString(),
      amountRwf: claim.amountRwf,
      status: claim.status,
      reason: claim.reason,
      drainTxRef: claim.drainTxRef,
      evidenceNote: claim.evidenceNote,
      fraudRiskScore: claim.fraudRiskScore,
      submittedAt: claim.submittedAt?.toISOString(),
      investigationStartedAt: claim.investigationStartedAt?.toISOString(),
      reviewedAt: claim.reviewedAt?.toISOString(),
      reviewNote: claim.reviewNote,
      paidAt: claim.paidAt?.toISOString(),
      payoutRef: claim.payoutRef,
      process: [
        'Wallet Drained',
        'Claim Submitted',
        'Fraud Investigation',
        'Claim Approved',
        'Insurance Payout',
      ],
      createdAt: claim.createdAt?.toISOString(),
    };
  }
}

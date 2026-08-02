import { Injectable } from '@nestjs/common';

import type { InsuranceRiskScores } from '@fastpay/schemas';

export type RiskProfileInput = {
  userId: string;
  /** 0–100 from KYC level mapping */
  kycLevel?: number;
  biometricEnabled?: boolean;
  trustedDeviceCount?: number;
  recentTxCount?: number;
  openFraudFlags?: number;
};

/**
 * Deterministic wallet risk engine (diagram: Device Reputation,
 * Transaction History, KYC Score, Security Score, Fraud Detection).
 * Higher overall = safer → lower premium.
 */
@Injectable()
export class RiskEngineService {
  score(input: RiskProfileInput): InsuranceRiskScores {
    const kycScore = this.clamp(
      input.kycLevel == null ? 40 : Math.min(100, 35 + input.kycLevel * 20),
    );

    const deviceReputation = this.clamp(
      35 + (input.trustedDeviceCount ?? 0) * 25,
    );

    const securityScore = this.clamp(
      (input.biometricEnabled ? 70 : 40) + (input.trustedDeviceCount ? 15 : 0),
    );

    const tx = input.recentTxCount ?? 0;
    const transactionHistory = this.clamp(
      tx === 0 ? 45 : Math.min(95, 50 + Math.log10(tx + 1) * 25),
    );

    const fraudDetection = this.clamp(
      90 - (input.openFraudFlags ?? 0) * 35,
    );

    const overall = this.clamp(
      Math.round(
        deviceReputation * 0.2 +
          transactionHistory * 0.2 +
          kycScore * 0.25 +
          securityScore * 0.2 +
          fraudDetection * 0.15,
      ),
    );

    return {
      deviceReputation,
      transactionHistory,
      kycScore,
      securityScore,
      fraudDetection,
      overall,
    };
  }

  /** Base 2_000 RWF/mo; riskier wallets pay more (up to ~8_000). */
  calculatePremium(overallScore: number, coverageLimitRwf: number): number {
    const riskFactor = 1 + (100 - overallScore) / 50;
    const coverageFactor = Math.max(1, coverageLimitRwf / 500_000);
    const premium = Math.round(2_000 * riskFactor * Math.sqrt(coverageFactor));
    return Math.min(15_000, Math.max(1_000, premium));
  }

  private clamp(n: number) {
    return Math.max(0, Math.min(100, Math.round(n)));
  }
}

export const LOCK_PERIOD_OPTIONS = [15, 20, 25, 30] as const;

import type { WeeklyFinanceSources } from "@/lib/analytics/weekly";
import { normalizeAllSources } from "@/lib/analytics/weekly";

export type LockPeriodYears = (typeof LOCK_PERIOD_OPTIONS)[number];

export const YEARLY_INCOME_PERCENT_OPTIONS = [5, 10, 15, 20, 25, 30] as const;

export type YearlyIncomePercent =
  (typeof YEARLY_INCOME_PERCENT_OPTIONS)[number];

export interface FamilyPlanSettings {
  yearlyIncomePercent: YearlyIncomePercent;
}

export interface FamilyChildPlan {
  id: string;
  name: string;
  targetRwf: number;
  savedRwf: number;
  lockYears: LockPeriodYears;
  createdAt: string;
}

export interface FamilyContribution {
  id: string;
  planId: string;
  amountRwf: number;
  contributedAt: string;
}

export interface FamilyPlanData {
  settings: FamilyPlanSettings;
  plans: FamilyChildPlan[];
  contributions: FamilyContribution[];
}

export interface FamilyIncomeAllocation {
  yearlyIncomeRwf: number;
  yearlyPercent: number;
  yearlyAllowanceRwf: number;
  contributedYtdRwf: number;
  remainingAllowanceRwf: number;
  deductedFromIncomeRwf: number;
  availableIncomeRwf: number;
}

export interface AdjustedPeriodIncome {
  grossIncomeRwf: number;
  familyPlanDeductionRwf: number;
  availableIncomeRwf: number;
}

export interface TimelineMilestone {
  year: number;
  yearOffset: number;
  label: string;
  amountRwf: number;
  isPast: boolean;
  isCurrent: boolean;
  isUnlock: boolean;
}

export interface FamilyChildPlanStatus {
  planId: string;
  progress: number;
  remainingRwf: number;
  unlockDate: Date;
  unlockLabel: string;
  yearsRemaining: number;
  isLocked: boolean;
  isUnlocked: boolean;
  timeline: TimelineMilestone[];
}

const CHILD_NAME_PRESETS = [
  "First child",
  "Second child",
  "Third child",
  "Fourth child",
  "Fifth child",
];

export function createFamilyPlanId(): string {
  return `family-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function createDefaultFamilySettings(): FamilyPlanSettings {
  return { yearlyIncomePercent: 10 };
}

export function createFamilyContributionId(): string {
  return `fcontrib-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function getYearlyIncomeRwf(
  sources: WeeklyFinanceSources,
  year: number = new Date().getFullYear(),
): number {
  const transactions = normalizeAllSources(sources);

  return transactions
    .filter(
      (tx) =>
        tx.direction === "income" &&
        new Date(tx.occurredAt).getFullYear() === year,
    )
    .reduce((sum, tx) => sum + tx.amountRwf, 0);
}

export function filterContributionsYtd(
  contributions: FamilyContribution[],
  year: number = new Date().getFullYear(),
): FamilyContribution[] {
  return contributions.filter(
    (item) => new Date(item.contributedAt).getFullYear() === year,
  );
}

export function filterContributionsInRange(
  contributions: FamilyContribution[],
  start: Date,
  end: Date,
): FamilyContribution[] {
  const startMs = start.getTime();
  const endMs = end.getTime();

  return contributions.filter((item) => {
    const at = new Date(item.contributedAt).getTime();
    return at >= startMs && at <= endMs;
  });
}

export function totalContributed(
  contributions: FamilyContribution[],
): number {
  return contributions.reduce((sum, item) => sum + item.amountRwf, 0);
}

export function computeYearlyFamilyAllowance(
  yearlyIncomeRwf: number,
  yearlyPercent: number,
): number {
  return Math.round((Math.max(yearlyIncomeRwf, 0) * yearlyPercent) / 100);
}

export function evaluateFamilyIncomeAllocation(input: {
  yearlyIncomeRwf: number;
  yearlyPercent: number;
  contributions: FamilyContribution[];
  year?: number;
}): FamilyIncomeAllocation {
  const year = input.year ?? new Date().getFullYear();
  const ytdContributions = filterContributionsYtd(input.contributions, year);
  const contributedYtdRwf = totalContributed(ytdContributions);
  const yearlyAllowanceRwf = computeYearlyFamilyAllowance(
    input.yearlyIncomeRwf,
    input.yearlyPercent,
  );
  const remainingAllowanceRwf = Math.max(
    yearlyAllowanceRwf - contributedYtdRwf,
    0,
  );

  return {
    yearlyIncomeRwf: input.yearlyIncomeRwf,
    yearlyPercent: input.yearlyPercent,
    yearlyAllowanceRwf,
    contributedYtdRwf,
    remainingAllowanceRwf,
    deductedFromIncomeRwf: contributedYtdRwf,
    availableIncomeRwf: Math.max(input.yearlyIncomeRwf - contributedYtdRwf, 0),
  };
}

export function applyPeriodIncomeDeduction(
  grossIncomeRwf: number,
  contributions: FamilyContribution[],
  start: Date,
  end: Date,
): AdjustedPeriodIncome {
  const periodContributions = filterContributionsInRange(
    contributions,
    start,
    end,
  );
  const familyPlanDeductionRwf = totalContributed(periodContributions);

  return {
    grossIncomeRwf,
    familyPlanDeductionRwf,
    availableIncomeRwf: Math.max(grossIncomeRwf - familyPlanDeductionRwf, 0),
  };
}

export function validateFamilyContribution(
  amountRwf: number,
  allocation: FamilyIncomeAllocation,
): { valid: boolean; message?: string } {
  const amount = Math.max(amountRwf, 0);

  if (amount <= 0) {
    return { valid: false, message: "Enter an amount greater than 0." };
  }

  if (allocation.yearlyAllowanceRwf <= 0) {
    return {
      valid: false,
      message: "No yearly income available to allocate. Record income first.",
    };
  }

  if (amount > allocation.remainingAllowanceRwf) {
    return {
      valid: false,
      message: `Only ${allocation.remainingAllowanceRwf.toLocaleString()} RWF left from your ${allocation.yearlyPercent}% yearly income allocation.`,
    };
  }

  return { valid: true };
}

export function suggestChildName(existingCount: number): string {
  return CHILD_NAME_PRESETS[existingCount] ?? `Child ${existingCount + 1}`;
}

export function getUnlockDate(
  createdAt: string,
  lockYears: LockPeriodYears,
): Date {
  const start = new Date(createdAt);
  const unlock = new Date(start);
  unlock.setFullYear(unlock.getFullYear() + lockYears);
  return unlock;
}

export function formatUnlockDate(date: Date): string {
  return date.toLocaleDateString("en-GB", {
    month: "short",
    year: "numeric",
  });
}

export function evaluateFamilyPlan(
  plan: FamilyChildPlan,
  today: Date = new Date(),
): FamilyChildPlanStatus {
  const target = Math.max(plan.targetRwf, 0);
  const saved = Math.max(plan.savedRwf, 0);
  const progress = target > 0 ? Math.min(saved / target, 1) : 0;
  const remainingRwf = Math.max(target - saved, 0);
  const unlockDate = getUnlockDate(plan.createdAt, plan.lockYears);
  const isUnlocked = today.getTime() >= unlockDate.getTime();
  const isLocked = !isUnlocked;

  const msRemaining = Math.max(unlockDate.getTime() - today.getTime(), 0);
  const yearsRemaining = Math.ceil(msRemaining / (1000 * 60 * 60 * 24 * 365.25));

  return {
    planId: plan.id,
    progress,
    remainingRwf,
    unlockDate,
    unlockLabel: formatUnlockDate(unlockDate),
    yearsRemaining: isUnlocked ? 0 : yearsRemaining,
    isLocked,
    isUnlocked,
    timeline: buildTimeline(plan, today),
  };
}

export function buildTimeline(
  plan: FamilyChildPlan,
  today: Date = new Date(),
): TimelineMilestone[] {
  const startYear = new Date(plan.createdAt).getFullYear();
  const currentYear = today.getFullYear();
  const target = Math.max(plan.targetRwf, 0);
  const saved = Math.max(plan.savedRwf, 0);

  const offsets = [0];
  for (let year = 5; year < plan.lockYears; year += 5) {
    offsets.push(year);
  }
  if (!offsets.includes(plan.lockYears)) {
    offsets.push(plan.lockYears);
  }

  return offsets.map((offset) => {
    const year = startYear + offset;
    const ratio = plan.lockYears > 0 ? offset / plan.lockYears : 0;
    const amountRwf = Math.round(saved + (target - saved) * ratio);
    const isPast = year < currentYear;
    const isCurrent = year === currentYear;
    const isUnlock = offset === plan.lockYears;

    let label = `${offset} years`;
    if (offset === 0) {
      label = "Start";
    } else if (isUnlock) {
      label = "Unlock";
    }

    return {
      year,
      yearOffset: offset,
      label,
      amountRwf,
      isPast,
      isCurrent,
      isUnlock,
    };
  });
}

export function totalFamilySaved(plans: FamilyChildPlan[]): number {
  return plans.reduce((sum, plan) => sum + Math.max(plan.savedRwf, 0), 0);
}

export function totalFamilyLocked(plans: FamilyChildPlan[]): number {
  const today = new Date();
  return plans
    .filter((plan) => !evaluateFamilyPlan(plan, today).isUnlocked)
    .reduce((sum, plan) => sum + Math.max(plan.savedRwf, 0), 0);
}

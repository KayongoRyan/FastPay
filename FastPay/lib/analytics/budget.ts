export type BudgetPeriod = "weekly" | "monthly" | "yearly";

export interface BudgetBucket {
  id: string;
  name: string;
  percent: number;
}

export interface UserBudget {
  period: BudgetPeriod;
  incomeBaseRwf: number;
  buckets: BudgetBucket[];
  updatedAt: string;
}

export type BudgetHealth = "on_track" | "warning" | "over_budget";

export interface BudgetAllocation {
  bucketId: string;
  name: string;
  percent: number;
  plannedRwf: number;
  isSavings: boolean;
}

export interface PeriodCashFlow {
  incomeTotalRwf: number;
  expenseTotalRwf: number;
  netRwf: number;
}

export interface BudgetStatus {
  allocations: BudgetAllocation[];
  actualIncomeRwf: number;
  actualExpenseRwf: number;
  actualNetRwf: number;
  spendAllowanceRwf: number;
  spendUsedRwf: number;
  spendProgress: number;
  spendRemainingRwf: number;
  savingsPlannedRwf: number;
  savingsActualRwf: number;
  savingsProgress: number;
  incomeProgress: number;
  health: BudgetHealth;
  insights: string[];
}

const SAVINGS_KEYWORDS = ["savings", "save", "goal", "invest"];

export const DEFAULT_BUCKETS: BudgetBucket[] = [
  { id: "needs", name: "Needs", percent: 50 },
  { id: "wants", name: "Wants", percent: 30 },
  { id: "savings", name: "Savings", percent: 20 },
];

export function getBudgetPeriodLabel(period: BudgetPeriod): string {
  if (period === "weekly") {
    return "week";
  }
  if (period === "monthly") {
    return "month";
  }
  return "year";
}

export function createDefaultBudget(): UserBudget {
  return {
    period: "monthly",
    incomeBaseRwf: 0,
    buckets: DEFAULT_BUCKETS.map((bucket) => ({ ...bucket })),
    updatedAt: new Date().toISOString(),
  };
}

export function isSavingsBucket(name: string): boolean {
  const lower = name.trim().toLowerCase();
  return SAVINGS_KEYWORDS.some((keyword) => lower.includes(keyword));
}

export function sumBucketPercents(buckets: BudgetBucket[]): number {
  return buckets.reduce((sum, bucket) => sum + bucket.percent, 0);
}

export function validatePercentages(buckets: BudgetBucket[]): {
  valid: boolean;
  total: number;
  message?: string;
} {
  if (buckets.length < 2) {
    return { valid: false, total: sumBucketPercents(buckets), message: "Add at least 2 budget buckets." };
  }
  if (buckets.length > 5) {
    return { valid: false, total: sumBucketPercents(buckets), message: "Maximum 5 budget buckets." };
  }

  const total = sumBucketPercents(buckets);
  if (total !== 100) {
    return {
      valid: false,
      total,
      message: `Bucket percentages must total 100% (currently ${total}%).`,
    };
  }

  const invalid = buckets.some(
    (bucket) => bucket.percent < 0 || bucket.percent > 100 || !bucket.name.trim(),
  );
  if (invalid) {
    return {
      valid: false,
      total,
      message: "Each bucket needs a name and a percent between 0 and 100.",
    };
  }

  return { valid: true, total };
}

export function allocateBudget(
  incomeBaseRwf: number,
  buckets: BudgetBucket[],
): BudgetAllocation[] {
  const base = Math.max(incomeBaseRwf, 0);

  return buckets.map((bucket) => ({
    bucketId: bucket.id,
    name: bucket.name,
    percent: bucket.percent,
    plannedRwf: Math.round((base * bucket.percent) / 100),
    isSavings: isSavingsBucket(bucket.name),
  }));
}

export function evaluateBudget(
  budget: UserBudget,
  cashFlow: PeriodCashFlow,
): BudgetStatus {
  const allocations = allocateBudget(budget.incomeBaseRwf, budget.buckets);
  const spendAllowanceRwf = allocations
    .filter((allocation) => !allocation.isSavings)
    .reduce((sum, allocation) => sum + allocation.plannedRwf, 0);

  const savingsPlannedRwf = allocations
    .filter((allocation) => allocation.isSavings)
    .reduce((sum, allocation) => sum + allocation.plannedRwf, 0);

  const actualIncomeRwf = cashFlow.incomeTotalRwf;
  const actualExpenseRwf = cashFlow.expenseTotalRwf;
  const actualNetRwf = cashFlow.netRwf;
  const spendUsedRwf = actualExpenseRwf;
  const savingsActualRwf = Math.max(actualNetRwf, 0);

  const spendProgress =
    spendAllowanceRwf > 0 ? spendUsedRwf / spendAllowanceRwf : 0;
  const spendRemainingRwf = Math.max(spendAllowanceRwf - spendUsedRwf, 0);
  const savingsProgress =
    savingsPlannedRwf > 0 ? savingsActualRwf / savingsPlannedRwf : 0;
  const incomeProgress =
    budget.incomeBaseRwf > 0 ? actualIncomeRwf / budget.incomeBaseRwf : 0;

  const health = resolveBudgetHealth(spendProgress, spendAllowanceRwf);
  const insights = buildBudgetInsights({
    budget,
    spendAllowanceRwf,
    spendUsedRwf,
    spendRemainingRwf,
    spendProgress,
    savingsPlannedRwf,
    savingsActualRwf,
    actualIncomeRwf,
    incomeProgress,
    actualNetRwf,
    health,
  });

  return {
    allocations,
    actualIncomeRwf,
    actualExpenseRwf,
    actualNetRwf,
    spendAllowanceRwf,
    spendUsedRwf,
    spendProgress,
    spendRemainingRwf,
    savingsPlannedRwf,
    savingsActualRwf,
    savingsProgress,
    incomeProgress,
    health,
    insights,
  };
}

function resolveBudgetHealth(
  spendProgress: number,
  spendAllowanceRwf: number,
): BudgetHealth {
  if (spendAllowanceRwf <= 0) {
    return "on_track";
  }
  if (spendProgress > 1) {
    return "over_budget";
  }
  if (spendProgress >= 0.8) {
    return "warning";
  }
  return "on_track";
}

function buildBudgetInsights(input: {
  budget: UserBudget;
  spendAllowanceRwf: number;
  spendUsedRwf: number;
  spendRemainingRwf: number;
  spendProgress: number;
  savingsPlannedRwf: number;
  savingsActualRwf: number;
  actualIncomeRwf: number;
  incomeProgress: number;
  actualNetRwf: number;
  health: BudgetHealth;
}): string[] {
  const insights: string[] = [];
  const periodLabel = getBudgetPeriodLabel(input.budget.period);

  if (input.budget.incomeBaseRwf > 0) {
    if (input.incomeProgress >= 1) {
      insights.push(`Income target reached for this ${periodLabel}.`);
    } else if (input.actualIncomeRwf < input.budget.incomeBaseRwf) {
      insights.push(
        `${formatRwf(input.budget.incomeBaseRwf - input.actualIncomeRwf)} below your planned income this ${periodLabel}.`,
      );
    }
  }

  if (input.spendAllowanceRwf > 0) {
    if (input.health === "over_budget") {
      insights.push(
        `Spending is ${formatRwf(input.spendUsedRwf - input.spendAllowanceRwf)} over your ${periodLabel}ly budget.`,
      );
    } else if (input.health === "warning") {
      insights.push(
        `${Math.round(input.spendProgress * 100)}% of your spending budget used this ${periodLabel}.`,
      );
    } else if (input.spendRemainingRwf > 0) {
      insights.push(
        `${formatRwf(input.spendRemainingRwf)} left in your spending budget.`,
      );
    }
  }

  if (input.savingsPlannedRwf > 0) {
    if (input.savingsActualRwf >= input.savingsPlannedRwf) {
      insights.push(`Savings target met: ${formatRwf(input.savingsActualRwf)} saved.`);
    } else {
      insights.push(
        `${formatRwf(input.savingsPlannedRwf - input.savingsActualRwf)} more to hit your savings allocation.`,
      );
    }
  }

  if (input.actualNetRwf < 0) {
    insights.push(
      `Cash flow is negative by ${formatRwf(Math.abs(input.actualNetRwf))} this ${periodLabel}.`,
    );
  }

  if (insights.length === 0) {
    insights.push("Set your income and bucket percentages to start tracking.");
  }

  return insights.slice(0, 3);
}

function formatRwf(amount: number): string {
  return `${Math.round(amount).toLocaleString()} RWF`;
}

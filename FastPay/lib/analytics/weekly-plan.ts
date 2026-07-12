import type { WeeklySummary } from "@/lib/analytics/weekly";

export interface WeeklyPlan {
  weekKey: string;
  incomeTargetRwf: number;
  expenseLimitRwf: number;
}

export type PlanHealth = "on_track" | "warning" | "over_budget";

export interface WeeklyPlanStatus {
  incomeProgress: number;
  expenseProgress: number;
  incomeRemainingRwf: number;
  expenseRemainingRwf: number;
  daysLeft: number;
  dailySpendAllowanceRwf: number;
  health: PlanHealth;
  insights: string[];
}

export function createEmptyPlan(weekKey: string): WeeklyPlan {
  return {
    weekKey,
    incomeTargetRwf: 0,
    expenseLimitRwf: 0,
  };
}

export function evaluateWeeklyPlan(
  summary: WeeklySummary,
  plan: WeeklyPlan,
  today: Date = new Date(),
): WeeklyPlanStatus {
  const incomeTarget = Math.max(plan.incomeTargetRwf, 0);
  const expenseLimit = Math.max(plan.expenseLimitRwf, 0);

  const incomeProgress =
    incomeTarget > 0 ? summary.incomeTotalRwf / incomeTarget : 0;
  const expenseProgress =
    expenseLimit > 0 ? summary.expenseTotalRwf / expenseLimit : 0;

  const incomeRemainingRwf = Math.max(
    incomeTarget - summary.incomeTotalRwf,
    0,
  );
  const expenseRemainingRwf = Math.max(
    expenseLimit - summary.expenseTotalRwf,
    0,
  );

  const daysLeft = countDaysLeftInWeek(summary.bounds.end, today);
  const dailySpendAllowanceRwf =
    daysLeft > 0 ? Math.round(expenseRemainingRwf / daysLeft) : 0;

  const health = resolveHealth(expenseProgress, expenseLimit);
  const insights = buildInsights({
    summary,
    plan,
    incomeProgress,
    expenseProgress,
    incomeRemainingRwf,
    expenseRemainingRwf,
    daysLeft,
    dailySpendAllowanceRwf,
    health,
  });

  return {
    incomeProgress,
    expenseProgress,
    incomeRemainingRwf,
    expenseRemainingRwf,
    daysLeft,
    dailySpendAllowanceRwf,
    health,
    insights,
  };
}

function countDaysLeftInWeek(weekEnd: Date, today: Date): number {
  const end = new Date(weekEnd);
  end.setHours(23, 59, 59, 999);
  const now = new Date(today);
  now.setHours(12, 0, 0, 0);

  if (now.getTime() > end.getTime()) {
    return 0;
  }

  const diffMs = end.getTime() - now.getTime();
  return Math.max(Math.ceil(diffMs / (1000 * 60 * 60 * 24)), 1);
}

function resolveHealth(
  expenseProgress: number,
  expenseLimit: number,
): PlanHealth {
  if (expenseLimit <= 0) {
    return "on_track";
  }
  if (expenseProgress > 1) {
    return "over_budget";
  }
  if (expenseProgress >= 0.8) {
    return "warning";
  }
  return "on_track";
}

function buildInsights(input: {
  summary: WeeklySummary;
  plan: WeeklyPlan;
  incomeProgress: number;
  expenseProgress: number;
  incomeRemainingRwf: number;
  expenseRemainingRwf: number;
  daysLeft: number;
  dailySpendAllowanceRwf: number;
  health: PlanHealth;
}): string[] {
  const insights: string[] = [];
  const {
    summary,
    plan,
    incomeProgress,
    expenseProgress,
    incomeRemainingRwf,
    expenseRemainingRwf,
    daysLeft,
    dailySpendAllowanceRwf,
    health,
  } = input;

  if (plan.expenseLimitRwf > 0) {
    if (health === "over_budget") {
      insights.push(
        `You are ${formatRwf(summary.expenseTotalRwf - plan.expenseLimitRwf)} over your weekly expense limit.`,
      );
    } else if (health === "warning") {
      insights.push(
        `${Math.round(expenseProgress * 100)}% of your weekly budget used with ${daysLeft} day${daysLeft === 1 ? "" : "s"} left.`,
      );
    } else {
      insights.push(
        `${formatRwf(expenseRemainingRwf)} left in your weekly budget.`,
      );
    }

    if (daysLeft > 0 && expenseRemainingRwf > 0) {
      insights.push(
        `Suggested daily spend: ${formatRwf(dailySpendAllowanceRwf)} for the rest of the week.`,
      );
    }
  }

  if (plan.incomeTargetRwf > 0) {
    if (incomeProgress >= 1) {
      insights.push("Income target reached for this week.");
    } else if (incomeRemainingRwf > 0) {
      insights.push(
        `${formatRwf(incomeRemainingRwf)} more income needed to hit your target.`,
      );
    }
  }

  if (summary.netRwf < 0) {
    insights.push(
      `Net position is negative by ${formatRwf(Math.abs(summary.netRwf))} this week.`,
    );
  } else if (summary.netRwf > 0 && insights.length < 3) {
    insights.push(
      `Net savings this week: ${formatRwf(summary.netRwf)}.`,
    );
  }

  if (insights.length === 0) {
    insights.push("Set income and expense targets to get weekly planning tips.");
  }

  return insights.slice(0, 3);
}

function formatRwf(amount: number): string {
  return `${Math.round(amount).toLocaleString()} RWF`;
}

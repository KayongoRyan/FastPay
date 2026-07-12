import assert from "node:assert/strict";

import type { PaymentHistoryItem } from "@/lib/api/stellar";
import type { MomoHistoryItem } from "@/lib/api/momo";
import type { BillPayment } from "@/lib/bills/types";
import {
  buildWeeklySummary,
  filterTransactionsInWeek,
  getWeekBounds,
  getWeekKey,
  normalizeAllSources,
  normalizeBillPayment,
  normalizeMomoPayment,
  normalizeWalletPayment,
} from "@/lib/analytics/weekly";
import {
  allocateBudget,
  createDefaultBudget,
  evaluateBudget,
  validatePercentages,
} from "@/lib/analytics/budget";
import {
  buildMonthlySummary,
  getMonthBounds,
  getMonthKey,
} from "@/lib/analytics/monthly";
import { evaluateGoal } from "@/lib/analytics/goals";
import {
  buildTimeline,
  evaluateFamilyIncomeAllocation,
  evaluateFamilyPlan,
  getUnlockDate,
  suggestChildName,
  validateFamilyContribution,
} from "@/lib/analytics/family-plan";
import {
  createEmptyPlan,
  evaluateWeeklyPlan,
} from "@/lib/analytics/weekly-plan";

function runTests() {
  testWeekBoundsStartOnMonday();
  testWeekKeyFormat();
  testWalletNormalization();
  testBillAndMomoNormalization();
  testDailyBucketAssignment();
  testWeeklySummaryTotals();
  testPlanEvaluationStates();
  testEmptyWeek();
  testMonthBounds();
  testMonthlySummaryTotals();
  testAllocateBudget();
  testValidatePercentages();
  testEvaluateBudgetHealth();
  testGoalProgress();
  testFamilyPlanLockAndTimeline();
  testSuggestChildName();
  testFamilyIncomeAllocation();
}

function testWeekBoundsStartOnMonday() {
  const bounds = getWeekBounds(new Date("2026-07-08T15:00:00"));
  assert.equal(bounds.start.getDay(), 1);
  assert.equal(bounds.end.getDay(), 0);
  assert.match(bounds.weekKey, /^\d{4}-W\d{2}$/);
}

function testWeekKeyFormat() {
  const key = getWeekKey(new Date("2026-07-08T12:00:00"));
  assert.match(key, /^2026-W\d{2}$/);
}

function testWalletNormalization() {
  const payment: PaymentHistoryItem = {
    id: "p1",
    txHash: "hash",
    status: "confirmed",
    amount: "2",
    asset: "XLM",
    direction: "out",
    counterparty: "GABC1234",
    createdAt: "2026-07-10T10:00:00.000Z",
  };

  const tx = normalizeWalletPayment(payment);
  assert.equal(tx.direction, "expense");
  assert.equal(tx.amountRwf, 3000);
  assert.equal(tx.source, "wallet");
}

function testBillAndMomoNormalization() {
  const bill: BillPayment = {
    id: "b1",
    categoryId: "rent",
    label: "Rent",
    amountRwf: 120000,
    paidAt: "2026-07-09",
  };
  const momo: MomoHistoryItem = {
    paymentId: "m1",
    provider: "mtn",
    phone: "250700000000",
    amountRwf: 5000,
    status: "completed",
    createdAt: "2026-07-11T08:00:00.000Z",
  };

  assert.equal(normalizeBillPayment(bill).direction, "expense");
  assert.equal(normalizeMomoPayment(momo).title, "MoMo top-up (MTN)");
}

function testDailyBucketAssignment() {
  const sources = {
    payments: [
      {
        id: "p1",
        txHash: "h1",
        status: "confirmed",
        amount: "1",
        asset: "XLM",
        direction: "out" as const,
        counterparty: "GABC",
        createdAt: "2026-07-07T12:00:00.000Z",
      },
    ],
    bills: [],
    momoPayments: [],
  };

  const summary = buildWeeklySummary(sources, new Date("2026-07-12T12:00:00"));
  assert.equal(summary.expenseByDay[1], 1500);
}

function testWeeklySummaryTotals() {
  const sources = {
    payments: [
      {
        id: "in1",
        txHash: "h2",
        status: "confirmed",
        amount: "2",
        asset: "XLM",
        direction: "in" as const,
        counterparty: "GDEF",
        createdAt: "2026-07-08T12:00:00.000Z",
      },
      {
        id: "out1",
        txHash: "h3",
        status: "confirmed",
        amount: "1",
        asset: "XLM",
        direction: "out" as const,
        counterparty: "GHIJ",
        createdAt: "2026-07-09T12:00:00.000Z",
      },
    ],
    bills: [
      {
        id: "b1",
        categoryId: "groceries" as const,
        label: "Groceries",
        amountRwf: 10000,
        paidAt: "2026-07-10",
      },
    ],
    momoPayments: [],
  };

  const summary = buildWeeklySummary(sources, new Date("2026-07-12T12:00:00"));
  assert.equal(summary.incomeTotalRwf, 3000);
  assert.equal(summary.expenseTotalRwf, 11500);
  assert.equal(summary.netRwf, -8500);
  assert.equal(summary.transactionCount.income, 1);
  assert.equal(summary.transactionCount.expense, 2);
}

function testPlanEvaluationStates() {
  const summary = buildWeeklySummary(
    {
      payments: [
        {
          id: "out1",
          txHash: "h4",
          status: "confirmed",
          amount: "10",
          asset: "XLM",
          direction: "out" as const,
          counterparty: "GXYZ",
          createdAt: "2026-07-10T12:00:00.000Z",
        },
      ],
      bills: [],
      momoPayments: [],
    },
    new Date("2026-07-12T12:00:00"),
  );

  const onTrack = evaluateWeeklyPlan(
    summary,
    { weekKey: summary.bounds.weekKey, incomeTargetRwf: 0, expenseLimitRwf: 30000 },
    new Date("2026-07-12T12:00:00"),
  );
  assert.equal(onTrack.health, "on_track");

  const warning = evaluateWeeklyPlan(
    summary,
    { weekKey: summary.bounds.weekKey, incomeTargetRwf: 0, expenseLimitRwf: 18000 },
    new Date("2026-07-12T12:00:00"),
  );
  assert.equal(warning.health, "warning");

  const overBudget = evaluateWeeklyPlan(
    summary,
    { weekKey: summary.bounds.weekKey, incomeTargetRwf: 0, expenseLimitRwf: 10000 },
    new Date("2026-07-12T12:00:00"),
  );
  assert.equal(overBudget.health, "over_budget");
  assert.ok(overBudget.insights.length > 0);
}

function testEmptyWeek() {
  const summary = buildWeeklySummary(
    { payments: [], bills: [], momoPayments: [] },
    new Date("2026-07-12T12:00:00"),
  );
  assert.equal(summary.incomeTotalRwf, 0);
  assert.equal(summary.expenseTotalRwf, 0);
  assert.equal(summary.incomeTransactions.length, 0);

  const plan = createEmptyPlan(summary.bounds.weekKey);
  const status = evaluateWeeklyPlan(summary, plan);
  assert.equal(status.health, "on_track");
}

function testFilterTransactionsInWeek() {
  const txs = normalizeAllSources({
    payments: [
      {
        id: "old",
        txHash: "old",
        status: "confirmed",
        amount: "1",
        asset: "XLM",
        direction: "out" as const,
        counterparty: "GOLD",
        createdAt: "2026-06-01T12:00:00.000Z",
      },
    ],
    bills: [],
    momoPayments: [],
  });
  const bounds = getWeekBounds(new Date("2026-07-12T12:00:00"));
  const filtered = filterTransactionsInWeek(txs, bounds);
  assert.equal(filtered.length, 0);
}

function testMonthBounds() {
  const bounds = getMonthBounds(new Date("2026-07-15T12:00:00"));
  assert.equal(bounds.start.getDate(), 1);
  assert.equal(bounds.end.getDate(), 31);
  assert.equal(bounds.start.getMonth(), 6);
  assert.equal(bounds.daysInMonth, 31);
  assert.equal(getMonthKey(new Date("2026-07-15T12:00:00")), "2026-07");
}

function testMonthlySummaryTotals() {
  const sources = {
    payments: [
      {
        id: "in1",
        txHash: "h5",
        status: "confirmed",
        amount: "4",
        asset: "XLM",
        direction: "in" as const,
        counterparty: "GDEF",
        createdAt: "2026-07-05T12:00:00.000Z",
      },
    ],
    bills: [
      {
        id: "b2",
        categoryId: "rent" as const,
        label: "Rent",
        amountRwf: 50000,
        paidAt: "2026-07-01",
      },
    ],
    momoPayments: [],
  };

  const summary = buildMonthlySummary(sources, new Date("2026-07-15T12:00:00"));
  assert.equal(summary.incomeTotalRwf, 6000);
  assert.equal(summary.expenseTotalRwf, 50000);
  assert.equal(summary.netRwf, -44000);
  assert.equal(summary.incomeByDay[4], 6000);
}

function testAllocateBudget() {
  const budget = createDefaultBudget();
  budget.incomeBaseRwf = 100_000;

  const allocations = allocateBudget(budget.incomeBaseRwf, budget.buckets);
  assert.equal(allocations.length, 3);
  assert.equal(allocations[0].plannedRwf, 50_000);
  assert.equal(allocations[1].plannedRwf, 30_000);
  assert.equal(allocations[2].plannedRwf, 20_000);
  assert.equal(allocations[2].isSavings, true);
}

function testValidatePercentages() {
  const valid = validatePercentages(createDefaultBudget().buckets);
  assert.equal(valid.valid, true);
  assert.equal(valid.total, 100);

  const invalid = validatePercentages([
    { id: "a", name: "A", percent: 50 },
    { id: "b", name: "B", percent: 40 },
  ]);
  assert.equal(invalid.valid, false);
  assert.equal(invalid.total, 90);
}

function testEvaluateBudgetHealth() {
  const budget = createDefaultBudget();
  budget.incomeBaseRwf = 100_000;

  const onTrack = evaluateBudget(budget, {
    incomeTotalRwf: 100_000,
    expenseTotalRwf: 60_000,
    netRwf: 40_000,
  });
  assert.equal(onTrack.health, "on_track");
  assert.equal(onTrack.spendAllowanceRwf, 80_000);
  assert.equal(onTrack.savingsPlannedRwf, 20_000);

  const overBudget = evaluateBudget(budget, {
    incomeTotalRwf: 100_000,
    expenseTotalRwf: 90_000,
    netRwf: 10_000,
  });
  assert.equal(overBudget.health, "over_budget");
}

function testGoalProgress() {
  const inProgress = evaluateGoal({
    id: "g1",
    name: "Laptop",
    type: "short",
    targetRwf: 100_000,
    savedRwf: 25_000,
    createdAt: "2026-07-01T00:00:00.000Z",
  });
  assert.equal(inProgress.progress, 0.25);
  assert.equal(inProgress.remainingRwf, 75_000);
  assert.equal(inProgress.isComplete, false);

  const complete = evaluateGoal({
    id: "g2",
    name: "Emergency",
    type: "long",
    targetRwf: 50_000,
    savedRwf: 50_000,
    createdAt: "2026-07-01T00:00:00.000Z",
  });
  assert.equal(complete.progress, 1);
  assert.equal(complete.isComplete, true);
}

function testFamilyPlanLockAndTimeline() {
  const plan = {
    id: "f1",
    name: "First child",
    targetRwf: 1_000_000,
    savedRwf: 100_000,
    lockYears: 15 as const,
    createdAt: "2026-01-01T00:00:00.000Z",
  };

  const unlock = getUnlockDate(plan.createdAt, plan.lockYears);
  assert.equal(unlock.getFullYear(), 2041);

  const locked = evaluateFamilyPlan(plan, new Date("2030-06-01T00:00:00.000Z"));
  assert.equal(locked.isLocked, true);
  assert.ok(locked.yearsRemaining > 0);

  const unlocked = evaluateFamilyPlan(plan, new Date("2042-01-01T00:00:00.000Z"));
  assert.equal(unlocked.isUnlocked, true);
  assert.equal(unlocked.yearsRemaining, 0);

  const timeline = buildTimeline(plan, new Date("2026-07-01T00:00:00.000Z"));
  assert.equal(timeline[0].label, "Start");
  assert.equal(timeline[timeline.length - 1].label, "Unlock");
  assert.equal(timeline[timeline.length - 1].year, 2041);
}

function testSuggestChildName() {
  assert.equal(suggestChildName(0), "First child");
  assert.equal(suggestChildName(1), "Second child");
  assert.equal(suggestChildName(5), "Child 6");
}

function testFamilyIncomeAllocation() {
  const allocation = evaluateFamilyIncomeAllocation({
    yearlyIncomeRwf: 1_000_000,
    yearlyPercent: 20,
    contributions: [
      {
        id: "c1",
        planId: "f1",
        amountRwf: 50_000,
        contributedAt: "2026-07-01T00:00:00.000Z",
      },
    ],
    year: 2026,
  });

  assert.equal(allocation.yearlyAllowanceRwf, 200_000);
  assert.equal(allocation.contributedYtdRwf, 50_000);
  assert.equal(allocation.remainingAllowanceRwf, 150_000);
  assert.equal(allocation.availableIncomeRwf, 950_000);

  const validation = validateFamilyContribution(200_000, allocation);
  assert.equal(validation.valid, false);

  const ok = validateFamilyContribution(100_000, allocation);
  assert.equal(ok.valid, true);
}

runTests();
console.log("weekly analytics tests passed");

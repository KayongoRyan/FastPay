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

runTests();
console.log("weekly analytics tests passed");

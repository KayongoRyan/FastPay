import { useCallback, useEffect, useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useFocusEffect } from "@react-navigation/native";

import {
  WeekPicker,
  WeeklyPlanCard,
  WeeklyTransactionRow,
} from "@/components/analytics";
import { TabScreenLayout } from "@/components/layout/TabScreenLayout";
import { ExpenseChart } from "@/components/ui/ExpenseChart";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import {
  buildWeeklySummary,
  getWeekBounds,
  normalizeDailyChartValues,
  shiftWeek,
} from "@/lib/analytics/weekly";
import { evaluateWeeklyPlan, createEmptyPlan } from "@/lib/analytics/weekly-plan";
import { useBillsStore } from "@/store/billsStore";
import { useWalletStore } from "@/store/walletStore";
import { useWeeklyPlanStore } from "@/store/weeklyPlanStore";
import { colors } from "@/theme/colors";
import { radius, spacing } from "@/theme/spacing";

export default function AnalyticsScreen() {
  useRequireAuth();
  const [tab, setTab] = useState<"expenses" | "income">("expenses");
  const [weekAnchor, setWeekAnchor] = useState(() => new Date());

  const {
    wallet,
    initialize,
    refreshWalletData,
    payments,
    momoHistory,
    isRefreshing,
    error: walletError,
  } = useWalletStore();
  const { payments: bills, initialize: initBills } = useBillsStore();
  const {
    initialize: initPlans,
    plans,
    savePlan,
    isSaving: planSaving,
    isReady: plansReady,
  } = useWeeklyPlanStore();

  useEffect(() => {
    void initialize();
    void initBills();
    void initPlans();
  }, [initialize, initBills, initPlans]);

  useFocusEffect(
    useCallback(() => {
      if (wallet?.publicKey) {
        void refreshWalletData();
      }
    }, [wallet?.publicKey, refreshWalletData]),
  );

  const summary = useMemo(
    () =>
      buildWeeklySummary(
        { payments, bills, momoPayments: momoHistory },
        weekAnchor,
      ),
    [payments, bills, momoHistory, weekAnchor],
  );

  const currentWeekKey = useMemo(() => getWeekBounds(new Date()).weekKey, []);
  const isCurrentWeek = summary.bounds.weekKey === currentWeekKey;

  const plan = useMemo(
    () =>
      plansReady
        ? (plans[summary.bounds.weekKey] ?? createEmptyPlan(summary.bounds.weekKey))
        : null,
    [plans, plansReady, summary.bounds.weekKey],
  );

  const planStatus = useMemo(
    () =>
      plan
        ? evaluateWeeklyPlan(summary, plan)
        : null,
    [summary, plan],
  );

  const tabTransactions =
    tab === "expenses"
      ? summary.expenseTransactions
      : summary.incomeTransactions;

  const tabTotal =
    tab === "expenses" ? summary.expenseTotalRwf : summary.incomeTotalRwf;

  const chartData = normalizeDailyChartValues(
    tab === "expenses" ? summary.expenseByDay : summary.incomeByDay,
  );

  const loading = isRefreshing && payments.length === 0 && momoHistory.length === 0;

  return (
    <TabScreenLayout
      refreshing={isRefreshing}
      onRefresh={() => void refreshWalletData()}
    >
      <Text style={styles.header}>STATISTICS</Text>

      <WeekPicker
        bounds={summary.bounds}
        isCurrentWeek={isCurrentWeek}
        onPrevious={() => setWeekAnchor((date) => shiftWeek(date, -1))}
        onNext={() => {
          if (!isCurrentWeek) {
            setWeekAnchor((date) => shiftWeek(date, 1));
          }
        }}
      />

      <View style={styles.summaryRow}>
        <SummaryCard
          label="Income"
          value={summary.incomeTotalRwf}
          tone="income"
        />
        <SummaryCard
          label="Expenses"
          value={summary.expenseTotalRwf}
          tone="expense"
        />
        <SummaryCard
          label="Net"
          value={summary.netRwf}
          tone={summary.netRwf >= 0 ? "income" : "expense"}
        />
      </View>

      <View style={styles.toggle}>
        <Pressable
          style={[styles.tabBtn, tab === "expenses" && styles.tabActive]}
          onPress={() => setTab("expenses")}
        >
          <Text style={[styles.tabText, tab === "expenses" && styles.tabTextActive]}>
            Expenses
          </Text>
        </Pressable>
        <Pressable
          style={[styles.tabBtn, tab === "income" && styles.tabActive]}
          onPress={() => setTab("income")}
        >
          <Text style={[styles.tabText, tab === "income" && styles.tabTextActive]}>
            Income
          </Text>
        </Pressable>
      </View>

      <Text style={styles.totalLabel}>
        {tab === "expenses" ? "Spent this week" : "Earned this week"}
      </Text>
      <Text style={styles.total}>
        {loading ? "..." : `${Math.round(tabTotal).toLocaleString()} RWF`}
      </Text>

      {walletError ? <Text style={styles.error}>{walletError}</Text> : null}

      <ExpenseChart data={chartData} />

      <View style={styles.weekLabels}>
        {summary.bounds.dayLabels.map((day) => (
          <Text key={day} style={styles.day}>
            {day}
          </Text>
        ))}
      </View>

      <Text style={styles.section}>
        Transactions ({tabTransactions.length})
      </Text>

      {!wallet ? (
        <Text style={styles.empty}>Create a wallet to see analytics.</Text>
      ) : tabTransactions.length === 0 ? (
        <Text style={styles.empty}>
          No {tab === "expenses" ? "expenses" : "income"} this week.
        </Text>
      ) : (
        tabTransactions.map((transaction, index) => (
          <WeeklyTransactionRow
            key={transaction.id}
            transaction={transaction}
            isLast={index === tabTransactions.length - 1}
          />
        ))
      )}

      {plan && planStatus ? (
        <WeeklyPlanCard
          plan={plan}
          status={planStatus}
          isSaving={planSaving}
          onSave={(nextPlan) => void savePlan(nextPlan)}
        />
      ) : null}
    </TabScreenLayout>
  );
}

function SummaryCard({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: "income" | "expense";
}) {
  return (
    <View style={styles.summaryCard}>
      <Text style={styles.summaryLabel}>{label}</Text>
      <Text
        style={[
          styles.summaryValue,
          tone === "income" ? styles.summaryIncome : styles.summaryExpense,
        ]}
      >
        {Math.round(value).toLocaleString()}
      </Text>
      <Text style={styles.summaryUnit}>RWF</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    color: colors.white,
    fontSize: 14,
    fontWeight: "700",
    letterSpacing: 2,
    textAlign: "center",
    marginBottom: spacing.lg,
  },
  summaryRow: {
    flexDirection: "row",
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  summaryCard: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.sm,
    backgroundColor: colors.inputBg,
    alignItems: "center",
  },
  summaryLabel: {
    color: colors.textMuted,
    fontSize: 11,
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: "700",
    marginTop: 4,
  },
  summaryIncome: {
    color: colors.success,
  },
  summaryExpense: {
    color: colors.error,
  },
  summaryUnit: {
    color: colors.textSubtle,
    fontSize: 10,
    marginTop: 2,
  },
  toggle: {
    flexDirection: "row",
    backgroundColor: colors.pillTrack,
    borderRadius: radius.pill,
    padding: 4,
    marginBottom: spacing.xl,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: radius.pill,
    alignItems: "center",
  },
  tabActive: { backgroundColor: colors.primary },
  tabText: { color: colors.textMuted, fontSize: 14, fontWeight: "600" },
  tabTextActive: { color: colors.white },
  totalLabel: { color: colors.textMuted, fontSize: 14, marginBottom: 4 },
  total: {
    color: colors.white,
    fontSize: 32,
    fontWeight: "700",
    marginBottom: spacing.md,
  },
  error: { color: colors.error, fontSize: 13, marginBottom: spacing.md },
  weekLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: spacing.xl,
    paddingHorizontal: 4,
  },
  day: { color: colors.textSubtle, fontSize: 11 },
  section: {
    color: colors.white,
    fontSize: 16,
    fontWeight: "600",
    marginBottom: spacing.md,
  },
  empty: {
    color: colors.textMuted,
    fontSize: 14,
    marginBottom: spacing.lg,
  },
});

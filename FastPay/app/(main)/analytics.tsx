import { useCallback, useEffect, useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useFocusEffect } from "@react-navigation/native";

import {
  AnalyticsModeTabs,
  BudgetBuilderCard,
  BudgetOverviewCard,
  FamilyPlanCard,
  GoalsList,
  MonthPicker,
  WeekPicker,
  WeeklyPlanCard,
  WeeklyTransactionRow,
  type AnalyticsMode,
} from "@/components/analytics";
import { TabScreenLayout } from "@/components/layout/TabScreenLayout";
import { ExpenseChart } from "@/components/ui/ExpenseChart";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { evaluateBudget } from "@/lib/analytics/budget";
import {
  buildMonthlySummary,
  getMonthBounds,
  shiftMonth,
} from "@/lib/analytics/monthly";
import { suggestContribution } from "@/lib/analytics/goals";
import {
  buildWeeklySummary,
  getWeekBounds,
  normalizeDailyChartValues,
  shiftWeek,
} from "@/lib/analytics/weekly";
import { evaluateWeeklyPlan, createEmptyPlan } from "@/lib/analytics/weekly-plan";
import { useBillsStore } from "@/store/billsStore";
import { useBudgetStore } from "@/store/budgetStore";
import { useFamilyPlanStore } from "@/store/familyPlanStore";
import { useWalletStore } from "@/store/walletStore";
import { useWeeklyPlanStore } from "@/store/weeklyPlanStore";
import { colors } from "@/theme/colors";
import { radius, spacing } from "@/theme/spacing";

const financeSources = (
  payments: ReturnType<typeof useWalletStore.getState>["payments"],
  bills: ReturnType<typeof useBillsStore.getState>["payments"],
  momoHistory: ReturnType<typeof useWalletStore.getState>["momoHistory"],
) => ({ payments, bills, momoPayments: momoHistory });

export default function AnalyticsScreen() {
  useRequireAuth();
  const [mode, setMode] = useState<AnalyticsMode>("cashflow");
  const [tab, setTab] = useState<"expenses" | "income">("expenses");
  const [weekAnchor, setWeekAnchor] = useState(() => new Date());
  const [monthAnchor, setMonthAnchor] = useState(() => new Date());

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
  const {
    initialize: initBudget,
    budget,
    goals,
    saveBudget,
    addGoal,
    contributeToGoal,
    deleteGoal,
    isSaving: budgetSaving,
    isReady: budgetReady,
    error: budgetError,
  } = useBudgetStore();
  const {
    initialize: initFamilyPlans,
    plans: familyPlans,
    addPlan: addFamilyPlan,
    contribute: contributeFamilyPlan,
    deletePlan: deleteFamilyPlan,
    isSaving: familyPlanSaving,
    isReady: familyPlanReady,
    error: familyPlanError,
  } = useFamilyPlanStore();

  useEffect(() => {
    void initialize();
    void initBills();
    void initPlans();
    void initBudget();
    void initFamilyPlans();
  }, [initialize, initBills, initPlans, initBudget, initFamilyPlans]);

  useFocusEffect(
    useCallback(() => {
      if (wallet?.publicKey) {
        void refreshWalletData();
      }
    }, [wallet?.publicKey, refreshWalletData]),
  );

  const sources = useMemo(
    () => financeSources(payments, bills, momoHistory),
    [payments, bills, momoHistory],
  );

  const weeklySummary = useMemo(
    () => buildWeeklySummary(sources, weekAnchor),
    [sources, weekAnchor],
  );

  const monthlySummary = useMemo(
    () => buildMonthlySummary(sources, monthAnchor),
    [sources, monthAnchor],
  );

  const budgetSummary = useMemo(() => {
    if (budget.period === "weekly") {
      return buildWeeklySummary(sources, weekAnchor);
    }
    return buildMonthlySummary(sources, monthAnchor);
  }, [budget.period, sources, weekAnchor, monthAnchor]);

  const currentWeekKey = useMemo(() => getWeekBounds(new Date()).weekKey, []);
  const currentMonthKey = useMemo(() => getMonthBounds(new Date()).monthKey, []);
  const isCurrentWeek = weeklySummary.bounds.weekKey === currentWeekKey;
  const isCurrentMonth = monthlySummary.bounds.monthKey === currentMonthKey;

  const plan = useMemo(
    () =>
      plansReady
        ? (plans[weeklySummary.bounds.weekKey] ??
            createEmptyPlan(weeklySummary.bounds.weekKey))
        : null,
    [plans, plansReady, weeklySummary.bounds.weekKey],
  );

  const planStatus = useMemo(
    () => (plan ? evaluateWeeklyPlan(weeklySummary, plan) : null),
    [weeklySummary, plan],
  );

  const budgetStatus = useMemo(
    () =>
      budgetReady
        ? evaluateBudget(budget, {
            incomeTotalRwf: budgetSummary.incomeTotalRwf,
            expenseTotalRwf: budgetSummary.expenseTotalRwf,
            netRwf: budgetSummary.netRwf,
          })
        : null,
    [budget, budgetReady, budgetSummary],
  );

  const goalInsight = useMemo(
    () => suggestContribution(weeklySummary.netRwf, goals),
    [weeklySummary.netRwf, goals],
  );

  const tabTransactions =
    tab === "expenses"
      ? weeklySummary.expenseTransactions
      : weeklySummary.incomeTransactions;

  const tabTotal =
    tab === "expenses"
      ? weeklySummary.expenseTotalRwf
      : weeklySummary.incomeTotalRwf;

  const chartData = normalizeDailyChartValues(
    tab === "expenses"
      ? weeklySummary.expenseByDay
      : weeklySummary.incomeByDay,
  );

  const loading =
    isRefreshing && payments.length === 0 && momoHistory.length === 0;

  return (
    <TabScreenLayout
      refreshing={isRefreshing}
      onRefresh={() => void refreshWalletData()}
    >
      <Text style={styles.header}>STATISTICS</Text>

      <AnalyticsModeTabs mode={mode} onChange={setMode} />

      {mode === "cashflow" ? (
        <CashFlowSection
          weeklySummary={weeklySummary}
          isCurrentWeek={isCurrentWeek}
          tab={tab}
          setTab={setTab}
          tabTransactions={tabTransactions}
          tabTotal={tabTotal}
          chartData={chartData}
          loading={loading}
          wallet={wallet}
          walletError={walletError}
          goalInsight={goalInsight}
          plan={plan}
          planStatus={planStatus}
          planSaving={planSaving}
          onSavePlan={(nextPlan) => void savePlan(nextPlan)}
          onPreviousWeek={() => setWeekAnchor((date) => shiftWeek(date, -1))}
          onNextWeek={() => {
            if (!isCurrentWeek) {
              setWeekAnchor((date) => shiftWeek(date, 1));
            }
          }}
        />
      ) : null}

      {mode === "budget" && budgetReady && familyPlanReady ? (
        <BudgetSection
          budget={budget}
          budgetStatus={budgetStatus}
          budgetSaving={budgetSaving}
          budgetError={budgetError}
          familyPlans={familyPlans}
          familyPlanSaving={familyPlanSaving}
          familyPlanError={familyPlanError}
          period={budget.period}
          isCurrentWeek={isCurrentWeek}
          isCurrentMonth={isCurrentMonth}
          weeklyBounds={weeklySummary.bounds}
          monthlyBounds={monthlySummary.bounds}
          onSaveBudget={(nextBudget) => void saveBudget(nextBudget)}
          onAddFamilyPlan={(input) => void addFamilyPlan(input)}
          onContributeFamilyPlan={(planId, amount) =>
            void contributeFamilyPlan(planId, amount)
          }
          onDeleteFamilyPlan={(planId) => void deleteFamilyPlan(planId)}
          onPreviousWeek={() => setWeekAnchor((date) => shiftWeek(date, -1))}
          onNextWeek={() => {
            if (!isCurrentWeek) {
              setWeekAnchor((date) => shiftWeek(date, 1));
            }
          }}
          onPreviousMonth={() => setMonthAnchor((date) => shiftMonth(date, -1))}
          onNextMonth={() => {
            if (!isCurrentMonth) {
              setMonthAnchor((date) => shiftMonth(date, 1));
            }
          }}
        />
      ) : null}

      {mode === "goals" && budgetReady ? (
        <GoalsList
          goals={goals}
          monthlyNetRwf={monthlySummary.netRwf}
          isSaving={budgetSaving}
          onAddGoal={(input) => void addGoal(input)}
          onContribute={(goalId, amount) => void contributeToGoal(goalId, amount)}
          onDelete={(goalId) => void deleteGoal(goalId)}
        />
      ) : null}
    </TabScreenLayout>
  );
}

function CashFlowSection({
  weeklySummary,
  isCurrentWeek,
  tab,
  setTab,
  tabTransactions,
  tabTotal,
  chartData,
  loading,
  wallet,
  walletError,
  goalInsight,
  plan,
  planStatus,
  planSaving,
  onSavePlan,
  onPreviousWeek,
  onNextWeek,
}: {
  weeklySummary: ReturnType<typeof buildWeeklySummary>;
  isCurrentWeek: boolean;
  tab: "expenses" | "income";
  setTab: (tab: "expenses" | "income") => void;
  tabTransactions: ReturnType<typeof buildWeeklySummary>["expenseTransactions"];
  tabTotal: number;
  chartData: number[];
  loading: boolean;
  wallet: ReturnType<typeof useWalletStore.getState>["wallet"];
  walletError: string | null;
  goalInsight: string | null;
  plan: ReturnType<typeof createEmptyPlan> | null;
  planStatus: ReturnType<typeof evaluateWeeklyPlan> | null;
  planSaving: boolean;
  onSavePlan: (plan: ReturnType<typeof createEmptyPlan>) => void;
  onPreviousWeek: () => void;
  onNextWeek: () => void;
}) {
  return (
    <>
      <WeekPicker
        bounds={weeklySummary.bounds}
        isCurrentWeek={isCurrentWeek}
        onPrevious={onPreviousWeek}
        onNext={onNextWeek}
      />

      <View style={styles.summaryRow}>
        <SummaryCard
          label="Income"
          value={weeklySummary.incomeTotalRwf}
          tone="income"
        />
        <SummaryCard
          label="Expenses"
          value={weeklySummary.expenseTotalRwf}
          tone="expense"
        />
        <SummaryCard
          label="Net"
          value={weeklySummary.netRwf}
          tone={weeklySummary.netRwf >= 0 ? "income" : "expense"}
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
      {goalInsight ? (
        <View style={styles.insightChip}>
          <Text style={styles.insightText}>{goalInsight}</Text>
        </View>
      ) : null}

      <ExpenseChart data={chartData} />

      <View style={styles.weekLabels}>
        {weeklySummary.bounds.dayLabels.map((day) => (
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
          onSave={onSavePlan}
        />
      ) : null}
    </>
  );
}

function BudgetSection({
  budget,
  budgetStatus,
  budgetSaving,
  budgetError,
  familyPlans,
  familyPlanSaving,
  familyPlanError,
  period,
  isCurrentWeek,
  isCurrentMonth,
  weeklyBounds,
  monthlyBounds,
  onSaveBudget,
  onAddFamilyPlan,
  onContributeFamilyPlan,
  onDeleteFamilyPlan,
  onPreviousWeek,
  onNextWeek,
  onPreviousMonth,
  onNextMonth,
}: {
  budget: ReturnType<typeof useBudgetStore.getState>["budget"];
  budgetStatus: ReturnType<typeof evaluateBudget> | null;
  budgetSaving: boolean;
  budgetError: string | null;
  familyPlans: ReturnType<typeof useFamilyPlanStore.getState>["plans"];
  familyPlanSaving: boolean;
  familyPlanError: string | null;
  period: "weekly" | "monthly";
  isCurrentWeek: boolean;
  isCurrentMonth: boolean;
  weeklyBounds: ReturnType<typeof getWeekBounds>;
  monthlyBounds: ReturnType<typeof getMonthBounds>;
  onSaveBudget: (budget: ReturnType<typeof useBudgetStore.getState>["budget"]) => void;
  onAddFamilyPlan: (
    input: Parameters<ReturnType<typeof useFamilyPlanStore.getState>["addPlan"]>[0],
  ) => void;
  onContributeFamilyPlan: (planId: string, amount: number) => void;
  onDeleteFamilyPlan: (planId: string) => void;
  onPreviousWeek: () => void;
  onNextWeek: () => void;
  onPreviousMonth: () => void;
  onNextMonth: () => void;
}) {
  return (
    <>
      {period === "weekly" ? (
        <WeekPicker
          bounds={weeklyBounds}
          isCurrentWeek={isCurrentWeek}
          onPrevious={onPreviousWeek}
          onNext={onNextWeek}
        />
      ) : (
        <MonthPicker
          bounds={monthlyBounds}
          isCurrentMonth={isCurrentMonth}
          onPrevious={onPreviousMonth}
          onNext={onNextMonth}
        />
      )}

      {budgetError ? <Text style={styles.error}>{budgetError}</Text> : null}

      <BudgetBuilderCard
        budget={budget}
        isSaving={budgetSaving}
        onSave={onSaveBudget}
      />

      {budgetStatus ? (
        <BudgetOverviewCard
          status={budgetStatus}
          periodLabel={period === "weekly" ? "week" : "month"}
        />
      ) : null}

      <FamilyPlanCard
        plans={familyPlans}
        isSaving={familyPlanSaving}
        error={familyPlanError}
        onAddPlan={onAddFamilyPlan}
        onContribute={onContributeFamilyPlan}
        onDelete={onDeleteFamilyPlan}
      />
    </>
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
  insightChip: {
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    marginBottom: spacing.md,
  },
  insightText: {
    color: colors.textMuted,
    fontSize: 13,
    lineHeight: 18,
  },
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

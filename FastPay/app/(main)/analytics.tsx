import { useCallback, useEffect, useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useFocusEffect, useLocalSearchParams } from "expo-router";

import {
  AnalyticsModeTabs,
  BudgetBuilderCard,
  BudgetOverviewCard,
  FamilyPlanCard,
  GoalsList,
  MonthPicker,
  WeekPicker,
  YearPicker,
  WeeklyPlanCard,
  WeeklyTransactionRow,
  type AnalyticsMode,
} from "@/components/analytics";
import { TabScreenLayout } from "@/components/layout/TabScreenLayout";
import { ExpenseChart } from "@/components/ui/ExpenseChart";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { evaluateBudget, getBudgetPeriodLabel } from "@/lib/analytics/budget";
import {
  applyPeriodIncomeDeduction,
  evaluateFamilyIncomeAllocation,
  getYearlyIncomeRwf,
} from "@/lib/analytics/family-plan";
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
import {
  buildYearlySummary,
  getYearBounds,
  shiftYear,
} from "@/lib/analytics/yearly";
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
  const { mode: modeParam } = useLocalSearchParams<{ mode?: string }>();
  const [mode, setMode] = useState<AnalyticsMode>("cashflow");
  const [tab, setTab] = useState<"expenses" | "income">("expenses");
  const [weekAnchor, setWeekAnchor] = useState(() => new Date());
  const [monthAnchor, setMonthAnchor] = useState(() => new Date());
  const [yearAnchor, setYearAnchor] = useState(() => new Date());

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
    settings: familySettings,
    plans: familyPlans,
    contributions: familyContributions,
    saveSettings: saveFamilySettings,
    addPlan: addFamilyPlan,
    contribute: contributeFamilyPlan,
    deletePlan: deleteFamilyPlan,
    isSaving: familyPlanSaving,
    isReady: familyPlanReady,
    error: familyPlanError,
  } = useFamilyPlanStore();

  useEffect(() => {
    if (
      modeParam === "cashflow" ||
      modeParam === "budget" ||
      modeParam === "goals"
    ) {
      setMode(modeParam);
    }
  }, [modeParam]);

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

  const yearlySummary = useMemo(
    () => buildYearlySummary(sources, yearAnchor),
    [sources, yearAnchor],
  );

  const budgetSummary = useMemo(() => {
    if (budget.period === "weekly") {
      return buildWeeklySummary(sources, weekAnchor);
    }
    if (budget.period === "monthly") {
      return buildMonthlySummary(sources, monthAnchor);
    }
    return buildYearlySummary(sources, yearAnchor);
  }, [budget.period, sources, weekAnchor, monthAnchor, yearAnchor]);

  const currentWeekKey = useMemo(() => getWeekBounds(new Date()).weekKey, []);
  const currentMonthKey = useMemo(() => getMonthBounds(new Date()).monthKey, []);
  const currentYearKey = useMemo(() => getYearBounds(new Date()).yearKey, []);
  const isCurrentWeek = weeklySummary.bounds.weekKey === currentWeekKey;
  const isCurrentMonth = monthlySummary.bounds.monthKey === currentMonthKey;
  const isCurrentYear = yearlySummary.bounds.yearKey === currentYearKey;

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

  const familyIncomeAllocation = useMemo(
    () =>
      evaluateFamilyIncomeAllocation({
        yearlyIncomeRwf: getYearlyIncomeRwf(sources),
        yearlyPercent: familySettings.yearlyIncomePercent,
        contributions: familyContributions,
      }),
    [sources, familySettings.yearlyIncomePercent, familyContributions],
  );

  const weeklyAdjustedIncome = useMemo(
    () =>
      applyPeriodIncomeDeduction(
        weeklySummary.incomeTotalRwf,
        familyContributions,
        weeklySummary.bounds.start,
        weeklySummary.bounds.end,
      ),
    [weeklySummary, familyContributions],
  );

  const budgetAdjustedIncome = useMemo(() => {
    const bounds =
      budget.period === "weekly"
        ? weeklySummary.bounds
        : budget.period === "monthly"
          ? monthlySummary.bounds
          : yearlySummary.bounds;

    const grossIncome =
      budget.period === "weekly"
        ? weeklySummary.incomeTotalRwf
        : budget.period === "monthly"
          ? monthlySummary.incomeTotalRwf
          : yearlySummary.incomeTotalRwf;

    return applyPeriodIncomeDeduction(
      grossIncome,
      familyContributions,
      bounds.start,
      bounds.end,
    );
  }, [
    budget.period,
    weeklySummary,
    monthlySummary,
    yearlySummary,
    familyContributions,
  ]);

  const budgetStatus = useMemo(
    () =>
      budgetReady
        ? evaluateBudget(budget, {
            incomeTotalRwf: budgetAdjustedIncome.availableIncomeRwf,
            expenseTotalRwf: budgetSummary.expenseTotalRwf,
            netRwf:
              budgetAdjustedIncome.availableIncomeRwf -
              budgetSummary.expenseTotalRwf,
          })
        : null,
    [budget, budgetReady, budgetSummary, budgetAdjustedIncome],
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
          adjustedIncome={weeklyAdjustedIncome}
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
          familySettings={familySettings}
          familyIncomeAllocation={familyIncomeAllocation}
          familyPlanSaving={familyPlanSaving}
          familyPlanError={familyPlanError}
          period={budget.period}
          adjustedIncome={budgetAdjustedIncome}
          isCurrentWeek={isCurrentWeek}
          isCurrentMonth={isCurrentMonth}
          isCurrentYear={isCurrentYear}
          weeklyBounds={weeklySummary.bounds}
          monthlyBounds={monthlySummary.bounds}
          yearlyBounds={yearlySummary.bounds}
          onSaveBudget={(nextBudget) => void saveBudget(nextBudget)}
          onSaveFamilySettings={(settings) => void saveFamilySettings(settings)}
          onAddFamilyPlan={(input) => void addFamilyPlan(input)}
          onContributeFamilyPlan={(planId, amount) =>
            void contributeFamilyPlan(planId, amount, sources)
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
          onPreviousYear={() => setYearAnchor((date) => shiftYear(date, -1))}
          onNextYear={() => {
            if (!isCurrentYear) {
              setYearAnchor((date) => shiftYear(date, 1));
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
  adjustedIncome,
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
  adjustedIncome: ReturnType<typeof applyPeriodIncomeDeduction>;
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
          value={adjustedIncome.availableIncomeRwf}
          tone="income"
        />
        <SummaryCard
          label="Expenses"
          value={weeklySummary.expenseTotalRwf}
          tone="expense"
        />
        <SummaryCard
          label="Net"
          value={adjustedIncome.availableIncomeRwf - weeklySummary.expenseTotalRwf}
          tone={
            adjustedIncome.availableIncomeRwf - weeklySummary.expenseTotalRwf >= 0
              ? "income"
              : "expense"
          }
        />
      </View>

      {adjustedIncome.familyPlanDeductionRwf > 0 ? (
        <Text style={styles.familyDeduction}>
          Family plan: -{adjustedIncome.familyPlanDeductionRwf.toLocaleString()} RWF
          removed from income this week
        </Text>
      ) : null}

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
  familySettings,
  familyIncomeAllocation,
  familyPlanSaving,
  familyPlanError,
  period,
  adjustedIncome,
  isCurrentWeek,
  isCurrentMonth,
  isCurrentYear,
  weeklyBounds,
  monthlyBounds,
  yearlyBounds,
  onSaveBudget,
  onSaveFamilySettings,
  onAddFamilyPlan,
  onContributeFamilyPlan,
  onDeleteFamilyPlan,
  onPreviousWeek,
  onNextWeek,
  onPreviousMonth,
  onNextMonth,
  onPreviousYear,
  onNextYear,
}: {
  budget: ReturnType<typeof useBudgetStore.getState>["budget"];
  budgetStatus: ReturnType<typeof evaluateBudget> | null;
  budgetSaving: boolean;
  budgetError: string | null;
  familyPlans: ReturnType<typeof useFamilyPlanStore.getState>["plans"];
  familySettings: ReturnType<typeof useFamilyPlanStore.getState>["settings"];
  familyIncomeAllocation: ReturnType<typeof evaluateFamilyIncomeAllocation>;
  familyPlanSaving: boolean;
  familyPlanError: string | null;
  period: "weekly" | "monthly" | "yearly";
  adjustedIncome: ReturnType<typeof applyPeriodIncomeDeduction>;
  isCurrentWeek: boolean;
  isCurrentMonth: boolean;
  isCurrentYear: boolean;
  weeklyBounds: ReturnType<typeof getWeekBounds>;
  monthlyBounds: ReturnType<typeof getMonthBounds>;
  yearlyBounds: ReturnType<typeof getYearBounds>;
  onSaveBudget: (budget: ReturnType<typeof useBudgetStore.getState>["budget"]) => void;
  onSaveFamilySettings: (
    settings: ReturnType<typeof useFamilyPlanStore.getState>["settings"],
  ) => void;
  onAddFamilyPlan: (
    input: Parameters<ReturnType<typeof useFamilyPlanStore.getState>["addPlan"]>[0],
  ) => void;
  onContributeFamilyPlan: (planId: string, amount: number) => void;
  onDeleteFamilyPlan: (planId: string) => void;
  onPreviousWeek: () => void;
  onNextWeek: () => void;
  onPreviousMonth: () => void;
  onNextMonth: () => void;
  onPreviousYear: () => void;
  onNextYear: () => void;
}) {
  const periodLabel = getBudgetPeriodLabel(period);

  return (
    <>
      {period === "weekly" ? (
        <WeekPicker
          bounds={weeklyBounds}
          isCurrentWeek={isCurrentWeek}
          onPrevious={onPreviousWeek}
          onNext={onNextWeek}
        />
      ) : period === "monthly" ? (
        <MonthPicker
          bounds={monthlyBounds}
          isCurrentMonth={isCurrentMonth}
          onPrevious={onPreviousMonth}
          onNext={onNextMonth}
        />
      ) : (
        <YearPicker
          bounds={yearlyBounds}
          isCurrentYear={isCurrentYear}
          onPrevious={onPreviousYear}
          onNext={onNextYear}
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
          periodLabel={periodLabel}
        />
      ) : null}

      {adjustedIncome.familyPlanDeductionRwf > 0 ? (
        <Text style={styles.familyDeduction}>
          Family plan: -{adjustedIncome.familyPlanDeductionRwf.toLocaleString()} RWF
          removed from income this {periodLabel}
        </Text>
      ) : null}

      <FamilyPlanCard
        plans={familyPlans}
        settings={familySettings}
        incomeAllocation={familyIncomeAllocation}
        isSaving={familyPlanSaving}
        error={familyPlanError}
        onSaveSettings={onSaveFamilySettings}
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
  familyDeduction: {
    color: colors.error,
    fontSize: 12,
    marginBottom: spacing.md,
  },
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

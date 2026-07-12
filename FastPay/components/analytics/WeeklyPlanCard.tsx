import { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";

import { Input } from "@/components/ui/Input";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import type { WeeklyPlanStatus } from "@/lib/analytics/weekly-plan";
import type { WeeklyPlan } from "@/lib/analytics/weekly-plan";
import { colors } from "@/theme/colors";
import { radius, spacing } from "@/theme/spacing";

interface WeeklyPlanCardProps {
  plan: WeeklyPlan;
  status: WeeklyPlanStatus;
  isSaving?: boolean;
  onSave: (plan: WeeklyPlan) => void;
}

export function WeeklyPlanCard({
  plan,
  status,
  isSaving = false,
  onSave,
}: WeeklyPlanCardProps) {
  const [incomeTarget, setIncomeTarget] = useState(
    plan.incomeTargetRwf > 0 ? String(plan.incomeTargetRwf) : "",
  );
  const [expenseLimit, setExpenseLimit] = useState(
    plan.expenseLimitRwf > 0 ? String(plan.expenseLimitRwf) : "",
  );

  useEffect(() => {
    setIncomeTarget(plan.incomeTargetRwf > 0 ? String(plan.incomeTargetRwf) : "");
    setExpenseLimit(plan.expenseLimitRwf > 0 ? String(plan.expenseLimitRwf) : "");
  }, [plan.weekKey, plan.incomeTargetRwf, plan.expenseLimitRwf]);

  const handleSave = () => {
    onSave({
      weekKey: plan.weekKey,
      incomeTargetRwf: Math.max(Number(incomeTarget.replace(/,/g, "")) || 0, 0),
      expenseLimitRwf: Math.max(Number(expenseLimit.replace(/,/g, "")) || 0, 0),
    });
  };

  return (
    <View style={styles.card}>
      <Text style={styles.title}>Weekly plan</Text>
      <Text style={styles.subtitle}>
        Set targets and track how you are doing this week.
      </Text>

      <Input
        label="Income target (RWF)"
        value={incomeTarget}
        onChangeText={setIncomeTarget}
        keyboardType="numeric"
        placeholder="0"
      />
      <Input
        label="Expense limit (RWF)"
        value={expenseLimit}
        onChangeText={setExpenseLimit}
        keyboardType="numeric"
        placeholder="0"
      />

      <PrimaryButton
        label={isSaving ? "Saving..." : "Save plan"}
        onPress={handleSave}
        disabled={isSaving}
      />

      {plan.incomeTargetRwf > 0 ? (
        <PlanProgress
          label="Income progress"
          progress={status.incomeProgress}
          detail={`${Math.round(status.incomeProgress * 100)}% of target`}
          tone="income"
        />
      ) : null}

      {plan.expenseLimitRwf > 0 ? (
        <PlanProgress
          label="Expense progress"
          progress={status.expenseProgress}
          detail={`${Math.round(status.expenseProgress * 100)}% of limit`}
          tone={status.health}
        />
      ) : null}

      {plan.expenseLimitRwf > 0 ? (
        <View style={styles.statsRow}>
          <Stat label="Remaining" value={`${status.expenseRemainingRwf.toLocaleString()} RWF`} />
          <Stat
            label="Daily allowance"
            value={`${status.dailySpendAllowanceRwf.toLocaleString()} RWF`}
          />
        </View>
      ) : null}

      <View style={styles.insights}>
        {status.insights.map((insight) => (
          <View key={insight} style={styles.insightChip}>
            <Text style={styles.insightText}>{insight}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

function PlanProgress({
  label,
  progress,
  detail,
  tone,
}: {
  label: string;
  progress: number;
  detail: string;
  tone: "income" | "on_track" | "warning" | "over_budget";
}) {
  const widthPercent = Math.min(progress, 1) * 100;
  const barColor =
    tone === "income"
      ? colors.success
      : tone === "over_budget"
        ? colors.error
        : tone === "warning"
          ? "#F59E0B"
          : colors.primary;

  return (
    <View style={styles.progressBlock}>
      <View style={styles.progressHeader}>
        <Text style={styles.progressLabel}>{label}</Text>
        <Text style={styles.progressDetail}>{detail}</Text>
      </View>
      <View style={styles.progressTrack}>
        <View
          style={[
            styles.progressFill,
            {
              width: `${widthPercent}%` as `${number}%`,
              backgroundColor: barColor,
            },
          ]}
        />
      </View>
    </View>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.md,
    backgroundColor: colors.inputBg,
    marginTop: spacing.lg,
    gap: spacing.sm,
  },
  title: {
    color: colors.white,
    fontSize: 16,
    fontWeight: "600",
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: 13,
    lineHeight: 18,
    marginBottom: spacing.sm,
  },
  progressBlock: {
    marginTop: spacing.sm,
  },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: spacing.xs,
  },
  progressLabel: {
    color: colors.white,
    fontSize: 13,
    fontWeight: "500",
  },
  progressDetail: {
    color: colors.textMuted,
    fontSize: 12,
  },
  progressTrack: {
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.pillTrack,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 4,
  },
  statsRow: {
    flexDirection: "row",
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  stat: {
    flex: 1,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    borderRadius: radius.sm,
    padding: spacing.sm,
  },
  statLabel: {
    color: colors.textMuted,
    fontSize: 11,
  },
  statValue: {
    color: colors.white,
    fontSize: 14,
    fontWeight: "600",
    marginTop: 4,
  },
  insights: {
    gap: spacing.xs,
    marginTop: spacing.sm,
  },
  insightChip: {
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  insightText: {
    color: colors.textMuted,
    fontSize: 13,
    lineHeight: 18,
  },
});

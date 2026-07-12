import { StyleSheet, Text, View } from "react-native";

import type { BudgetStatus } from "@/lib/analytics/budget";
import { colors } from "@/theme/colors";
import { radius, spacing } from "@/theme/spacing";

interface BudgetOverviewCardProps {
  status: BudgetStatus;
  periodLabel: string;
}

export function BudgetOverviewCard({
  status,
  periodLabel,
}: BudgetOverviewCardProps) {
  const spendBarColor =
    status.health === "over_budget"
      ? colors.error
      : status.health === "warning"
        ? "#F59E0B"
        : colors.primary;

  return (
    <View style={styles.card}>
      <Text style={styles.title}>Budget overview</Text>
      <Text style={styles.subtitle}>
        Planned vs actual cash flow for this {periodLabel}.
      </Text>

      <View style={styles.statsRow}>
        <Stat
          label="Income"
          value={`${status.actualIncomeRwf.toLocaleString()} RWF`}
        />
        <Stat
          label="Expenses"
          value={`${status.actualExpenseRwf.toLocaleString()} RWF`}
        />
        <Stat
          label="Net"
          value={`${status.actualNetRwf.toLocaleString()} RWF`}
          tone={status.actualNetRwf >= 0 ? "positive" : "negative"}
        />
      </View>

      {status.spendAllowanceRwf > 0 ? (
        <ProgressBlock
          label="Spending budget"
          progress={Math.min(status.spendProgress, 1)}
          detail={`${Math.round(status.spendProgress * 100)}% used · ${status.spendRemainingRwf.toLocaleString()} RWF left`}
          color={spendBarColor}
        />
      ) : null}

      {status.savingsPlannedRwf > 0 ? (
        <ProgressBlock
          label="Savings allocation"
          progress={Math.min(status.savingsProgress, 1)}
          detail={`${status.savingsActualRwf.toLocaleString()} / ${status.savingsPlannedRwf.toLocaleString()} RWF`}
          color={colors.success}
        />
      ) : null}

      <Text style={styles.sectionLabel}>Planned allocation</Text>
      {status.allocations.map((allocation) => (
        <View key={allocation.bucketId} style={styles.allocationRow}>
          <View style={styles.allocationHeader}>
            <Text style={styles.allocationName}>{allocation.name}</Text>
            <Text style={styles.allocationPercent}>{allocation.percent}%</Text>
          </View>
          <Text style={styles.allocationAmount}>
            {allocation.plannedRwf.toLocaleString()} RWF
          </Text>
        </View>
      ))}

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

function ProgressBlock({
  label,
  progress,
  detail,
  color,
}: {
  label: string;
  progress: number;
  detail: string;
  color: string;
}) {
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
              width: `${progress * 100}%` as `${number}%`,
              backgroundColor: color,
            },
          ]}
        />
      </View>
    </View>
  );
}

function Stat({
  label,
  value,
  tone = "neutral",
}: {
  label: string;
  value: string;
  tone?: "neutral" | "positive" | "negative";
}) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text
        style={[
          styles.statValue,
          tone === "positive" && styles.statPositive,
          tone === "negative" && styles.statNegative,
        ]}
      >
        {value}
      </Text>
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
  statsRow: {
    flexDirection: "row",
    gap: spacing.sm,
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
    fontSize: 13,
    fontWeight: "600",
    marginTop: 4,
  },
  statPositive: {
    color: colors.success,
  },
  statNegative: {
    color: colors.error,
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
  sectionLabel: {
    color: colors.white,
    fontSize: 14,
    fontWeight: "600",
    marginTop: spacing.sm,
  },
  allocationRow: {
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    borderRadius: radius.sm,
    padding: spacing.sm,
  },
  allocationHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  allocationName: {
    color: colors.white,
    fontSize: 14,
    fontWeight: "500",
  },
  allocationPercent: {
    color: colors.textMuted,
    fontSize: 13,
  },
  allocationAmount: {
    color: colors.textMuted,
    fontSize: 13,
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

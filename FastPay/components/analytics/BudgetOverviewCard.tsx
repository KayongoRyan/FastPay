import { StyleSheet, Text, View } from "react-native";

import type { BudgetStatus } from "@/lib/analytics/budget";
import { colors } from "@/theme/colors";
import { radius, spacing } from "@/theme/spacing";

interface BudgetOverviewCardProps {
  status: BudgetStatus;
  periodLabel: string;
}

const SPEND_COLORS = {
  on_track: {
    accent: colors.primary,
    bg: "rgba(0,174,239,0.12)",
    track: "rgba(0,174,239,0.2)",
    label: "#7DD3FC",
  },
  warning: {
    accent: "#F59E0B",
    bg: "rgba(245,158,11,0.12)",
    track: "rgba(245,158,11,0.22)",
    label: "#FCD34D",
  },
  over_budget: {
    accent: colors.error,
    bg: "rgba(248,113,113,0.12)",
    track: "rgba(248,113,113,0.22)",
    label: "#FCA5A5",
  },
} as const;

const SAVINGS_COLORS = {
  accent: colors.success,
  bg: "rgba(74,222,128,0.12)",
  track: "rgba(74,222,128,0.22)",
  label: "#86EFAC",
} as const;

export function BudgetOverviewCard({
  status,
  periodLabel,
}: BudgetOverviewCardProps) {
  const spendTheme = SPEND_COLORS[status.health];

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
          theme={spendTheme}
        />
      ) : null}

      {status.savingsPlannedRwf > 0 ? (
        <ProgressBlock
          label="Savings allocation"
          progress={Math.min(status.savingsProgress, 1)}
          detail={`${status.savingsActualRwf.toLocaleString()} / ${status.savingsPlannedRwf.toLocaleString()} RWF`}
          theme={SAVINGS_COLORS}
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
  theme,
}: {
  label: string;
  progress: number;
  detail: string;
  theme: {
    accent: string;
    bg: string;
    track: string;
    label: string;
  };
}) {
  return (
    <View
      style={[
        styles.progressBlock,
        {
          backgroundColor: theme.bg,
          borderLeftColor: theme.accent,
        },
      ]}
    >
      <View style={styles.progressHeader}>
        <View style={styles.progressLabelRow}>
          <View style={[styles.colorDot, { backgroundColor: theme.accent }]} />
          <Text style={[styles.progressLabel, { color: theme.label }]}>
            {label}
          </Text>
        </View>
        <Text style={[styles.progressDetail, { color: theme.label }]}>
          {detail}
        </Text>
      </View>
      <View style={[styles.progressTrack, { backgroundColor: theme.track }]}>
        <View
          style={[
            styles.progressFill,
            {
              width: `${progress * 100}%` as `${number}%`,
              backgroundColor: theme.accent,
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
    borderRadius: radius.sm,
    borderLeftWidth: 3,
    padding: spacing.sm,
  },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.sm,
    gap: spacing.sm,
  },
  progressLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    flexShrink: 1,
  },
  colorDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  progressLabel: {
    fontSize: 13,
    fontWeight: "600",
  },
  progressDetail: {
    fontSize: 12,
    fontWeight: "500",
    flexShrink: 0,
  },
  progressTrack: {
    height: 10,
    borderRadius: 5,
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

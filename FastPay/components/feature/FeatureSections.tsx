import { Pressable, StyleSheet, Text, View } from "react-native";
import { ChevronRight } from "lucide-react-native";

import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { colors } from "@/theme/colors";
import { radius, spacing } from "@/theme/spacing";

export interface FeatureStat {
  label: string;
  value: string;
}

export interface FeatureStep {
  title: string;
  detail: string;
}

export interface FeatureHighlight {
  title: string;
  detail: string;
}

export interface FeatureAction {
  label: string;
  onPress: () => void;
  variant?: "primary" | "outline";
}

export function FeatureStatRow({ stats }: { stats: FeatureStat[] }) {
  return (
    <View style={styles.statRow}>
      {stats.map((stat) => (
        <View key={stat.label} style={styles.statCard}>
          <Text style={styles.statLabel}>{stat.label}</Text>
          <Text style={styles.statValue}>{stat.value}</Text>
        </View>
      ))}
    </View>
  );
}

export function FeatureSteps({
  title,
  steps,
}: {
  title: string;
  steps: FeatureStep[];
}) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {steps.map((step, index) => (
        <View key={step.title} style={styles.stepRow}>
          <View style={styles.stepBadge}>
            <Text style={styles.stepBadgeText}>{index + 1}</Text>
          </View>
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>{step.title}</Text>
            <Text style={styles.stepDetail}>{step.detail}</Text>
          </View>
        </View>
      ))}
    </View>
  );
}

export function FeatureHighlights({
  title,
  items,
}: {
  title: string;
  items: FeatureHighlight[];
}) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {items.map((item) => (
        <View key={item.title} style={styles.highlightCard}>
          <Text style={styles.highlightTitle}>{item.title}</Text>
          <Text style={styles.highlightDetail}>{item.detail}</Text>
        </View>
      ))}
    </View>
  );
}

export function FeatureInfoPanel({
  title,
  lines,
}: {
  title: string;
  lines: string[];
}) {
  return (
    <View style={styles.infoPanel}>
      <Text style={styles.infoTitle}>{title}</Text>
      {lines.map((line) => (
        <Text key={line} style={styles.infoLine}>
          • {line}
        </Text>
      ))}
    </View>
  );
}

export function FeatureActionList({
  title,
  actions,
}: {
  title: string;
  actions: { label: string; detail?: string; onPress: () => void }[];
}) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.actionList}>
        {actions.map((action, index) => (
          <Pressable
            key={action.label}
            style={[
              styles.actionRow,
              index < actions.length - 1 && styles.actionRowDivider,
            ]}
            onPress={action.onPress}
          >
            <View style={styles.actionTextWrap}>
              <Text style={styles.actionLabel}>{action.label}</Text>
              {action.detail ? (
                <Text style={styles.actionDetail}>{action.detail}</Text>
              ) : null}
            </View>
            <ChevronRight color={colors.textMuted} size={18} />
          </Pressable>
        ))}
      </View>
    </View>
  );
}

export function FeatureActions({ actions }: { actions: FeatureAction[] }) {
  return (
    <View style={styles.actions}>
      {actions.map((action) =>
        action.variant === "outline" ? (
          <Pressable
            key={action.label}
            style={styles.outlineBtn}
            onPress={action.onPress}
          >
            <Text style={styles.outlineBtnText}>{action.label}</Text>
          </Pressable>
        ) : (
          <PrimaryButton
            key={action.label}
            label={action.label}
            onPress={action.onPress}
          />
        ),
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  statRow: {
    flexDirection: "row",
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  statCard: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.sm,
    backgroundColor: colors.inputBg,
  },
  statLabel: {
    color: colors.textMuted,
    fontSize: 11,
  },
  statValue: {
    color: colors.white,
    fontSize: 14,
    fontWeight: "700",
    marginTop: 4,
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    color: colors.white,
    fontSize: 16,
    fontWeight: "600",
    marginBottom: spacing.md,
  },
  stepRow: {
    flexDirection: "row",
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  stepBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  stepBadgeText: {
    color: colors.white,
    fontSize: 13,
    fontWeight: "700",
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    color: colors.white,
    fontSize: 15,
    fontWeight: "600",
  },
  stepDetail: {
    color: colors.textMuted,
    fontSize: 13,
    lineHeight: 18,
    marginTop: 2,
  },
  highlightCard: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.md,
    backgroundColor: colors.inputBg,
    marginBottom: spacing.sm,
  },
  highlightTitle: {
    color: colors.white,
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 4,
  },
  highlightDetail: {
    color: colors.textMuted,
    fontSize: 13,
    lineHeight: 18,
  },
  infoPanel: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.md,
    backgroundColor: colors.inputBg,
    marginBottom: spacing.lg,
    gap: spacing.xs,
  },
  infoTitle: {
    color: colors.white,
    fontSize: 14,
    fontWeight: "600",
    marginBottom: spacing.xs,
  },
  infoLine: {
    color: colors.textMuted,
    fontSize: 13,
    lineHeight: 18,
  },
  actionList: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: colors.inputBg,
    overflow: "hidden",
  },
  actionRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    gap: spacing.sm,
  },
  actionRowDivider: {
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.08)",
  },
  actionTextWrap: {
    flex: 1,
  },
  actionLabel: {
    color: colors.white,
    fontSize: 15,
    fontWeight: "500",
  },
  actionDetail: {
    color: colors.textMuted,
    fontSize: 12,
    marginTop: 2,
  },
  actions: {
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  outlineBtn: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingVertical: 14,
    alignItems: "center",
  },
  outlineBtnText: {
    color: colors.white,
    fontSize: 15,
    fontWeight: "600",
  },
});

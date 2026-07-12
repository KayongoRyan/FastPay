import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Plus } from "lucide-react-native";

import { GoalCard } from "@/components/analytics/GoalCard";
import { Input } from "@/components/ui/Input";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import {
  evaluateGoals,
  totalGoalSaved,
  type GoalType,
  type SavingsGoal,
} from "@/lib/analytics/goals";
import { colors } from "@/theme/colors";
import { radius, spacing } from "@/theme/spacing";

interface GoalsListProps {
  goals: SavingsGoal[];
  monthlyNetRwf?: number;
  isSaving?: boolean;
  onAddGoal: (input: {
    name: string;
    type: GoalType;
    targetRwf: number;
  }) => void;
  onContribute: (goalId: string, amountRwf: number) => void;
  onDelete: (goalId: string) => void;
}

export function GoalsList({
  goals,
  monthlyNetRwf,
  isSaving = false,
  onAddGoal,
  onContribute,
  onDelete,
}: GoalsListProps) {
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [type, setType] = useState<GoalType>("short");
  const [target, setTarget] = useState("");

  const shortGoals = goals.filter((goal) => goal.type === "short");
  const longGoals = goals.filter((goal) => goal.type === "long");
  const statuses = evaluateGoals(goals);
  const completedCount = statuses.filter((status) => status.isComplete).length;

  const handleAdd = () => {
    const trimmed = name.trim();
    const targetRwf = Math.max(Number(target.replace(/,/g, "")) || 0, 0);
    if (!trimmed || targetRwf <= 0) {
      return;
    }

    onAddGoal({ name: trimmed, type, targetRwf });
    setName("");
    setTarget("");
    setType("short");
    setShowForm(false);
  };

  return (
    <View>
      <View style={styles.summaryCard}>
        <Text style={styles.summaryTitle}>Goals summary</Text>
        <View style={styles.summaryRow}>
          <SummaryStat label="Total saved" value={totalGoalSaved(goals)} />
          <SummaryStat label="Goals" value={goals.length} />
          <SummaryStat label="Completed" value={completedCount} />
        </View>
        {monthlyNetRwf !== undefined && monthlyNetRwf > 0 ? (
          <Text style={styles.netHint}>
            This month&apos;s net cash flow: {monthlyNetRwf.toLocaleString()} RWF
          </Text>
        ) : null}
      </View>

      <Pressable
        style={styles.addToggle}
        onPress={() => setShowForm((current) => !current)}
      >
        <Plus color={colors.primary} size={16} />
        <Text style={styles.addToggleText}>
          {showForm ? "Hide new goal" : "Add goal"}
        </Text>
      </Pressable>

      {showForm ? (
        <View style={styles.formCard}>
          <Input
            label="Goal name"
            value={name}
            onChangeText={setName}
            placeholder="e.g. Emergency fund"
          />
          <View style={styles.typeRow}>
            <Pressable
              style={[styles.typeBtn, type === "short" && styles.typeActive]}
              onPress={() => setType("short")}
            >
              <Text
                style={[
                  styles.typeText,
                  type === "short" && styles.typeTextActive,
                ]}
              >
                Short-term
              </Text>
            </Pressable>
            <Pressable
              style={[styles.typeBtn, type === "long" && styles.typeActive]}
              onPress={() => setType("long")}
            >
              <Text
                style={[
                  styles.typeText,
                  type === "long" && styles.typeTextActive,
                ]}
              >
                Long-term
              </Text>
            </Pressable>
          </View>
          <Input
            label="Target amount (RWF)"
            value={target}
            onChangeText={setTarget}
            keyboardType="numeric"
            placeholder="0"
          />
          <PrimaryButton
            label={isSaving ? "Saving..." : "Create goal"}
            onPress={handleAdd}
            disabled={isSaving}
          />
        </View>
      ) : null}

      <GoalSection
        title="Short-term goals"
        goals={shortGoals}
        isSaving={isSaving}
        onContribute={onContribute}
        onDelete={onDelete}
      />
      <GoalSection
        title="Long-term goals"
        goals={longGoals}
        isSaving={isSaving}
        onContribute={onContribute}
        onDelete={onDelete}
      />
    </View>
  );
}

function GoalSection({
  title,
  goals,
  isSaving,
  onContribute,
  onDelete,
}: {
  title: string;
  goals: SavingsGoal[];
  isSaving: boolean;
  onContribute: (goalId: string, amountRwf: number) => void;
  onDelete: (goalId: string) => void;
}) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {goals.length === 0 ? (
        <Text style={styles.empty}>No goals yet.</Text>
      ) : (
        goals.map((goal) => (
          <GoalCard
            key={goal.id}
            goal={goal}
            isSaving={isSaving}
            onContribute={onContribute}
            onDelete={onDelete}
          />
        ))
      )}
    </View>
  );
}

function SummaryStat({ label, value }: { label: string; value: number }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue}>
        {label === "Goals" || label === "Completed"
          ? value
          : `${value.toLocaleString()} RWF`}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  summaryCard: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.md,
    backgroundColor: colors.inputBg,
    marginBottom: spacing.md,
  },
  summaryTitle: {
    color: colors.white,
    fontSize: 16,
    fontWeight: "600",
    marginBottom: spacing.sm,
  },
  summaryRow: {
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
  netHint: {
    color: colors.textMuted,
    fontSize: 13,
    marginTop: spacing.sm,
  },
  addToggle: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  addToggleText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: "600",
  },
  formCard: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.md,
    backgroundColor: colors.inputBg,
    marginBottom: spacing.lg,
  },
  typeRow: {
    flexDirection: "row",
    backgroundColor: colors.pillTrack,
    borderRadius: radius.pill,
    padding: 4,
    marginBottom: spacing.md,
  },
  typeBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: radius.pill,
    alignItems: "center",
  },
  typeActive: {
    backgroundColor: colors.primary,
  },
  typeText: {
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: "600",
  },
  typeTextActive: {
    color: colors.white,
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    color: colors.white,
    fontSize: 15,
    fontWeight: "600",
    marginBottom: spacing.sm,
  },
  empty: {
    color: colors.textMuted,
    fontSize: 14,
  },
});

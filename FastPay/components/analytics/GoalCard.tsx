import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Trash2 } from "lucide-react-native";

import { Input } from "@/components/ui/Input";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { evaluateGoal, type SavingsGoal } from "@/lib/analytics/goals";
import { colors } from "@/theme/colors";
import { radius, spacing } from "@/theme/spacing";

interface GoalCardProps {
  goal: SavingsGoal;
  isSaving?: boolean;
  onContribute: (goalId: string, amountRwf: number) => void;
  onDelete: (goalId: string) => void;
}

export function GoalCard({
  goal,
  isSaving = false,
  onContribute,
  onDelete,
}: GoalCardProps) {
  const [amount, setAmount] = useState("");
  const [showContribute, setShowContribute] = useState(false);
  const status = evaluateGoal(goal);

  const handleContribute = () => {
    const value = Math.max(Number(amount.replace(/,/g, "")) || 0, 0);
    if (value <= 0) {
      return;
    }
    onContribute(goal.id, value);
    setAmount("");
    setShowContribute(false);
  };

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.titleWrap}>
          <Text style={styles.name}>{goal.name}</Text>
          <Text style={styles.type}>
            {goal.type === "short" ? "Short-term" : "Long-term"}
          </Text>
        </View>
        <Pressable onPress={() => onDelete(goal.id)} hitSlop={8}>
          <Trash2 color={colors.error} size={18} />
        </Pressable>
      </View>

      <View style={styles.amountRow}>
        <Text style={styles.saved}>{goal.savedRwf.toLocaleString()} RWF</Text>
        <Text style={styles.target}>
          / {goal.targetRwf.toLocaleString()} RWF
        </Text>
      </View>

      <View style={styles.progressTrack}>
        <View
          style={[
            styles.progressFill,
            {
              width: `${status.progress * 100}%` as `${number}%`,
              backgroundColor: status.isComplete ? colors.success : colors.primary,
            },
          ]}
        />
      </View>

      <Text style={styles.progressDetail}>
        {status.isComplete
          ? "Goal complete"
          : `${Math.round(status.progress * 100)}% · ${status.remainingRwf.toLocaleString()} RWF left`}
      </Text>

      {showContribute ? (
        <View style={styles.contributeBlock}>
          <Input
            label="Contribution (RWF)"
            value={amount}
            onChangeText={setAmount}
            keyboardType="numeric"
            placeholder="0"
          />
          <View style={styles.contributeActions}>
            <Pressable
              style={styles.cancelBtn}
              onPress={() => {
                setShowContribute(false);
                setAmount("");
              }}
            >
              <Text style={styles.cancelText}>Cancel</Text>
            </Pressable>
            <View style={styles.contributeBtnWrap}>
              <PrimaryButton
                label={isSaving ? "Saving..." : "Add"}
                onPress={handleContribute}
                disabled={isSaving}
              />
            </View>
          </View>
        </View>
      ) : (
        <Pressable
          style={styles.contributeToggle}
          onPress={() => setShowContribute(true)}
        >
          <Text style={styles.contributeToggleText}>Add contribution</Text>
        </Pressable>
      )}
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
    marginBottom: spacing.sm,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: spacing.sm,
  },
  titleWrap: {
    flex: 1,
    paddingRight: spacing.sm,
  },
  name: {
    color: colors.white,
    fontSize: 15,
    fontWeight: "600",
  },
  type: {
    color: colors.textMuted,
    fontSize: 12,
    marginTop: 2,
  },
  amountRow: {
    flexDirection: "row",
    alignItems: "baseline",
    marginBottom: spacing.sm,
  },
  saved: {
    color: colors.white,
    fontSize: 18,
    fontWeight: "700",
  },
  target: {
    color: colors.textMuted,
    fontSize: 14,
    marginLeft: 4,
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
  progressDetail: {
    color: colors.textMuted,
    fontSize: 12,
    marginTop: spacing.xs,
    marginBottom: spacing.sm,
  },
  contributeToggle: {
    alignSelf: "flex-start",
    paddingVertical: spacing.xs,
  },
  contributeToggleText: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: "600",
  },
  contributeBlock: {
    marginTop: spacing.xs,
  },
  contributeActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  cancelBtn: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
  },
  cancelText: {
    color: colors.textMuted,
    fontSize: 14,
  },
  contributeBtnWrap: {
    flex: 1,
  },
});

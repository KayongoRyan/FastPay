import { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Minus, Plus, Trash2 } from "lucide-react-native";

import { Input } from "@/components/ui/Input";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import {
  sumBucketPercents,
  validatePercentages,
  type BudgetBucket,
  type BudgetPeriod,
  type UserBudget,
} from "@/lib/analytics/budget";
import { colors } from "@/theme/colors";
import { radius, spacing } from "@/theme/spacing";

interface BudgetBuilderCardProps {
  budget: UserBudget;
  isSaving?: boolean;
  onSave: (budget: UserBudget) => void;
}

function createBucketId(): string {
  return `bucket-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
}

export function BudgetBuilderCard({
  budget,
  isSaving = false,
  onSave,
}: BudgetBuilderCardProps) {
  const [period, setPeriod] = useState<BudgetPeriod>(budget.period);
  const [incomeBase, setIncomeBase] = useState(
    budget.incomeBaseRwf > 0 ? String(budget.incomeBaseRwf) : "",
  );
  const [buckets, setBuckets] = useState<BudgetBucket[]>(
    budget.buckets.map((bucket) => ({ ...bucket })),
  );

  useEffect(() => {
    setPeriod(budget.period);
    setIncomeBase(
      budget.incomeBaseRwf > 0 ? String(budget.incomeBaseRwf) : "",
    );
    setBuckets(budget.buckets.map((bucket) => ({ ...bucket })));
  }, [budget.updatedAt, budget.period, budget.incomeBaseRwf, budget.buckets]);

  const percentTotal = sumBucketPercents(buckets);
  const validation = validatePercentages(buckets);
  const canSave = validation.valid && !isSaving;

  const updateBucket = (id: string, patch: Partial<BudgetBucket>) => {
    setBuckets((current) =>
      current.map((bucket) =>
        bucket.id === id ? { ...bucket, ...patch } : bucket,
      ),
    );
  };

  const adjustPercent = (id: string, delta: number) => {
    setBuckets((current) =>
      current.map((bucket) => {
        if (bucket.id !== id) {
          return bucket;
        }
        const next = Math.min(Math.max(bucket.percent + delta, 0), 100);
        return { ...bucket, percent: next };
      }),
    );
  };

  const addBucket = () => {
    if (buckets.length >= 5) {
      return;
    }
    setBuckets((current) => [
      ...current,
      { id: createBucketId(), name: "New bucket", percent: 0 },
    ]);
  };

  const removeBucket = (id: string) => {
    if (buckets.length <= 2) {
      return;
    }
    setBuckets((current) => current.filter((bucket) => bucket.id !== id));
  };

  const handleSave = () => {
    if (!canSave) {
      return;
    }

    onSave({
      period,
      incomeBaseRwf: Math.max(Number(incomeBase.replace(/,/g, "")) || 0, 0),
      buckets: buckets.map((bucket) => ({
        ...bucket,
        name: bucket.name.trim(),
      })),
      updatedAt: budget.updatedAt,
    });
  };

  return (
    <View style={styles.card}>
      <Text style={styles.title}>Build your budget</Text>
      <Text style={styles.subtitle}>
        Set your income and split it across buckets. Percentages must total 100%.
      </Text>

      <View style={styles.periodRow}>
        <Pressable
          style={[styles.periodBtn, period === "weekly" && styles.periodActive]}
          onPress={() => setPeriod("weekly")}
        >
          <Text
            style={[
              styles.periodText,
              period === "weekly" && styles.periodTextActive,
            ]}
          >
            Weekly
          </Text>
        </Pressable>
        <Pressable
          style={[styles.periodBtn, period === "monthly" && styles.periodActive]}
          onPress={() => setPeriod("monthly")}
        >
          <Text
            style={[
              styles.periodText,
              period === "monthly" && styles.periodTextActive,
            ]}
          >
            Monthly
          </Text>
        </Pressable>
      </View>

      <Input
        label={`Income base (RWF / ${period === "weekly" ? "week" : "month"})`}
        value={incomeBase}
        onChangeText={setIncomeBase}
        keyboardType="numeric"
        placeholder="0"
      />

      <Text style={styles.sectionLabel}>Allocation buckets</Text>

      {buckets.map((bucket) => (
        <View key={bucket.id} style={styles.bucketRow}>
          <View style={styles.bucketNameWrap}>
            <Input
              label="Name"
              value={bucket.name}
              onChangeText={(name) => updateBucket(bucket.id, { name })}
              placeholder="Bucket name"
            />
          </View>
          <View style={styles.percentCol}>
            <Text style={styles.percentLabel}>Percent</Text>
            <View style={styles.stepper}>
              <Pressable
                style={styles.stepBtn}
                onPress={() => adjustPercent(bucket.id, -5)}
              >
                <Minus color={colors.white} size={16} />
              </Pressable>
              <Text style={styles.percentValue}>{bucket.percent}%</Text>
              <Pressable
                style={styles.stepBtn}
                onPress={() => adjustPercent(bucket.id, 5)}
              >
                <Plus color={colors.white} size={16} />
              </Pressable>
            </View>
          </View>
          <Pressable
            style={[
              styles.removeBtn,
              buckets.length <= 2 && styles.removeBtnDisabled,
            ]}
            onPress={() => removeBucket(bucket.id)}
            disabled={buckets.length <= 2}
          >
            <Trash2
              color={buckets.length <= 2 ? colors.textSubtle : colors.error}
              size={18}
            />
          </Pressable>
        </View>
      ))}

      <Pressable
        style={[styles.addBtn, buckets.length >= 5 && styles.addBtnDisabled]}
        onPress={addBucket}
        disabled={buckets.length >= 5}
      >
        <Plus color={colors.primary} size={16} />
        <Text style={styles.addBtnText}>Add bucket</Text>
      </Pressable>

      <Text
        style={[
          styles.totalText,
          percentTotal !== 100 && styles.totalTextError,
        ]}
      >
        Total: {percentTotal}%
        {validation.message ? ` — ${validation.message}` : ""}
      </Text>

      <PrimaryButton
        label={isSaving ? "Saving..." : "Save budget"}
        onPress={handleSave}
        disabled={!canSave}
      />
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
  periodRow: {
    flexDirection: "row",
    backgroundColor: colors.pillTrack,
    borderRadius: radius.pill,
    padding: 4,
    marginBottom: spacing.sm,
  },
  periodBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: radius.pill,
    alignItems: "center",
  },
  periodActive: {
    backgroundColor: colors.primary,
  },
  periodText: {
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: "600",
  },
  periodTextActive: {
    color: colors.white,
  },
  sectionLabel: {
    color: colors.white,
    fontSize: 14,
    fontWeight: "600",
    marginTop: spacing.sm,
  },
  bucketRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: spacing.sm,
  },
  bucketNameWrap: {
    flex: 1,
  },
  percentCol: {
    width: 120,
    marginBottom: spacing.md,
  },
  percentLabel: {
    color: colors.textMuted,
    fontSize: 13,
    marginBottom: spacing.sm,
  },
  stepper: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.sm,
    paddingVertical: 10,
    backgroundColor: colors.inputBg,
  },
  stepBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  percentValue: {
    color: colors.white,
    fontSize: 15,
    fontWeight: "600",
  },
  removeBtn: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.md,
  },
  removeBtnDisabled: {
    opacity: 0.4,
  },
  addBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    alignSelf: "flex-start",
    paddingVertical: spacing.xs,
  },
  addBtnDisabled: {
    opacity: 0.4,
  },
  addBtnText: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: "600",
  },
  totalText: {
    color: colors.textMuted,
    fontSize: 13,
  },
  totalTextError: {
    color: colors.error,
  },
});

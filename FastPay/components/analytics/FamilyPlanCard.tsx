import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Lock, Plus, Trash2, Unlock } from "lucide-react-native";

import { Input } from "@/components/ui/Input";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import {
  evaluateFamilyPlan,
  LOCK_PERIOD_OPTIONS,
  suggestChildName,
  totalFamilyLocked,
  totalFamilySaved,
  validateFamilyContribution,
  YEARLY_INCOME_PERCENT_OPTIONS,
  type FamilyChildPlan,
  type FamilyIncomeAllocation,
  type FamilyPlanSettings,
  type LockPeriodYears,
  type YearlyIncomePercent,
} from "@/lib/analytics/family-plan";
import { colors } from "@/theme/colors";
import { radius, spacing } from "@/theme/spacing";

interface FamilyPlanCardProps {
  plans: FamilyChildPlan[];
  settings: FamilyPlanSettings;
  incomeAllocation: FamilyIncomeAllocation;
  isSaving?: boolean;
  error?: string | null;
  onSaveSettings: (settings: FamilyPlanSettings) => void;
  onAddPlan: (input: {
    name: string;
    targetRwf: number;
    lockYears: LockPeriodYears;
  }) => void;
  onContribute: (planId: string, amountRwf: number) => void;
  onDelete: (planId: string) => void;
}

const FAMILY_COLORS = {
  accent: "#A78BFA",
  bg: "rgba(167,139,250,0.12)",
  track: "rgba(167,139,250,0.22)",
  label: "#C4B5FD",
  unlock: colors.success,
  locked: "#F59E0B",
};

export function FamilyPlanCard({
  plans,
  settings,
  incomeAllocation,
  isSaving = false,
  error,
  onSaveSettings,
  onAddPlan,
  onContribute,
  onDelete,
}: FamilyPlanCardProps) {
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [target, setTarget] = useState("");
  const [lockYears, setLockYears] = useState<LockPeriodYears>(15);

  const totalSaved = totalFamilySaved(plans);
  const totalLocked = totalFamilyLocked(plans);

  const handleAdd = () => {
    const trimmed = name.trim() || suggestChildName(plans.length);
    const targetRwf = Math.max(Number(target.replace(/,/g, "")) || 0, 0);
    if (targetRwf <= 0) {
      return;
    }

    onAddPlan({ name: trimmed, targetRwf, lockYears });
    setName("");
    setTarget("");
    setLockYears(15);
    setShowForm(false);
  };

  return (
    <View style={styles.card}>
      <Text style={styles.title}>Family Plan</Text>
      <Text style={styles.subtitle}>
        Long-term savings for your children. Set a yearly % of income — each
        deposit is removed from your available income immediately.
      </Text>

      <View style={styles.incomeCard}>
        <Text style={styles.incomeCardTitle}>Yearly income allocation</Text>
        <Text style={styles.fieldLabel}>
          Percent of yearly income for family plan
        </Text>
        <View style={styles.percentRow}>
          {YEARLY_INCOME_PERCENT_OPTIONS.map((percent) => (
            <Pressable
              key={percent}
              style={[
                styles.percentBtn,
                settings.yearlyIncomePercent === percent && styles.percentBtnActive,
              ]}
              onPress={() =>
                onSaveSettings({ yearlyIncomePercent: percent as YearlyIncomePercent })
              }
            >
              <Text
                style={[
                  styles.percentBtnText,
                  settings.yearlyIncomePercent === percent &&
                    styles.percentBtnTextActive,
                ]}
              >
                {percent}%
              </Text>
            </Pressable>
          ))}
        </View>

        <View style={styles.incomeStats}>
          <IncomeStat
            label="Yearly income"
            value={`${incomeAllocation.yearlyIncomeRwf.toLocaleString()} RWF`}
          />
          <IncomeStat
            label={`${incomeAllocation.yearlyPercent}% allowed`}
            value={`${incomeAllocation.yearlyAllowanceRwf.toLocaleString()} RWF`}
          />
          <IncomeStat
            label="Removed from income"
            value={`${incomeAllocation.deductedFromIncomeRwf.toLocaleString()} RWF`}
            tone="deduction"
          />
        </View>

        <Text style={styles.availableIncome}>
          Available income: {incomeAllocation.availableIncomeRwf.toLocaleString()} RWF
        </Text>
        <Text style={styles.remainingAllowance}>
          {incomeAllocation.remainingAllowanceRwf.toLocaleString()} RWF left to add
          this year
        </Text>
      </View>

      <View style={styles.summaryRow}>
        <SummaryStat label="Total saved" value={`${totalSaved.toLocaleString()} RWF`} />
        <SummaryStat label="Locked" value={`${totalLocked.toLocaleString()} RWF`} />
        <SummaryStat label="Children" value={String(plans.length)} />
      </View>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <Pressable
        style={styles.addToggle}
        onPress={() => {
          setShowForm((current) => !current);
          if (!showForm) {
            setName(suggestChildName(plans.length));
          }
        }}
      >
        <Plus color={FAMILY_COLORS.accent} size={16} />
        <Text style={styles.addToggleText}>
          {showForm ? "Hide new plan" : "Add child plan"}
        </Text>
      </Pressable>

      {showForm ? (
        <View style={styles.formCard}>
          <Input
            label="Child name"
            value={name}
            onChangeText={setName}
            placeholder={suggestChildName(plans.length)}
          />
          <Input
            label="Target amount (RWF)"
            value={target}
            onChangeText={setTarget}
            keyboardType="numeric"
            placeholder="0"
          />

          <Text style={styles.fieldLabel}>Lock period — cannot withdraw until</Text>
          <View style={styles.lockRow}>
            {LOCK_PERIOD_OPTIONS.map((years) => (
              <Pressable
                key={years}
                style={[
                  styles.lockBtn,
                  lockYears === years && styles.lockBtnActive,
                ]}
                onPress={() => setLockYears(years)}
              >
                <Text
                  style={[
                    styles.lockBtnText,
                    lockYears === years && styles.lockBtnTextActive,
                  ]}
                >
                  {years}y
                </Text>
              </Pressable>
            ))}
          </View>

          <PrimaryButton
            label={isSaving ? "Saving..." : "Create family plan"}
            onPress={handleAdd}
            disabled={isSaving}
          />
        </View>
      ) : null}

      {plans.length === 0 ? (
        <Text style={styles.empty}>
          No family plans yet. Start saving for your first child.
        </Text>
      ) : (
        plans.map((plan) => (
          <FamilyChildRow
            key={plan.id}
            plan={plan}
            incomeAllocation={incomeAllocation}
            isSaving={isSaving}
            onContribute={onContribute}
            onDelete={onDelete}
          />
        ))
      )}
    </View>
  );
}

function FamilyChildRow({
  plan,
  incomeAllocation,
  isSaving,
  onContribute,
  onDelete,
}: {
  plan: FamilyChildPlan;
  incomeAllocation: FamilyIncomeAllocation;
  isSaving: boolean;
  onContribute: (planId: string, amountRwf: number) => void;
  onDelete: (planId: string) => void;
}) {
  const [amount, setAmount] = useState("");
  const [showContribute, setShowContribute] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const status = evaluateFamilyPlan(plan);

  const handleContribute = () => {
    const value = Math.max(Number(amount.replace(/,/g, "")) || 0, 0);
    const validation = validateFamilyContribution(value, incomeAllocation);
    if (!validation.valid) {
      setLocalError(validation.message ?? "Contribution not allowed.");
      return;
    }
    setLocalError(null);
    onContribute(plan.id, value);
    setAmount("");
    setShowContribute(false);
  };

  const previewAmount = Math.max(Number(amount.replace(/,/g, "")) || 0, 0);

  return (
    <View style={styles.childCard}>
      <View style={styles.childHeader}>
        <View style={styles.childTitleWrap}>
          <Text style={styles.childName}>{plan.name}</Text>
          <View style={styles.lockBadge}>
            {status.isLocked ? (
              <Lock color={FAMILY_COLORS.locked} size={12} />
            ) : (
              <Unlock color={FAMILY_COLORS.unlock} size={12} />
            )}
            <Text
              style={[
                styles.lockBadgeText,
                status.isUnlocked && styles.lockBadgeUnlocked,
              ]}
            >
              {status.isLocked
                ? `Locked until ${status.unlockLabel} (${status.yearsRemaining}y left)`
                : `Unlocked since ${status.unlockLabel}`}
            </Text>
          </View>
        </View>
        <Pressable onPress={() => onDelete(plan.id)} hitSlop={8}>
          <Trash2 color={colors.error} size={18} />
        </Pressable>
      </View>

      <View style={styles.amountRow}>
        <Text style={styles.saved}>{plan.savedRwf.toLocaleString()} RWF</Text>
        <Text style={styles.target}>/ {plan.targetRwf.toLocaleString()} RWF</Text>
      </View>

      <View style={[styles.progressTrack, { backgroundColor: FAMILY_COLORS.track }]}>
        <View
          style={[
            styles.progressFill,
            {
              width: `${status.progress * 100}%` as `${number}%`,
              backgroundColor: status.isUnlocked
                ? FAMILY_COLORS.unlock
                : FAMILY_COLORS.accent,
            },
          ]}
        />
      </View>

      <Text style={styles.progressDetail}>
        {Math.round(status.progress * 100)}% · {status.remainingRwf.toLocaleString()} RWF
        to go · {plan.lockYears}-year plan
      </Text>

      <Text style={styles.timelineTitle}>Savings timeline</Text>
      <View style={styles.timeline}>
        {status.timeline.map((milestone, index) => (
          <View key={`${milestone.year}-${milestone.label}`} style={styles.timelineRow}>
            <View style={styles.timelineRail}>
              <View
                style={[
                  styles.timelineDot,
                  milestone.isUnlock && styles.timelineDotUnlock,
                  milestone.isCurrent && styles.timelineDotCurrent,
                  milestone.isPast && styles.timelineDotPast,
                ]}
              />
              {index < status.timeline.length - 1 ? (
                <View
                  style={[
                    styles.timelineLine,
                    milestone.isPast && styles.timelineLinePast,
                  ]}
                />
              ) : null}
            </View>
            <View style={styles.timelineContent}>
              <Text style={styles.timelineYear}>{milestone.year}</Text>
              <Text style={styles.timelineLabel}>{milestone.label}</Text>
              <Text style={styles.timelineAmount}>
                {milestone.amountRwf.toLocaleString()} RWF
              </Text>
            </View>
          </View>
        ))}
      </View>

      {status.isLocked ? (
        <Text style={styles.lockedNote}>
          Savings cannot be withdrawn until {status.unlockLabel}.
        </Text>
      ) : (
        <Text style={styles.unlockedNote}>
          This plan is unlocked. Savings are available to use.
        </Text>
      )}

      {showContribute ? (
        <View style={styles.contributeBlock}>
          <Input
            label="Add savings (RWF)"
            value={amount}
            onChangeText={(value) => {
              setAmount(value);
              setLocalError(null);
            }}
            keyboardType="numeric"
            placeholder="0"
          />
          {previewAmount > 0 ? (
            <Text style={styles.deductionPreview}>
              {previewAmount.toLocaleString()} RWF will be removed from your
              available income immediately.
            </Text>
          ) : null}
          {localError ? <Text style={styles.error}>{localError}</Text> : null}
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
                label={isSaving ? "Saving..." : "Add savings"}
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
          <Text style={styles.contributeToggleText}>Add savings</Text>
        </Pressable>
      )}
    </View>
  );
}

function SummaryStat({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue}>{value}</Text>
    </View>
  );
}

function IncomeStat({
  label,
  value,
  tone = "neutral",
}: {
  label: string;
  value: string;
  tone?: "neutral" | "deduction";
}) {
  return (
    <View style={styles.incomeStat}>
      <Text style={styles.incomeStatLabel}>{label}</Text>
      <Text
        style={[
          styles.incomeStatValue,
          tone === "deduction" && styles.incomeStatDeduction,
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
  incomeCard: {
    borderWidth: 1,
    borderColor: "rgba(167,139,250,0.25)",
    borderRadius: radius.sm,
    padding: spacing.md,
    backgroundColor: FAMILY_COLORS.bg,
    marginBottom: spacing.sm,
  },
  incomeCardTitle: {
    color: colors.white,
    fontSize: 14,
    fontWeight: "600",
    marginBottom: spacing.sm,
  },
  percentRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  percentBtn: {
    minWidth: 52,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    backgroundColor: colors.inputBg,
  },
  percentBtnActive: {
    backgroundColor: FAMILY_COLORS.accent,
    borderColor: FAMILY_COLORS.accent,
  },
  percentBtnText: {
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: "600",
  },
  percentBtnTextActive: {
    color: colors.white,
  },
  incomeStats: {
    flexDirection: "row",
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  incomeStat: {
    flex: 1,
    borderWidth: 1,
    borderColor: "rgba(167,139,250,0.15)",
    borderRadius: radius.sm,
    padding: spacing.sm,
  },
  incomeStatLabel: {
    color: colors.textMuted,
    fontSize: 10,
  },
  incomeStatValue: {
    color: colors.white,
    fontSize: 12,
    fontWeight: "600",
    marginTop: 4,
  },
  incomeStatDeduction: {
    color: colors.error,
  },
  availableIncome: {
    color: colors.success,
    fontSize: 13,
    fontWeight: "600",
  },
  remainingAllowance: {
    color: colors.textMuted,
    fontSize: 12,
    marginTop: 4,
  },
  summaryRow: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  stat: {
    flex: 1,
    borderWidth: 1,
    borderColor: "rgba(167,139,250,0.2)",
    borderRadius: radius.sm,
    padding: spacing.sm,
    backgroundColor: FAMILY_COLORS.bg,
  },
  statLabel: {
    color: colors.textMuted,
    fontSize: 11,
  },
  statValue: {
    color: FAMILY_COLORS.label,
    fontSize: 12,
    fontWeight: "600",
    marginTop: 4,
  },
  error: {
    color: colors.error,
    fontSize: 13,
  },
  addToggle: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  addToggleText: {
    color: FAMILY_COLORS.accent,
    fontSize: 14,
    fontWeight: "600",
  },
  formCard: {
    borderWidth: 1,
    borderColor: "rgba(167,139,250,0.25)",
    borderRadius: radius.sm,
    padding: spacing.md,
    backgroundColor: FAMILY_COLORS.bg,
  },
  fieldLabel: {
    color: colors.textMuted,
    fontSize: 13,
    marginBottom: spacing.sm,
  },
  lockRow: {
    flexDirection: "row",
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  lockBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    backgroundColor: colors.inputBg,
  },
  lockBtnActive: {
    backgroundColor: FAMILY_COLORS.accent,
    borderColor: FAMILY_COLORS.accent,
  },
  lockBtnText: {
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: "600",
  },
  lockBtnTextActive: {
    color: colors.white,
  },
  empty: {
    color: colors.textMuted,
    fontSize: 14,
    marginTop: spacing.sm,
  },
  childCard: {
    borderWidth: 1,
    borderColor: "rgba(167,139,250,0.2)",
    borderRadius: radius.sm,
    padding: spacing.md,
    backgroundColor: FAMILY_COLORS.bg,
    marginTop: spacing.sm,
  },
  childHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: spacing.sm,
  },
  childTitleWrap: {
    flex: 1,
    paddingRight: spacing.sm,
  },
  childName: {
    color: colors.white,
    fontSize: 15,
    fontWeight: "600",
  },
  lockBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 4,
  },
  lockBadgeText: {
    color: FAMILY_COLORS.locked,
    fontSize: 12,
    fontWeight: "500",
  },
  lockBadgeUnlocked: {
    color: FAMILY_COLORS.unlock,
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
  timelineTitle: {
    color: colors.white,
    fontSize: 13,
    fontWeight: "600",
    marginBottom: spacing.sm,
  },
  timeline: {
    marginBottom: spacing.sm,
  },
  timelineRow: {
    flexDirection: "row",
    minHeight: 56,
  },
  timelineRail: {
    width: 24,
    alignItems: "center",
  },
  timelineDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.pillTrack,
    borderWidth: 2,
    borderColor: FAMILY_COLORS.accent,
  },
  timelineDotPast: {
    backgroundColor: FAMILY_COLORS.accent,
  },
  timelineDotCurrent: {
    backgroundColor: colors.white,
    borderColor: FAMILY_COLORS.accent,
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  timelineDotUnlock: {
    borderColor: FAMILY_COLORS.unlock,
    backgroundColor: FAMILY_COLORS.unlock,
  },
  timelineLine: {
    flex: 1,
    width: 2,
    backgroundColor: "rgba(167,139,250,0.25)",
    marginVertical: 2,
  },
  timelineLinePast: {
    backgroundColor: FAMILY_COLORS.accent,
  },
  timelineContent: {
    flex: 1,
    paddingBottom: spacing.sm,
    paddingLeft: spacing.xs,
  },
  timelineYear: {
    color: FAMILY_COLORS.label,
    fontSize: 12,
    fontWeight: "600",
  },
  timelineLabel: {
    color: colors.white,
    fontSize: 13,
    fontWeight: "500",
  },
  timelineAmount: {
    color: colors.textMuted,
    fontSize: 12,
    marginTop: 2,
  },
  lockedNote: {
    color: FAMILY_COLORS.locked,
    fontSize: 12,
    fontStyle: "italic",
    marginBottom: spacing.sm,
  },
  unlockedNote: {
    color: FAMILY_COLORS.unlock,
    fontSize: 12,
    marginBottom: spacing.sm,
  },
  contributeToggle: {
    alignSelf: "flex-start",
    paddingVertical: spacing.xs,
  },
  contributeToggleText: {
    color: FAMILY_COLORS.accent,
    fontSize: 13,
    fontWeight: "600",
  },
  contributeBlock: {
    marginTop: spacing.xs,
  },
  deductionPreview: {
    color: colors.error,
    fontSize: 12,
    marginBottom: spacing.sm,
    lineHeight: 18,
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

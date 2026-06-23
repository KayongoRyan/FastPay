import { Href, router } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import { Check, Circle } from "lucide-react-native";

import { BackHeader } from "@/components/ui/BackHeader";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { Screen } from "@/components/ui/Screen";
import { colors } from "@/theme/colors";
import { radius, spacing } from "@/theme/spacing";

const STEPS = [
  { label: "Step 1: Create your account", done: true },
  { label: "Step 2: Phone number & email", done: true },
  { label: "Step 3: Verify your identity", done: false, action: "Edit" },
] as const;

export default function SecureAccountScreen() {
  return (
    <Screen scroll>
      <BackHeader />

      <View style={styles.checkCircle}>
        <Check color={colors.background} size={40} strokeWidth={3} />
      </View>

      <Text style={styles.title}>Let's secure your account</Text>

      <View style={styles.steps}>
        {STEPS.map((step) => (
          <View key={step.label} style={styles.stepRow}>
            <View style={[styles.stepIcon, step.done && styles.stepDone]}>
              {step.done ? (
                <Check color={colors.background} size={14} strokeWidth={3} />
              ) : (
                <Circle color={colors.textMuted} size={14} />
              )}
            </View>
            <Text style={[styles.stepLabel, step.done && styles.stepLabelDone]}>
              {step.label}
            </Text>
            {"action" in step && step.action ? (
              <Text style={styles.edit}>{step.action}</Text>
            ) : null}
          </View>
        ))}
      </View>

      <View style={styles.spacer} />

      <PrimaryButton
        label="Next"
        onPress={() => router.push("/(auth)/kyc" as Href)}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  checkCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.white,
    alignSelf: "center",
    alignItems: "center",
    justifyContent: "center",
    marginVertical: spacing.xl,
  },
  title: {
    color: colors.white,
    fontSize: 24,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: spacing.xl,
  },
  steps: {
    gap: spacing.lg,
    marginBottom: spacing.xl,
  },
  stepRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  stepIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  stepDone: {
    backgroundColor: colors.success,
    borderColor: colors.success,
  },
  stepLabel: {
    flex: 1,
    color: colors.textMuted,
    fontSize: 15,
  },
  stepLabelDone: {
    color: colors.white,
  },
  edit: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: "600",
  },
  spacer: {
    flex: 1,
    minHeight: 40,
  },
});

import { Href, router } from "expo-router";
import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";

import { BackHeader } from "@/components/ui/BackHeader";
import { NumericKeypad } from "@/components/ui/NumericKeypad";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { Screen } from "@/components/ui/Screen";
import { colors } from "@/theme/colors";
import { radius, spacing } from "@/theme/spacing";

const OTP_LENGTH = 6;

export default function OtpScreen() {
  const [code, setCode] = useState("");

  const onKey = (key: string) => {
    if (code.length < OTP_LENGTH) {
      setCode((prev) => prev + key);
    }
  };

  const onDelete = () => {
    setCode((prev) => prev.slice(0, -1));
  };

  return (
    <Screen>
      <BackHeader />

      <Text style={styles.title}>Enter authentication code</Text>
      <Text style={styles.subtitle}>
        Enter the 6 digit code we just sent to your email
      </Text>

      <View style={styles.codeBox}>
        <Text style={styles.code}>
          {code.padEnd(OTP_LENGTH, " ").split("").join(" ")}
        </Text>
      </View>

      <PrimaryButton
        label="Continue"
        onPress={() => router.push("/(auth)/secure-account" as Href)}
        disabled={code.length !== OTP_LENGTH}
        style={styles.button}
      />

      <Text style={styles.resend}>Resend Code</Text>

      <NumericKeypad onKey={onKey} onDelete={onDelete} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: {
    color: colors.white,
    fontSize: 22,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: spacing.sm,
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
    marginBottom: spacing.xl,
    paddingHorizontal: spacing.md,
  },
  codeBox: {
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: radius.md,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.md,
    alignItems: "center",
    marginBottom: spacing.lg,
    backgroundColor: colors.inputBg,
  },
  code: {
    color: colors.white,
    fontSize: 28,
    letterSpacing: 8,
    fontWeight: "600",
  },
  button: {
    marginBottom: spacing.md,
  },
  resend: {
    color: colors.textMuted,
    textAlign: "center",
    fontSize: 14,
    marginBottom: spacing.md,
  },
});

import { Href, router } from "expo-router";
import { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Mail } from "lucide-react-native";

import { BackHeader } from "@/components/ui/BackHeader";
import { OutlineButton } from "@/components/ui/OutlineButton";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { Screen } from "@/components/ui/Screen";
import { sendEmailOtp } from "@/lib/api/onboarding";
import { useOnboardingStore } from "@/store/onboardingStore";
import { colors } from "@/theme/colors";
import { spacing } from "@/theme/spacing";

export default function VerifyEmailScreen() {
  const email = useOnboardingStore((s) => s.email);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [debugCode, setDebugCode] = useState<string | null>(null);

  useEffect(() => {
    void handleSendOtp();
  }, []);

  const handleSendOtp = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await sendEmailOtp();
      if ("debugCode" in result && result.debugCode) {
        setDebugCode(String(result.debugCode));
      }
    } catch (sendError) {
      setError(
        sendError instanceof Error ? sendError.message : "Failed to send OTP",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen scroll>
      <BackHeader />

      <View style={styles.iconWrap}>
        <Mail color={colors.white} size={64} strokeWidth={1.5} />
      </View>

      <Text style={styles.title}>Verify your email</Text>
      <Text style={styles.body}>
        We sent a verification code to {email || "your email"}. Enter it on the
        next screen to continue.
      </Text>

      {debugCode ? (
        <Text style={styles.debug}>Dev code: {debugCode}</Text>
      ) : null}
      {error ? <Text style={styles.error}>{error}</Text> : null}

      <PrimaryButton
        label="Enter code"
        onPress={() => router.push("/(auth)/otp" as Href)}
        style={styles.primary}
      />
      <OutlineButton
        label={loading ? "Sending..." : "Resend email"}
        onPress={() => void handleSendOtp()}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  iconWrap: {
    alignSelf: "center",
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.xl,
    marginTop: spacing.md,
  },
  title: {
    color: colors.white,
    fontSize: 24,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: spacing.md,
  },
  body: {
    color: colors.textMuted,
    fontSize: 15,
    lineHeight: 22,
    textAlign: "center",
    marginBottom: spacing.xl,
    paddingHorizontal: spacing.sm,
  },
  debug: {
    color: colors.primary,
    textAlign: "center",
    marginBottom: spacing.md,
    fontWeight: "600",
  },
  error: {
    color: colors.error,
    textAlign: "center",
    marginBottom: spacing.md,
  },
  primary: {
    marginBottom: spacing.md,
  },
});

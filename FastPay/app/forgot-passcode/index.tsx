import { Href, router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { Keyboard, Pressable, StyleSheet, Text, View } from "react-native";
import { ChevronLeft } from "lucide-react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { FastPayLogo } from "@/components/FastPayLogo";
import { Input } from "@/components/ui/Input";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { verifyAccountPassword } from "@/lib/auth/api";
import { featureRoutes } from "@/lib/navigation/feature-routes";
import { usePasscodeResetStore } from "@/store/passcodeResetStore";
import { colors } from "@/theme/colors";
import { spacing } from "@/theme/spacing";

export default function ForgotPasscodeVerifyScreen() {
  const { user } = useRequireAuth();
  const { returnTo } = useLocalSearchParams<{ returnTo?: string }>();
  const markVerified = usePasscodeResetStore((state) => state.markVerified);

  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleVerify = async () => {
    Keyboard.dismiss();
    setError(null);

    if (!password.trim()) {
      setError("Enter your account password.");
      return;
    }

    if (password.length < 8) {
      setError(
        "Use your login password (at least 8 characters), not your 4-digit transaction passcode.",
      );
      return;
    }

    setSubmitting(true);
    try {
      await verifyAccountPassword(password);
      markVerified();
      const nextReturn = returnTo ?? "/home";
      router.push({
        pathname: "/forgot-passcode/new-pin",
        params: { returnTo: nextReturn },
      } as Href);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Could not verify your password. Try again.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      <View style={styles.topBar}>
        <Pressable style={styles.backBtn} onPress={() => router.back()} hitSlop={12}>
          <ChevronLeft color={colors.white} size={28} />
        </Pressable>
        <FastPayLogo size={34} />
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>Reset passcode</Text>
        <Text style={styles.subtitle}>
          Enter the password you use to sign in to FastPay — not your 4-digit payment
          passcode
          {user?.fullName ? `, ${user.fullName}` : ""}.
        </Text>

        <Text style={styles.hint}>Login password · minimum 8 characters</Text>

        <Input
          placeholder="Login password"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
          onSubmitEditing={() => void handleVerify()}
          returnKeyType="go"
        />

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <PrimaryButton
          label="Continue"
          onPress={() => void handleVerify()}
          loading={submitting}
          style={styles.button}
        />

        <Pressable onPress={() => router.replace(featureRoutes.login as Href)}>
          <Text style={styles.altLink}>Sign in with a different account</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
  },
  title: {
    color: colors.white,
    fontSize: 32,
    fontWeight: "700",
    marginBottom: spacing.sm,
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: 16,
    lineHeight: 24,
    marginBottom: spacing.sm,
  },
  hint: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: "600",
    marginBottom: spacing.lg,
  },
  button: {
    marginTop: spacing.md,
  },
  error: {
    color: colors.error,
    fontSize: 14,
    marginTop: spacing.sm,
    marginBottom: spacing.sm,
    textAlign: "center",
  },
  altLink: {
    color: colors.primary,
    textAlign: "center",
    marginTop: spacing.xl,
    fontSize: 15,
    fontWeight: "500",
  },
});

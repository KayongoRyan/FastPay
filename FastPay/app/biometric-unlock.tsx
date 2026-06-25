import { Href, router } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { FastPayLogo } from "@/components/FastPayLogo";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { Screen } from "@/components/ui/Screen";
import { useAuthStore } from "@/store/authStore";
import { colors } from "@/theme/colors";
import { spacing } from "@/theme/spacing";

export default function BiometricUnlockScreen() {
  const {
    user,
    isLoading,
    error,
    biometricLabel,
    unlockWithBiometric,
    logout,
  } = useAuthStore();

  return (
    <Screen centered>
      <FastPayLogo size={48} />
      <Text style={styles.title}>FastPay is locked</Text>
      <Text style={styles.subtitle}>
        {user
          ? `Use ${biometricLabel} to unlock ${user.fullName}'s account`
          : `Use ${biometricLabel} to continue`}
      </Text>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <PrimaryButton
        label={isLoading ? "Unlocking..." : `Unlock with ${biometricLabel}`}
        onPress={() => {
          void unlockWithBiometric()
            .then(() => router.replace("/home" as Href))
            .catch(() => undefined);
        }}
        loading={isLoading}
        style={styles.button}
      />

      <Pressable
        style={styles.secondary}
        disabled={isLoading}
        onPress={() => {
          void logout().then(() => router.replace("/(auth)/login" as Href));
        }}
      >
        <Text style={styles.secondaryText}>Sign in with password</Text>
      </Pressable>
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: colors.white,
    marginTop: spacing.xl,
    marginBottom: spacing.sm,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 15,
    color: colors.textMuted,
    textAlign: "center",
    marginBottom: spacing.lg,
    paddingHorizontal: spacing.md,
  },
  error: {
    color: colors.error,
    marginBottom: spacing.md,
    textAlign: "center",
  },
  button: {
    width: "100%",
    maxWidth: 360,
    marginTop: spacing.md,
  },
  secondary: {
    paddingVertical: spacing.lg,
  },
  secondaryText: {
    color: colors.textMuted,
    fontSize: 15,
  },
});

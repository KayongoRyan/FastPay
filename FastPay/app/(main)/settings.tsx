import { Href, router } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { TabScreenLayout } from "@/components/layout/TabScreenLayout";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { useAuthStore } from "@/store/authStore";
import { colors } from "@/theme/colors";
import { radius, spacing } from "@/theme/spacing";

export default function SettingsScreen() {
  const { user, isReady, isLoading } = useRequireAuth();
  const { logout, enableBiometric, disableBiometric, biometricLabel, isLoading: authBusy, error } =
    useAuthStore();

  if (!isReady || isLoading || !user) {
    return (
      <TabScreenLayout scroll={false}>
        <Text style={styles.muted}>Loading...</Text>
      </TabScreenLayout>
    );
  }

  return (
    <TabScreenLayout>
      <Text style={styles.title}>Settings</Text>
      <Text style={styles.subtitle}>{user.email ?? user.phone ?? user.id}</Text>

      <View style={styles.card}>
        <Text style={styles.label}>Account</Text>
        <Text style={styles.value}>{user.fullName}</Text>
        <Text style={styles.label}>KYC</Text>
        <Text style={styles.value}>
          {user.kycStatus} (level {user.kycLevel})
        </Text>
        <Text style={styles.label}>Biometric</Text>
        <Text style={styles.value}>
          {user.biometricEnabled ? `${biometricLabel} on` : "Off"}
        </Text>
      </View>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <Pressable
        style={[styles.rowBtn, authBusy && styles.disabled]}
        disabled={authBusy}
        onPress={() =>
          user.biometricEnabled ? void disableBiometric() : void enableBiometric()
        }
      >
        <Text style={styles.rowBtnText}>
          {user.biometricEnabled ? `Disable ${biometricLabel}` : `Enable ${biometricLabel}`}
        </Text>
      </Pressable>

      <Pressable
        style={[styles.rowBtn, styles.signOutBtn]}
        onPress={() => void logout().then(() => router.replace("/login" as Href))}
      >
        <Text style={styles.signOutText}>Sign out</Text>
      </Pressable>
    </TabScreenLayout>
  );
}

const styles = StyleSheet.create({
  muted: { color: colors.textMuted },
  title: { color: colors.white, fontSize: 26, fontWeight: "700" },
  subtitle: { color: colors.textMuted, marginBottom: spacing.lg },
  card: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.lg,
    backgroundColor: colors.inputBg,
    gap: 4,
  },
  label: {
    color: colors.textMuted,
    fontSize: 11,
    textTransform: "uppercase",
    marginTop: 8,
  },
  value: { color: colors.white, fontSize: 15, marginBottom: 4 },
  error: {
    color: colors.error,
    marginBottom: spacing.md,
    textAlign: "center",
    fontSize: 14,
    lineHeight: 20,
  },
  rowBtn: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.pill,
    paddingVertical: spacing.md,
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  rowBtnText: { color: colors.white, fontWeight: "600" },
  disabled: { opacity: 0.5 },
  signOutBtn: { borderColor: colors.error, marginTop: spacing.md },
  signOutText: { color: colors.error, fontWeight: "600" },
});

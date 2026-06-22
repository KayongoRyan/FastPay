import { router } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { useAuthStore } from "@/store/authStore";

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
    <View style={styles.container}>
      <Text style={styles.title}>FastPay is locked</Text>
      <Text style={styles.subtitle}>
        {user
          ? `Use ${biometricLabel} to unlock ${user.fullName}'s account`
          : `Use ${biometricLabel} to continue`}
      </Text>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <Pressable
        style={[styles.button, isLoading && styles.buttonDisabled]}
        disabled={isLoading}
        onPress={() => {
          void unlockWithBiometric().then(() => router.replace("/"));
        }}
      >
        <Text style={styles.buttonText}>
          {isLoading ? "Unlocking..." : `Unlock with ${biometricLabel}`}
        </Text>
      </Pressable>

      <Pressable
        style={styles.secondaryButton}
        disabled={isLoading}
        onPress={() => {
          void logout().then(() => router.replace("/login"));
        }}
      >
        <Text style={styles.secondaryButtonText}>Sign in with password</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    backgroundColor: "#0a0a0a",
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#ffffff",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#a3a3a3",
    textAlign: "center",
    marginBottom: 24,
  },
  error: {
    color: "#f87171",
    marginBottom: 16,
    textAlign: "center",
  },
  button: {
    width: "100%",
    maxWidth: 360,
    backgroundColor: "#ffffff",
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
    marginBottom: 12,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: "#0a0a0a",
    fontWeight: "600",
    fontSize: 15,
  },
  secondaryButton: {
    paddingVertical: 14,
  },
  secondaryButtonText: {
    color: "#a3a3a3",
    fontSize: 15,
  },
});

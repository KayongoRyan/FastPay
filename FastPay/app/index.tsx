import { Href, Link, router } from "expo-router";
import { useEffect } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { useAuthStore } from "@/store/authStore";
import { useWalletStore } from "@/store/walletStore";

function truncateKey(publicKey: string): string {
  return `${publicKey.slice(0, 6)}...${publicKey.slice(-6)}`;
}

export default function HomeScreen() {
  const {
    user,
    isReady: authReady,
    isLoading: authLoading,
    isLocked,
    biometricLabel,
    logout,
    enableBiometric,
    disableBiometric,
  } = useAuthStore();
  const {
    wallet,
    providerType,
    isReady: walletReady,
    isLoading: walletLoading,
    error,
    initialize,
    createWallet,
    upgradeToWeb3Auth,
  } = useWalletStore();

  useEffect(() => {
    if (isLocked) {
      router.replace("/biometric-unlock" as Href);
    }
  }, [isLocked]);

  useEffect(() => {
    if (user && !isLocked) {
      void initialize();
    }
  }, [user, isLocked, initialize]);

  if (!authReady || authLoading) {
    return (
      <View style={styles.container}>
        <Text style={styles.subtitle}>Loading session...</Text>
      </View>
    );
  }

  if (!user) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>FastPay Wallet</Text>
        <Text style={styles.subtitle}>
          Sign in to access your wallet and offline payments.
        </Text>
        <Link href="/login" style={styles.navLink}>
          Sign in
        </Link>
        <Link href="/register" style={styles.navLinkSecondary}>
          Create account
        </Link>
      </View>
    );
  }

  const isLoading = walletLoading;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>FastPay Wallet</Text>
      <Text style={styles.subtitle}>Signed in as {user.fullName}</Text>

      <View style={styles.card}>
        <Text style={styles.label}>Account</Text>
        <Text style={styles.value}>{user.email ?? user.phone ?? user.id}</Text>
        <Text style={styles.label}>KYC</Text>
        <Text style={styles.value}>
          {user.kycStatus} (level {user.kycLevel})
        </Text>

        <Text style={styles.label}>Biometric</Text>
        <Text style={styles.value}>
          {user.biometricEnabled ? `${biometricLabel} enabled` : "Password only"}
        </Text>

        <Text style={styles.label}>MPC provider</Text>
        <Text style={styles.value}>{providerType}</Text>

        <Text style={styles.label}>Wallet</Text>
        <Text style={styles.value}>
          {!walletReady
            ? "Initializing..."
            : wallet
              ? truncateKey(wallet.publicKey)
              : "No wallet yet"}
        </Text>

        {error ? <Text style={styles.error}>{error}</Text> : null}
      </View>

      {!wallet ? (
        <Pressable
          style={[styles.button, isLoading && styles.buttonDisabled]}
          disabled={!walletReady || isLoading}
          onPress={() => void createWallet()}
        >
          <Text style={styles.buttonText}>Create wallet (single-key)</Text>
        </Pressable>
      ) : (
        <>
          <Link href="/offline/send" style={styles.navLink}>
            Offline send (QR)
          </Link>
          <Link href="/offline/receive" style={styles.navLink}>
            Offline receive (scan & relay)
          </Link>
          <Pressable
            style={[styles.buttonSecondary, isLoading && styles.buttonDisabled]}
            disabled={isLoading || providerType === "web3auth"}
            onPress={() => void upgradeToWeb3Auth()}
          >
            <Text style={styles.buttonSecondaryText}>Upgrade to Web3Auth MPC</Text>
          </Pressable>
        </>
      )}

      {user.biometricEnabled ? (
        <Pressable
          style={[styles.buttonSecondary, authLoading && styles.buttonDisabled]}
          disabled={authLoading}
          onPress={() => void disableBiometric()}
        >
          <Text style={styles.buttonSecondaryText}>
            Disable {biometricLabel}
          </Text>
        </Pressable>
      ) : (
        <Pressable
          style={[styles.buttonSecondary, authLoading && styles.buttonDisabled]}
          disabled={authLoading}
          onPress={() => void enableBiometric()}
        >
          <Text style={styles.buttonSecondaryText}>
            Enable {biometricLabel}
          </Text>
        </Pressable>
      )}

      <Pressable
        style={[styles.buttonSecondary, styles.logoutButton]}
        onPress={() => {
          void logout().then(() => router.replace("/login"));
        }}
      >
        <Text style={styles.buttonSecondaryText}>Sign out</Text>
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
  card: {
    width: "100%",
    maxWidth: 360,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#262626",
    padding: 16,
    marginBottom: 16,
    gap: 6,
  },
  label: {
    fontSize: 12,
    color: "#737373",
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  value: {
    fontSize: 16,
    color: "#fafafa",
    marginBottom: 8,
  },
  error: {
    fontSize: 13,
    color: "#f87171",
    marginTop: 4,
  },
  button: {
    width: "100%",
    maxWidth: 360,
    backgroundColor: "#ffffff",
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
  },
  buttonSecondary: {
    width: "100%",
    maxWidth: 360,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#404040",
    paddingVertical: 14,
    alignItems: "center",
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: "#0a0a0a",
    fontWeight: "600",
    fontSize: 15,
  },
  buttonSecondaryText: {
    color: "#e5e5e5",
    fontWeight: "600",
    fontSize: 15,
  },
  navLink: {
    width: "100%",
    maxWidth: 360,
    color: "#ffffff",
    textAlign: "center",
    paddingVertical: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#404040",
    marginBottom: 12,
    overflow: "hidden",
  },
  navLinkSecondary: {
    width: "100%",
    maxWidth: 360,
    color: "#a3a3a3",
    textAlign: "center",
    paddingVertical: 14,
    fontSize: 15,
  },
  logoutButton: {
    marginTop: 16,
  },
});

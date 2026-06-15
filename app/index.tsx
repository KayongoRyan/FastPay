import { useEffect } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { useWalletStore } from "@/store/walletStore";

function truncateKey(publicKey: string): string {
  return `${publicKey.slice(0, 6)}...${publicKey.slice(-6)}`;
}

export default function HomeScreen() {
  const {
    wallet,
    providerType,
    isReady,
    isLoading,
    error,
    initialize,
    createWallet,
    upgradeToWeb3Auth,
  } = useWalletStore();

  useEffect(() => {
    void initialize();
  }, [initialize]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>FastPay Wallet</Text>
      <Text style={styles.subtitle}>
        Non-custodial crypto wallet for web and mobile.
      </Text>

      <View style={styles.card}>
        <Text style={styles.label}>MPC provider</Text>
        <Text style={styles.value}>{providerType}</Text>

        <Text style={styles.label}>Wallet</Text>
        <Text style={styles.value}>
          {!isReady
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
          disabled={!isReady || isLoading}
          onPress={() => void createWallet()}
        >
          <Text style={styles.buttonText}>Create wallet (single-key)</Text>
        </Pressable>
      ) : (
        <Pressable
          style={[styles.buttonSecondary, isLoading && styles.buttonDisabled]}
          disabled={isLoading || providerType === "web3auth"}
          onPress={() => void upgradeToWeb3Auth()}
        >
          <Text style={styles.buttonSecondaryText}>Upgrade to Web3Auth MPC</Text>
        </Pressable>
      )}
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
});

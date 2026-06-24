import { Link } from "expo-router";
import { useEffect } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { TabScreenLayout } from "@/components/layout/TabScreenLayout";
import { VirtualCard } from "@/components/ui/VirtualCard";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { useWalletStore } from "@/store/walletStore";
import { colors } from "@/theme/colors";
import { radius, spacing } from "@/theme/spacing";

export default function WalletScreen() {
  const { user, isReady, isLoading } = useRequireAuth();
  const { wallet, initialize, createWallet, isLoading: walletLoading, isReady: walletReady } =
    useWalletStore();

  useEffect(() => {
    if (user) void initialize();
  }, [user, initialize]);

  if (!isReady || isLoading || !user) {
    return (
      <TabScreenLayout scroll={false}>
        <Text style={styles.muted}>Loading...</Text>
      </TabScreenLayout>
    );
  }

  return (
    <TabScreenLayout>
      <Text style={styles.title}>Wallet</Text>
      <Text style={styles.subtitle}>Your virtual card & Stellar wallet</Text>

      <VirtualCard holderName={user.fullName} />

      <View style={styles.card}>
        <Text style={styles.label}>Stellar address</Text>
        <Text style={styles.value}>
          {walletReady
            ? wallet
              ? wallet.publicKey
              : "No wallet created"
            : "Loading..."}
        </Text>
      </View>

      {!wallet ? (
        <Pressable
          style={[styles.button, walletLoading && styles.disabled]}
          disabled={!walletReady || walletLoading}
          onPress={() => void createWallet()}
        >
          <Text style={styles.buttonText}>
            {walletLoading ? "Creating..." : "Create wallet"}
          </Text>
        </Pressable>
      ) : (
        <>
          <Link href="/offline/send" style={styles.link}>
            Send (offline QR)
          </Link>
          <Link href="/offline/receive" style={styles.link}>
            Receive (scan & relay)
          </Link>
        </>
      )}
    </TabScreenLayout>
  );
}

const styles = StyleSheet.create({
  muted: { color: colors.textMuted },
  title: { color: colors.white, fontSize: 26, fontWeight: "700", marginBottom: 4 },
  subtitle: { color: colors.textMuted, marginBottom: spacing.lg },
  card: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.md,
    marginTop: spacing.lg,
    marginBottom: spacing.lg,
    backgroundColor: colors.inputBg,
  },
  label: {
    color: colors.textMuted,
    fontSize: 12,
    textTransform: "uppercase",
    marginBottom: 6,
  },
  value: { color: colors.white, fontSize: 13, lineHeight: 20 },
  button: {
    backgroundColor: colors.primary,
    borderRadius: radius.pill,
    paddingVertical: spacing.md,
    alignItems: "center",
  },
  buttonText: { color: colors.white, fontWeight: "600" },
  disabled: { opacity: 0.5 },
  link: {
    color: colors.white,
    textAlign: "center",
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.pill,
    paddingVertical: spacing.md,
    marginBottom: spacing.sm,
    overflow: "hidden",
  },
});

import { Link } from "expo-router";
import { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { TabScreenLayout } from "@/components/layout/TabScreenLayout";
import {
  VirtualCardCarousel,
  VirtualCardItem,
} from "@/components/ui/VirtualCardCarousel";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { useWalletStore } from "@/store/walletStore";
import { colors } from "@/theme/colors";
import { radius, spacing } from "@/theme/spacing";

const WALLET_CARDS: VirtualCardItem[] = [
  {
    id: "fastpay-rwf",
    cardNumber: "2550 3456 7728 3504",
    expiry: "19/30",
    gradientColors: ["#1F5C52", "#0F3D38"],
  },
  {
    id: "fastpay-usdt",
    cardNumber: "4412 8890 1123 9087",
    expiry: "06/28",
    gradientColors: ["#163A6B", "#08182F"],
  },
  {
    id: "fastpay-savings",
    cardNumber: "9012 4567 3344 2100",
    expiry: "12/29",
    gradientColors: ["#0B4F6C", "#062E40"],
  },
];

export default function WalletScreen() {
  const [sensitiveVisible, setSensitiveVisible] = useState(false);
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

      <VirtualCardCarousel
        holderName={user.fullName}
        cards={WALLET_CARDS}
        revealed={sensitiveVisible}
        onToggleReveal={() => setSensitiveVisible((v) => !v)}
      />

      <View style={styles.card}>
        <Text style={styles.label}>Stellar wallet</Text>
        <Text style={styles.value}>
          {walletReady
            ? wallet
              ? wallet.publicKey
              : "No wallet created yet"
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
  title: {
    color: colors.white,
    fontSize: 26,
    fontWeight: "700",
    marginBottom: spacing.lg,
  },
  card: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.md,
    marginTop: spacing.sm,
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

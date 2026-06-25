import { Link } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { CardSubscriptionPanel } from "@/components/ui/CardSubscriptionPanel";
import { TabScreenLayout } from "@/components/layout/TabScreenLayout";
import { VirtualCardCarousel } from "@/components/ui/VirtualCardCarousel";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { tierToCardItem } from "@/lib/cards/tiers";
import { useCardSubscriptionStore } from "@/store/cardSubscriptionStore";
import { useWalletStore } from "@/store/walletStore";
import { colors } from "@/theme/colors";
import { radius, spacing } from "@/theme/spacing";

export default function WalletScreen() {
  const [sensitiveVisible, setSensitiveVisible] = useState(false);
  const { user, isReady, isLoading } = useRequireAuth();
  const { wallet, initialize, createWallet, isLoading: walletLoading, isReady: walletReady } =
    useWalletStore();
  const {
    initialize: initSubscriptions,
    isReady: subscriptionsReady,
    activeTierId,
    ownedTierIds,
  } = useCardSubscriptionStore();

  const ownedCards = useMemo(() => {
    const order = ["standard", "bronze", "silver", "gold"] as const;
    return order
      .filter((tierId) => ownedTierIds.includes(tierId))
      .map(tierToCardItem);
  }, [ownedTierIds]);

  useEffect(() => {
    if (user) {
      void initialize();
      void initSubscriptions();
    }
  }, [user, initialize, initSubscriptions]);

  if (!isReady || isLoading || !user || !subscriptionsReady) {
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
        cards={ownedCards}
        activeCardId={activeTierId}
        revealed={sensitiveVisible}
        onToggleReveal={() => setSensitiveVisible((v) => !v)}
      />

      <CardSubscriptionPanel />

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

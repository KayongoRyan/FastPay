import { useCallback, useEffect, useMemo, useState } from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import {
  ArrowDownLeft,
  ArrowUpRight,
} from "lucide-react-native";

import { TabScreenLayout } from "@/components/layout/TabScreenLayout";
import { QuickLinkGrid } from "@/components/quickLinks";
import { ServiceIconGrid } from "@/components/services";
import { VirtualCardCarousel } from "@/components/ui/VirtualCardCarousel";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { tierToCardItem } from "@/lib/cards/tiers";
import {
  HOME_QUICK_LINKS,
  MORE_QUICK_LINK,
} from "@/lib/quick-links/data";
import { PRIMARY_SERVICES } from "@/lib/services/data";
import { useWalletStore } from "@/store/walletStore";
import { colors } from "@/theme/colors";
import { radius, spacing } from "@/theme/spacing";

const HOME_CARDS = [
  tierToCardItem("standard"),
  tierToCardItem("bronze"),
  tierToCardItem("silver"),
];

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good Morning";
  if (hour < 17) return "Good Afternoon";
  return "Good Evening";
}

export default function HomeScreen() {
  const [sensitiveVisible, setSensitiveVisible] = useState(false);
  const { user, isReady, isLoading } = useRequireAuth();
  const {
    initialize,
    refreshWalletData,
    isRefreshing,
    transactions,
    wallet,
  } = useWalletStore();

  const displayName = useMemo(() => user?.fullName ?? "Future Pluto", [user?.fullName]);

  useEffect(() => {
    if (user) void initialize();
  }, [user, initialize]);

  const onRefresh = useCallback(() => {
    void refreshWalletData();
  }, [refreshWalletData]);

  if (!isReady || isLoading || !user) {
    return (
      <TabScreenLayout scroll={false}>
        <Text style={styles.muted}>Loading...</Text>
      </TabScreenLayout>
    );
  }

  return (
    <TabScreenLayout
      refreshing={isRefreshing}
      onRefresh={onRefresh}
    >
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>{getGreeting()},</Text>
          <Text style={styles.name}>{displayName}</Text>
        </View>
        <Image
          source={{
            uri: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&h=120&fit=crop",
          }}
          style={styles.avatar}
        />
      </View>

      <VirtualCardCarousel
        holderName={displayName}
        cards={HOME_CARDS}
        revealed={sensitiveVisible}
        onToggleReveal={() => setSensitiveVisible((v) => !v)}
      />

      <Text style={styles.sectionTitle}>Services</Text>
      <ServiceIconGrid services={PRIMARY_SERVICES} variant="row" />

      <Text style={styles.sectionTitle}>Quick Links</Text>
      <QuickLinkGrid
        links={[...HOME_QUICK_LINKS, MORE_QUICK_LINK]}
        useShortLabel
        variant="row"
      />

      <Text style={styles.sectionTitle}>Transactions</Text>
      {!wallet ? (
        <Text style={styles.muted}>Create a wallet to see payment history.</Text>
      ) : transactions.length === 0 ? (
        <Text style={styles.muted}>No transactions yet.</Text>
      ) : (
        transactions.slice(0, 5).map((tx) => (
          <View key={tx.id} style={styles.txCard}>
            <View style={styles.txIcon}>
              {tx.direction === "out" ? (
                <ArrowUpRight color={colors.error} size={18} />
              ) : (
                <ArrowDownLeft color={colors.success} size={18} />
              )}
            </View>
            <View style={styles.txInfo}>
              <Text style={styles.txTitle}>{tx.title}</Text>
              <Text style={styles.txDate}>{tx.date}</Text>
            </View>
            <Text
              style={[
                styles.txAmount,
                tx.direction === "in" ? styles.txAmountIn : styles.txAmountOut,
              ]}
            >
              {sensitiveVisible ? tx.amount : "••••"}
            </Text>
          </View>
        ))
      )}
    </TabScreenLayout>
  );
}

const styles = StyleSheet.create({
  muted: { color: colors.textMuted },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: spacing.lg,
  },
  greeting: {
    color: colors.textMuted,
    fontSize: 15,
    lineHeight: 22,
  },
  name: {
    color: colors.white,
    fontSize: 22,
    fontWeight: "700",
    lineHeight: 28,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.inputBg,
  },
  sectionTitle: {
    color: colors.white,
    fontSize: 17,
    fontWeight: "600",
    marginTop: spacing.lg,
    marginBottom: spacing.md,
  },
  txCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    backgroundColor: "rgba(255,255,255,0.04)",
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
  },
  txIcon: {
    width: 44,
    height: 44,
    borderRadius: radius.sm,
    backgroundColor: colors.inputBg,
    alignItems: "center",
    justifyContent: "center",
  },
  txInfo: {
    flex: 1,
  },
  txTitle: {
    color: colors.white,
    fontSize: 15,
    fontWeight: "500",
  },
  txDate: {
    color: colors.textMuted,
    fontSize: 12,
    marginTop: 2,
  },
  txAmount: {
    fontSize: 14,
    fontWeight: "600",
  },
  txAmountOut: {
    color: colors.error,
  },
  txAmountIn: {
    color: colors.success,
  },
});

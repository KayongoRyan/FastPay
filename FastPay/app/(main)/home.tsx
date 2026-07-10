import { Href, router } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import {
  ArrowDownLeft,
  ArrowLeftRight,
  ArrowUpRight,
  MoreHorizontal,
  Receipt,
  TicketPercent,
} from "lucide-react-native";

import { TabScreenLayout } from "@/components/layout/TabScreenLayout";
import { QuickLinkGrid } from "@/components/quickLinks";
import { VirtualCardCarousel } from "@/components/ui/VirtualCardCarousel";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { tierToCardItem } from "@/lib/cards/tiers";
import {
  HOME_QUICK_LINKS,
  MORE_QUICK_LINK,
} from "@/lib/quick-links/data";
import { useWalletStore } from "@/store/walletStore";
import { colors } from "@/theme/colors";
import { radius, spacing } from "@/theme/spacing";

const SERVICES = [
  { id: "transfer", label: "Transfer", icon: ArrowLeftRight, href: "/wallet/transfer" as Href },
  { id: "voucher", label: "Voucher", icon: TicketPercent, href: "/buy" as Href },
  { id: "bill", label: "Bill", icon: Receipt, href: "/bills" as Href },
  { id: "more", label: "More", icon: MoreHorizontal, href: "/settings" as Href },
] as const;

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
    balanceRwfEstimate,
    balanceXlmFormatted,
    transactions,
    wallet,
    error: walletError,
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

      <Text style={styles.balanceLabel}>Your Balance</Text>
      <Text style={styles.balance}>
        {sensitiveVisible
          ? wallet
            ? `${balanceRwfEstimate} RWF`
            : "Create wallet"
          : "•••••• RWF"}
      </Text>
      {sensitiveVisible && wallet ? (
        <Text style={styles.balanceSub}>{balanceXlmFormatted} XLM</Text>
      ) : null}
      {walletError ? <Text style={styles.error}>{walletError}</Text> : null}

      <VirtualCardCarousel
        holderName={displayName}
        cards={HOME_CARDS}
        revealed={sensitiveVisible}
        onToggleReveal={() => setSensitiveVisible((v) => !v)}
      />

      <Text style={styles.sectionTitle}>Services</Text>
      <View style={styles.services}>
        {SERVICES.map((service) => {
          const Icon = service.icon;
          return (
            <Pressable
              key={service.id}
              style={styles.service}
              onPress={() => router.push(service.href)}
            >
              <View style={styles.serviceIcon}>
                <Icon color={colors.white} size={22} />
              </View>
              <Text style={styles.serviceLabel}>{service.label}</Text>
            </Pressable>
          );
        })}
      </View>

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
  error: { color: colors.error, fontSize: 13, marginBottom: spacing.sm },
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
  balanceLabel: {
    color: colors.textMuted,
    fontSize: 14,
    marginBottom: 4,
  },
  balance: {
    color: colors.white,
    fontSize: 34,
    fontWeight: "700",
    marginBottom: spacing.xs,
  },
  balanceSub: {
    color: colors.textMuted,
    fontSize: 14,
    marginBottom: spacing.lg,
    marginTop: 4,
  },
  sectionTitle: {
    color: colors.white,
    fontSize: 17,
    fontWeight: "600",
    marginTop: spacing.lg,
    marginBottom: spacing.md,
  },
  services: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  service: {
    alignItems: "center",
    width: "22%",
    gap: spacing.sm,
  },
  serviceIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.inputBg,
  },
  serviceLabel: {
    color: colors.textMuted,
    fontSize: 12,
    textAlign: "center",
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

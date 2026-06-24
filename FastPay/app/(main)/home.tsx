import { Href, Link, router } from "expo-router";
import { useEffect } from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import {
  ArrowLeftRight,
  MoreHorizontal,
  Receipt,
  TicketPercent,
} from "lucide-react-native";

import { TabScreenLayout } from "@/components/layout/TabScreenLayout";
import { VirtualCard } from "@/components/ui/VirtualCard";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { useWalletStore } from "@/store/walletStore";
import { colors } from "@/theme/colors";
import { radius, spacing } from "@/theme/spacing";

const BALANCE = "200,450";

const TRANSACTIONS = [
  {
    id: "1",
    title: "Concert Tickets",
    date: "27 05 2026",
    amount: "45,000 RWF",
    image:
      "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=120&h=120&fit=crop",
  },
  {
    id: "2",
    title: "Concert Tickets",
    date: "27 05 2026",
    amount: "45,000 RWF",
    image:
      "https://images.unsplash.com/photo-1506157786151-b8491531f063?w=120&h=120&fit=crop",
  },
  {
    id: "3",
    title: "Concert Tickets",
    date: "27 05 2026",
    amount: "45,000 RWF",
    image:
      "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=120&h=120&fit=crop",
  },
];

const SERVICES = [
  { id: "transfer", label: "Transfer", icon: ArrowLeftRight, href: "/convert" as Href },
  { id: "voucher", label: "Voucher", icon: TicketPercent, href: "/buy" as Href },
  { id: "bill", label: "Bill", icon: Receipt, href: "/analytics" as Href },
  { id: "more", label: "More", icon: MoreHorizontal, href: "/settings" as Href },
] as const;

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good Morning";
  if (hour < 17) return "Good Afternoon";
  return "Good Evening";
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export default function HomeScreen() {
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
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>{getGreeting()},</Text>
          <Text style={styles.name}>{user.fullName}</Text>
        </View>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{getInitials(user.fullName)}</Text>
        </View>
      </View>

      <Text style={styles.balanceLabel}>Your Balance</Text>
      <Text style={styles.balance}>{BALANCE} RWF</Text>

      <VirtualCard holderName={user.fullName} />

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

      <Text style={styles.sectionTitle}>Transactions</Text>
      {TRANSACTIONS.map((tx) => (
        <View key={tx.id} style={styles.txCard}>
          <Image source={{ uri: tx.image }} style={styles.txThumb} />
          <View style={styles.txInfo}>
            <Text style={styles.txTitle}>{tx.title}</Text>
            <Text style={styles.txDate}>{tx.date}</Text>
          </View>
          <Text style={styles.txAmount}>{tx.amount}</Text>
        </View>
      ))}

      {!wallet && walletReady ? (
        <Pressable
          style={[styles.walletCta, walletLoading && styles.disabled]}
          disabled={walletLoading}
          onPress={() => void createWallet()}
        >
          <Text style={styles.walletCtaText}>
            {walletLoading ? "Creating wallet..." : "Create Stellar wallet"}
          </Text>
        </Pressable>
      ) : null}

      {wallet ? (
        <View style={styles.offlineRow}>
          <Link href="/offline/send" style={styles.offlineLink}>
            Offline send
          </Link>
          <Link href="/offline/receive" style={styles.offlineLink}>
            Offline receive
          </Link>
        </View>
      ) : null}
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
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    color: colors.white,
    fontWeight: "700",
    fontSize: 16,
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
    marginBottom: spacing.lg,
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
  txThumb: {
    width: 44,
    height: 44,
    borderRadius: radius.sm,
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
    color: colors.white,
    fontSize: 14,
    fontWeight: "600",
  },
  walletCta: {
    marginTop: spacing.lg,
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: radius.pill,
    paddingVertical: spacing.md,
    alignItems: "center",
  },
  walletCtaText: {
    color: colors.primary,
    fontWeight: "600",
  },
  disabled: { opacity: 0.5 },
  offlineRow: {
    flexDirection: "row",
    gap: spacing.md,
    marginTop: spacing.md,
  },
  offlineLink: {
    flex: 1,
    color: colors.white,
    textAlign: "center",
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.pill,
    paddingVertical: spacing.sm,
    overflow: "hidden",
  },
});

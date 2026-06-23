import { Href, Link, router } from "expo-router";
import { useEffect } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import {
  ArrowLeftRight,
  BarChart3,
  MoreHorizontal,
  Receipt,
  Ticket,
} from "lucide-react-native";

import { VirtualCard } from "@/components/ui/VirtualCard";
import { Screen } from "@/components/ui/Screen";
import { useAuthStore } from "@/store/authStore";
import { useWalletStore } from "@/store/walletStore";
import { colors } from "@/theme/colors";
import { radius, spacing } from "@/theme/spacing";

const TRANSACTIONS = [
  { id: "1", title: "Concert Tickets", date: "Oct 12", amount: -120 },
  { id: "2", title: "Grocery Store", date: "Oct 10", amount: -54.2 },
  { id: "3", title: "Salary Deposit", date: "Oct 1", amount: 2400 },
];

const SERVICES = [
  { id: "transfer", label: "Transfer", icon: ArrowLeftRight },
  { id: "voucher", label: "Voucher", icon: Ticket },
  { id: "bill", label: "Bill", icon: Receipt },
  { id: "more", label: "More", icon: MoreHorizontal },
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
  const {
    user,
    isReady,
    isLoading: authLoading,
    isLocked,
    logout,
    enableBiometric,
    disableBiometric,
    biometricLabel,
  } = useAuthStore();

  const {
    wallet,
    isReady: walletReady,
    isLoading: walletLoading,
    initialize,
    createWallet,
  } = useWalletStore();

  useEffect(() => {
    if (!isReady) return;
    if (isLocked) {
      router.replace("/biometric-unlock" as Href);
      return;
    }
    if (!user) {
      router.replace("/(auth)/login" as Href);
    }
  }, [isReady, isLocked, user]);

  useEffect(() => {
    if (user && !isLocked) {
      void initialize();
    }
  }, [user, isLocked, initialize]);

  if (!isReady || authLoading || !user) {
    return (
      <Screen centered>
        <Text style={styles.muted}>Loading...</Text>
      </Screen>
    );
  }

  const displayName = user.fullName || "User";
  const balance = wallet ? "7,904.48" : "0.00";

  return (
    <Screen style={styles.screen}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>
              {getGreeting()},{"\n"}
              <Text style={styles.name}>{displayName}</Text>
            </Text>
          </View>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{getInitials(displayName)}</Text>
          </View>
        </View>

        <Text style={styles.balanceLabel}>Your Balance</Text>
        <Text style={styles.balance}>${balance}</Text>

        <VirtualCard holderName={displayName} />

        <Text style={styles.sectionTitle}>Services</Text>
        <View style={styles.services}>
          {SERVICES.map((service) => {
            const Icon = service.icon;
            const onPress =
              service.id === "more"
                ? () =>
                    user.biometricEnabled
                      ? void disableBiometric()
                      : void enableBiometric()
                : service.id === "bill"
                  ? () => router.push("/(main)/analytics" as Href)
                  : undefined;

            return (
              <Pressable key={service.id} style={styles.service} onPress={onPress}>
                <View style={styles.serviceIcon}>
                  <Icon color={colors.white} size={22} />
                </View>
                <Text style={styles.serviceLabel}>{service.label}</Text>
              </Pressable>
            );
          })}
        </View>

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

        <View style={styles.transactionsHeader}>
          <Text style={styles.sectionTitle}>Transactions</Text>
          <Pressable onPress={() => router.push("/(main)/analytics" as Href)}>
            <BarChart3 color={colors.primary} size={20} />
          </Pressable>
        </View>

        {TRANSACTIONS.map((tx) => (
          <View key={tx.id} style={styles.txRow}>
            <View style={styles.txIcon}>
              <Receipt color={colors.white} size={18} />
            </View>
            <View style={styles.txInfo}>
              <Text style={styles.txTitle}>{tx.title}</Text>
              <Text style={styles.txDate}>{tx.date}</Text>
            </View>
            <Text
              style={[
                styles.txAmount,
                tx.amount < 0 ? styles.txNegative : styles.txPositive,
              ]}
            >
              {tx.amount < 0 ? "-" : "+"}${Math.abs(tx.amount).toFixed(2)}
            </Text>
          </View>
        ))}

        <Pressable
          style={styles.signOut}
          onPress={() => void logout().then(() => router.replace("/(auth)/login" as Href))}
        >
          <Text style={styles.signOutText}>Sign out</Text>
        </Pressable>

        {!user.biometricEnabled ? (
          <Text style={styles.hint}>
            Tap More to enable {biometricLabel}
          </Text>
        ) : null}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: {
    paddingTop: spacing.sm,
  },
  muted: {
    color: colors.textMuted,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: spacing.lg,
  },
  greeting: {
    color: colors.textMuted,
    fontSize: 16,
    lineHeight: 24,
  },
  name: {
    color: colors.white,
    fontSize: 22,
    fontWeight: "700",
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
    fontSize: 36,
    fontWeight: "700",
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    color: colors.white,
    fontSize: 18,
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
    gap: spacing.sm,
    width: "22%",
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
  disabled: {
    opacity: 0.5,
  },
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
  transactionsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  txRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.06)",
    gap: spacing.md,
  },
  txIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
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
    fontSize: 15,
    fontWeight: "600",
  },
  txNegative: {
    color: colors.white,
  },
  txPositive: {
    color: colors.success,
  },
  signOut: {
    marginTop: spacing.xl,
    alignItems: "center",
    paddingVertical: spacing.md,
  },
  signOutText: {
    color: colors.textMuted,
    fontSize: 14,
  },
  hint: {
    color: colors.textSubtle,
    fontSize: 12,
    textAlign: "center",
    marginBottom: spacing.xl,
  },
});

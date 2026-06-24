import { Href, Link, router } from "expo-router";
import { useEffect } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import {
  ArrowDownLeft,
  ArrowUpRight,
  ChevronDown,
  CreditCard,
  Plus,
} from "lucide-react-native";

import { TabScreenLayout } from "@/components/layout/TabScreenLayout";
import { TokenListRow } from "@/components/ui/TokenListRow";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { useWalletStore } from "@/store/walletStore";
import { colors } from "@/theme/colors";
import { radius, spacing } from "@/theme/spacing";

const TRENDING = [
  { id: "1", title: "Shopping", date: "27 05 2026", amount: "50,450 RWF" },
  { id: "2", title: "Shopping", date: "27 05 2026", amount: "50,450 RWF" },
  { id: "3", title: "Shopping", date: "27 05 2026", amount: "50,450 RWF" },
];

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
  const { wallet, initialize, createWallet, isLoading: walletLoading } = useWalletStore();

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

  const handle = `@${user.fullName.toLowerCase().replace(/\s+/g, "")}`;
  const balance = wallet ? "150,776" : "0";

  return (
    <TabScreenLayout>
      <View style={styles.profileRow}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{getInitials(user.fullName)}</Text>
        </View>
        <View>
          <Text style={styles.handle}>{handle}</Text>
          <Text style={styles.displayName}>{user.fullName}</Text>
        </View>
      </View>

      <View style={styles.balanceRow}>
        <Text style={styles.balance}>{balance} RWF</Text>
        <View style={styles.changePill}>
          <Text style={styles.changeText}>+1.22 · 2.4%</Text>
        </View>
      </View>

      <View style={styles.actions}>
        <QuickAction icon={Plus} label="Add Fund" onPress={() => router.push("/buy" as Href)} />
        <QuickAction
          icon={ArrowUpRight}
          label="Transfer"
          onPress={() => router.push("/convert" as Href)}
        />
        <QuickAction
          icon={ArrowDownLeft}
          label="Receive"
          onPress={() => router.push("/wallet" as Href)}
        />
        <QuickAction
          icon={CreditCard}
          label="Purchase"
          onPress={() => router.push("/buy" as Href)}
        />
      </View>

      <TextInput
        placeholder="Search Tokens"
        placeholderTextColor={colors.textSubtle}
        style={styles.search}
      />

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Trending Tokens</Text>
        <Pressable style={styles.filterBtn}>
          <Text style={styles.filterText}>Today</Text>
          <ChevronDown color={colors.white} size={16} />
        </Pressable>
      </View>

      {TRENDING.map((item) => (
        <TokenListRow
          key={item.id}
          title={item.title}
          date={item.date}
          amount={item.amount}
        />
      ))}

      {!wallet ? (
        <Pressable
          style={[styles.walletCta, walletLoading && styles.disabled]}
          disabled={walletLoading}
          onPress={() => void createWallet()}
        >
          <Text style={styles.walletCtaText}>
            {walletLoading ? "Creating wallet..." : "Create Stellar wallet"}
          </Text>
        </Pressable>
      ) : (
        <View style={styles.offlineRow}>
          <Link href="/offline/send" style={styles.offlineLink}>
            Offline send
          </Link>
          <Link href="/offline/receive" style={styles.offlineLink}>
            Offline receive
          </Link>
        </View>
      )}
    </TabScreenLayout>
  );
}

function QuickAction({
  icon: Icon,
  label,
  onPress,
}: {
  icon: typeof Plus;
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable style={styles.quickAction} onPress={onPress}>
      <View style={styles.quickIcon}>
        <Icon color={colors.white} size={20} />
      </View>
      <Text style={styles.quickLabel}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  muted: { color: colors.textMuted },
  profileRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { color: colors.white, fontWeight: "700", fontSize: 18 },
  handle: { color: colors.textMuted, fontSize: 13 },
  displayName: { color: colors.white, fontSize: 18, fontWeight: "700" },
  balanceRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  balance: { color: colors.white, fontSize: 32, fontWeight: "700" },
  changePill: {
    backgroundColor: "rgba(0,174,239,0.2)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.pill,
  },
  changeText: { color: colors.primary, fontSize: 12, fontWeight: "600" },
  actions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: spacing.lg,
  },
  quickAction: { alignItems: "center", width: "23%" },
  quickIcon: {
    width: 52,
    height: 52,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.inputBg,
    marginBottom: spacing.sm,
  },
  quickLabel: { color: colors.textMuted, fontSize: 11, textAlign: "center" },
  search: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
    color: colors.white,
    backgroundColor: colors.inputBg,
    marginBottom: spacing.lg,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  sectionTitle: { color: colors.white, fontSize: 17, fontWeight: "600" },
  filterBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.pill,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  filterText: { color: colors.white, fontSize: 13 },
  walletCta: {
    marginTop: spacing.lg,
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: radius.pill,
    paddingVertical: spacing.md,
    alignItems: "center",
  },
  walletCtaText: { color: colors.primary, fontWeight: "600" },
  disabled: { opacity: 0.5 },
  offlineRow: { flexDirection: "row", gap: spacing.md, marginTop: spacing.md },
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

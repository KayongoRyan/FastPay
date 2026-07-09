import { useCallback, useEffect, useMemo, useState } from "react";
import { StyleSheet, Text, View, Pressable } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { ShoppingBag, Car, MoreHorizontal } from "lucide-react-native";

import { TabScreenLayout } from "@/components/layout/TabScreenLayout";
import { ExpenseChart } from "@/components/ui/ExpenseChart";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { aggregateAnalytics } from "@/lib/analytics/from-payments";
import { useWalletStore } from "@/store/walletStore";
import { colors } from "@/theme/colors";
import { radius, spacing } from "@/theme/spacing";

const CATEGORY_ICONS = [ShoppingBag, Car, MoreHorizontal];

export default function AnalyticsScreen() {
  useRequireAuth();
  const {
    wallet,
    initialize,
    refreshWalletData,
    payments,
    isRefreshing,
    error: walletError,
  } = useWalletStore();
  const [tab, setTab] = useState<"expenses" | "income">("expenses");

  useEffect(() => {
    void initialize();
  }, [initialize]);

  useFocusEffect(
    useCallback(() => {
      if (wallet?.publicKey) {
        void refreshWalletData();
      }
    }, [wallet?.publicKey, refreshWalletData]),
  );

  const analytics = useMemo(
    () => aggregateAnalytics(payments),
    [payments],
  );
  const categoryRows = useMemo(() => analytics.categoryRows, [analytics]);
  const loading = isRefreshing && payments.length === 0;

  return (
    <TabScreenLayout
      refreshing={isRefreshing}
      onRefresh={() => void refreshWalletData()}
    >
      <Text style={styles.header}>STATISTICS</Text>

      <View style={styles.toggle}>
        <Pressable
          style={[styles.tabBtn, tab === "expenses" && styles.tabActive]}
          onPress={() => setTab("expenses")}
        >
          <Text style={[styles.tabText, tab === "expenses" && styles.tabTextActive]}>
            Expenses
          </Text>
        </Pressable>
        <Pressable
          style={[styles.tabBtn, tab === "income" && styles.tabActive]}
          onPress={() => setTab("income")}
        >
          <Text style={[styles.tabText, tab === "income" && styles.tabTextActive]}>
            Income
          </Text>
        </Pressable>
      </View>

      <Text style={styles.totalLabel}>
        Total {tab === "expenses" ? "Expenses" : "Income"}
      </Text>
      <Text style={styles.total}>
        {loading
          ? "..."
          : `${Math.round(
              tab === "expenses"
                ? analytics.expenseTotal
                : analytics.incomeTotal,
            ).toLocaleString()} RWF`}
      </Text>

      {walletError ? <Text style={styles.error}>{walletError}</Text> : null}

      <ExpenseChart data={analytics.dailyTotals} />

      <View style={styles.weekLabels}>
        {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
          <Text key={day} style={styles.day}>
            {day}
          </Text>
        ))}
      </View>

      <Text style={styles.section}>Recent activity</Text>

      {!wallet ? (
        <Text style={styles.empty}>Create a wallet to see analytics.</Text>
      ) : categoryRows.length === 0 ? (
        <Text style={styles.empty}>No payment activity yet.</Text>
      ) : (
        categoryRows.map((item, index) => {
          const Icon = CATEGORY_ICONS[index % CATEGORY_ICONS.length];
          return (
            <View key={item.id} style={styles.categoryRow}>
              <View style={styles.categoryIcon}>
                <Icon color={colors.white} size={18} />
              </View>
              <View style={styles.categoryInfo}>
                <Text style={styles.categoryTitle}>{item.title}</Text>
                <Text style={styles.categoryDate}>{item.date}</Text>
              </View>
              <Text style={styles.categoryAmount}>{item.amount}</Text>
            </View>
          );
        })
      )}
    </TabScreenLayout>
  );
}

const styles = StyleSheet.create({
  header: {
    color: colors.white,
    fontSize: 14,
    fontWeight: "700",
    letterSpacing: 2,
    textAlign: "center",
    marginBottom: spacing.lg,
  },
  toggle: {
    flexDirection: "row",
    backgroundColor: colors.pillTrack,
    borderRadius: radius.pill,
    padding: 4,
    marginBottom: spacing.xl,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: radius.pill,
    alignItems: "center",
  },
  tabActive: { backgroundColor: colors.primary },
  tabText: { color: colors.textMuted, fontSize: 14, fontWeight: "600" },
  tabTextActive: { color: colors.white },
  totalLabel: { color: colors.textMuted, fontSize: 14, marginBottom: 4 },
  total: { color: colors.white, fontSize: 32, fontWeight: "700", marginBottom: spacing.md },
  error: { color: colors.error, fontSize: 13, marginBottom: spacing.md },
  weekLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: spacing.xl,
    paddingHorizontal: 4,
  },
  day: { color: colors.textSubtle, fontSize: 11 },
  section: {
    color: colors.white,
    fontSize: 16,
    fontWeight: "600",
    marginBottom: spacing.md,
  },
  empty: {
    color: colors.textMuted,
    fontSize: 14,
    marginBottom: spacing.lg,
  },
  categoryRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.06)",
  },
  categoryIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.inputBg,
    alignItems: "center",
    justifyContent: "center",
  },
  categoryInfo: { flex: 1 },
  categoryTitle: { color: colors.white, fontSize: 15, fontWeight: "500" },
  categoryDate: { color: colors.textMuted, fontSize: 12, marginTop: 2 },
  categoryAmount: { color: colors.white, fontSize: 14, fontWeight: "600" },
});

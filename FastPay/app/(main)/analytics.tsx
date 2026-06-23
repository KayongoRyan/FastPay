import React, { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { ShoppingBag, Car } from "lucide-react-native";

import { BackHeader } from "@/components/ui/BackHeader";
import { ExpenseChart } from "@/components/ui/ExpenseChart";
import { Screen } from "@/components/ui/Screen";
import { colors } from "@/theme/colors";
import { radius, spacing } from "@/theme/spacing";

const CATEGORIES = [
  { id: "1", title: "Shopping", date: "Oct 12", amount: 420, icon: ShoppingBag },
  { id: "2", title: "Transport", date: "Oct 8", amount: 86.5, icon: Car },
];

export default function AnalyticsScreen() {
  const [tab, setTab] = useState<"expenses" | "income">("expenses");

  return (
    <Screen scroll>
      <BackHeader title="STATISTICS" />

      <View style={styles.toggle}>
        <Pressable
          style={[styles.tab, tab === "expenses" && styles.tabActive]}
          onPress={() => setTab("expenses")}
        >
          <Text style={[styles.tabText, tab === "expenses" && styles.tabTextActive]}>
            Expenses
          </Text>
        </Pressable>
        <Pressable
          style={[styles.tab, tab === "income" && styles.tabActive]}
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
        ${tab === "expenses" ? "2,334.20" : "4,120.00"}
      </Text>

      <ExpenseChart />

      <View style={styles.weekLabels}>
        {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
          <Text key={day} style={styles.day}>
            {day}
          </Text>
        ))}
      </View>

      <Text style={styles.section}>Expenses by category</Text>

      {CATEGORIES.map((item) => {
        const Icon = item.icon;
        return (
          <View key={item.id} style={styles.categoryRow}>
            <View style={styles.categoryIcon}>
              <Icon color={colors.white} size={18} />
            </View>
            <View style={styles.categoryInfo}>
              <Text style={styles.categoryTitle}>{item.title}</Text>
              <Text style={styles.categoryDate}>{item.date}</Text>
            </View>
            <Text style={styles.categoryAmount}>${item.amount.toFixed(2)}</Text>
          </View>
        );
      })}
    </Screen>
  );
}

const styles = StyleSheet.create({
  toggle: {
    flexDirection: "row",
    backgroundColor: colors.pillTrack,
    borderRadius: radius.pill,
    padding: 4,
    marginBottom: spacing.xl,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: radius.pill,
    alignItems: "center",
  },
  tabActive: {
    backgroundColor: colors.primary,
  },
  tabText: {
    color: colors.textMuted,
    fontSize: 14,
    fontWeight: "600",
  },
  tabTextActive: {
    color: colors.white,
  },
  totalLabel: {
    color: colors.textMuted,
    fontSize: 14,
    marginBottom: 4,
  },
  total: {
    color: colors.white,
    fontSize: 32,
    fontWeight: "700",
    marginBottom: spacing.md,
  },
  weekLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: spacing.xl,
    paddingHorizontal: 4,
  },
  day: {
    color: colors.textSubtle,
    fontSize: 11,
  },
  section: {
    color: colors.white,
    fontSize: 16,
    fontWeight: "600",
    marginBottom: spacing.md,
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
  categoryInfo: {
    flex: 1,
  },
  categoryTitle: {
    color: colors.white,
    fontSize: 15,
    fontWeight: "500",
  },
  categoryDate: {
    color: colors.textMuted,
    fontSize: 12,
    marginTop: 2,
  },
  categoryAmount: {
    color: colors.white,
    fontSize: 15,
    fontWeight: "600",
  },
});

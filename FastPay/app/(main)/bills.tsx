import { router } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Plus, Receipt } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { AddBillModal } from "@/components/bills/AddBillModal";
import { BillCategorySummary } from "@/components/bills/BillCategorySummary";
import { BillPaymentRow } from "@/components/bills/BillPaymentRow";
import { TabScreenLayout } from "@/components/layout/TabScreenLayout";
import { BackHeader } from "@/components/ui/BackHeader";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { useHideTabBar } from "@/hooks/useHideTabBar";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { BILL_CATEGORIES } from "@/lib/bills/categories";
import { getCategoryTotals, groupPaymentsByMonth } from "@/lib/bills/data";
import { formatBillAmount, monthKey, shortMonthLabel } from "@/lib/bills/format";
import type { BillCategoryId } from "@/lib/bills/types";
import { useBillsStore } from "@/store/billsStore";
import { colors } from "@/theme/colors";
import { radius, spacing } from "@/theme/spacing";

export default function BillsScreen() {
  useHideTabBar();
  useRequireAuth();
  const insets = useSafeAreaInsets();
  const payments = useBillsStore((s) => s.payments);
  const { initialize, isReady, removePayment } = useBillsStore();
  const [selectedMonthKey, setSelectedMonthKey] = useState("");
  const [addModalOpen, setAddModalOpen] = useState(false);

  useEffect(() => {
    void initialize();
  }, [initialize]);

  const billMonths = useMemo(() => groupPaymentsByMonth(payments), [payments]);

  useEffect(() => {
    if (billMonths.length === 0) {
      setSelectedMonthKey("");
      return;
    }

    const stillExists = billMonths.some((month) => month.key === selectedMonthKey);
    if (!stillExists) {
      setSelectedMonthKey(billMonths[0].key);
    }
  }, [billMonths, selectedMonthKey]);

  const selectedMonth = useMemo(
    () => billMonths.find((month) => month.key === selectedMonthKey) ?? billMonths[0],
    [billMonths, selectedMonthKey],
  );

  const categoryTotals = useMemo(
    () => getCategoryTotals(selectedMonth?.payments ?? []),
    [selectedMonth],
  );

  const activeCategories = (Object.keys(BILL_CATEGORIES) as BillCategoryId[]).filter(
    (id) => (categoryTotals[id] ?? 0) > 0,
  );

  const handleBillAdded = (paidAt: string) => {
    const [yearStr, monthStr] = paidAt.split("-");
    setSelectedMonthKey(monthKey(Number(yearStr), Number(monthStr)));
  };

  const handleRemove = async (id: string) => {
    await removePayment(id);
  };

  if (!isReady) {
    return (
      <TabScreenLayout bottomInset={insets.bottom + spacing.lg}>
        <BackHeader title="Bills" onBack={() => router.back()} />
        <Text style={styles.muted}>Loading bills...</Text>
      </TabScreenLayout>
    );
  }

  if (!selectedMonth) {
    return (
      <TabScreenLayout bottomInset={insets.bottom + spacing.lg}>
        <BackHeader title="Bills" onBack={() => router.back()} />
        <View style={styles.emptyWrap}>
          <View style={styles.heroIcon}>
            <Receipt color={colors.primary} size={22} />
          </View>
          <Text style={styles.emptyTitle}>No bills yet</Text>
          <Text style={styles.emptyText}>
            Add rent, utilities, groceries, and other monthly payments to track
            them here.
          </Text>
          <PrimaryButton
            label="Add bill"
            onPress={() => setAddModalOpen(true)}
            style={styles.emptyBtn}
          />
        </View>
        <AddBillModal
          visible={addModalOpen}
          onClose={() => setAddModalOpen(false)}
          onAdded={handleBillAdded}
        />
      </TabScreenLayout>
    );
  }

  return (
    <TabScreenLayout bottomInset={insets.bottom + spacing.lg}>
      <BackHeader title="Bills" onBack={() => router.back()} />

      <View style={styles.hero}>
        <View style={styles.heroIcon}>
          <Receipt color={colors.primary} size={22} />
        </View>
        <Text style={styles.pageTag}>BILLS</Text>
        <Text style={styles.subtitle}>
          Monthly rent, utilities, and recurring payments.
        </Text>
      </View>

      <View style={styles.actionsRow}>
        <Text style={styles.sectionLabel}>Select month</Text>
        <Pressable style={styles.addChip} onPress={() => setAddModalOpen(true)}>
          <Plus color={colors.white} size={16} />
          <Text style={styles.addChipText}>Add bill</Text>
        </Pressable>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.monthRow}
      >
        {billMonths.map((month) => {
          const active = month.key === selectedMonth.key;
          return (
            <Pressable
              key={month.key}
              style={[styles.monthChip, active && styles.monthChipActive]}
              onPress={() => setSelectedMonthKey(month.key)}
            >
              <Text style={[styles.monthChipText, active && styles.monthChipTextActive]}>
                {shortMonthLabel(month.year, month.month)}
              </Text>
              <Text
                style={[styles.monthChipCount, active && styles.monthChipCountActive]}
              >
                {month.payments.length} paid
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      <LinearGradient
        colors={["rgba(0,174,239,0.22)", "rgba(8,24,47,0.95)"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.totalCard}
      >
        <Text style={styles.totalLabel}>Total paid</Text>
        <Text style={styles.totalAmount}>
          {formatBillAmount(selectedMonth.totalRwf)}
        </Text>
        <Text style={styles.totalMeta}>{selectedMonth.label}</Text>
      </LinearGradient>

      {activeCategories.length > 0 ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>By category</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoryRow}
          >
            {activeCategories.map((categoryId) => (
              <BillCategorySummary
                key={categoryId}
                categoryId={categoryId}
                totalRwf={categoryTotals[categoryId] ?? 0}
              />
            ))}
          </ScrollView>
        </View>
      ) : null}

      <View style={styles.section}>
        <View style={styles.historyHeader}>
          <Text style={styles.sectionTitle}>Payment history</Text>
          <Text style={styles.historyCount}>
            {selectedMonth.payments.length} items
          </Text>
        </View>

        <View style={styles.historyCard}>
          {selectedMonth.payments.length === 0 ? (
            <Text style={styles.historyEmpty}>No payments this month.</Text>
          ) : (
            selectedMonth.payments.map((payment, index) => (
              <BillPaymentRow
                key={payment.id}
                payment={payment}
                isLast={index === selectedMonth.payments.length - 1}
                onRemove={(id) => void handleRemove(id)}
              />
            ))
          )}
        </View>
      </View>

      <AddBillModal
        visible={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        onAdded={handleBillAdded}
      />
    </TabScreenLayout>
  );
}

const styles = StyleSheet.create({
  muted: {
    color: colors.textMuted,
    textAlign: "center",
    marginTop: spacing.xl,
  },
  hero: {
    alignItems: "center",
    marginBottom: spacing.lg,
  },
  heroIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(0,174,239,0.12)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.sm,
  },
  pageTag: {
    color: colors.white,
    fontSize: 14,
    fontWeight: "700",
    letterSpacing: 2,
    marginBottom: spacing.xs,
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: 14,
    lineHeight: 20,
    textAlign: "center",
  },
  actionsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.sm,
  },
  sectionLabel: {
    color: colors.textSubtle,
    fontSize: 12,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  addChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    borderRadius: radius.pill,
    backgroundColor: colors.primary,
  },
  addChipText: {
    color: colors.white,
    fontSize: 13,
    fontWeight: "600",
  },
  monthRow: {
    gap: spacing.sm,
    paddingBottom: spacing.lg,
  },
  monthChip: {
    minWidth: 96,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    backgroundColor: colors.inputBg,
    gap: 2,
  },
  monthChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  monthChipText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: "700",
  },
  monthChipTextActive: {
    color: colors.white,
  },
  monthChipCount: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: "500",
  },
  monthChipCountActive: {
    color: "rgba(255,255,255,0.85)",
  },
  totalCard: {
    borderWidth: 1,
    borderColor: "rgba(0,174,239,0.35)",
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.xl,
  },
  totalLabel: {
    color: colors.textMuted,
    fontSize: 13,
    marginBottom: spacing.xs,
  },
  totalAmount: {
    color: colors.white,
    fontSize: 32,
    fontWeight: "700",
    marginBottom: spacing.xs,
  },
  totalMeta: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: "600",
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    color: colors.white,
    fontSize: 16,
    fontWeight: "600",
  },
  categoryRow: {
    gap: spacing.sm,
    paddingTop: spacing.md,
  },
  historyHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.md,
  },
  historyCount: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: "500",
  },
  historyCard: {
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    borderRadius: radius.lg,
    backgroundColor: colors.inputBg,
    overflow: "hidden",
  },
  historyEmpty: {
    color: colors.textMuted,
    fontSize: 14,
    textAlign: "center",
    padding: spacing.lg,
  },
  emptyWrap: {
    alignItems: "center",
    paddingTop: spacing.xl,
    paddingHorizontal: spacing.md,
  },
  emptyTitle: {
    color: colors.white,
    fontSize: 20,
    fontWeight: "700",
    marginBottom: spacing.sm,
  },
  emptyText: {
    color: colors.textMuted,
    fontSize: 14,
    lineHeight: 21,
    textAlign: "center",
    marginBottom: spacing.lg,
  },
  emptyBtn: {
    alignSelf: "stretch",
    width: "100%",
  },
});

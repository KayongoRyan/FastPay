import { StyleSheet, Text, View } from "react-native";

import { getBillCategory } from "@/lib/bills/categories";
import { formatBillAmount } from "@/lib/bills/format";
import type { BillCategoryId } from "@/lib/bills/types";
import { colors } from "@/theme/colors";
import { radius, spacing } from "@/theme/spacing";

interface BillCategorySummaryProps {
  categoryId: BillCategoryId;
  totalRwf: number;
}

export function BillCategorySummary({
  categoryId,
  totalRwf,
}: BillCategorySummaryProps) {
  const category = getBillCategory(categoryId);
  const Icon = category.icon;

  return (
    <View style={styles.card}>
      <View style={[styles.iconWrap, { backgroundColor: category.tint }]}>
        <Icon color={colors.white} size={18} />
      </View>
      <Text style={styles.label}>{category.label}</Text>
      <Text style={styles.amount} numberOfLines={1}>
        {formatBillAmount(totalRwf)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    minWidth: 118,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    borderRadius: radius.lg,
    backgroundColor: "rgba(255,255,255,0.04)",
    padding: spacing.md,
    gap: spacing.sm,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  label: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  amount: {
    color: colors.white,
    fontSize: 15,
    fontWeight: "700",
  },
});

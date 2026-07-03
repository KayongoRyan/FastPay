import { Alert, Pressable, StyleSheet, Text, View } from "react-native";
import { Trash2 } from "lucide-react-native";

import { getBillCategory } from "@/lib/bills/categories";
import { formatBillAmount, formatBillDate } from "@/lib/bills/format";
import type { BillPayment } from "@/lib/bills/types";
import { colors } from "@/theme/colors";
import { radius, spacing } from "@/theme/spacing";

interface BillPaymentRowProps {
  payment: BillPayment;
  isLast?: boolean;
  onRemove?: (id: string) => void;
}

export function BillPaymentRow({
  payment,
  isLast = false,
  onRemove,
}: BillPaymentRowProps) {
  const category = getBillCategory(payment.categoryId);
  const Icon = category.icon;

  const confirmRemove = () => {
    Alert.alert(
      "Remove bill",
      `Remove "${payment.label}" from your history?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: () => onRemove?.(payment.id),
        },
      ],
    );
  };

  return (
    <View style={[styles.row, !isLast && styles.rowDivider]}>
      <View style={[styles.iconWrap, { backgroundColor: category.tint }]}>
        <Icon color={colors.white} size={18} />
      </View>
      <View style={styles.info}>
        <Text style={styles.title}>{payment.label}</Text>
        <View style={styles.metaRow}>
          <View style={[styles.categoryPill, { backgroundColor: category.tint }]}>
            <Text style={styles.categoryPillText}>{category.label}</Text>
          </View>
          <Text style={styles.date}>{formatBillDate(payment.paidAt)}</Text>
        </View>
      </View>
      <View style={styles.trailing}>
        <Text style={styles.amount}>{formatBillAmount(payment.amountRwf)}</Text>
        {onRemove ? (
          <Pressable
            style={styles.removeBtn}
            onPress={confirmRemove}
            hitSlop={8}
          >
            <Trash2 color={colors.error} size={16} />
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
  },
  rowDivider: {
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.06)",
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  info: {
    flex: 1,
    gap: 6,
  },
  title: {
    color: colors.white,
    fontSize: 15,
    fontWeight: "600",
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  categoryPill: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radius.pill,
  },
  categoryPillText: {
    color: colors.white,
    fontSize: 11,
    fontWeight: "600",
  },
  date: {
    color: colors.textMuted,
    fontSize: 12,
  },
  trailing: {
    alignItems: "flex-end",
    gap: spacing.sm,
  },
  amount: {
    color: colors.white,
    fontSize: 14,
    fontWeight: "700",
    maxWidth: 110,
    textAlign: "right",
  },
  removeBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(248,113,113,0.12)",
  },
});

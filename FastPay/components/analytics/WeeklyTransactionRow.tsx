import { StyleSheet, Text, View } from "react-native";
import {
  Receipt,
  Smartphone,
  Wallet,
} from "lucide-react-native";

import type { WeeklyTransaction } from "@/lib/analytics/weekly";
import { formatTxDate } from "@/lib/stellar/format";
import { colors } from "@/theme/colors";
import { radius, spacing } from "@/theme/spacing";

const SOURCE_META = {
  wallet: { label: "Wallet", icon: Wallet },
  bill: { label: "Bill", icon: Receipt },
  momo: { label: "MoMo", icon: Smartphone },
} as const;

interface WeeklyTransactionRowProps {
  transaction: WeeklyTransaction;
  isLast?: boolean;
}

export function WeeklyTransactionRow({
  transaction,
  isLast = false,
}: WeeklyTransactionRowProps) {
  const meta = SOURCE_META[transaction.source];
  const Icon = meta.icon;

  return (
    <View style={[styles.row, !isLast && styles.rowDivider]}>
      <View style={styles.iconWrap}>
        <Icon color={colors.white} size={18} />
      </View>
      <View style={styles.info}>
        <Text style={styles.title}>{transaction.title}</Text>
        <View style={styles.metaRow}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{meta.label}</Text>
          </View>
          <Text style={styles.date}>{formatTxDate(transaction.occurredAt)}</Text>
        </View>
        {transaction.subtitle ? (
          <Text style={styles.subtitle}>{transaction.subtitle}</Text>
        ) : null}
      </View>
      <Text
        style={[
          styles.amount,
          transaction.direction === "income"
            ? styles.amountIncome
            : styles.amountExpense,
        ]}
      >
        {transaction.direction === "income" ? "+" : "-"}
        {Math.round(transaction.amountRwf).toLocaleString()} RWF
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    paddingVertical: spacing.md,
  },
  rowDivider: {
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.06)",
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.inputBg,
    alignItems: "center",
    justifyContent: "center",
  },
  info: {
    flex: 1,
  },
  title: {
    color: colors.white,
    fontSize: 15,
    fontWeight: "500",
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginTop: 4,
  },
  badge: {
    backgroundColor: "rgba(0,174,239,0.15)",
    borderRadius: radius.sm,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  badgeText: {
    color: colors.primary,
    fontSize: 10,
    fontWeight: "700",
  },
  date: {
    color: colors.textMuted,
    fontSize: 12,
  },
  subtitle: {
    color: colors.textSubtle,
    fontSize: 12,
    marginTop: 2,
  },
  amount: {
    fontSize: 14,
    fontWeight: "600",
  },
  amountIncome: {
    color: colors.success,
  },
  amountExpense: {
    color: colors.error,
  },
});

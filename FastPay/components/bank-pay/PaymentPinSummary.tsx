import { LinearGradient } from "expo-linear-gradient";
import { StyleSheet, Text, View } from "react-native";
import { Building2, UserRound } from "lucide-react-native";

import type { BankPayDraft } from "@/store/bankPayStore";
import { colors } from "@/theme/colors";
import { radius, spacing } from "@/theme/spacing";

interface PaymentPinSummaryProps {
  draft: BankPayDraft;
}

export function PaymentPinSummary({ draft }: PaymentPinSummaryProps) {
  const amountLabel = `${Number(draft.amount).toLocaleString()} RWF`;

  return (
    <View style={styles.card}>
      <LinearGradient
        colors={["#163A6B", "#0B1F3F"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.cardHeader}
      >
        <Text style={styles.cardTag}>TRANSFER SUMMARY</Text>
        <Text style={styles.amount}>{amountLabel}</Text>
      </LinearGradient>

      <View style={styles.cardBody}>
        <View style={styles.row}>
          <View style={styles.iconWrap}>
            <Building2 color={colors.primary} size={18} />
          </View>
          <View style={styles.rowContent}>
            <Text style={styles.rowLabel}>Merchant</Text>
            <Text style={styles.rowValue}>{draft.merchantName}</Text>
            <Text style={styles.rowMeta}>{draft.merchantCode}</Text>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.row}>
          <View style={styles.iconWrap}>
            <UserRound color={colors.primary} size={18} />
          </View>
          <View style={styles.rowContent}>
            <Text style={styles.rowLabel}>Beneficiary</Text>
            <Text style={styles.rowValue}>{draft.beneficiaryName}</Text>
            <Text style={styles.rowMeta}>{draft.beneficiaryCategory}</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.lg,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.lg,
  },
  cardHeader: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
  },
  cardTag: {
    color: "rgba(255,255,255,0.72)",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1.4,
    marginBottom: spacing.sm,
  },
  amount: {
    color: colors.white,
    fontSize: 30,
    fontWeight: "700",
  },
  cardBody: {
    padding: spacing.lg,
    backgroundColor: "rgba(255,255,255,0.03)",
  },
  row: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.md,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0,174,239,0.12)",
  },
  rowContent: {
    flex: 1,
  },
  rowLabel: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 2,
  },
  rowValue: {
    color: colors.white,
    fontSize: 15,
    fontWeight: "600",
  },
  rowMeta: {
    color: colors.textSubtle,
    fontSize: 12,
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.md,
  },
});

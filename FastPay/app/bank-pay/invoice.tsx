import { Href, router } from "expo-router";
import { useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";

import { TabScreenLayout } from "@/components/layout/TabScreenLayout";
import { BackHeader } from "@/components/ui/BackHeader";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { useBankPayStore } from "@/store/bankPayStore";
import { colors } from "@/theme/colors";
import { radius, spacing } from "@/theme/spacing";

function InvoiceRow({
  label,
  value,
  subValue,
  highlight,
}: {
  label: string;
  value: string;
  subValue?: string;
  highlight?: boolean;
}) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={[styles.rowValue, highlight && styles.rowValueHighlight]}>
        {value}
      </Text>
      {subValue ? <Text style={styles.rowSubValue}>{subValue}</Text> : null}
    </View>
  );
}

export default function BankPayInvoiceScreen() {
  useRequireAuth();
  const draft = useBankPayStore((state) => state.draft);

  useEffect(() => {
    if (!draft) {
      router.replace("/bank-pay" as Href);
    }
  }, [draft]);

  if (!draft) {
    return null;
  }

  const amountLabel = `${Number(draft.amount).toLocaleString()} RWF`;
  const invoiceId = `INV-${Date.now().toString().slice(-8)}`;

  return (
    <TabScreenLayout bottomInset={spacing.xl}>
      <BackHeader title="Invoice" />

      <View style={styles.invoiceCard}>
        <Text style={styles.invoiceTag}>PAYMENT INVOICE</Text>
        <Text style={styles.invoiceId}>{invoiceId}</Text>

        <View style={styles.divider} />

        <InvoiceRow label="Pay from" value={draft.payFromName} subValue={draft.payFromAccount} />
        <InvoiceRow label="Pay to" value={draft.payToCode} subValue="Your FastPay code" />
        <InvoiceRow
          label="Pay for"
          value={draft.beneficiaryName}
          subValue={draft.beneficiaryCategory}
        />
        <InvoiceRow
          label="Merchant"
          value={draft.merchantName}
          subValue={draft.merchantCode}
        />

        <View style={styles.divider} />

        <InvoiceRow label="Total amount" value={amountLabel} highlight />
      </View>

      <Text style={styles.note}>
        Review the details above. Tap Make Transfer to confirm this payment.
      </Text>

      <PrimaryButton
        label="Make Transfer"
        onPress={() => router.push("/bank-pay/pin" as Href)}
        style={styles.button}
      />
    </TabScreenLayout>
  );
}

const styles = StyleSheet.create({
  invoiceCard: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: spacing.lg,
    backgroundColor: "rgba(255,255,255,0.03)",
    marginBottom: spacing.lg,
  },
  invoiceTag: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 1.5,
    marginBottom: spacing.xs,
  },
  invoiceId: {
    color: colors.textMuted,
    fontSize: 13,
    marginBottom: spacing.md,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.md,
  },
  row: {
    marginBottom: spacing.md,
  },
  rowLabel: {
    color: colors.textMuted,
    fontSize: 12,
    marginBottom: 4,
    fontWeight: "600",
  },
  rowValue: {
    color: colors.white,
    fontSize: 16,
    fontWeight: "600",
  },
  rowValueHighlight: {
    color: colors.primary,
    fontSize: 24,
    marginTop: spacing.xs,
  },
  rowSubValue: {
    color: colors.textMuted,
    fontSize: 13,
    marginTop: 2,
  },
  note: {
    color: colors.textMuted,
    fontSize: 14,
    lineHeight: 20,
    marginBottom: spacing.lg,
  },
  button: {
    marginTop: spacing.sm,
  },
});

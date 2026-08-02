import { useCallback, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { useFocusEffect } from "expo-router";

import { PortalHeader } from "@/components/portal/PortalHeader";
import { Input } from "@/components/ui/Input";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { Screen } from "@/components/ui/Screen";
import { FLOATING_TAB_BAR_HEIGHT } from "@/components/navigation/FloatingPillTabBar";
import {
  createMerchantInvoice,
  fetchMerchantInvoices,
  type MerchantInvoice,
} from "@/lib/portal/merchant-api";
import { formatRwf } from "@/lib/portal/format";
import { colors } from "@/theme/colors";
import { radius, spacing } from "@/theme/spacing";

export default function MerchantInvoicesScreen() {
  const [invoices, setInvoices] = useState<MerchantInvoice[]>([]);
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    try {
      setError(null);
      setInvoices(await fetchMerchantInvoices());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load invoices");
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load]),
  );

  async function onCreate() {
    const amountRwf = Number(amount);
    if (!Number.isFinite(amountRwf) || amountRwf < 100) {
      setError("Amount must be at least 100 RWF.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await createMerchantInvoice({
        amountRwf,
        description: description.trim() || undefined,
      });
      setAmount("");
      setDescription("");
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create invoice");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Screen scroll style={{ paddingBottom: FLOATING_TAB_BAR_HEIGHT + spacing.lg }}>
      <PortalHeader
        eyebrow="Till"
        title="Invoices"
        subtitle="Create a payment request customers can pay with Bank Pay."
      />

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <View style={styles.card}>
        <Text style={styles.cardTitle}>New invoice</Text>
        <Input
          label="Amount (RWF)"
          value={amount}
          onChangeText={setAmount}
          keyboardType="numeric"
          placeholder="5000"
        />
        <Input
          label="Description (optional)"
          value={description}
          onChangeText={setDescription}
        />
        <PrimaryButton label="Create invoice" onPress={() => void onCreate()} loading={busy} />
      </View>

      <View style={[styles.card, { marginTop: spacing.lg }]}>
        <Text style={styles.cardTitle}>Recent</Text>
        {!invoices.length ? (
          <Text style={styles.empty}>No invoices yet.</Text>
        ) : (
          invoices.slice(0, 20).map((inv) => (
            <View key={inv.id} style={styles.row}>
              <View>
                <Text style={styles.rowStrong}>{formatRwf(inv.amountRwf)}</Text>
                <Text style={styles.rowMuted}>
                  {inv.invoiceNumber} · {inv.status}
                </Text>
              </View>
              <Text style={styles.rowMuted}>
                {inv.createdAt ? new Date(inv.createdAt).toLocaleDateString() : ""}
              </Text>
            </View>
          ))
        )}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  error: { color: colors.error, marginBottom: spacing.md },
  card: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.md,
    backgroundColor: colors.inputBg,
  },
  cardTitle: {
    color: colors.white,
    fontSize: 16,
    fontWeight: "700",
    marginBottom: spacing.md,
  },
  empty: { color: colors.textMuted },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  rowStrong: { color: colors.white, fontWeight: "600" },
  rowMuted: { color: colors.textMuted, fontSize: 12 },
});

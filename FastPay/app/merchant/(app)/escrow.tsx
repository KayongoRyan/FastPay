import { useCallback, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { useFocusEffect } from "expo-router";

import { PortalHeader } from "@/components/portal/PortalHeader";
import { Input } from "@/components/ui/Input";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { Screen } from "@/components/ui/Screen";
import { FLOATING_TAB_BAR_HEIGHT } from "@/components/navigation/FloatingPillTabBar";
import {
  deliverMerchantEscrow,
  disputeMerchantEscrow,
  listMerchantEscrows,
  shipMerchantEscrow,
  type MerchantEscrow,
} from "@/lib/portal/merchant-api";
import { formatRwf } from "@/lib/portal/format";
import { colors } from "@/theme/colors";
import { radius, spacing } from "@/theme/spacing";

export default function MerchantEscrowScreen() {
  const [deals, setDeals] = useState<MerchantEscrow[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [shippingNote, setShippingNote] = useState("");
  const [disputeReason, setDisputeReason] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    try {
      setError(null);
      setDeals(await listMerchantEscrows());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load escrow deals");
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load]),
  );

  const selected = deals.find((d) => d.id === selectedId) ?? null;

  async function run(action: () => Promise<unknown>) {
    setBusy(true);
    setError(null);
    try {
      await action();
      setShippingNote("");
      setDisputeReason("");
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Action failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Screen scroll style={{ paddingBottom: FLOATING_TAB_BAR_HEIGHT + spacing.lg }}>
      <PortalHeader
        eyebrow="Protection"
        title="Escrow orders"
        subtitle="Buyer funds are held until you ship and they confirm release."
      />

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Incoming deals</Text>
        {!deals.length ? (
          <Text style={styles.empty}>No escrow orders yet.</Text>
        ) : (
          deals.map((d) => (
            <View key={d.id} style={styles.row}>
              <View style={{ flex: 1 }}>
                <Text style={styles.rowStrong}>
                  {d.title || d.escrowCode}
                </Text>
                <Text style={styles.rowMuted}>
                  {d.escrowCode} · {d.status}
                </Text>
              </View>
              <View style={{ alignItems: "flex-end", gap: 6 }}>
                <Text style={styles.rowStrong}>{formatRwf(d.amountRwf)}</Text>
                <PrimaryButton
                  label={selectedId === d.id ? "Hide" : "Manage"}
                  onPress={() => setSelectedId(selectedId === d.id ? null : d.id)}
                  style={styles.miniBtn}
                  labelStyle={{ fontSize: 12 }}
                />
              </View>
            </View>
          ))
        )}
      </View>

      {selected ? (
        <View style={[styles.card, { marginTop: spacing.lg }]}>
          <Text style={styles.cardTitle}>Manage {selected.escrowCode}</Text>
          <Text style={styles.rowMuted}>Status: {selected.status}</Text>
          {selected.description ? (
            <Text style={styles.rowMuted}>{selected.description}</Text>
          ) : null}

          {selected.status === "paid" ? (
            <>
              <Input
                label="Shipping note"
                value={shippingNote}
                onChangeText={setShippingNote}
                placeholder="Tracking / courier info"
              />
              <PrimaryButton
                label="Mark shipped"
                loading={busy}
                onPress={() =>
                  void run(() =>
                    shipMerchantEscrow(selected.id, shippingNote.trim() || undefined),
                  )
                }
              />
            </>
          ) : null}

          {selected.status === "shipped" ? (
            <PrimaryButton
              label="Mark delivered"
              loading={busy}
              onPress={() => void run(() => deliverMerchantEscrow(selected.id))}
            />
          ) : null}

          {["paid", "shipped", "delivered"].includes(selected.status) ? (
            <>
              <Input
                label="Dispute reason"
                value={disputeReason}
                onChangeText={setDisputeReason}
                multiline
              />
              <PrimaryButton
                label="Open dispute"
                loading={busy}
                onPress={() => {
                  if (disputeReason.trim().length < 5) {
                    setError("Dispute reason min 5 chars.");
                    return;
                  }
                  void run(() =>
                    disputeMerchantEscrow(selected.id, disputeReason.trim()),
                  );
                }}
                style={styles.ghost}
                labelStyle={{ color: colors.error }}
              />
            </>
          ) : null}

          {selected.status === "released" ? (
            <Text style={styles.ok}>Funds released to your merchant balance.</Text>
          ) : null}
        </View>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  error: { color: colors.error, marginBottom: spacing.md },
  ok: { color: colors.success, marginTop: spacing.sm },
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
    alignItems: "center",
    gap: spacing.md,
    paddingVertical: spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  rowStrong: { color: colors.white, fontWeight: "600" },
  rowMuted: { color: colors.textMuted, fontSize: 12, marginTop: 2, marginBottom: spacing.sm },
  miniBtn: {
    minHeight: 36,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  ghost: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: colors.error,
    marginTop: spacing.sm,
  },
});

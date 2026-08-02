import { useLocalSearchParams } from "expo-router";
import { useCallback, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { useFocusEffect } from "expo-router";

import { Screen } from "@/components/ui/Screen";
import { Input } from "@/components/ui/Input";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import {
  cancelEscrow,
  confirmEscrow,
  deliverEscrow,
  disputeEscrow,
  ESCROW_STATUS_LABEL,
  formatEscrowRwf,
  fundEscrow,
  getEscrow,
  type EscrowContract,
} from "@/lib/api/escrow";
import { colors } from "@/theme/colors";
import { radius, spacing } from "@/theme/spacing";

const PIPELINE = ["pending", "paid", "shipped", "delivered", "released"] as const;

export default function EscrowDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [deal, setDeal] = useState<EscrowContract | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [disputeReason, setDisputeReason] = useState("");

  const load = useCallback(async () => {
    if (!id) return;
    try {
      setError(null);
      setDeal(await getEscrow(id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load");
    }
  }, [id]);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load]),
  );

  async function run(action: () => Promise<EscrowContract>) {
    setBusy(true);
    setError(null);
    try {
      setDeal(await action());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Action failed");
    } finally {
      setBusy(false);
    }
  }

  if (!deal) {
    return (
      <Screen>
        <Text style={styles.muted}>{error ?? "Loading…"}</Text>
      </Screen>
    );
  }

  const stepIndex = Math.max(
    0,
    PIPELINE.indexOf(deal.status as (typeof PIPELINE)[number]),
  );

  return (
    <Screen scroll>
      <Text style={styles.code}>{deal.escrowCode}</Text>
      <Text style={styles.title}>{deal.title || deal.sellerBusinessName || "Escrow deal"}</Text>
      <Text style={styles.amount}>{formatEscrowRwf(deal.amountRwf)}</Text>
      <Text style={styles.status}>{ESCROW_STATUS_LABEL[deal.status]}</Text>

      <View style={styles.pipeline}>
        {PIPELINE.map((s, i) => (
          <View key={s} style={[styles.pipeStep, i <= stepIndex && styles.pipeOn]}>
            <Text style={[styles.pipeText, i <= stepIndex && styles.pipeTextOn]}>
              {ESCROW_STATUS_LABEL[s].split(" ")[0]}
            </Text>
          </View>
        ))}
      </View>

      {deal.description ? <Text style={styles.muted}>{deal.description}</Text> : null}
      {deal.shippingNote ? (
        <Text style={styles.muted}>Shipping: {deal.shippingNote}</Text>
      ) : null}
      {deal.disputeReason ? (
        <Text style={styles.error}>Dispute: {deal.disputeReason}</Text>
      ) : null}
      {error ? <Text style={styles.error}>{error}</Text> : null}

      <View style={styles.actions}>
        {deal.status === "pending" ? (
          <>
            <PrimaryButton
              label="Fund escrow (hold payment)"
              loading={busy}
              onPress={() => void run(() => fundEscrow(deal.id))}
            />
            <PrimaryButton
              label="Cancel"
              loading={busy}
              onPress={() => void run(() => cancelEscrow(deal.id))}
              style={styles.ghost}
              labelStyle={{ color: colors.error }}
            />
          </>
        ) : null}

        {deal.status === "shipped" || deal.status === "paid" ? (
          <PrimaryButton
            label="Mark delivered"
            loading={busy}
            onPress={() => void run(() => deliverEscrow(deal.id))}
          />
        ) : null}

        {deal.status === "delivered" || deal.status === "shipped" ? (
          <PrimaryButton
            label="Confirm & release to merchant"
            loading={busy}
            onPress={() => void run(() => confirmEscrow(deal.id))}
          />
        ) : null}

        {["paid", "shipped", "delivered"].includes(deal.status) ? (
          <View style={styles.disputeBox}>
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
                  setError("Describe the issue (min 5 chars).");
                  return;
                }
                void run(() => disputeEscrow(deal.id, disputeReason.trim()));
              }}
              style={styles.ghost}
              labelStyle={{ color: colors.error }}
            />
          </View>
        ) : null}
      </View>

      <View style={styles.meta}>
        <Text style={styles.muted}>Seller: {deal.sellerBusinessName ?? "—"}</Text>
        <Text style={styles.muted}>Code: {deal.sellerMerchantCode ?? "—"}</Text>
        {deal.fundedPaymentRef ? (
          <Text style={styles.muted}>Fund ref: {deal.fundedPaymentRef}</Text>
        ) : null}
        {deal.releasePaymentRef ? (
          <Text style={styles.muted}>Release ref: {deal.releasePaymentRef}</Text>
        ) : null}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  code: {
    color: colors.primary,
    fontWeight: "700",
    letterSpacing: 1,
    marginBottom: spacing.xs,
  },
  title: {
    color: colors.white,
    fontSize: 24,
    fontWeight: "700",
  },
  amount: {
    color: colors.white,
    fontSize: 28,
    fontWeight: "700",
    marginTop: spacing.sm,
  },
  status: {
    color: colors.textMuted,
    marginTop: spacing.xs,
    marginBottom: spacing.lg,
  },
  pipeline: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  pipeStep: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    opacity: 0.45,
  },
  pipeOn: {
    opacity: 1,
    borderColor: colors.primary,
    backgroundColor: "rgba(0,174,239,0.12)",
  },
  pipeText: { color: colors.textMuted, fontSize: 11, fontWeight: "600" },
  pipeTextOn: { color: colors.white },
  muted: { color: colors.textMuted, marginBottom: spacing.sm },
  error: { color: colors.error, marginBottom: spacing.md },
  actions: { gap: spacing.md, marginTop: spacing.md },
  ghost: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: colors.error,
  },
  disputeBox: { marginTop: spacing.sm },
  meta: { marginTop: spacing.xl },
});

import { useLocalSearchParams, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { StyleSheet, Text, View } from "react-native";

import { Screen } from "@/components/ui/Screen";
import {
  formatInsRwf,
  getClaim,
  type InsuranceClaim,
} from "@/lib/api/insurance";
import { colors } from "@/theme/colors";
import { radius, spacing } from "@/theme/spacing";

const PIPELINE = [
  { key: "submitted", label: "Claim Submitted" },
  { key: "investigating", label: "Fraud Investigation" },
  { key: "approved", label: "Claim Approved" },
  { key: "paid", label: "Insurance Payout" },
] as const;

function pipelineIndex(status: string) {
  if (status === "rejected") return 1;
  const i = PIPELINE.findIndex((p) => p.key === status);
  return i < 0 ? 0 : i;
}

export default function InsuranceClaimDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [claim, setClaim] = useState<InsuranceClaim | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!id) return;
    try {
      setError(null);
      setClaim(await getClaim(id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load claim");
    }
  }, [id]);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load]),
  );

  if (!claim) {
    return (
      <Screen>
        <Text style={styles.muted}>{error ?? "Loading…"}</Text>
      </Screen>
    );
  }

  const active = pipelineIndex(claim.status);

  return (
    <Screen scroll>
      <Text style={styles.code}>{claim.claimNumber}</Text>
      <Text style={styles.amount}>{formatInsRwf(claim.amountRwf)}</Text>
      <Text style={styles.status}>{claim.status}</Text>

      <Text style={styles.sectionTitle}>Claim Process</Text>
      <View style={styles.pipeline}>
        <View style={styles.pipeItem}>
          <Text style={[styles.pipeLabel, styles.pipeOn]}>Wallet Drained</Text>
        </View>
        {PIPELINE.map((p, i) => {
          const on = i <= active && claim.status !== "rejected";
          const rejected = claim.status === "rejected" && i === 1;
          return (
            <View
              key={p.key}
              style={[styles.pipeItem, (on || rejected) && styles.pipeItemOn]}
            >
              <Text
                style={[
                  styles.pipeLabel,
                  on && styles.pipeOn,
                  rejected && styles.pipeRejected,
                ]}
              >
                {rejected ? "Rejected after investigation" : p.label}
              </Text>
            </View>
          );
        })}
      </View>

      <Text style={styles.reason}>{claim.reason}</Text>
      {claim.drainTxRef ? (
        <Text style={styles.muted}>Drain ref: {claim.drainTxRef}</Text>
      ) : null}
      {claim.fraudRiskScore != null ? (
        <Text style={styles.muted}>Fraud risk score: {claim.fraudRiskScore}</Text>
      ) : null}
      {claim.payoutRef ? (
        <Text style={styles.ok}>Payout: {claim.payoutRef}</Text>
      ) : null}
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  code: {
    color: colors.primary,
    fontWeight: "700",
    letterSpacing: 1,
  },
  amount: {
    color: colors.white,
    fontSize: 28,
    fontWeight: "700",
    marginTop: spacing.sm,
  },
  status: {
    color: colors.textMuted,
    marginBottom: spacing.lg,
    textTransform: "capitalize",
  },
  sectionTitle: {
    color: colors.white,
    fontWeight: "700",
    marginBottom: spacing.sm,
  },
  pipeline: { gap: spacing.sm, marginBottom: spacing.lg },
  pipeItem: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.md,
    opacity: 0.45,
  },
  pipeItemOn: {
    opacity: 1,
    borderColor: "#34D399",
    backgroundColor: "rgba(52,211,153,0.1)",
  },
  pipeLabel: { color: colors.textMuted, fontWeight: "600" },
  pipeOn: { color: colors.white },
  pipeRejected: { color: colors.error },
  reason: { color: colors.white, marginBottom: spacing.md, lineHeight: 22 },
  muted: { color: colors.textMuted, marginBottom: 4 },
  ok: { color: colors.success, marginTop: spacing.md },
  error: { color: colors.error },
});

import { Href, router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { Screen } from "@/components/ui/Screen";
import { Input } from "@/components/ui/Input";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import {
  formatInsRwf,
  listClaims,
  submitClaim,
  type InsuranceClaim,
} from "@/lib/api/insurance";
import { colors } from "@/theme/colors";
import { radius, spacing } from "@/theme/spacing";

export default function InsuranceClaimsScreen() {
  const [claims, setClaims] = useState<InsuranceClaim[]>([]);
  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState("");
  const [drainTxRef, setDrainTxRef] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    try {
      setError(null);
      setClaims(await listClaims());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load claims");
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load]),
  );

  async function onSubmit() {
    const amountRwf = Number(amount);
    if (!Number.isFinite(amountRwf) || amountRwf < 100) {
      setError("Amount must be at least 100 RWF.");
      return;
    }
    if (reason.trim().length < 8) {
      setError("Describe what happened (min 8 characters).");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const claim = await submitClaim({
        amountRwf,
        reason: reason.trim(),
        drainTxRef: drainTxRef.trim() || undefined,
      });
      setAmount("");
      setReason("");
      setDrainTxRef("");
      await load();
      router.push(`/services/insurance/claims/${claim.id}` as Href);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Claim failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Screen scroll>
      <Text style={styles.eyebrow}>Claim Submission</Text>
      <Text style={styles.title}>Wallet drained?</Text>
      <Text style={styles.sub}>
        Submit a claim → fraud investigation → approval → insurance payout.
      </Text>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <View style={styles.card}>
        <Input
          label="Loss amount (RWF)"
          value={amount}
          onChangeText={setAmount}
          keyboardType="numeric"
        />
        <Input
          label="What happened"
          value={reason}
          onChangeText={setReason}
          multiline
          placeholder="Unauthorized transfers emptied my wallet…"
        />
        <Input
          label="Drain tx ref (optional)"
          value={drainTxRef}
          onChangeText={setDrainTxRef}
        />
        <PrimaryButton
          label="Submit claim"
          onPress={() => void onSubmit()}
          loading={busy}
        />
      </View>

      <View style={[styles.card, { marginTop: spacing.lg }]}>
        <Text style={styles.cardTitle}>Your claims</Text>
        {!claims.length ? (
          <Text style={styles.empty}>No claims yet.</Text>
        ) : (
          claims.map((c) => (
            <Pressable
              key={c.id}
              style={styles.row}
              onPress={() =>
                router.push(`/services/insurance/claims/${c.id}` as Href)
              }
            >
              <View style={{ flex: 1 }}>
                <Text style={styles.rowStrong}>{c.claimNumber}</Text>
                <Text style={styles.rowMuted}>{c.status}</Text>
              </View>
              <Text style={styles.rowStrong}>{formatInsRwf(c.amountRwf)}</Text>
            </Pressable>
          ))
        )}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  eyebrow: {
    color: colors.primary,
    fontWeight: "700",
    letterSpacing: 1,
    fontSize: 12,
    textTransform: "uppercase",
  },
  title: {
    color: colors.white,
    fontSize: 26,
    fontWeight: "700",
    marginTop: spacing.xs,
  },
  sub: {
    color: colors.textMuted,
    marginBottom: spacing.lg,
    marginTop: spacing.sm,
  },
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
    fontWeight: "700",
    fontSize: 16,
    marginBottom: spacing.md,
  },
  empty: { color: colors.textMuted },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  rowStrong: { color: colors.white, fontWeight: "600" },
  rowMuted: { color: colors.textMuted, fontSize: 12, marginTop: 2 },
});

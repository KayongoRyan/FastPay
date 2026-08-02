import { Href, router, useFocusEffect } from "expo-router";
import { Handshake } from "lucide-react-native";
import { useCallback, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { FeaturePageLayout } from "@/components/feature";
import { Input } from "@/components/ui/Input";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import {
  createEscrow,
  ESCROW_STATUS_LABEL,
  formatEscrowRwf,
  listMyEscrows,
  type EscrowContract,
  type EscrowStatus,
} from "@/lib/api/escrow";
import { colors } from "@/theme/colors";
import { radius, spacing } from "@/theme/spacing";

const FLOW = ["Buyer", "Escrow", "Ships", "Confirm", "Paid"] as const;
const STATUSES: EscrowStatus[] = [
  "pending",
  "paid",
  "shipped",
  "delivered",
  "released",
  "disputed",
];

export default function EscrowScreen() {
  const [deals, setDeals] = useState<EscrowContract[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [merchantCode, setMerchantCode] = useState("");
  const [amount, setAmount] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const load = useCallback(async () => {
    try {
      setError(null);
      setDeals(await listMyEscrows());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load escrows");
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load]),
  );

  async function onCreate() {
    const amountRwf = Number(amount);
    if (!merchantCode.trim()) {
      setError("Enter the merchant code (e.g. MRC482).");
      return;
    }
    if (!Number.isFinite(amountRwf) || amountRwf < 100) {
      setError("Amount must be at least 100 RWF.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const created = await createEscrow({
        merchantCode: merchantCode.trim().toUpperCase(),
        amountRwf,
        title: title.trim() || undefined,
        description: description.trim() || undefined,
        requiresBuyerConfirm: true,
      });
      setMerchantCode("");
      setAmount("");
      setTitle("");
      setDescription("");
      await load();
      router.push(`/services/escrow/${created.id}` as Href);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create escrow");
    } finally {
      setBusy(false);
    }
  }

  return (
    <FeaturePageLayout
      title="Escrow"
      icon={Handshake}
      tag="MERCHANT PROTECTION"
      headline="Pay with confidence"
      description="Funds stay locked until the merchant ships and you confirm."
      accentColor="#38BDF8"
    >
      <View style={styles.flowRow}>
        {FLOW.map((label, i) => (
          <View key={label} style={styles.flowItem}>
            <View style={styles.flowDot}>
              <Text style={styles.flowN}>{i + 1}</Text>
            </View>
            <Text style={styles.flowLabel} numberOfLines={1}>
              {label}
            </Text>
          </View>
        ))}
      </View>

      <View style={styles.statusWrap}>
        {STATUSES.map((s) => (
          <View key={s} style={styles.statusChip}>
            <Text style={styles.statusText}>{ESCROW_STATUS_LABEL[s]}</Text>
          </View>
        ))}
      </View>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Create protected deal</Text>
        <Input
          label="Merchant code"
          value={merchantCode}
          onChangeText={(t) => setMerchantCode(t.toUpperCase())}
          autoCapitalize="characters"
          placeholder="MRC482"
        />
        <Input
          label="Amount (RWF)"
          value={amount}
          onChangeText={setAmount}
          keyboardType="numeric"
        />
        <Input label="Title (optional)" value={title} onChangeText={setTitle} />
        <Input
          label="Details (optional)"
          value={description}
          onChangeText={setDescription}
          multiline
        />
        <PrimaryButton label="Create escrow" onPress={() => void onCreate()} loading={busy} />
      </View>

      <View style={[styles.card, { marginTop: spacing.lg }]}>
        <Text style={styles.cardTitle}>Your deals</Text>
        {!deals.length ? (
          <Text style={styles.empty}>No escrow deals yet.</Text>
        ) : (
          deals.map((d) => (
            <Pressable
              key={d.id}
              style={styles.row}
              onPress={() => router.push(`/services/escrow/${d.id}` as Href)}
            >
              <View style={{ flex: 1 }}>
                <Text style={styles.rowStrong}>
                  {d.title || d.sellerBusinessName || d.escrowCode}
                </Text>
                <Text style={styles.rowMuted}>
                  {d.escrowCode} · {ESCROW_STATUS_LABEL[d.status]}
                </Text>
              </View>
              <Text style={styles.rowStrong}>{formatEscrowRwf(d.amountRwf)}</Text>
            </Pressable>
          ))
        )}
      </View>
    </FeaturePageLayout>
  );
}

const styles = StyleSheet.create({
  flowRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: spacing.md,
    gap: 4,
  },
  flowItem: { flex: 1, alignItems: "center", gap: 6 },
  flowDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "rgba(56,189,248,0.2)",
    borderWidth: 1,
    borderColor: "#38BDF8",
    alignItems: "center",
    justifyContent: "center",
  },
  flowN: { color: colors.white, fontSize: 12, fontWeight: "700" },
  flowLabel: {
    color: colors.textMuted,
    fontSize: 10,
    fontWeight: "600",
    textTransform: "uppercase",
  },
  statusWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  statusChip: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.pill,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: colors.inputBg,
  },
  statusText: { color: colors.textMuted, fontSize: 11, fontWeight: "600" },
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
    alignItems: "center",
    gap: spacing.md,
    paddingVertical: spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  rowStrong: { color: colors.white, fontWeight: "600" },
  rowMuted: { color: colors.textMuted, fontSize: 12, marginTop: 2 },
});

import { useCallback, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { useFocusEffect } from "expo-router";

import { PortalHeader } from "@/components/portal/PortalHeader";
import { PortalTypePicker } from "@/components/portal/PortalTypePicker";
import { Input } from "@/components/ui/Input";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { Screen } from "@/components/ui/Screen";
import { FLOATING_TAB_BAR_HEIGHT } from "@/components/navigation/FloatingPillTabBar";
import type { BusinessType } from "@/lib/portal/business-types";
import { businessTypeLabel } from "@/lib/portal/business-types";
import {
  createBranch,
  fetchBranches,
  linkBranch,
  type BusinessBranch,
} from "@/lib/portal/business-api";
import { formatRwf } from "@/lib/portal/format";
import { colors } from "@/theme/colors";
import { radius, spacing } from "@/theme/spacing";

export default function BusinessBranchesScreen() {
  const [branches, setBranches] = useState<BusinessBranch[]>([]);
  const [branchName, setBranchName] = useState("");
  const [category, setCategory] = useState<BusinessType | "">("");
  const [merchantCode, setMerchantCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    try {
      setError(null);
      setBranches(await fetchBranches());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load branches");
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load]),
  );

  async function onCreate() {
    if (!branchName.trim()) {
      setError("Branch name is required.");
      return;
    }
    if (!category) {
      setError("Pick a branch business type.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await createBranch({ branchName: branchName.trim(), category });
      setBranchName("");
      setCategory("");
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create branch");
    } finally {
      setBusy(false);
    }
  }

  async function onLink() {
    if (!merchantCode.trim()) {
      setError("Enter a merchant code (e.g. MRC482).");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await linkBranch(merchantCode.trim().toUpperCase());
      setMerchantCode("");
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not link merchant");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Screen scroll style={{ paddingBottom: FLOATING_TAB_BAR_HEIGHT + spacing.lg }}>
      <PortalHeader
        eyebrow="Network"
        title="Branches"
        subtitle="Create merchant shops under this company, or link shops you already own."
      />

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Create branch</Text>
        <Input
          label="Branch / shop name"
          value={branchName}
          onChangeText={setBranchName}
          placeholder="Kigali City Market"
        />
        <PortalTypePicker value={category} onChange={setCategory} title="Business type" />
        <PrimaryButton
          label="Create merchant branch"
          onPress={() => void onCreate()}
          loading={busy}
        />
      </View>

      <View style={[styles.card, { marginTop: spacing.lg }]}>
        <Text style={styles.cardTitle}>Link existing merchant</Text>
        <Input
          label="Merchant code"
          value={merchantCode}
          onChangeText={(t) => setMerchantCode(t.toUpperCase())}
          autoCapitalize="characters"
          placeholder="MRC482"
        />
        <PrimaryButton label="Link to company" onPress={() => void onLink()} loading={busy} />
      </View>

      <View style={[styles.card, { marginTop: spacing.lg }]}>
        <Text style={styles.cardTitle}>All branches</Text>
        {!branches.length ? (
          <Text style={styles.empty}>No linked shops yet.</Text>
        ) : (
          branches.map((b) => (
            <View key={b.orgId} style={styles.row}>
              <View style={{ flex: 1 }}>
                <Text style={styles.rowStrong}>{b.businessName}</Text>
                <Text style={styles.rowMuted}>
                  {b.merchantCode}
                  {b.category ? ` · ${businessTypeLabel(b.category)}` : ""} · {b.status}
                </Text>
              </View>
              <Text style={styles.rowStrong}>{formatRwf(b.totalReceivedRwf)}</Text>
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
    gap: spacing.md,
    paddingVertical: spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  rowStrong: { color: colors.white, fontWeight: "600" },
  rowMuted: { color: colors.textMuted, fontSize: 12 },
});

import { useCallback, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { useFocusEffect } from "expo-router";

import { PortalHeader } from "@/components/portal/PortalHeader";
import { PortalStatCard } from "@/components/portal/PortalStatCard";
import { Screen } from "@/components/ui/Screen";
import { FLOATING_TAB_BAR_HEIGHT } from "@/components/navigation/FloatingPillTabBar";
import {
  fetchMerchantDashboard,
  type MerchantDashboard,
} from "@/lib/portal/merchant-api";
import { formatRwf } from "@/lib/portal/format";
import { useMerchantAuthStore } from "@/store/merchantAuthStore";
import { colors } from "@/theme/colors";
import { radius, spacing } from "@/theme/spacing";

export default function MerchantHomeScreen() {
  const user = useMerchantAuthStore((s) => s.user);
  const [data, setData] = useState<MerchantDashboard | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setError(null);
      setData(await fetchMerchantDashboard());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load dashboard");
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load]),
  );

  return (
    <Screen scroll style={{ paddingBottom: FLOATING_TAB_BAR_HEIGHT + spacing.lg }}>
      <PortalHeader
        eyebrow="Merchant dashboard"
        title={user?.businessName ?? data?.org.businessName ?? "Your shop"}
        subtitle={`Code ${user?.merchantCode ?? data?.org.merchantCode ?? "—"} · customers pay via Bank Pay`}
      />

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <View style={styles.stats}>
        <PortalStatCard
          label="Today"
          value={formatRwf(data?.todayTotalRwf ?? 0)}
          hint={`${data?.todayCount ?? 0} payments`}
        />
        <PortalStatCard
          label="Total received"
          value={formatRwf(data?.totalReceivedRwf ?? 0)}
          hint="All time"
        />
        <PortalStatCard
          label="Open invoices"
          value={String(data?.openInvoices ?? 0)}
          hint="Awaiting payment"
        />
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Recent payments</Text>
        {!data?.recentTransactions.length ? (
          <Text style={styles.empty}>No payments yet. Share your merchant code.</Text>
        ) : (
          data.recentTransactions.map((tx) => (
            <View key={tx.id} style={styles.row}>
              <View>
                <Text style={styles.rowStrong}>{formatRwf(tx.amountRwf)}</Text>
                <Text style={styles.rowMuted}>{tx.channel.replace(/_/g, " ")}</Text>
              </View>
              <Text style={styles.rowMuted}>
                {tx.createdAt ? new Date(tx.createdAt).toLocaleString() : ""}
              </Text>
            </View>
          ))
        )}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  error: {
    color: colors.error,
    marginBottom: spacing.md,
  },
  stats: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  card: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.md,
    backgroundColor: colors.inputBg,
    gap: spacing.sm,
  },
  cardTitle: {
    color: colors.white,
    fontSize: 16,
    fontWeight: "700",
    marginBottom: spacing.xs,
  },
  empty: {
    color: colors.textMuted,
    fontSize: 14,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  rowStrong: {
    color: colors.white,
    fontWeight: "600",
  },
  rowMuted: {
    color: colors.textMuted,
    fontSize: 12,
  },
});

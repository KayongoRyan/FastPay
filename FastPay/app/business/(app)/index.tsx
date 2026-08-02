import { useCallback, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { useFocusEffect } from "expo-router";

import { PortalHeader } from "@/components/portal/PortalHeader";
import { PortalStatCard } from "@/components/portal/PortalStatCard";
import { Screen } from "@/components/ui/Screen";
import { FLOATING_TAB_BAR_HEIGHT } from "@/components/navigation/FloatingPillTabBar";
import {
  fetchBusinessDashboard,
  type BusinessDashboard,
} from "@/lib/portal/business-api";
import { formatRwf } from "@/lib/portal/format";
import { businessTypeLabel } from "@/lib/portal/business-types";
import { useBusinessAuthStore } from "@/store/businessAuthStore";
import { colors } from "@/theme/colors";
import { radius, spacing } from "@/theme/spacing";

export default function BusinessHomeScreen() {
  const user = useBusinessAuthStore((s) => s.user);
  const [data, setData] = useState<BusinessDashboard | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setError(null);
      setData(await fetchBusinessDashboard());
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
        eyebrow="Business HQ"
        title={user?.companyName ?? data?.org.companyName ?? "Your company"}
        subtitle={`Code ${user?.businessCode ?? data?.org.businessCode ?? "—"} · group view across merchant branches`}
      />

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <View style={styles.stats}>
        <PortalStatCard
          label="Branches"
          value={String(data?.branchCount ?? 0)}
          hint={`${data?.activeBranches ?? 0} active`}
        />
        <PortalStatCard
          label="Group received"
          value={formatRwf(data?.totalReceivedRwf ?? 0)}
          hint="All linked shops"
        />
        <PortalStatCard
          label="Team"
          value={String(data?.memberCount ?? 0)}
          hint="HQ members"
        />
        <PortalStatCard
          label="Status"
          value={data?.org.status ?? "—"}
          hint={businessTypeLabel(data?.org.businessType)}
        />
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Linked branches</Text>
        {!data?.branches.length ? (
          <Text style={styles.empty}>
            No branches yet. Create a shop under this company or link an existing merchant code.
          </Text>
        ) : (
          data.branches.map((b) => (
            <View key={b.orgId} style={styles.row}>
              <View style={{ flex: 1 }}>
                <Text style={styles.rowStrong}>{b.businessName}</Text>
                <Text style={styles.rowMuted}>
                  {b.merchantCode} · {b.status}
                  {b.category ? ` · ${businessTypeLabel(b.category)}` : ""}
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
  empty: { color: colors.textMuted, fontSize: 14 },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: spacing.md,
    paddingVertical: spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  rowStrong: { color: colors.white, fontWeight: "600" },
  rowMuted: { color: colors.textMuted, fontSize: 12 },
});

import { Href, router, useFocusEffect } from "expo-router";
import { ShieldCheck } from "lucide-react-native";
import { useCallback, useState } from "react";
import { StyleSheet, Text, View } from "react-native";

import { FeaturePageLayout } from "@/components/feature";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import {
  enableInsurance,
  fetchInsuranceDashboard,
  formatInsRwf,
  type InsuranceDashboard,
  type InsuranceRiskScores,
} from "@/lib/api/insurance";
import { colors } from "@/theme/colors";
import { radius, spacing } from "@/theme/spacing";

const RISK_KEYS: { key: keyof InsuranceRiskScores; label: string }[] = [
  { key: "deviceReputation", label: "Device Reputation" },
  { key: "transactionHistory", label: "Transaction History" },
  { key: "kycScore", label: "KYC Score" },
  { key: "securityScore", label: "Security Score" },
  { key: "fraudDetection", label: "Fraud Detection" },
];

export default function InsuranceHomeScreen() {
  const [data, setData] = useState<InsuranceDashboard | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    try {
      setError(null);
      setData(await fetchInsuranceDashboard());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load insurance");
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load]),
  );

  async function onEnable() {
    setBusy(true);
    setError(null);
    try {
      await enableInsurance(500_000);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not enable insurance");
    } finally {
      setBusy(false);
    }
  }

  const policy = data?.policy;
  const scores = policy?.riskScores;

  return (
    <FeaturePageLayout
      title="Wallet Insurance"
      icon={ShieldCheck}
      tag="WALLET PROTECTION"
      headline="Cover your wallet"
      description="Enable cover → risk engine scores your wallet → monthly premium → policy issued. Claims follow fraud investigation before payout."
      accentColor="#34D399"
    >
      {error ? <Text style={styles.error}>{error}</Text> : null}

      {/* Insurance Service modules */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Insurance Service</Text>
        {(data?.modules ?? [
          "Policy Creation",
          "Premium Calculation",
          "Coverage Management",
          "Claim Submission",
          "Claim Review",
          "Payouts",
        ]).map((m) => (
          <Text key={m} style={styles.listItem}>
            {m}
          </Text>
        ))}
      </View>

      {/* Insurance Flow */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Insurance Flow</Text>
        {(data?.insuranceFlow ?? []).map((step, i) => (
          <Text key={step} style={styles.flowStep}>
            {i + 1}. {step}
          </Text>
        ))}
      </View>

      {/* Claim Process */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Claim Process</Text>
        {(data?.claimProcess ?? []).map((step, i) => (
          <Text key={step} style={styles.flowStep}>
            {i + 1}. {step}
          </Text>
        ))}
      </View>

      {/* Risk Engine */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Risk Engine</Text>
        {scores
          ? RISK_KEYS.map(({ key, label }) => (
              <View key={key} style={styles.scoreRow}>
                <Text style={styles.scoreLabel}>{label}</Text>
                <Text style={styles.scoreValue}>{scores[key]}</Text>
              </View>
            ))
          : (data?.riskEngine ?? RISK_KEYS.map((r) => r.label)).map((label) => (
              <Text key={label} style={styles.listItem}>
                {label}
              </Text>
            ))}
        {scores ? (
          <View style={[styles.scoreRow, styles.scoreTotal]}>
            <Text style={styles.scoreLabel}>Overall</Text>
            <Text style={styles.scoreValue}>{scores.overall}</Text>
          </View>
        ) : null}
      </View>

      {/* Coverage / Policy */}
      <View style={[styles.card, { marginTop: spacing.lg }]}>
        <Text style={styles.cardTitle}>Coverage Management</Text>
        {policy?.status === "active" ? (
          <>
            <Text style={styles.policyNum}>{policy.policyNumber}</Text>
            <Text style={styles.meta}>
              Premium {formatInsRwf(policy.premiumRwf)} / month
            </Text>
            <Text style={styles.meta}>
              Limit {formatInsRwf(policy.coverageLimitRwf)}
            </Text>
            <PrimaryButton
              label="File a claim"
              onPress={() => router.push("/services/insurance/claims" as Href)}
              style={{ marginTop: spacing.md }}
            />
          </>
        ) : (
          <>
            <Text style={styles.meta}>
              No active policy. Enable to run the risk engine and issue cover.
            </Text>
            <PrimaryButton
              label="Enable wallet insurance"
              onPress={() => void onEnable()}
              loading={busy}
              style={{ marginTop: spacing.md }}
            />
          </>
        )}
      </View>
    </FeaturePageLayout>
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
    marginBottom: spacing.lg,
  },
  cardTitle: {
    color: colors.white,
    fontSize: 16,
    fontWeight: "700",
    marginBottom: spacing.sm,
  },
  listItem: {
    color: colors.textMuted,
    paddingVertical: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
    fontSize: 14,
  },
  section: { marginBottom: spacing.lg },
  sectionTitle: {
    color: colors.white,
    fontSize: 16,
    fontWeight: "700",
    marginBottom: spacing.sm,
  },
  flowStep: {
    color: colors.textMuted,
    fontSize: 14,
    marginBottom: 6,
  },
  scoreRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  scoreTotal: {
    marginTop: spacing.xs,
    borderTopWidth: 1,
  },
  scoreLabel: { color: colors.textMuted, fontSize: 14 },
  scoreValue: { color: colors.white, fontWeight: "700" },
  policyNum: {
    color: colors.primary,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  meta: { color: colors.textMuted, marginTop: 4 },
});

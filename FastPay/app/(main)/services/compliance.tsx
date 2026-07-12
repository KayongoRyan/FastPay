import { router } from "expo-router";
import { Scale } from "lucide-react-native";

import {
  FeatureActionList,
  FeatureActions,
  FeatureHighlights,
  FeatureInfoPanel,
  FeaturePageLayout,
  FeatureStatRow,
  FeatureSteps,
} from "@/components/feature";
import { featureRoutes } from "@/lib/navigation/feature-routes";

export default function ComplianceScreen() {
  return (
    <FeaturePageLayout
      title="Compliance"
      icon={Scale}
      tag="REGULATORY"
      headline="Stay compliant, stay trusted"
      description="Meet KYC, AML, and transaction reporting requirements — all managed inside FastPay."
      accentColor="#94A3B8"
    >
      <FeatureStatRow
        stats={[
          { label: "KYC status", value: "Track" },
          { label: "Reports", value: "Auto" },
          { label: "Limits", value: "Tiered" },
        ]}
      />
      <FeatureSteps
        title="Your compliance journey"
        steps={[
          {
            title: "Verify your identity",
            detail: "Complete KYC with your national ID for full account access.",
          },
          {
            title: "Understand your limits",
            detail: "Higher tiers unlock larger daily and monthly limits.",
          },
          {
            title: "Stay up to date",
            detail: "Renew documents before expiry to avoid interruptions.",
          },
        ]}
      />
      <FeatureHighlights
        title="Compliance tools"
        items={[
          {
            title: "Transaction monitoring",
            detail: "Unusual activity is flagged and reviewed automatically.",
          },
          {
            title: "Tax reporting",
            detail: "Export annual summaries for RRA filing.",
          },
          {
            title: "Source of funds",
            detail: "Declare income sources for large transactions.",
          },
        ]}
      />
      <FeatureInfoPanel
        title="Account tiers"
        lines={[
          "Basic — phone verified, 500K RWF/day limit",
          "Verified — ID approved, 2M RWF/day limit",
          "Premium — enhanced checks, 5M RWF/day limit",
        ]}
      />
      <FeatureActionList
        title="Compliance actions"
        actions={[
          {
            label: "Complete KYC verification",
            detail: "Upload your national ID",
            onPress: () => router.push(featureRoutes.kyc),
          },
          {
            label: "View account limits",
            detail: "See your current tier",
            onPress: () => router.push(featureRoutes.settings),
          },
          {
            label: "Download tax summary",
            detail: "Annual transaction report",
            onPress: () => router.push(featureRoutes.analytics("cashflow")),
          },
        ]}
      />
      <FeatureActions
        actions={[
          {
            label: "Verify my identity",
            onPress: () => router.push(featureRoutes.kyc),
          },
        ]}
      />
    </FeaturePageLayout>
  );
}

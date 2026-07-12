import { router } from "expo-router";
import { ShieldCheck } from "lucide-react-native";

import {
  FeatureActionList,
  FeatureActions,
  FeatureHighlights,
  FeatureInfoPanel,
  FeaturePageLayout,
  FeatureStatRow,
  FeatureSteps,
} from "@/components/feature";

const PLANS = [
  { name: "Health Basic", price: "15,000 RWF/mo", coverage: "Outpatient + emergency" },
  { name: "Motor Cover", price: "45,000 RWF/mo", coverage: "Third-party + theft" },
  { name: "Device Shield", price: "8,000 RWF/mo", coverage: "Phone & laptop damage" },
];

export default function InsuranceScreen() {
  return (
    <FeaturePageLayout
      title="Insurance"
      icon={ShieldCheck}
      tag="COVERAGE"
      headline="Protect what matters"
      description="Browse partner insurance plans and pay premiums directly from your FastPay wallet."
      accentColor="#34D399"
    >
      <FeatureStatRow
        stats={[
          { label: "Partners", value: "6 insurers" },
          { label: "Plans", value: "20+" },
          { label: "Claims", value: "In-app" },
        ]}
      />
      <FeatureSteps
        title="Get covered in 3 steps"
        steps={[
          {
            title: "Compare plans",
            detail: "Filter by health, motor, device, or life coverage.",
          },
          {
            title: "Choose & pay",
            detail: "Select monthly or annual billing from your wallet.",
          },
          {
            title: "Manage policies",
            detail: "Store documents, set renewals, and file claims.",
          },
        ]}
      />
      <FeatureHighlights
        title="Available plans"
        items={PLANS.map((plan) => ({
          title: `${plan.name} — ${plan.price}`,
          detail: plan.coverage,
        }))}
      />
      <FeatureInfoPanel
        title="Policy benefits"
        lines={[
          "Digital policy documents stored in-app",
          "Renewal reminders 7 days before expiry",
          "Claims submitted with photo evidence",
          "Family members can be added to health plans",
        ]}
      />
      <FeatureActionList
        title="Insurance actions"
        actions={[
          {
            label: "Get a health quote",
            detail: "Individual and family plans",
            onPress: () => router.push("/settings"),
          },
          {
            label: "Insure my vehicle",
            detail: "Motor third-party and comprehensive",
            onPress: () => router.push("/settings"),
          },
          {
            label: "My policies",
            detail: "View active coverage",
            onPress: () => router.push("/settings"),
          },
        ]}
      />
      <FeatureActions
        actions={[
          {
            label: "Browse insurance plans",
            onPress: () => router.push("/settings"),
          },
        ]}
      />
    </FeaturePageLayout>
  );
}

import { router } from "expo-router";
import { Receipt } from "lucide-react-native";

import {
  FeatureActionList,
  FeatureActions,
  FeatureHighlights,
  FeaturePageLayout,
  FeatureStatRow,
  FeatureSteps,
} from "@/components/feature";

export default function BillServiceScreen() {
  return (
    <FeaturePageLayout
      title="Bill Pay"
      icon={Receipt}
      tag="BILL MANAGEMENT"
      headline="Pay and track every bill"
      description="Organize rent, utilities, subscriptions, and recurring payments in one place."
      accentColor="#4ADE80"
    >
      <FeatureStatRow
        stats={[
          { label: "Categories", value: "8" },
          { label: "Reminders", value: "Auto" },
          { label: "History", value: "12 months" },
        ]}
      />
      <FeatureSteps
        title="Pay a bill in 3 steps"
        steps={[
          {
            title: "Add your bill",
            detail: "Enter amount, category, and due date for any expense.",
          },
          {
            title: "Pay from wallet",
            detail: "Settle instantly using your FastPay balance.",
          },
          {
            title: "Track monthly spend",
            detail: "See totals by category and month in your dashboard.",
          },
        ]}
      />
      <FeatureHighlights
        title="Bill categories"
        items={[
          {
            title: "Home & utilities",
            detail: "Rent, electricity, water, and WiFi in one view.",
          },
          {
            title: "Government & tax",
            detail: "RRA payments and public service fees.",
          },
        ]}
      />
      <FeatureActionList
        title="Quick bill actions"
        actions={[
          {
            label: "Pay utilities",
            detail: "Electricity and water",
            onPress: () => router.push("/quick-links/utilities"),
          },
          {
            label: "Pay tax",
            detail: "RRA and government fees",
            onPress: () => router.push("/quick-links/pay-tax"),
          },
          {
            label: "View all bills",
            detail: "Open bill manager",
            onPress: () => router.push("/bills"),
          },
        ]}
      />
      <FeatureActions
        actions={[
          {
            label: "Open bill manager",
            onPress: () => router.push("/bills"),
          },
        ]}
      />
    </FeaturePageLayout>
  );
}

import { router } from "expo-router";
import { Droplets } from "lucide-react-native";

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

export default function UtilitiesScreen() {
  return (
    <FeaturePageLayout
      title="Electricity & Water"
      icon={Droplets}
      tag="UTILITIES"
      headline="Pay your utility bills"
      description="Settle REG electricity and WASAC water bills instantly — enter your meter number and pay."
      accentColor="#22D3EE"
    >
      <FeatureStatRow
        stats={[
          { label: "Providers", value: "REG + WASAC" },
          { label: "Receipt", value: "Instant" },
          { label: "History", value: "Tracked" },
        ]}
      />
      <FeatureSteps
        title="Pay a utility bill"
        steps={[
          {
            title: "Select utility type",
            detail: "Choose electricity (REG) or water (WASAC).",
          },
          {
            title: "Enter meter number",
            detail: "Your customer or meter ID from your last bill.",
          },
          {
            title: "Pay & save receipt",
            detail: "Payment is confirmed and logged in your bill history.",
          },
        ]}
      />
      <FeatureHighlights
        title="Utility services"
        items={[
          {
            title: "REG — Electricity",
            detail: "Prepaid and postpaid electricity tokens and bills.",
          },
          {
            title: "WASAC — Water",
            detail: "Monthly water bills for residential and commercial.",
          },
          {
            title: "Bill reminders",
            detail: "Get notified before your next due date.",
          },
        ]}
      />
      <FeatureInfoPanel
        title="Tips"
        lines={[
          "Save your meter number for faster payments next time.",
          "All utility payments count toward your monthly budget.",
          "Download receipts for landlord or tax records.",
        ]}
      />
      <FeatureActionList
        title="Pay now"
        actions={[
          {
            label: "Pay electricity (REG)",
            detail: "Add electricity bill",
            onPress: () =>
              router.push(featureRoutes.bills({ category: "electricity", add: true })),
          },
          {
            label: "Pay water (WASAC)",
            detail: "Add water bill",
            onPress: () =>
              router.push(featureRoutes.bills({ category: "water", add: true })),
          },
          {
            label: "View utility history",
            detail: "Past payments in bill manager",
            onPress: () => router.push(featureRoutes.bills()),
          },
        ]}
      />
      <FeatureActions
        actions={[
          {
            label: "Pay electricity bill",
            onPress: () =>
              router.push(featureRoutes.bills({ category: "electricity", add: true })),
          },
        ]}
      />
    </FeaturePageLayout>
  );
}

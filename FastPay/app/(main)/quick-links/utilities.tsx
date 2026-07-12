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
            detail: "Enter meter number",
            onPress: () => router.push("/bills"),
          },
          {
            label: "Pay water (WASAC)",
            detail: "Enter customer ID",
            onPress: () => router.push("/bills"),
          },
          {
            label: "View utility history",
            detail: "Past payments",
            onPress: () => router.push("/bills"),
          },
        ]}
      />
      <FeatureActions
        actions={[
          {
            label: "Pay utility bill",
            onPress: () => router.push("/bills"),
          },
        ]}
      />
    </FeaturePageLayout>
  );
}

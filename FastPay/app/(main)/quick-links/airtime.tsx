import { router } from "expo-router";
import { Wallet } from "lucide-react-native";

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

export default function AirtimeScreen() {
  return (
    <FeaturePageLayout
      title="Airtime"
      icon={Wallet}
      tag="TOP-UP"
      headline="Buy airtime instantly"
      description="Top up any MTN or Airtel number — for yourself or send airtime as a gift."
      accentColor="#FBBF24"
    >
      <FeatureStatRow
        stats={[
          { label: "Networks", value: "MTN + Airtel" },
          { label: "Delivery", value: "< 30 sec" },
          { label: "Min", value: "100 RWF" },
        ]}
      />
      <FeatureSteps
        title="Buy airtime"
        steps={[
          {
            title: "Choose network",
            detail: "MTN or Airtel — auto-detected from phone prefix.",
          },
          {
            title: "Pick amount",
            detail: "Select a bundle or enter a custom airtime value.",
          },
          {
            title: "Instant delivery",
            detail: "Airtime credited to the number immediately.",
          },
        ]}
      />
      <FeatureHighlights
        title="Popular bundles"
        items={[
          { title: "MTN 1,000 RWF", detail: "Voice + SMS bundle" },
          { title: "MTN 5,000 RWF", detail: "All-net minutes pack" },
          { title: "Airtel 2,000 RWF", detail: "Daily data + voice" },
          { title: "Airtel 10,000 RWF", detail: "Monthly mega bundle" },
        ]}
      />
      <FeatureInfoPanel
        title="Airtime tips"
        lines={[
          "Double-check the phone number before confirming.",
          "Gift airtime to any Rwandan number.",
          "Bundle purchases may include bonus data.",
          "All purchases appear in your transaction history.",
        ]}
      />
      <FeatureActionList
        title="Quick buy"
        actions={[
          {
            label: "MTN airtime",
            detail: "Top up any MTN number",
            onPress: () => router.push(featureRoutes.buy("mtn")),
          },
          {
            label: "Airtel airtime",
            detail: "Top up any Airtel number",
            onPress: () => router.push(featureRoutes.buy("airtel")),
          },
          {
            label: "Data bundles",
            detail: "Internet packages",
            onPress: () => router.push(featureRoutes.voucher),
          },
        ]}
      />
      <FeatureActions
        actions={[
          {
            label: "Buy MTN airtime",
            onPress: () => router.push(featureRoutes.buy("mtn")),
          },
          {
            label: "Buy Airtel airtime",
            onPress: () => router.push(featureRoutes.buy("airtel")),
            variant: "outline",
          },
        ]}
      />
    </FeaturePageLayout>
  );
}

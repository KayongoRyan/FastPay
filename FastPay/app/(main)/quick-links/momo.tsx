import { router } from "expo-router";
import { Smartphone } from "lucide-react-native";

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

export default function MomoScreen() {
  return (
    <FeaturePageLayout
      title="FastPay to MoMo"
      icon={Smartphone}
      tag="MOBILE MONEY"
      headline="Top up MTN or Airtel"
      description="Move money from your FastPay wallet to any Rwandan mobile money account in seconds."
      accentColor="#FACC15"
    >
      <FeatureStatRow
        stats={[
          { label: "Providers", value: "MTN + Airtel" },
          { label: "Delivery", value: "< 1 min" },
          { label: "Min", value: "500 RWF" },
        ]}
      />
      <FeatureSteps
        title="Top up MoMo"
        steps={[
          {
            title: "Pick provider",
            detail: "Choose MTN MoMo or Airtel Money.",
          },
          {
            title: "Enter phone & amount",
            detail: "Use your number or send to someone else.",
          },
          {
            title: "Confirm top-up",
            detail: "Funds appear on the MoMo account instantly.",
          },
        ]}
      />
      <FeatureHighlights
        title="MoMo features"
        items={[
          {
            title: "MTN MoMo",
            detail: "Top up any 2507XX XXX XXX MTN number.",
          },
          {
            title: "Airtel Money",
            detail: "Send to any Airtel Money wallet in Rwanda.",
          },
          {
            title: "Auto-fill phone",
            detail: "Your registered number is saved for quick sends.",
          },
        ]}
      />
      <FeatureInfoPanel
        title="Before you send"
        lines={[
          "Ensure the phone number is registered for mobile money.",
          "Amounts are in RWF — converted to USDT on your wallet.",
          "Failed top-ups are refunded within 24 hours.",
        ]}
      />
      <FeatureActionList
        title="Quick top-up"
        actions={[
          {
            label: "MTN MoMo top-up",
            detail: "Send to MTN mobile money",
            onPress: () => router.push(featureRoutes.buy("mtn")),
          },
          {
            label: "Airtel Money top-up",
            detail: "Send to Airtel wallet",
            onPress: () => router.push(featureRoutes.buy("airtel")),
          },
        ]}
      />
      <FeatureActions
        actions={[
          {
            label: "Top up now",
            onPress: () => router.push(featureRoutes.buy("mtn")),
          },
        ]}
      />
    </FeaturePageLayout>
  );
}

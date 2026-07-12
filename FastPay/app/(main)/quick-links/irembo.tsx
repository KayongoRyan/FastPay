import { router } from "expo-router";
import { Globe2 } from "lucide-react-native";

import {
  FeatureActionList,
  FeatureActions,
  FeatureHighlights,
  FeatureInfoPanel,
  FeaturePageLayout,
  FeatureStatRow,
  FeatureSteps,
} from "@/components/feature";

const IREMBO_SERVICES = [
  { name: "National ID application", fee: "From 5,000 RWF" },
  { name: "Birth certificate", fee: "2,000 RWF" },
  { name: "Police clearance", fee: "10,000 RWF" },
  { name: "Land title search", fee: "5,000 RWF" },
  { name: "Driving license renewal", fee: "15,000 RWF" },
];

export default function IremboScreen() {
  return (
    <FeaturePageLayout
      title="Irembo"
      icon={Globe2}
      tag="GOVERNMENT SERVICES"
      headline="Government services made easy"
      description="Pay for Irembo.gov.rw services — IDs, certificates, permits, and more — directly from FastPay."
      accentColor="#2DD4BF"
    >
      <FeatureStatRow
        stats={[
          { label: "Services", value: "50+" },
          { label: "Payment", value: "Instant" },
          { label: "Tracking", value: "In-app" },
        ]}
      />
      <FeatureSteps
        title="Use Irembo via FastPay"
        steps={[
          {
            title: "Browse services",
            detail: "Find the government service you need on Irembo.",
          },
          {
            title: "Pay with FastPay",
            detail: "Select FastPay as payment method at checkout.",
          },
          {
            title: "Track your application",
            detail: "Reference number saved in your transaction history.",
          },
        ]}
      />
      <FeatureHighlights
        title="Popular Irembo services"
        items={IREMBO_SERVICES.map((service) => ({
          title: service.name,
          detail: service.fee,
        }))}
      />
      <FeatureInfoPanel
        title="How it works"
        lines={[
          "Start your application on irembo.gov.rw",
          "Choose FastPay when prompted for payment",
          "Your receipt and reference are stored in-app",
          "Application status updates via SMS and email",
        ]}
      />
      <FeatureActionList
        title="Common services"
        actions={IREMBO_SERVICES.slice(0, 4).map((service) => ({
          label: service.name,
          detail: service.fee,
          onPress: () => router.push("/settings"),
        }))}
      />
      <FeatureActions
        actions={[
          {
            label: "Go to Irembo services",
            onPress: () => router.push("/settings"),
          },
        ]}
      />
    </FeaturePageLayout>
  );
}

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
import { featureRoutes } from "@/lib/navigation/feature-routes";

const IREMBO_SERVICES = [
  { id: "national-id" as const, name: "National ID application", fee: "5,000 RWF" },
  { id: "birth-certificate" as const, name: "Birth certificate", fee: "2,000 RWF" },
  { id: "police-clearance" as const, name: "Police clearance", fee: "10,000 RWF" },
  { id: "land-title" as const, name: "Land title search", fee: "5,000 RWF" },
  { id: "driving-license" as const, name: "Driving license renewal", fee: "15,000 RWF" },
];

export default function IremboQuickLinkScreen() {
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
            detail: "Find the government service you need.",
          },
          {
            title: "Pay with FastPay",
            detail: "Complete payment from your wallet.",
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
          "Select a service and pay the listed fee",
          "Your receipt and reference are stored in-app",
          "Application status updates via SMS and email",
        ]}
      />
      <FeatureActionList
        title="Common services"
        actions={IREMBO_SERVICES.map((service) => ({
          label: service.name,
          detail: service.fee,
          onPress: () => router.push(featureRoutes.iremboService(service.id)),
        }))}
      />
      <FeatureActions
        actions={[
          {
            label: "Browse Irembo services",
            onPress: () => router.push(featureRoutes.iremboService()),
          },
        ]}
      />
    </FeaturePageLayout>
  );
}

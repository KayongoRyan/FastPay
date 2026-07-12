import { router } from "expo-router";
import { Handshake } from "lucide-react-native";

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

export default function EscrowScreen() {
  return (
    <FeaturePageLayout
      title="Escrow"
      icon={Handshake}
      tag="SECURE DEALS"
      headline="Pay with confidence"
      description="Hold funds safely until goods are delivered or services are completed — protecting buyers and sellers."
      accentColor="#38BDF8"
    >
      <FeatureStatRow
        stats={[
          { label: "Protection", value: "100%" },
          { label: "Disputes", value: "Mediated" },
          { label: "Release", value: "On confirm" },
        ]}
      />
      <FeatureSteps
        title="How escrow works"
        steps={[
          {
            title: "Buyer funds escrow",
            detail: "Payment is locked in a secure holding account.",
          },
          {
            title: "Seller delivers",
            detail: "Goods or services are provided per agreed terms.",
          },
          {
            title: "Funds released",
            detail: "Buyer confirms — money moves to the seller instantly.",
          },
        ]}
      />
      <FeatureHighlights
        title="Escrow protections"
        items={[
          {
            title: "Dispute resolution",
            detail: "FastPay reviews evidence if either side raises a dispute.",
          },
          {
            title: "Milestone payments",
            detail: "Release funds in stages for large projects.",
          },
          {
            title: "Full audit trail",
            detail: "Every action is timestamped and stored.",
          },
        ]}
      />
      <FeatureInfoPanel
        title="Best for"
        lines={[
          "Online marketplace purchases",
          "Freelance and contract work",
          "Vehicle and property deposits",
          "Any deal where trust matters",
        ]}
      />
      <FeatureActionList
        title="Escrow actions"
        actions={[
          {
            label: "Create new escrow",
            detail: "Start a protected transaction",
            onPress: () => router.push(featureRoutes.walletTransfer),
          },
          {
            label: "View transaction history",
            detail: "Track pending deals",
            onPress: () => router.push(featureRoutes.analytics("cashflow")),
          },
        ]}
      />
      <FeatureActions
        actions={[
          {
            label: "Start escrow payment",
            onPress: () => router.push(featureRoutes.walletTransfer),
          },
        ]}
      />
    </FeaturePageLayout>
  );
}

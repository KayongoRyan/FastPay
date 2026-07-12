import { router } from "expo-router";
import { ArrowLeftRight } from "lucide-react-native";

import {
  FeatureActions,
  FeatureHighlights,
  FeatureInfoPanel,
  FeaturePageLayout,
  FeatureStatRow,
  FeatureSteps,
} from "@/components/feature";
import { featureRoutes } from "@/lib/navigation/feature-routes";

export default function FastPayTransferScreen() {
  return (
    <FeaturePageLayout
      title="FastPay to FastPay"
      icon={ArrowLeftRight}
      tag="WALLET TRANSFER"
      headline="Send to any FastPay user"
      description="Instant, free wallet-to-wallet transfers — just enter a phone number or wallet address."
      accentColor="#00AEEF"
    >
      <FeatureStatRow
        stats={[
          { label: "Fee", value: "Free" },
          { label: "Speed", value: "Instant" },
          { label: "Currencies", value: "RWF + USDT" },
        ]}
      />
      <FeatureSteps
        title="Send in seconds"
        steps={[
          {
            title: "Find recipient",
            detail: "Search by phone, name, or paste a wallet public key.",
          },
          {
            title: "Enter amount",
            detail: "Choose RWF or USDT and add an optional note.",
          },
          {
            title: "Send instantly",
            detail: "Recipient is notified immediately.",
          },
        ]}
      />
      <FeatureHighlights
        title="Why FastPay to FastPay"
        items={[
          {
            title: "Zero fees",
            detail: "No charge for wallet-to-wallet transfers.",
          },
          {
            title: "Request money",
            detail: "Send a payment request link to anyone.",
          },
          {
            title: "Saved contacts",
            detail: "Your frequent recipients are one tap away.",
          },
        ]}
      />
      <FeatureInfoPanel
        title="Transfer limits"
        lines={[
          "Unverified: 500,000 RWF/day",
          "KYC verified: 2,000,000 RWF/day",
          "Premium: 5,000,000 RWF/day",
        ]}
      />
      <FeatureActions
        actions={[
          {
            label: "Send money now",
            onPress: () => router.push(featureRoutes.walletTransfer),
          },
          {
            label: "Request payment",
            onPress: () => router.push(featureRoutes.walletReceive),
            variant: "outline",
          },
        ]}
      />
    </FeaturePageLayout>
  );
}

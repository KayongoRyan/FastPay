import { router } from "expo-router";
import { ArrowLeftRight } from "lucide-react-native";

import {
  FeatureActionList,
  FeatureActions,
  FeatureHighlights,
  FeaturePageLayout,
  FeatureStatRow,
  FeatureSteps,
} from "@/components/feature";
import { featureRoutes } from "@/lib/navigation/feature-routes";

export default function TransferServiceScreen() {
  return (
    <FeaturePageLayout
      title="Transfer"
      icon={ArrowLeftRight}
      tag="MONEY TRANSFER"
      headline="Send money instantly"
      description="Move funds to FastPay wallets, mobile money, or bank accounts with real-time tracking."
      accentColor="#00AEEF"
    >
      <FeatureStatRow
        stats={[
          { label: "Speed", value: "Instant" },
          { label: "Fee", value: "From 0 RWF" },
          { label: "Limit", value: "5M RWF/day" },
        ]}
      />
      <FeatureSteps
        title="How to transfer"
        steps={[
          {
            title: "Choose recipient",
            detail: "Enter a wallet address, phone number, or saved contact.",
          },
          {
            title: "Set amount & note",
            detail: "Pick RWF or USDT and add an optional payment reference.",
          },
          {
            title: "Confirm & send",
            detail: "Review details and authorize with your PIN.",
          },
        ]}
      />
      <FeatureHighlights
        title="Why use FastPay Transfer"
        items={[
          {
            title: "Saved beneficiaries",
            detail: "Store frequent recipients and send again in one tap.",
          },
          {
            title: "Payment receipts",
            detail: "Every transfer generates a shareable confirmation.",
          },
        ]}
      />
      <FeatureActionList
        title="Transfer options"
        actions={[
          {
            label: "FastPay to FastPay",
            detail: "Wallet-to-wallet, lowest fees",
            onPress: () => router.push(featureRoutes.walletTransfer),
          },
          {
            label: "FastPay to MoMo",
            detail: "Top up MTN or Airtel",
            onPress: () => router.push(featureRoutes.buy()),
          },
          {
            label: "Bank transfer",
            detail: "Send to any local bank account",
            onPress: () => router.push(featureRoutes.bankPay),
          },
        ]}
      />
      <FeatureActions
        actions={[
          {
            label: "Start a transfer",
            onPress: () => router.push(featureRoutes.walletTransfer),
          },
        ]}
      />
    </FeaturePageLayout>
  );
}

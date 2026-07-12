import { router } from "expo-router";
import { TicketPercent } from "lucide-react-native";

import {
  FeatureActions,
  FeatureHighlights,
  FeatureInfoPanel,
  FeaturePageLayout,
  FeatureStatRow,
  FeatureSteps,
} from "@/components/feature";

export default function VoucherServiceScreen() {
  return (
    <FeaturePageLayout
      title="Voucher"
      icon={TicketPercent}
      tag="VOUCHERS & TOP-UPS"
      headline="Buy vouchers and digital credit"
      description="Purchase airtime, data bundles, gaming cards, and merchant vouchers directly from your wallet."
      accentColor="#F59E0B"
    >
      <FeatureStatRow
        stats={[
          { label: "Providers", value: "12+" },
          { label: "Delivery", value: "< 30 sec" },
          { label: "Discounts", value: "Up to 5%" },
        ]}
      />
      <FeatureSteps
        title="How vouchers work"
        steps={[
          {
            title: "Pick a category",
            detail: "Choose airtime, data, gaming, or retail vouchers.",
          },
          {
            title: "Select value",
            detail: "Pick a preset amount or enter a custom voucher value.",
          },
          {
            title: "Receive instantly",
            detail: "Your code or top-up is delivered in-app immediately.",
          },
        ]}
      />
      <FeatureHighlights
        title="Popular vouchers"
        items={[
          {
            title: "Mobile airtime",
            detail: "MTN and Airtel top-ups for any Rwandan number.",
          },
          {
            title: "Data bundles",
            detail: "Daily, weekly, and monthly internet packages.",
          },
          {
            title: "Gift cards",
            detail: "Send digital gift value to friends and family.",
          },
        ]}
      />
      <FeatureInfoPanel
        title="Good to know"
        lines={[
          "Voucher purchases are non-refundable once delivered.",
          "Promo codes can be applied at checkout.",
          "All purchases appear in your transaction history.",
        ]}
      />
      <FeatureActions
        actions={[
          {
            label: "Browse vouchers",
            onPress: () => router.push("/quick-links/airtime"),
          },
          {
            label: "Buy MoMo top-up",
            onPress: () => router.push("/buy"),
            variant: "outline",
          },
        ]}
      />
    </FeaturePageLayout>
  );
}

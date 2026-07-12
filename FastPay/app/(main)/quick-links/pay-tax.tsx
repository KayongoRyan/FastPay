import { router } from "expo-router";
import { Receipt } from "lucide-react-native";

import {
  FeatureActionList,
  FeatureActions,
  FeatureHighlights,
  FeatureInfoPanel,
  FeaturePageLayout,
  FeatureStatRow,
  FeatureSteps,
} from "@/components/feature";

const TAX_TYPES = [
  { name: "Income tax (PAYE)", authority: "RRA" },
  { name: "VAT payment", authority: "RRA" },
  { name: "Property tax", authority: "Local gov" },
  { name: "Motor vehicle tax", authority: "RRA" },
];

export default function PayTaxScreen() {
  return (
    <FeaturePageLayout
      title="Pay Tax"
      icon={Receipt}
      tag="GOVERNMENT"
      headline="Pay taxes in minutes"
      description="Settle RRA income tax, VAT, and other government fees directly from your FastPay wallet."
      accentColor="#E879F9"
    >
      <FeatureStatRow
        stats={[
          { label: "Authority", value: "RRA" },
          { label: "Receipt", value: "Official" },
          { label: "History", value: "Stored" },
        ]}
      />
      <FeatureSteps
        title="Pay your tax"
        steps={[
          {
            title: "Select tax type",
            detail: "Income, VAT, property, or motor vehicle tax.",
          },
          {
            title: "Enter TIN & amount",
            detail: "Your Tax Identification Number and payment amount.",
          },
          {
            title: "Get official receipt",
            detail: "RRA confirmation stored in your bill history.",
          },
        ]}
      />
      <FeatureHighlights
        title="Tax categories"
        items={TAX_TYPES.map((tax) => ({
          title: tax.name,
          detail: `Paid via ${tax.authority}`,
        }))}
      />
      <FeatureInfoPanel
        title="Before paying"
        lines={[
          "Have your TIN (Tax Identification Number) ready.",
          "Cross-check amounts on your RRA assessment notice.",
          "Keep receipts for annual tax filing.",
          "Tax payments appear in your Analytics statement.",
        ]}
      />
      <FeatureActionList
        title="Pay tax now"
        actions={TAX_TYPES.map((tax) => ({
          label: tax.name,
          detail: `Pay via ${tax.authority}`,
          onPress: () => router.push("/bills"),
        }))}
      />
      <FeatureActions
        actions={[
          {
            label: "Pay tax",
            onPress: () => router.push("/bills"),
          },
          {
            label: "View tax history",
            onPress: () => router.push("/analytics"),
            variant: "outline",
          },
        ]}
      />
    </FeaturePageLayout>
  );
}

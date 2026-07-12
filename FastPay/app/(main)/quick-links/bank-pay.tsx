import { router } from "expo-router";
import { Building2 } from "lucide-react-native";

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

const BANKS = [
  { name: "Bank of Kigali", code: "BK" },
  { name: "Equity Bank", code: "EQB" },
  { name: "I&M Bank", code: "IM" },
  { name: "Cogebanque", code: "COG" },
];

export default function BankPayScreen() {
  return (
    <FeaturePageLayout
      title="Bank Pay"
      icon={Building2}
      tag="BANK TRANSFER"
      headline="Send to any bank account"
      description="Transfer money from FastPay directly to local bank accounts — fast, tracked, and secure."
      accentColor="#60A5FA"
    >
      <FeatureStatRow
        stats={[
          { label: "Banks", value: "15+" },
          { label: "Settlement", value: "Same day" },
          { label: "Fee", value: "500 RWF" },
        ]}
      />
      <FeatureSteps
        title="Send to a bank"
        steps={[
          {
            title: "Select your bank",
            detail: "Choose from all major Rwandan banks.",
          },
          {
            title: "Enter account details",
            detail: "Account number, name, and transfer amount.",
          },
          {
            title: "Confirm transfer",
            detail: "Funds arrive same business day.",
          },
        ]}
      />
      <FeatureHighlights
        title="Supported banks"
        items={BANKS.map((bank) => ({
          title: bank.name,
          detail: `Transfer to any ${bank.code} account holder`,
        }))}
      />
      <FeatureInfoPanel
        title="Transfer limits"
        lines={[
          "Minimum transfer: 1,000 RWF",
          "Maximum per transfer: 5,000,000 RWF",
          "KYC verification required for amounts over 500,000 RWF",
        ]}
      />
      <FeatureActionList
        title="Start transfer"
        actions={BANKS.map((bank) => ({
          label: bank.name,
          detail: "Open bank pay form",
          onPress: () => router.push(featureRoutes.bankPay),
        }))}
      />
      <FeatureActions
        actions={[
          {
            label: "New bank transfer",
            onPress: () => router.push(featureRoutes.bankPay),
          },
        ]}
      />
    </FeaturePageLayout>
  );
}

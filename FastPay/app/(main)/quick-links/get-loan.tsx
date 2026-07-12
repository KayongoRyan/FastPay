import { router } from "expo-router";
import { HandCoins } from "lucide-react-native";

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

const LOAN_TYPES = [
  { id: "personal" as const, name: "Personal loan", range: "50K – 2M RWF" },
  { id: "business" as const, name: "Business loan", range: "500K – 10M RWF" },
  { id: "salary" as const, name: "Salary advance", range: "Up to 1 month salary" },
];

export default function GetLoanScreen() {
  return (
    <FeaturePageLayout
      title="Get Loan"
      icon={HandCoins}
      tag="LENDING"
      headline="Borrow on your terms"
      description="Apply for personal, business, or salary advance loans — approved in minutes with wallet disbursement."
      accentColor="#F472B6"
    >
      <FeatureStatRow
        stats={[
          { label: "Approval", value: "< 5 min" },
          { label: "Disbursement", value: "Instant" },
          { label: "Partners", value: "4 lenders" },
        ]}
      />
      <FeatureSteps
        title="How to get a loan"
        steps={[
          {
            title: "Check eligibility",
            detail: "Based on your transaction history and KYC tier.",
          },
          {
            title: "Choose amount & term",
            detail: "Pick loan type, amount, and repayment period.",
          },
          {
            title: "Receive in wallet",
            detail: "Approved funds land in your FastPay balance instantly.",
          },
        ]}
      />
      <FeatureHighlights
        title="Loan products"
        items={LOAN_TYPES.map((loan) => ({
          title: loan.name,
          detail: loan.range,
        }))}
      />
      <FeatureInfoPanel
        title="Requirements"
        lines={[
          "KYC verification completed",
          "At least 3 months of wallet activity",
          "No outstanding defaults on previous loans",
          "Repayments auto-deducted on due dates",
        ]}
      />
      <FeatureActionList
        title="Apply for a loan"
        actions={LOAN_TYPES.map((loan) => ({
          label: loan.name,
          detail: loan.range,
          onPress: () => router.push(featureRoutes.loanApply(loan.id)),
        }))}
      />
      <FeatureActions
        actions={[
          {
            label: "Check my eligibility",
            onPress: () => router.push(featureRoutes.loanApply("personal")),
          },
        ]}
      />
    </FeaturePageLayout>
  );
}

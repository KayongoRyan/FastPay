import { router, useLocalSearchParams } from "expo-router";
import { useMemo, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { HandCoins } from "lucide-react-native";

import {
  FeaturePageLayout,
  FeatureActions,
  FeatureInfoPanel,
} from "@/components/feature";
import { Input } from "@/components/ui/Input";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { useHideTabBar } from "@/hooks/useHideTabBar";
import { featureRoutes, type LoanType } from "@/lib/navigation/feature-routes";
import { colors } from "@/theme/colors";
import { radius, spacing } from "@/theme/spacing";

const LOAN_LABELS: Record<LoanType, string> = {
  personal: "Personal loan",
  business: "Business loan",
  salary: "Salary advance",
};

export default function LoanApplyScreen() {
  useHideTabBar();
  const { type } = useLocalSearchParams<{ type?: string }>();
  const loanType = (type as LoanType) || "personal";

  const [amount, setAmount] = useState("");
  const [termMonths, setTermMonths] = useState("12");
  const [purpose, setPurpose] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const title = useMemo(
    () => LOAN_LABELS[loanType] ?? "Loan application",
    [loanType],
  );

  const handleSubmit = () => {
    if (!amount.trim()) {
      return;
    }
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <FeaturePageLayout
        title="Application sent"
        icon={HandCoins}
        tag="LOAN"
        headline="We are reviewing your application"
        description="You will receive a decision within 5 minutes. Approved funds go straight to your wallet."
        accentColor="#F472B6"
      >
        <FeatureInfoPanel
          title="What happens next"
          lines={[
            "Check your notifications for approval status.",
            "If approved, funds appear in your FastPay wallet.",
            "Repayments are auto-scheduled on your due dates.",
          ]}
        />
        <FeatureActions
          actions={[
            {
              label: "Go to wallet",
              onPress: () => router.push(featureRoutes.wallet),
            },
            {
              label: "View statement",
              onPress: () => router.push(featureRoutes.analytics("cashflow")),
              variant: "outline",
            },
          ]}
        />
      </FeaturePageLayout>
    );
  }

  return (
    <FeaturePageLayout
      title={title}
      icon={HandCoins}
      tag="APPLY NOW"
      headline={`Apply for a ${title.toLowerCase()}`}
      description="Fill in the details below. Eligibility is based on your wallet history and KYC tier."
      accentColor="#F472B6"
    >
      <View style={styles.form}>
        <Input
          label="Amount (RWF)"
          value={amount}
          onChangeText={setAmount}
          keyboardType="numeric"
          placeholder="50000"
        />
        <Input
          label="Term (months)"
          value={termMonths}
          onChangeText={setTermMonths}
          keyboardType="numeric"
          placeholder="12"
        />
        <Input
          label="Purpose"
          value={purpose}
          onChangeText={setPurpose}
          placeholder="What will you use this loan for?"
        />
        <PrimaryButton label="Submit application" onPress={handleSubmit} />
      </View>
    </FeaturePageLayout>
  );
}

const styles = StyleSheet.create({
  form: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.md,
    backgroundColor: colors.inputBg,
    marginBottom: spacing.lg,
  },
});

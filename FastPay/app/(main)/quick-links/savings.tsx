import { router } from "expo-router";
import { PiggyBank } from "lucide-react-native";

import {
  FeatureActionList,
  FeatureActions,
  FeatureHighlights,
  FeatureInfoPanel,
  FeaturePageLayout,
  FeatureStatRow,
  FeatureSteps,
} from "@/components/feature";

export default function SavingsScreen() {
  return (
    <FeaturePageLayout
      title="Open Savings"
      icon={PiggyBank}
      tag="SAVE MONEY"
      headline="Start saving today"
      description="Open a savings pot, set goals, and earn visibility on your progress — from emergency funds to family plans."
      accentColor="#4ADE80"
    >
      <FeatureStatRow
        stats={[
          { label: "Min deposit", value: "1,000 RWF" },
          { label: "Goals", value: "Unlimited" },
          { label: "Lock option", value: "15–30 yrs" },
        ]}
      />
      <FeatureSteps
        title="Open your first savings pot"
        steps={[
          {
            title: "Choose a savings type",
            detail: "Flexible savings, locked goal, or family plan.",
          },
          {
            title: "Set your target",
            detail: "Name it, set an amount, and pick a deadline.",
          },
          {
            title: "Start contributing",
            detail: "Add manually or allocate a % of your income in Budget.",
          },
        ]}
      />
      <FeatureHighlights
        title="Savings options"
        items={[
          {
            title: "Flexible savings",
            detail: "Withdraw anytime — ideal for emergency funds.",
          },
          {
            title: "Goal-based savings",
            detail: "Short and long-term targets with progress tracking.",
          },
          {
            title: "Family Plan",
            detail: "Lock children's savings for 15, 20, 25, or 30 years.",
          },
        ]}
      />
      <FeatureInfoPanel
        title="Getting started"
        lines={[
          "No minimum balance to keep a savings pot open.",
          "Link savings to your monthly budget allocation.",
          "View all goals in Analytics → Goals tab.",
        ]}
      />
      <FeatureActionList
        title="Savings actions"
        actions={[
          {
            label: "Create a savings goal",
            detail: "Set a target and deadline",
            onPress: () => router.push("/analytics"),
          },
          {
            label: "Family Plan savings",
            detail: "Long-term children's funds",
            onPress: () => router.push("/analytics"),
          },
          {
            label: "View wallet balance",
            detail: "Check available funds",
            onPress: () => router.push("/wallet"),
          },
        ]}
      />
      <FeatureActions
        actions={[
          {
            label: "Open savings goal",
            onPress: () => router.push("/analytics"),
          },
        ]}
      />
    </FeaturePageLayout>
  );
}

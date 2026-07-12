import { router } from "expo-router";
import { PiggyBank } from "lucide-react-native";

import {
  FeatureActions,
  FeatureHighlights,
  FeatureInfoPanel,
  FeaturePageLayout,
  FeatureStatRow,
  FeatureSteps,
} from "@/components/feature";

export default function SavingsGoalScreen() {
  return (
    <FeaturePageLayout
      title="Savings Goal"
      icon={PiggyBank}
      tag="SAVE & GROW"
      headline="Turn goals into plans"
      description="Set targets, contribute on schedule, and watch your progress — from emergencies to big purchases."
      accentColor="#4ADE80"
    >
      <FeatureStatRow
        stats={[
          { label: "Goal types", value: "Short + Long" },
          { label: "Auto-save", value: "Weekly" },
          { label: "Family plan", value: "Included" },
        ]}
      />
      <FeatureSteps
        title="Build your savings plan"
        steps={[
          {
            title: "Name your goal",
            detail: "Emergency fund, school fees, new phone — anything you need.",
          },
          {
            title: "Set a target & deadline",
            detail: "Choose how much you need and when you want to reach it.",
          },
          {
            title: "Contribute & track",
            detail: "Add money manually or schedule automatic contributions.",
          },
        ]}
      />
      <FeatureHighlights
        title="Savings tools"
        items={[
          {
            title: "Short & long-term goals",
            detail: "Separate quick wins from multi-year targets.",
          },
          {
            title: "Family Plan savings",
            detail: "Lock children's funds for 15–30 years with a timeline.",
          },
          {
            title: "Budget integration",
            detail: "Your savings % is built into your monthly budget.",
          },
        ]}
      />
      <FeatureInfoPanel
        title="Tips for success"
        lines={[
          "Start with one achievable short-term goal.",
          "Use Analytics Budget to allocate a savings percentage.",
          "Celebrate milestones when you hit 25%, 50%, and 100%.",
        ]}
      />
      <FeatureActions
        actions={[
          {
            label: "Open savings goals",
            onPress: () => router.push("/analytics"),
          },
          {
            label: "Set up family plan",
            onPress: () => router.push("/analytics"),
            variant: "outline",
          },
        ]}
      />
    </FeaturePageLayout>
  );
}

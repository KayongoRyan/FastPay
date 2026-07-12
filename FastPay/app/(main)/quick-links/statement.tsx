import { router } from "expo-router";
import { FileText } from "lucide-react-native";

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

export default function StatementScreen() {
  return (
    <FeaturePageLayout
      title="Statement"
      icon={FileText}
      tag="ACCOUNT HISTORY"
      headline="Your full financial picture"
      description="View income, expenses, transfers, and bills — filter by week, month, or custom range."
      accentColor="#818CF8"
    >
      <FeatureStatRow
        stats={[
          { label: "History", value: "12 months" },
          { label: "Export", value: "PDF/CSV" },
          { label: "Categories", value: "Auto" },
        ]}
      />
      <FeatureSteps
        title="Use your statement"
        steps={[
          {
            title: "Open Analytics",
            detail: "See cash flow, budget, and goals in one dashboard.",
          },
          {
            title: "Filter by period",
            detail: "Switch between weekly and monthly views.",
          },
          {
            title: "Export or share",
            detail: "Download a PDF statement for any date range.",
          },
        ]}
      />
      <FeatureHighlights
        title="What's included"
        items={[
          {
            title: "Cash flow breakdown",
            detail: "Income, expenses, and net position per period.",
          },
          {
            title: "Transaction log",
            detail: "Every wallet, bill, and MoMo payment listed.",
          },
          {
            title: "Budget vs actual",
            detail: "Compare your plan against real spending.",
          },
        ]}
      />
      <FeatureInfoPanel
        title="Statement types"
        lines={[
          "Weekly cash flow summary",
          "Monthly budget report",
          "Annual tax summary (for RRA)",
          "Custom date range export",
        ]}
      />
      <FeatureActionList
        title="View reports"
        actions={[
          {
            label: "Cash flow",
            detail: "Income & expenses this week",
            onPress: () => router.push(featureRoutes.analytics("cashflow")),
          },
          {
            label: "Budget overview",
            detail: "Planned vs actual spending",
            onPress: () => router.push(featureRoutes.analytics("budget")),
          },
          {
            label: "Savings goals",
            detail: "Track your progress",
            onPress: () => router.push(featureRoutes.analytics("goals")),
          },
        ]}
      />
      <FeatureActions
        actions={[
          {
            label: "Open Analytics",
            onPress: () => router.push(featureRoutes.analytics("cashflow")),
          },
        ]}
      />
    </FeaturePageLayout>
  );
}

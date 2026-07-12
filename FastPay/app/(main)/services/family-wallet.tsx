import { router } from "expo-router";
import { Users } from "lucide-react-native";

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

export default function FamilyWalletScreen() {
  return (
    <FeaturePageLayout
      title="Family Wallet"
      icon={Users}
      tag="SHARED FINANCE"
      headline="One wallet for the whole family"
      description="Pool money, set spending rules, and approve payments together — built for households."
      accentColor="#A78BFA"
    >
      <FeatureStatRow
        stats={[
          { label: "Members", value: "Up to 8" },
          { label: "Roles", value: "3 types" },
          { label: "Approvals", value: "Real-time" },
        ]}
      />
      <FeatureSteps
        title="Set up your family wallet"
        steps={[
          {
            title: "Create a family group",
            detail: "Name your wallet and choose who can spend or only view.",
          },
          {
            title: "Invite members",
            detail: "Send invites by phone. Parents approve, kids get limits.",
          },
          {
            title: "Set rules & limits",
            detail: "Daily caps, category blocks, and approval thresholds.",
          },
        ]}
      />
      <FeatureHighlights
        title="Family features"
        items={[
          {
            title: "Parent approvals",
            detail: "Payments above your limit wait for a parent to confirm.",
          },
          {
            title: "Allowance schedules",
            detail: "Auto-send weekly pocket money to children.",
          },
          {
            title: "Shared visibility",
            detail: "Everyone sees balances; only admins can change rules.",
          },
        ]}
      />
      <FeatureInfoPanel
        title="Member roles"
        lines={[
          "Admin — full control, invites, and limits",
          "Spender — can pay within assigned limits",
          "Viewer — read-only access to family activity",
        ]}
      />
      <FeatureActionList
        title="Family actions"
        actions={[
          {
            label: "Create family wallet",
            detail: "Set up your household group",
            onPress: () => router.push(featureRoutes.familySetup),
          },
          {
            label: "View family budget",
            detail: "Track household spending",
            onPress: () => router.push(featureRoutes.analytics("budget")),
          },
        ]}
      />
      <FeatureActions
        actions={[
          {
            label: "Create family wallet",
            onPress: () => router.push(featureRoutes.familySetup),
          },
        ]}
      />
    </FeaturePageLayout>
  );
}

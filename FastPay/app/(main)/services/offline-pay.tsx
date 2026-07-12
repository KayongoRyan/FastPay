import { router } from "expo-router";
import { WifiOff } from "lucide-react-native";

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

export default function OfflinePayScreen() {
  return (
    <FeaturePageLayout
      title="Offline Pay"
      icon={WifiOff}
      tag="NO INTERNET NEEDED"
      headline="Pay without connectivity"
      description="Use QR codes and NFC tap-to-pay when you're offline — syncs automatically when you're back online."
      accentColor="#FB923C"
    >
      <FeatureStatRow
        stats={[
          { label: "Methods", value: "QR + NFC" },
          { label: "Offline limit", value: "50K RWF" },
          { label: "Sync", value: "Automatic" },
        ]}
      />
      <FeatureSteps
        title="How offline pay works"
        steps={[
          {
            title: "Generate your code",
            detail: "Create a one-time QR or enable NFC before going offline.",
          },
          {
            title: "Merchant scans or taps",
            detail: "Payment is authorized locally on your device.",
          },
          {
            title: "Auto-sync later",
            detail: "Transaction settles when your phone reconnects.",
          },
        ]}
      />
      <FeatureHighlights
        title="Offline features"
        items={[
          {
            title: "QR receive codes",
            detail: "Show a scannable code for merchants without internet.",
          },
          {
            title: "NFC tap-to-pay",
            detail: "Tap your phone on supported POS terminals.",
          },
          {
            title: "Queued transactions",
            detail: "Pending payments show in your wallet until synced.",
          },
        ]}
      />
      <FeatureInfoPanel
        title="Important"
        lines={[
          "Offline limit is 50,000 RWF per transaction.",
          "You need at least one online session every 7 days.",
          "KYC verification required for offline payments.",
          "Funds are reserved on your device until sync completes.",
        ]}
      />
      <FeatureActionList
        title="Offline actions"
        actions={[
          {
            label: "Generate offline QR",
            detail: "Create a receive code now",
            onPress: () => router.push(featureRoutes.walletReceive),
          },
          {
            label: "Relay offline payment",
            detail: "Scan and sync when back online",
            onPress: () => router.push(featureRoutes.offlineReceive),
          },
        ]}
      />
      <FeatureActions
        actions={[
          {
            label: "Set up offline pay",
            onPress: () => router.push(featureRoutes.walletReceive),
          },
        ]}
      />
    </FeaturePageLayout>
  );
}

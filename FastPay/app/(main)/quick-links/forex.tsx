import { router } from "expo-router";
import { TrendingUp } from "lucide-react-native";

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

const RATES = [
  { pair: "USD / RWF", rate: "1,380.50", change: "+0.12%" },
  { pair: "EUR / RWF", rate: "1,495.20", change: "-0.08%" },
  { pair: "GBP / RWF", rate: "1,742.80", change: "+0.25%" },
  { pair: "USDT / RWF", rate: "1,382.00", change: "+0.05%" },
];

export default function ForexScreen() {
  return (
    <FeaturePageLayout
      title="Forex"
      icon={TrendingUp}
      tag="CURRENCY EXCHANGE"
      headline="Convert at live rates"
      description="Exchange RWF, USD, EUR, and USDT at competitive rates — right inside your wallet."
      accentColor="#A3E635"
    >
      <FeatureStatRow
        stats={[
          { label: "Pairs", value: "8+" },
          { label: "Spread", value: "Low" },
          { label: "Settlement", value: "Instant" },
        ]}
      />
      <FeatureSteps
        title="Exchange currency"
        steps={[
          {
            title: "Pick currencies",
            detail: "Select what you're converting from and to.",
          },
          {
            title: "See live rate",
            detail: "Rate updates in real time before you confirm.",
          },
          {
            title: "Convert instantly",
            detail: "Funds swap in your wallet immediately.",
          },
        ]}
      />
      <FeatureHighlights
        title="Live rates"
        items={RATES.map((item) => ({
          title: `${item.pair} — ${item.rate}`,
          detail: `24h change: ${item.change}`,
        }))}
      />
      <FeatureInfoPanel
        title="Forex notes"
        lines={[
          "Rates refresh every 60 seconds.",
          "No fee on RWF ↔ USDT conversions under 1M RWF.",
          "Large conversions may require KYC verification.",
          "Rate history available in Analytics.",
        ]}
      />
      <FeatureActionList
        title="Quick convert"
        actions={[
          {
            label: "RWF to USDT",
            detail: "Most popular pair",
            onPress: () => router.push(featureRoutes.convert),
          },
          {
            label: "USDT to RWF",
            detail: "Cash out to local currency",
            onPress: () => router.push(featureRoutes.convert),
          },
          {
            label: "View rate history",
            detail: "Past 30 days",
            onPress: () => router.push(featureRoutes.analytics("cashflow")),
          },
        ]}
      />
      <FeatureActions
        actions={[
          {
            label: "Convert now",
            onPress: () => router.push(featureRoutes.convert),
          },
        ]}
      />
    </FeaturePageLayout>
  );
}

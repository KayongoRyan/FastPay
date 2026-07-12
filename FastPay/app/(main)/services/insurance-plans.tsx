import { router, useLocalSearchParams } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import { ShieldCheck } from "lucide-react-native";

import {
  FeaturePageLayout,
  FeatureActions,
  FeatureHighlights,
} from "@/components/feature";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { useHideTabBar } from "@/hooks/useHideTabBar";
import {
  featureRoutes,
  type InsurancePlanType,
} from "@/lib/navigation/feature-routes";
import { colors } from "@/theme/colors";
import { radius, spacing } from "@/theme/spacing";

const PLANS: Record<
  InsurancePlanType,
  { name: string; price: string; coverage: string }
> = {
  health: {
    name: "Health Basic",
    price: "15,000 RWF/mo",
    coverage: "Outpatient + emergency visits",
  },
  motor: {
    name: "Motor Cover",
    price: "45,000 RWF/mo",
    coverage: "Third-party liability + theft",
  },
  device: {
    name: "Device Shield",
    price: "8,000 RWF/mo",
    coverage: "Phone and laptop damage",
  },
};

export default function InsurancePlansScreen() {
  useHideTabBar();
  const { plan } = useLocalSearchParams<{ plan?: string }>();
  const planType = plan as InsurancePlanType | undefined;
  const selected = planType ? PLANS[planType] : null;

  return (
    <FeaturePageLayout
      title="Insurance Plans"
      icon={ShieldCheck}
      tag="COVERAGE"
      headline={selected ? selected.name : "Compare insurance plans"}
      description={
        selected
          ? `${selected.price} — ${selected.coverage}`
          : "Select a plan type to see pricing and subscribe from your wallet."
      }
      accentColor="#34D399"
    >
      {!selected ? (
        <FeatureHighlights
          title="Available plans"
          items={Object.entries(PLANS).map(([id, item]) => ({
            title: `${item.name} — ${item.price}`,
            detail: item.coverage,
          }))}
        />
      ) : null}

      <View style={styles.planActions}>
        {(Object.keys(PLANS) as InsurancePlanType[]).map((id) => (
          <PrimaryButton
            key={id}
            label={PLANS[id].name}
            onPress={() => router.push(featureRoutes.insurancePlans(id))}
          />
        ))}
      </View>

      {selected ? (
        <FeatureActions
          actions={[
            {
              label: `Subscribe — ${selected.price}`,
              onPress: () => router.push(featureRoutes.bills({ add: true })),
            },
            {
              label: "View my policies",
              onPress: () => router.push(featureRoutes.analytics("cashflow")),
              variant: "outline",
            },
          ]}
        />
      ) : null}
    </FeaturePageLayout>
  );
}

const styles = StyleSheet.create({
  planActions: {
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
});

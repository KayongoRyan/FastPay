import { router, useLocalSearchParams } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { ChevronRight, Globe2 } from "lucide-react-native";

import { FeaturePageLayout, FeatureActions } from "@/components/feature";
import { useHideTabBar } from "@/hooks/useHideTabBar";
import {
  featureRoutes,
  type IremboServiceId,
} from "@/lib/navigation/feature-routes";
import { colors } from "@/theme/colors";
import { radius, spacing } from "@/theme/spacing";

const SERVICES: {
  id: IremboServiceId;
  name: string;
  fee: string;
  detail: string;
}[] = [
  {
    id: "national-id",
    name: "National ID application",
    fee: "5,000 RWF",
    detail: "New or replacement ID card",
  },
  {
    id: "birth-certificate",
    name: "Birth certificate",
    fee: "2,000 RWF",
    detail: "Official copy for records",
  },
  {
    id: "police-clearance",
    name: "Police clearance",
    fee: "10,000 RWF",
    detail: "Certificate of good conduct",
  },
  {
    id: "land-title",
    name: "Land title search",
    fee: "5,000 RWF",
    detail: "Property ownership verification",
  },
  {
    id: "driving-license",
    name: "Driving license renewal",
    fee: "15,000 RWF",
    detail: "Renew or replace license",
  },
];

export default function IremboScreen() {
  useHideTabBar();
  const { service } = useLocalSearchParams<{ service?: string }>();
  const selected = SERVICES.find((item) => item.id === service);

  return (
    <FeaturePageLayout
      title="Irembo"
      icon={Globe2}
      tag="GOVERNMENT"
      headline={selected ? selected.name : "Choose a government service"}
      description={
        selected
          ? `Pay ${selected.fee} via FastPay and track your application on Irembo.`
          : "Select the service you need, then pay securely through FastPay."
      }
      accentColor="#2DD4BF"
    >
      <View style={styles.list}>
        {SERVICES.map((item, index) => (
          <Pressable
            key={item.id}
            style={[
              styles.row,
              index < SERVICES.length - 1 && styles.rowDivider,
              service === item.id && styles.rowSelected,
            ]}
            onPress={() => router.push(featureRoutes.iremboService(item.id))}
          >
            <View style={styles.rowText}>
              <Text style={styles.rowTitle}>{item.name}</Text>
              <Text style={styles.rowDetail}>
                {item.fee} · {item.detail}
              </Text>
            </View>
            <ChevronRight color={colors.textMuted} size={18} />
          </Pressable>
        ))}
      </View>

      {selected ? (
        <FeatureActions
          actions={[
            {
              label: `Pay ${selected.fee}`,
              onPress: () =>
                router.push(featureRoutes.bills({ add: true })),
            },
            {
              label: "View payment history",
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
  list: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: colors.inputBg,
    overflow: "hidden",
    marginBottom: spacing.lg,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.md,
    gap: spacing.sm,
  },
  rowDivider: {
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.08)",
  },
  rowSelected: {
    backgroundColor: "rgba(45,212,191,0.1)",
  },
  rowText: {
    flex: 1,
  },
  rowTitle: {
    color: colors.white,
    fontSize: 15,
    fontWeight: "500",
  },
  rowDetail: {
    color: colors.textMuted,
    fontSize: 12,
    marginTop: 2,
  },
});

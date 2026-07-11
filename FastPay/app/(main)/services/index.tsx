import { StyleSheet, Text } from "react-native";

import { TabScreenLayout } from "@/components/layout/TabScreenLayout";
import { ServiceIconGrid } from "@/components/services";
import { BackHeader } from "@/components/ui/BackHeader";
import { useHideTabBar } from "@/hooks/useHideTabBar";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { MORE_PAGE_SERVICES } from "@/lib/services/data";
import { colors } from "@/theme/colors";
import { spacing } from "@/theme/spacing";

export default function MoreServicesScreen() {
  useRequireAuth();
  useHideTabBar();

  return (
    <TabScreenLayout>
      <BackHeader title="More Services" />
      <Text style={styles.subtitle}>
        Transfer, vouchers, bills, family wallets, savings, escrow, insurance,
        compliance, KYC, and offline payments.
      </Text>
      <ServiceIconGrid services={MORE_PAGE_SERVICES} variant="list" />
    </TabScreenLayout>
  );
}

const styles = StyleSheet.create({
  subtitle: {
    color: colors.textMuted,
    fontSize: 15,
    lineHeight: 22,
    marginBottom: spacing.lg,
  },
});

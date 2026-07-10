import { TabScreenLayout } from "@/components/layout/TabScreenLayout";
import { QuickLinkGrid } from "@/components/quickLinks";
import { BackHeader } from "@/components/ui/BackHeader";
import { useHideTabBar } from "@/hooks/useHideTabBar";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import {
  MORE_FEATURE_LINKS,
  PINNED_QUICK_LINKS,
} from "@/lib/quick-links/data";
import { colors } from "@/theme/colors";
import { spacing } from "@/theme/spacing";
import { StyleSheet, Text } from "react-native";

export default function QuickLinksScreen() {
  useRequireAuth();
  useHideTabBar();

  return (
    <TabScreenLayout>
      <BackHeader title="Quick Links" />

      <Text style={styles.sectionTitle}>Pinned Features</Text>
      <QuickLinkGrid links={PINNED_QUICK_LINKS} columns={4} />

      <Text style={styles.sectionTitle}>More Features</Text>
      <QuickLinkGrid links={MORE_FEATURE_LINKS} columns={4} />
    </TabScreenLayout>
  );
}

const styles = StyleSheet.create({
  sectionTitle: {
    color: colors.white,
    fontSize: 17,
    fontWeight: "600",
    marginTop: spacing.md,
    marginBottom: spacing.md,
  },
});

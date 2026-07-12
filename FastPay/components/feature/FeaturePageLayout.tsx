import { ReactNode } from "react";
import { StyleSheet, Text, View } from "react-native";
import type { LucideIcon } from "lucide-react-native";

import { TabScreenLayout } from "@/components/layout/TabScreenLayout";
import { BackHeader } from "@/components/ui/BackHeader";
import { useHideTabBar } from "@/hooks/useHideTabBar";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { colors } from "@/theme/colors";
import { radius, spacing } from "@/theme/spacing";

interface FeaturePageLayoutProps {
  title: string;
  icon: LucideIcon;
  tag: string;
  headline: string;
  description: string;
  accentColor?: string;
  children?: ReactNode;
}

export function FeaturePageLayout({
  title,
  icon: Icon,
  tag,
  headline,
  description,
  accentColor = colors.primary,
  children,
}: FeaturePageLayoutProps) {
  useRequireAuth();
  useHideTabBar();

  return (
    <TabScreenLayout>
      <BackHeader title={title} />
      <View style={styles.hero}>
        <View style={[styles.iconWrap, { borderColor: `${accentColor}55` }]}>
          <Icon color={accentColor} size={30} />
        </View>
        <Text style={[styles.tag, { color: accentColor }]}>{tag}</Text>
        <Text style={styles.headline}>{headline}</Text>
        <Text style={styles.description}>{description}</Text>
      </View>
      {children}
    </TabScreenLayout>
  );
}

const styles = StyleSheet.create({
  hero: {
    alignItems: "center",
    marginTop: spacing.md,
    marginBottom: spacing.lg,
    gap: spacing.sm,
  },
  iconWrap: {
    width: 76,
    height: 76,
    borderRadius: 38,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.inputBg,
    marginBottom: spacing.xs,
  },
  tag: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1.4,
  },
  headline: {
    color: colors.white,
    fontSize: 22,
    fontWeight: "700",
    textAlign: "center",
    paddingHorizontal: spacing.md,
  },
  description: {
    color: colors.textMuted,
    fontSize: 15,
    lineHeight: 22,
    textAlign: "center",
    paddingHorizontal: spacing.lg,
  },
});

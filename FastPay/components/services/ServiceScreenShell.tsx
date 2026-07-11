import { ReactNode } from "react";
import { StyleSheet, Text, View } from "react-native";
import type { LucideIcon } from "lucide-react-native";

import { TabScreenLayout } from "@/components/layout/TabScreenLayout";
import { BackHeader } from "@/components/ui/BackHeader";
import { useHideTabBar } from "@/hooks/useHideTabBar";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { colors } from "@/theme/colors";
import { radius, spacing } from "@/theme/spacing";

interface ServiceScreenShellProps {
  title: string;
  icon: LucideIcon;
  description: string;
  features: string[];
  children?: ReactNode;
}

export function ServiceScreenShell({
  title,
  icon: Icon,
  description,
  features,
  children,
}: ServiceScreenShellProps) {
  useRequireAuth();
  useHideTabBar();

  return (
    <TabScreenLayout>
      <BackHeader title={title} />
      <View style={styles.hero}>
        <View style={styles.iconWrap}>
          <Icon color={colors.white} size={28} />
        </View>
        <Text style={styles.tag}>SERVICE</Text>
        <Text style={styles.description}>{description}</Text>
      </View>
      <View style={styles.card}>
        {features.map((feature) => (
          <Text key={feature} style={styles.feature}>
            • {feature}
          </Text>
        ))}
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
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.inputBg,
    marginBottom: spacing.xs,
  },
  tag: {
    color: colors.primary,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1.2,
  },
  description: {
    color: colors.textMuted,
    fontSize: 15,
    lineHeight: 22,
    textAlign: "center",
    paddingHorizontal: spacing.md,
  },
  card: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.md,
    backgroundColor: colors.inputBg,
    gap: spacing.sm,
  },
  feature: {
    color: colors.white,
    fontSize: 14,
    lineHeight: 20,
  },
});

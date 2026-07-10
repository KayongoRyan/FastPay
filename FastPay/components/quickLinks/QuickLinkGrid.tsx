import { Href, router } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";

import type { QuickLinkItem } from "@/lib/quick-links/data";
import { getQuickLinkLabel } from "@/lib/quick-links/data";
import { colors } from "@/theme/colors";
import { spacing } from "@/theme/spacing";

interface QuickLinkTileProps {
  link: QuickLinkItem;
  useShortLabel?: boolean;
  variant?: "grid" | "row";
}

export function QuickLinkTile({
  link,
  useShortLabel = false,
  variant = "grid",
}: QuickLinkTileProps) {
  const Icon = link.icon;
  const label = getQuickLinkLabel(link, useShortLabel);
  const isRow = variant === "row";

  return (
    <Pressable
      style={[styles.tile, isRow && styles.tileRow]}
      onPress={() => router.push(link.href as Href)}
    >
      <View style={styles.iconWrap}>
        <Icon color={colors.white} size={22} />
      </View>
      <Text style={[styles.label, isRow && styles.labelRow]} numberOfLines={2}>
        {label}
      </Text>
    </Pressable>
  );
}

interface QuickLinkGridProps {
  links: QuickLinkItem[];
  useShortLabel?: boolean;
  columns?: number;
  variant?: "grid" | "row";
}

export function QuickLinkGrid({
  links,
  useShortLabel = false,
  columns = 4,
  variant = "grid",
}: QuickLinkGridProps) {
  if (variant === "row") {
    return (
      <View style={styles.row}>
        {links.map((link) => (
          <QuickLinkTile
            key={link.id}
            link={link}
            useShortLabel={useShortLabel}
            variant="row"
          />
        ))}
      </View>
    );
  }

  const width = `${100 / columns}%` as `${number}%`;

  return (
    <View style={styles.grid}>
      {links.map((link) => (
        <View key={link.id} style={[styles.cell, { width }]}>
          <QuickLinkTile link={link} useShortLabel={useShortLabel} variant="grid" />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  cell: {
    paddingHorizontal: 4,
    marginBottom: spacing.md,
  },
  tile: {
    alignItems: "center",
    gap: spacing.sm,
  },
  tileRow: {
    width: "22%",
    gap: spacing.sm,
  },
  iconWrap: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.inputBg,
  },
  label: {
    color: colors.textMuted,
    fontSize: 12,
    textAlign: "center",
    lineHeight: 16,
  },
  labelRow: {
    fontSize: 12,
    lineHeight: 15,
  },
});

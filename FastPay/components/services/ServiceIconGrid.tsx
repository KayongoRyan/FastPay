import { Href, router } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { ChevronRight } from "lucide-react-native";

import {
  getServiceLabel,
  type ServiceItem,
} from "@/lib/services/data";
import { colors } from "@/theme/colors";
import { radius, spacing } from "@/theme/spacing";

interface ServiceIconGridProps {
  services: ServiceItem[];
  variant?: "row" | "grid" | "list";
  columns?: number;
  useShortLabel?: boolean;
  onServicePress?: (service: ServiceItem) => void;
}

export function ServiceIconGrid({
  services,
  variant = "grid",
  columns = 4,
  useShortLabel = false,
  onServicePress,
}: ServiceIconGridProps) {
  const handlePress = (service: ServiceItem) => {
    if (onServicePress) {
      onServicePress(service);
      return;
    }
    if (service.href) {
      router.push(service.href as Href);
    }
  };

  if (variant === "row") {
    return (
      <View style={styles.row}>
        {services.map((service) => (
          <ServiceTile
            key={service.id}
            service={service}
            useShortLabel={useShortLabel}
            variant="row"
            onPress={() => handlePress(service)}
          />
        ))}
      </View>
    );
  }

  if (variant === "list") {
    return (
      <View style={styles.list}>
        {services.map((service, index) => (
          <ServiceListRow
            key={service.id}
            service={service}
            useShortLabel={useShortLabel}
            isLast={index === services.length - 1}
            onPress={() => handlePress(service)}
          />
        ))}
      </View>
    );
  }

  const width = `${100 / columns}%` as `${number}%`;

  return (
    <View style={styles.grid}>
      {services.map((service) => (
        <View key={service.id} style={[styles.cell, { width }]}>
          <ServiceTile
            service={service}
            useShortLabel={useShortLabel}
            variant="grid"
            onPress={() => handlePress(service)}
          />
        </View>
      ))}
    </View>
  );
}

function ServiceTile({
  service,
  useShortLabel,
  variant,
  onPress,
}: {
  service: ServiceItem;
  useShortLabel: boolean;
  variant: "row" | "grid";
  onPress: () => void;
}) {
  const Icon = service.icon;
  const label = getServiceLabel(service, useShortLabel);
  const isRow = variant === "row";

  return (
    <Pressable
      style={[styles.tile, isRow && styles.tileRow]}
      onPress={onPress}
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

function ServiceListRow({
  service,
  useShortLabel,
  isLast,
  onPress,
}: {
  service: ServiceItem;
  useShortLabel: boolean;
  isLast: boolean;
  onPress: () => void;
}) {
  const Icon = service.icon;
  const label = getServiceLabel(service, useShortLabel);

  return (
    <Pressable
      style={[styles.listRow, !isLast && styles.listRowDivider]}
      onPress={onPress}
    >
      <View style={styles.listIconWrap}>
        <Icon color={colors.white} size={22} />
      </View>
      <Text style={styles.listLabel}>{label}</Text>
      <ChevronRight color={colors.textMuted} size={20} />
    </Pressable>
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
  list: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: colors.inputBg,
    overflow: "hidden",
  },
  listRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  listRowDivider: {
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.08)",
  },
  listIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.04)",
  },
  listLabel: {
    flex: 1,
    color: colors.white,
    fontSize: 15,
    fontWeight: "500",
  },
});

import { ActivityIndicator, StyleSheet, Switch, Text, View } from "react-native";
import type { LucideIcon } from "lucide-react-native";

import { colors } from "@/theme/colors";
import { radius, spacing } from "@/theme/spacing";

interface SettingsToggleRowProps {
  icon: LucideIcon;
  title: string;
  subtitle?: string;
  value: boolean;
  onValueChange: (next: boolean) => void;
  disabled?: boolean;
  loading?: boolean;
  isLast?: boolean;
}

export function SettingsToggleRow({
  icon: Icon,
  title,
  subtitle,
  value,
  onValueChange,
  disabled = false,
  loading = false,
  isLast = false,
}: SettingsToggleRowProps) {
  return (
    <View style={[styles.row, !isLast && styles.rowBorder]}>
      <View style={styles.iconWrap}>
        <Icon color={colors.primary} size={18} />
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>

      {loading ? (
        <ActivityIndicator color={colors.primary} size="small" />
      ) : (
        <Switch
          value={value}
          onValueChange={onValueChange}
          disabled={disabled}
          trackColor={{ false: colors.pillTrack, true: colors.primary }}
          thumbColor={colors.white}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  rowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.06)",
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: radius.sm,
    backgroundColor: "rgba(0,174,239,0.12)",
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    flex: 1,
    gap: 2,
  },
  title: {
    color: colors.white,
    fontSize: 15,
    fontWeight: "600",
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: 13,
    lineHeight: 18,
  },
});

import { Pressable, StyleSheet, Text, View } from "react-native";
import { ChevronRight, type LucideIcon } from "lucide-react-native";

import { colors } from "@/theme/colors";
import { radius, spacing } from "@/theme/spacing";

interface SettingsNavRowProps {
  icon: LucideIcon;
  title: string;
  subtitle?: string;
  onPress?: () => void;
  disabled?: boolean;
  badge?: string;
  destructive?: boolean;
  isLast?: boolean;
}

export function SettingsNavRow({
  icon: Icon,
  title,
  subtitle,
  onPress,
  disabled = false,
  badge,
  destructive = false,
  isLast = false,
}: SettingsNavRowProps) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.row,
        !isLast && styles.rowBorder,
        pressed && !disabled && styles.pressed,
        disabled && styles.disabled,
      ]}
      onPress={onPress}
      disabled={disabled || !onPress}
    >
      <View style={[styles.iconWrap, destructive && styles.iconDestructive]}>
        <Icon color={destructive ? colors.error : colors.primary} size={18} />
      </View>

      <View style={styles.content}>
        <View style={styles.titleRow}>
          <Text style={[styles.title, destructive && styles.titleDestructive]}>
            {title}
          </Text>
          {badge ? (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{badge}</Text>
            </View>
          ) : null}
        </View>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>

      {onPress && !disabled ? (
        <ChevronRight color={colors.textSubtle} size={18} />
      ) : null}
    </Pressable>
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
  pressed: {
    backgroundColor: "rgba(255,255,255,0.04)",
  },
  disabled: {
    opacity: 0.55,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: radius.sm,
    backgroundColor: "rgba(0,174,239,0.12)",
    alignItems: "center",
    justifyContent: "center",
  },
  iconDestructive: {
    backgroundColor: "rgba(248,113,113,0.12)",
  },
  content: {
    flex: 1,
    gap: 2,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    flexWrap: "wrap",
  },
  title: {
    color: colors.white,
    fontSize: 15,
    fontWeight: "600",
  },
  titleDestructive: {
    color: colors.error,
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: 13,
    lineHeight: 18,
  },
  badge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.pill,
    backgroundColor: colors.pillTrack,
  },
  badgeText: {
    color: colors.textMuted,
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
});

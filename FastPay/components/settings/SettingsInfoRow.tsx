import { StyleSheet, Text, View } from "react-native";

import { colors } from "@/theme/colors";
import { spacing } from "@/theme/spacing";

interface SettingsInfoRowProps {
  label: string;
  value: string;
  isLast?: boolean;
  mono?: boolean;
}

export function SettingsInfoRow({
  label,
  value,
  isLast = false,
  mono = false,
}: SettingsInfoRowProps) {
  return (
    <View style={[styles.row, !isLast && styles.rowBorder]}>
      <Text style={styles.label}>{label}</Text>
      <Text style={[styles.value, mono && styles.mono]} selectable>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  rowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.06)",
  },
  label: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.6,
    marginBottom: 4,
  },
  value: {
    color: colors.white,
    fontSize: 15,
    lineHeight: 22,
  },
  mono: {
    fontFamily: "monospace",
    fontSize: 13,
  },
});

import { StyleSheet, Text, View } from "react-native";

import { colors } from "@/theme/colors";
import { radius, spacing } from "@/theme/spacing";

interface ReadOnlyFieldProps {
  label: string;
  value: string;
  subValue?: string;
}

export function ReadOnlyField({ label, value, subValue }: ReadOnlyFieldProps) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.box}>
        <Text style={styles.value}>{value}</Text>
        {subValue ? <Text style={styles.subValue}>{subValue}</Text> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  field: {
    marginBottom: spacing.md,
  },
  label: {
    color: colors.textMuted,
    fontSize: 13,
    marginBottom: spacing.sm,
    fontWeight: "600",
  },
  box: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 14,
    backgroundColor: "rgba(255,255,255,0.02)",
  },
  value: {
    color: colors.white,
    fontSize: 15,
    fontWeight: "600",
  },
  subValue: {
    color: colors.textMuted,
    fontSize: 13,
    marginTop: 4,
  },
});

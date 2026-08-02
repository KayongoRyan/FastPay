import { Pressable, StyleSheet, Text, View } from "react-native";

import {
  BUSINESS_TYPE_OPTIONS,
  type BusinessType,
} from "@/lib/portal/business-types";
import { colors } from "@/theme/colors";
import { radius, spacing } from "@/theme/spacing";

type Props = {
  value: BusinessType | "";
  onChange: (value: BusinessType) => void;
  title?: string;
};

export function PortalTypePicker({ value, onChange, title = "Business type" }: Props) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.title}>{title}</Text>
      <View style={styles.grid}>
        {BUSINESS_TYPE_OPTIONS.map((opt) => {
          const selected = value === opt.value;
          return (
            <Pressable
              key={opt.value}
              onPress={() => onChange(opt.value)}
              style={[styles.card, selected && styles.cardSelected]}
            >
              <Text style={styles.cardLabel}>{opt.label}</Text>
              <Text style={styles.cardHint}>{opt.hint}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  title: {
    color: colors.textMuted,
    fontSize: 13,
    marginBottom: spacing.xs,
  },
  grid: {
    gap: spacing.sm,
  },
  card: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.md,
    backgroundColor: colors.inputBg,
  },
  cardSelected: {
    borderColor: colors.primary,
    backgroundColor: "rgba(0,174,239,0.12)",
  },
  cardLabel: {
    color: colors.white,
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 4,
  },
  cardHint: {
    color: colors.textMuted,
    fontSize: 12,
    lineHeight: 16,
  },
});

import { StyleSheet, View } from "react-native";

import { colors } from "@/theme/colors";
import { spacing } from "@/theme/spacing";

interface PinDotsProps {
  length: number;
  filled: number;
  max?: number;
}

export function PinDots({ length, filled, max = 4 }: PinDotsProps) {
  return (
    <View style={styles.row}>
      {Array.from({ length: max }).map((_, index) => (
        <View
          key={index}
          style={[
            styles.dot,
            index < filled ? styles.filled : styles.empty,
            index < length && styles.active,
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    justifyContent: "center",
    gap: spacing.md,
    marginVertical: spacing.lg,
  },
  dot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 1,
    borderColor: colors.border,
  },
  filled: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  empty: {
    backgroundColor: "transparent",
  },
  active: {},
});

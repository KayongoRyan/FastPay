import { Pressable, StyleSheet, Text, View } from "react-native";
import { ChevronLeft, ChevronRight } from "lucide-react-native";

import type { YearBounds } from "@/lib/analytics/yearly";
import { colors } from "@/theme/colors";
import { radius, spacing } from "@/theme/spacing";

interface YearPickerProps {
  bounds: YearBounds;
  isCurrentYear: boolean;
  onPrevious: () => void;
  onNext: () => void;
}

export function YearPicker({
  bounds,
  isCurrentYear,
  onPrevious,
  onNext,
}: YearPickerProps) {
  return (
    <View style={styles.row}>
      <Pressable style={styles.btn} onPress={onPrevious} hitSlop={8}>
        <ChevronLeft color={colors.white} size={22} />
      </Pressable>
      <View style={styles.labelWrap}>
        <Text style={styles.label}>
          {isCurrentYear ? "This year" : "Selected year"}
        </Text>
        <Text style={styles.range}>{bounds.label}</Text>
      </View>
      <Pressable
        style={[styles.btn, isCurrentYear && styles.btnDisabled]}
        onPress={onNext}
        disabled={isCurrentYear}
        hitSlop={8}
      >
        <ChevronRight
          color={isCurrentYear ? colors.textSubtle : colors.white}
          size={22}
        />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.sm,
    backgroundColor: colors.inputBg,
  },
  btn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  btnDisabled: {
    opacity: 0.4,
  },
  labelWrap: {
    alignItems: "center",
    flex: 1,
  },
  label: {
    color: colors.textMuted,
    fontSize: 12,
  },
  range: {
    color: colors.white,
    fontSize: 15,
    fontWeight: "600",
    marginTop: 2,
  },
});

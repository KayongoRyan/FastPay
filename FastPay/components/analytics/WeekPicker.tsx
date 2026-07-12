import { Pressable, StyleSheet, Text, View } from "react-native";
import { ChevronLeft, ChevronRight } from "lucide-react-native";

import type { WeekBounds } from "@/lib/analytics/weekly";
import { colors } from "@/theme/colors";
import { radius, spacing } from "@/theme/spacing";

interface WeekPickerProps {
  bounds: WeekBounds;
  isCurrentWeek: boolean;
  onPrevious: () => void;
  onNext: () => void;
}

export function WeekPicker({
  bounds,
  isCurrentWeek,
  onPrevious,
  onNext,
}: WeekPickerProps) {
  return (
    <View style={styles.row}>
      <Pressable style={styles.btn} onPress={onPrevious} hitSlop={8}>
        <ChevronLeft color={colors.white} size={22} />
      </Pressable>
      <View style={styles.labelWrap}>
        <Text style={styles.label}>
          {isCurrentWeek ? "This week" : "Selected week"}
        </Text>
        <Text style={styles.range}>{bounds.label}</Text>
      </View>
      <Pressable
        style={[styles.btn, isCurrentWeek && styles.btnDisabled]}
        onPress={onNext}
        disabled={isCurrentWeek}
        hitSlop={8}
      >
        <ChevronRight
          color={isCurrentWeek ? colors.textSubtle : colors.white}
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

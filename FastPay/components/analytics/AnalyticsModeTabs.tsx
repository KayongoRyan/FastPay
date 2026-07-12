import { Pressable, StyleSheet, Text, View } from "react-native";

import { colors } from "@/theme/colors";
import { radius, spacing } from "@/theme/spacing";

export type AnalyticsMode = "cashflow" | "budget" | "goals";

interface AnalyticsModeTabsProps {
  mode: AnalyticsMode;
  onChange: (mode: AnalyticsMode) => void;
}

const MODES: { id: AnalyticsMode; label: string }[] = [
  { id: "cashflow", label: "Cash Flow" },
  { id: "budget", label: "Budget" },
  { id: "goals", label: "Goals" },
];

export function AnalyticsModeTabs({ mode, onChange }: AnalyticsModeTabsProps) {
  return (
    <View style={styles.row}>
      {MODES.map((item) => (
        <Pressable
          key={item.id}
          style={[styles.tab, mode === item.id && styles.tabActive]}
          onPress={() => onChange(item.id)}
        >
          <Text style={[styles.tabText, mode === item.id && styles.tabTextActive]}>
            {item.label}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    backgroundColor: colors.pillTrack,
    borderRadius: radius.pill,
    padding: 4,
    marginBottom: spacing.lg,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: radius.pill,
    alignItems: "center",
  },
  tabActive: {
    backgroundColor: colors.primary,
  },
  tabText: {
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: "600",
  },
  tabTextActive: {
    color: colors.white,
  },
});

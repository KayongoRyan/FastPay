import { Pressable, StyleSheet, Text, View } from "react-native";

import { colors } from "@/theme/colors";
import { radius, spacing } from "@/theme/spacing";

interface SourceChipsProps {
  sources: { title: string; source: string; route?: string }[];
  lowConfidence?: boolean;
}

export function SourceChips({ sources, lowConfidence }: SourceChipsProps) {
  if (!sources.length) {
    return null;
  }

  return (
    <View style={styles.wrap}>
      {sources.map((source) => (
        <View key={`${source.source}-${source.title}`} style={styles.chip}>
          <Text style={styles.chipText}>{source.title}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xs,
    marginTop: spacing.sm,
  },
  chip: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    backgroundColor: colors.inputBg,
  },
  chipText: {
    color: colors.textMuted,
    fontSize: 11,
  },
});

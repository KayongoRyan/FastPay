import { Pressable, StyleSheet, Text, View } from "react-native";
import { Delete } from "lucide-react-native";

import { colors } from "@/theme/colors";
import { spacing } from "@/theme/spacing";

const KEYS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "", "0", "del"] as const;

interface NumericKeypadProps {
  onKey: (key: string) => void;
  onDelete: () => void;
  variant?: "dark" | "light";
}

export function NumericKeypad({
  onKey,
  onDelete,
  variant = "dark",
}: NumericKeypadProps) {
  const light = variant === "light";
  const keyTextColor = light ? colors.background : colors.white;
  const pressedBg = light ? "rgba(11,31,63,0.08)" : colors.inputBg;

  return (
    <View style={[styles.grid, light && styles.gridLight]}>
      {KEYS.map((key, index) => {
        if (key === "") {
          return <View key={`empty-${index}`} style={styles.key} />;
        }

        if (key === "del") {
          return (
            <Pressable key="del" style={styles.key} onPress={onDelete}>
              <Delete color={keyTextColor} size={22} />
            </Pressable>
          );
        }

        return (
          <Pressable
            key={key}
            style={({ pressed }) => [
              styles.key,
              pressed && { backgroundColor: pressedBg },
            ]}
            onPress={() => onKey(key)}
          >
            <Text style={[styles.keyText, { color: keyTextColor }]}>{key}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: spacing.sm,
    paddingTop: spacing.md,
  },
  gridLight: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginHorizontal: -spacing.lg,
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
  },
  key: {
    width: "30%",
    maxWidth: 110,
    aspectRatio: 1.6,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
  },
  keyPressed: {
    backgroundColor: colors.inputBg,
  },
  keyText: {
    fontSize: 24,
    fontWeight: "500",
  },
});

import { Pressable, StyleSheet, Text, View } from "react-native";
import { Delete } from "lucide-react-native";

import { colors } from "@/theme/colors";
import { spacing } from "@/theme/spacing";

const KEYS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "", "0", "del"] as const;

interface NumericKeypadProps {
  onKey: (key: string) => void;
  onDelete: () => void;
}

export function NumericKeypad({ onKey, onDelete }: NumericKeypadProps) {
  return (
    <View style={styles.grid}>
      {KEYS.map((key, index) => {
        if (key === "") {
          return <View key={`empty-${index}`} style={styles.key} />;
        }

        if (key === "del") {
          return (
            <Pressable key="del" style={styles.key} onPress={onDelete}>
              <Delete color={colors.white} size={22} />
            </Pressable>
          );
        }

        return (
          <Pressable
            key={key}
            style={({ pressed }) => [styles.key, pressed && styles.keyPressed]}
            onPress={() => onKey(key)}
          >
            <Text style={styles.keyText}>{key}</Text>
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
    color: colors.white,
    fontSize: 24,
    fontWeight: "500",
  },
});

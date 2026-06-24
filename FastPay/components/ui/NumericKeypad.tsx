import { Pressable, StyleSheet, Text, View } from "react-native";

import { BackspaceKeyIcon } from "@/components/ui/BackspaceKeyIcon";
import { colors } from "@/theme/colors";
import { spacing } from "@/theme/spacing";

const PIN_ROWS = [
  ["1", "2", "3"],
  ["4", "5", "6"],
  ["7", "8", "9"],
  ["", "0", "del"],
] as const;

const CONVERT_ROWS = [
  ["1", "2", "3"],
  ["4", "5", "6"],
  ["7", "8", "9"],
  ["*", "0", "del"],
] as const;

const LIGHT_ROWS = [
  ["1", "2", "3"],
  ["4", "5", "6"],
  ["7", "8", "9"],
  ["", "0", "del"],
] as const;

type KeypadVariant = "dark" | "light" | "convert";

interface NumericKeypadProps {
  onKey: (key: string) => void;
  onDelete: () => void;
  variant?: KeypadVariant;
}

function getRows(variant: KeypadVariant) {
  if (variant === "dark") return PIN_ROWS;
  if (variant === "convert") return CONVERT_ROWS;
  return LIGHT_ROWS;
}

export function NumericKeypad({
  onKey,
  onDelete,
  variant = "dark",
}: NumericKeypadProps) {
  const rows = getRows(variant);
  const isConvert = variant === "convert";
  const isLight = variant === "light";

  return (
    <View
      style={[
        styles.shell,
        isConvert && styles.shellConvert,
        isLight && styles.shellLight,
      ]}
    >
      {rows.map((row) => (
        <View
          key={row.join("-")}
          style={[
            styles.row,
            isConvert && styles.rowConvert,
            isLight && styles.rowLight,
            !isConvert && !isLight && styles.rowDark,
          ]}
        >
          {row.map((key, colIndex) => {
            if (key === "") {
              return <View key={`empty-${colIndex}`} style={styles.cell} />;
            }

            if (key === "del") {
              return (
                <Pressable
                  key="del"
                  style={({ pressed }) => [
                    styles.cell,
                    pressed && styles.cellPressedConvert,
                  ]}
                  onPress={onDelete}
                >
                  {isConvert || isLight ? (
                    <BackspaceKeyIcon />
                  ) : (
                    <BackspaceKeyIcon fill={colors.white} markColor={colors.background} />
                  )}
                </Pressable>
              );
            }

            return (
              <Pressable
                key={key}
                style={({ pressed }) => [
                  styles.cell,
                  !isConvert && !isLight && pressed && styles.cellPressedDark,
                  (isConvert || isLight) && pressed && styles.cellPressedConvert,
                ]}
                onPress={() => onKey(key)}
              >
                <Text
                  style={[
                    styles.keyText,
                    isConvert && styles.keyTextConvert,
                    isLight && styles.keyTextLight,
                  ]}
                >
                  {key}
                </Text>
              </Pressable>
            );
          })}
        </View>
      ))}
    </View>
  );
}

const KEY_HEIGHT = 64;

const styles = StyleSheet.create({
  shell: {
    width: "100%",
  },
  shellConvert: {
    backgroundColor: "#0D2D6E",
    paddingTop: spacing.lg,
    paddingBottom: spacing.lg,
    paddingHorizontal: spacing.md,
  },
  shellLight: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 8,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
  rowConvert: {
    height: KEY_HEIGHT,
  },
  rowLight: {
    height: 58,
  },
  rowDark: {
    height: KEY_HEIGHT,
    marginBottom: spacing.xs,
  },
  cell: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    height: "100%",
  },
  cellPressedDark: {
    opacity: 0.65,
  },
  cellPressedConvert: {
    opacity: 0.75,
  },
  keyText: {
    color: colors.white,
    fontSize: 34,
    fontWeight: "700",
  },
  keyTextConvert: {
    color: colors.white,
    fontSize: 36,
    fontWeight: "700",
  },
  keyTextLight: {
    color: colors.background,
    fontSize: 28,
    fontWeight: "500",
  },
});

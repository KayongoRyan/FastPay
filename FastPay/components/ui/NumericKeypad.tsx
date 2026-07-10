import { Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { X } from "lucide-react-native";

import { BackspaceKeyIcon } from "@/components/ui/BackspaceKeyIcon";
import { colors } from "@/theme/colors";
import { spacing } from "@/theme/spacing";

const PIN_ROWS = [
  ["1", "2", "3"],
  ["4", "5", "6"],
  ["7", "8", "9"],
  ["", "0", "del"],
] as const;

const PASSCODE_ROWS = [
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

type KeypadVariant = "dark" | "light" | "convert" | "pinPro" | "passcode";

interface NumericKeypadProps {
  onKey: (key: string) => void;
  onDelete: () => void;
  variant?: KeypadVariant;
  onClose?: () => void;
}

function getRows(variant: KeypadVariant) {
  if (variant === "passcode") return PASSCODE_ROWS;
  if (variant === "dark") return PIN_ROWS;
  if (variant === "convert") return CONVERT_ROWS;
  return LIGHT_ROWS;
}

export function NumericKeypad({
  onKey,
  onDelete,
  variant = "dark",
  onClose,
}: NumericKeypadProps) {
  const rows = getRows(variant);
  const isConvert = variant === "convert";
  const isLight = variant === "light";
  const isPinPro = variant === "pinPro";
  const isPasscode = variant === "passcode";

  return (
    <View
      style={[
        styles.shell,
        isConvert && styles.shellConvert,
        isLight && styles.shellLight,
        isPinPro && styles.shellPinPro,
        isPasscode && styles.shellPasscode,
      ]}
    >
      {isConvert && onClose ? (
        <View style={styles.convertHeader}>
          <Pressable style={styles.convertHeaderBtn} onPress={onClose} hitSlop={10}>
            <X color={colors.white} size={22} />
          </Pressable>
        </View>
      ) : null}

      {rows.map((row) => (
        <View
          key={row.join("-")}
          style={[
            styles.row,
            isConvert && styles.rowConvert,
            isLight && styles.rowLight,
            isPinPro && styles.rowPinPro,
            isPasscode && styles.rowPasscode,
            !isConvert && !isLight && !isPinPro && !isPasscode && styles.rowDark,
          ]}
        >
          {row.map((key, colIndex) => {
            if (key === "") {
              return isPasscode ? (
                <View key={`empty-${colIndex}`} style={styles.passcodeSpacer} />
              ) : (
                <View key={`empty-${colIndex}`} style={styles.cell} />
              );
            }

            if (key === "del") {
              return (
                <Pressable
                  key="del"
                  style={({ pressed }) => [
                    !isPasscode && !isPinPro && styles.cell,
                    (isPasscode || isPinPro) && styles.cellRound,
                    (isPasscode || isPinPro) && pressed && styles.cellRoundPressed,
                    !isPasscode && !isPinPro && pressed && styles.cellPressedConvert,
                  ]}
                  onPress={onDelete}
                >
                  <View style={styles.roundKeyContent}>
                    <BackspaceKeyIcon
                      size={isPasscode ? 34 : 46}
                      fill={colors.white}
                      markColor={isPasscode ? "#1A3358" : colors.backgroundDeep}
                    />
                  </View>
                </Pressable>
              );
            }

            return (
              <Pressable
                key={key}
                style={({ pressed }) => [
                  !isPasscode && !isPinPro && styles.cell,
                  (isPasscode || isPinPro) && styles.cellRound,
                  (isPasscode || isPinPro) && pressed && styles.cellRoundPressed,
                  !isConvert && !isLight && !isPinPro && !isPasscode && pressed && styles.cellPressedDark,
                  (isConvert || isLight) && !isPinPro && !isPasscode && pressed && styles.cellPressedConvert,
                ]}
                onPress={() => onKey(key)}
              >
                {(isPasscode || isPinPro) ? (
                  <View style={styles.roundKeyContent}>
                    <Text
                      style={[
                        isPasscode ? styles.keyTextPasscode : styles.keyTextPinPro,
                      ]}
                    >
                      {key}
                    </Text>
                  </View>
                ) : (
                  <Text
                    style={[
                      styles.keyText,
                      isConvert && styles.keyTextConvert,
                      isLight && styles.keyTextLight,
                    ]}
                  >
                    {key}
                  </Text>
                )}
              </Pressable>
            );
          })}
        </View>
      ))}
    </View>
  );
}

const KEY_HEIGHT = 56;
const PASSCODE_KEY = 78;
const PASSCODE_GAP = 32;

const styles = StyleSheet.create({
  shell: {
    width: "100%",
  },
  shellConvert: {
    backgroundColor: "transparent",
    paddingTop: 0,
    paddingBottom: 0,
    paddingHorizontal: 0,
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
  shellPinPro: {
    paddingTop: spacing.sm,
    paddingBottom: spacing.xs,
  },
  shellPasscode: {
    paddingHorizontal: spacing.sm,
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
  rowPinPro: {
    height: 76,
    marginBottom: spacing.sm,
  },
  rowPasscode: {
    height: PASSCODE_KEY,
    marginBottom: spacing.md,
    justifyContent: "center",
    gap: PASSCODE_GAP,
  },
  passcodeSpacer: {
    width: PASSCODE_KEY,
    height: PASSCODE_KEY,
  },
  cell: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    height: "100%",
  },
  cellRound: {
    width: PASSCODE_KEY,
    height: PASSCODE_KEY,
    borderRadius: PASSCODE_KEY / 2,
    flex: 0,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    backgroundColor: "rgba(36, 64, 102, 0.85)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  roundKeyContent: {
    width: PASSCODE_KEY,
    height: PASSCODE_KEY,
    alignItems: "center",
    justifyContent: "center",
  },
  cellRoundPressed: {
    backgroundColor: "rgba(0, 174, 239, 0.28)",
    borderColor: "rgba(0, 174, 239, 0.35)",
    transform: [{ scale: 0.96 }],
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
  keyTextPasscode: {
    color: colors.white,
    fontSize: 30,
    fontWeight: "500",
    textAlign: "center",
    lineHeight: 34,
    ...(Platform.OS === "android" ? { includeFontPadding: false } : {}),
  },
  keyTextPinPro: {
    color: colors.white,
    fontSize: 28,
    fontWeight: "600",
    textAlign: "center",
    lineHeight: 32,
    ...(Platform.OS === "android" ? { includeFontPadding: false } : {}),
  },
  keyTextConvert: {
    color: colors.white,
    fontSize: 34,
    fontWeight: "700",
  },
  convertHeader: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    minHeight: 36,
    marginBottom: spacing.xs,
  },
  convertHeaderBtn: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  keyTextLight: {
    color: colors.background,
    fontSize: 28,
    fontWeight: "500",
  },
});

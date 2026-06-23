import { Pressable, StyleSheet, Text, ViewStyle } from "react-native";

import { colors } from "@/theme/colors";
import { radius, spacing } from "@/theme/spacing";

interface OutlineButtonProps {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  style?: ViewStyle;
}

export function OutlineButton({ label, onPress, disabled, style }: OutlineButtonProps) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.button,
        pressed && styles.pressed,
        disabled && styles.disabled,
        style,
      ]}
      disabled={disabled}
      onPress={onPress}
    >
      <Text style={styles.label}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.pill,
    paddingVertical: spacing.md,
    alignItems: "center",
    minHeight: 52,
    justifyContent: "center",
  },
  pressed: {
    backgroundColor: colors.inputBg,
  },
  disabled: {
    opacity: 0.45,
  },
  label: {
    color: colors.white,
    fontSize: 16,
    fontWeight: "500",
  },
});

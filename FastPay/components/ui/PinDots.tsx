import { useEffect, useRef } from "react";
import { Animated, Easing, StyleSheet, View } from "react-native";

import { colors } from "@/theme/colors";
import { spacing } from "@/theme/spacing";

interface PinDotsProps {
  filled: number;
  max?: number;
  error?: boolean;
  variant?: "default" | "passcode";
}

export function PinDots({
  filled,
  max = 4,
  error = false,
  variant = "passcode",
}: PinDotsProps) {
  const shake = useRef(new Animated.Value(0)).current;
  const isPasscode = variant === "passcode";

  useEffect(() => {
    if (!error) {
      return;
    }

    shake.setValue(0);
    Animated.sequence([
      Animated.timing(shake, { toValue: 1, duration: 60, useNativeDriver: true }),
      Animated.timing(shake, { toValue: -1, duration: 60, useNativeDriver: true }),
      Animated.timing(shake, { toValue: 1, duration: 60, useNativeDriver: true }),
      Animated.timing(shake, { toValue: 0, duration: 60, useNativeDriver: true }),
    ]).start();
  }, [error, shake]);

  const translateX = shake.interpolate({
    inputRange: [-1, 0, 1],
    outputRange: [-8, 0, 8],
  });

  return (
    <Animated.View
      style={[
        styles.row,
        isPasscode && styles.rowPasscode,
        { transform: [{ translateX }] },
      ]}
    >
      {Array.from({ length: max }).map((_, index) => {
        const isFilled = index < filled;

        return (
          <View
            key={index}
            style={[
              isPasscode ? styles.dotPasscode : styles.dotDefault,
              isFilled && (isPasscode ? styles.dotPasscodeFilled : styles.dotDefaultFilled),
              error && styles.dotError,
            ]}
          />
        );
      })}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    justifyContent: "center",
    gap: spacing.lg,
  },
  rowPasscode: {
    gap: 28,
    marginTop: spacing.xl,
    marginBottom: spacing.xl,
  },
  dotPasscode: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: colors.white,
    backgroundColor: "transparent",
  },
  dotPasscodeFilled: {
    backgroundColor: colors.white,
    borderColor: colors.white,
  },
  dotDefault: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.22)",
    backgroundColor: "transparent",
  },
  dotDefaultFilled: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  dotError: {
    borderColor: colors.error,
    backgroundColor: "rgba(248,113,113,0.15)",
  },
});

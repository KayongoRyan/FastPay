import { LinearGradient } from "expo-linear-gradient";
import { router, usePathname } from "expo-router";
import { Pressable, StyleSheet, View } from "react-native";
import { Bot } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { FLOATING_TAB_BAR_HEIGHT } from "@/components/navigation/MainTabBar";
import { featureRoutes } from "@/lib/navigation/feature-routes";
import { useAuthStore } from "@/store/authStore";
import { colors } from "@/theme/colors";
import { spacing } from "@/theme/spacing";

export function AssistantFab() {
  const insets = useSafeAreaInsets();
  const pathname = usePathname();
  const user = useAuthStore((s) => s.user);
  const isLocked = useAuthStore((s) => s.isLocked);

  if (!user || isLocked || pathname.includes("support")) {
    return null;
  }

  return (
    <View
      pointerEvents="box-none"
      style={[
        styles.wrap,
        {
          bottom: FLOATING_TAB_BAR_HEIGHT + Math.max(insets.bottom, spacing.sm) + spacing.md,
        },
      ]}
    >
      <Pressable
        onPress={() => router.push(featureRoutes.support)}
        style={({ pressed }) => [styles.pressable, pressed && styles.pressed]}
        accessibilityLabel="Open FastPay AI Assistant"
      >
        <LinearGradient
          colors={[colors.primary, "#0077A8"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.btn}
        >
          <Bot color={colors.white} size={26} strokeWidth={2.2} />
        </LinearGradient>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: "absolute",
    right: spacing.lg,
    zIndex: 100,
  },
  pressable: {
    borderRadius: 30,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.45,
    shadowRadius: 12,
    elevation: 12,
  },
  btn: {
    width: 58,
    height: 58,
    borderRadius: 29,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.25)",
  },
  pressed: {
    opacity: 0.9,
    transform: [{ scale: 0.96 }],
  },
});

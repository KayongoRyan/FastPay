import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { LinearGradient } from "expo-linear-gradient";
import { LucideIcon } from "lucide-react-native";
import { Pressable, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { colors } from "@/theme/colors";
import { spacing } from "@/theme/spacing";

export type FloatingTabItem = {
  name: string;
  icon: LucideIcon;
  center?: boolean;
};

const PILL_HEIGHT = 58;
const CENTER_SIZE = 62;

type Props = BottomTabBarProps & {
  items: readonly FloatingTabItem[];
};

export function FloatingPillTabBar({ state, navigation, descriptors, items }: Props) {
  const insets = useSafeAreaInsets();
  const activeRoute = state.routes[state.index]?.name;
  const focusedRoute = state.routes[state.index];
  const tabBarStyle = focusedRoute
    ? descriptors[focusedRoute.key]?.options.tabBarStyle
    : undefined;
  const hideTabBar =
    typeof tabBarStyle === "object" &&
    tabBarStyle !== null &&
    "display" in tabBarStyle &&
    tabBarStyle.display === "none";

  if (hideTabBar) {
    return null;
  }

  return (
    <View
      style={[
        styles.outer,
        { paddingBottom: Math.max(insets.bottom, spacing.sm) },
      ]}
    >
      <View style={styles.pill}>
        {items.map((item) => {
          const Icon = item.icon;
          const active = activeRoute === item.name;
          const routeExists = state.routes.some((r) => r.name === item.name);
          if (!routeExists) return null;

          if (item.center) {
            return (
              <View key={item.name} style={styles.centerSlot}>
                <Pressable
                  onPress={() => navigation.navigate(item.name)}
                  style={({ pressed }) => [
                    styles.centerPressable,
                    pressed && styles.centerPressed,
                  ]}
                >
                  <LinearGradient
                    colors={["#163A6B", "#08182F"]}
                    start={{ x: 0.2, y: 0 }}
                    end={{ x: 0.8, y: 1 }}
                    style={styles.centerBtn}
                  >
                    <Icon color={colors.white} size={26} strokeWidth={2.2} />
                  </LinearGradient>
                </Pressable>
              </View>
            );
          }

          return (
            <Pressable
              key={item.name}
              style={styles.tab}
              onPress={() => navigation.navigate(item.name)}
              hitSlop={6}
            >
              <Icon
                color={active ? colors.white : "rgba(255,255,255,0.45)"}
                size={24}
                strokeWidth={active ? 2.2 : 1.8}
              />
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

/** Reserve space above the floating tab bar in scroll layouts. */
export const FLOATING_TAB_BAR_HEIGHT = PILL_HEIGHT + spacing.lg + spacing.sm;

const styles = StyleSheet.create({
  outer: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    backgroundColor: "transparent",
  },
  pill: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    height: PILL_HEIGHT,
    borderRadius: PILL_HEIGHT / 2,
    backgroundColor: "#061223",
    paddingHorizontal: spacing.lg,
    overflow: "visible",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.45,
    shadowRadius: 18,
    elevation: 14,
  },
  tab: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    height: PILL_HEIGHT,
  },
  centerSlot: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    height: PILL_HEIGHT,
    overflow: "visible",
  },
  centerPressable: {
    position: "absolute",
    top: -(CENTER_SIZE - PILL_HEIGHT) / 2,
  },
  centerBtn: {
    width: CENTER_SIZE,
    height: CENTER_SIZE,
    borderRadius: CENTER_SIZE / 2,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: "#061223",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 10,
  },
  centerPressed: {
    opacity: 0.88,
    transform: [{ scale: 0.96 }],
  },
});

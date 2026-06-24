import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { Pressable, StyleSheet, Text, View } from "react-native";
import {
  ArrowLeftRight,
  BarChart3,
  Home,
  Settings,
  Wallet,
} from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { colors } from "@/theme/colors";
import { radius } from "@/theme/spacing";

const TAB_ITEMS = [
  { name: "home", label: "Home", icon: Home },
  { name: "wallet", label: "Wallet", icon: Wallet },
  { name: "convert", label: "Swap", icon: ArrowLeftRight, center: true },
  { name: "analytics", label: "Stats", icon: BarChart3 },
  { name: "settings", label: "Settings", icon: Settings },
] as const;

export function MainTabBar({ state, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const activeRoute = state.routes[state.index]?.name;

  return (
    <View style={[styles.wrap, { paddingBottom: Math.max(insets.bottom, 10) }]}>
      {TAB_ITEMS.map((item) => {
        const Icon = item.icon;
        const active = activeRoute === item.name;

        if ("center" in item && item.center) {
          return (
            <Pressable
              key={item.name}
              style={styles.centerSlot}
              onPress={() => navigation.navigate(item.name)}
            >
              <View style={[styles.centerBtn, active && styles.centerBtnActive]}>
                <Icon color={colors.white} size={26} />
              </View>
            </Pressable>
          );
        }

        return (
          <Pressable
            key={item.name}
            style={styles.tab}
            onPress={() => navigation.navigate(item.name)}
          >
            <Icon color={active ? colors.primary : colors.textMuted} size={22} />
            <Text style={[styles.label, active && styles.labelActive]}>
              {item.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-around",
    backgroundColor: colors.backgroundDeep,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.08)",
    paddingTop: 10,
    paddingHorizontal: 8,
  },
  tab: {
    flex: 1,
    alignItems: "center",
    gap: 4,
    paddingBottom: 4,
  },
  label: {
    color: colors.textMuted,
    fontSize: 10,
    fontWeight: "500",
  },
  labelActive: {
    color: colors.primary,
  },
  centerSlot: {
    flex: 1,
    alignItems: "center",
    marginTop: -28,
  },
  centerBtn: {
    width: 58,
    height: 58,
    borderRadius: radius.full,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 4,
    borderColor: colors.backgroundDeep,
  },
  centerBtnActive: {
    backgroundColor: colors.primaryPressed,
  },
});

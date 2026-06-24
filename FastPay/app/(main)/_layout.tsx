import { Tabs } from "expo-router";
import { Platform } from "react-native";

import {
  FLOATING_TAB_BAR_HEIGHT,
  MainTabBar,
} from "@/components/navigation/MainTabBar";
import { colors } from "@/theme/colors";

export default function MainLayout() {
  return (
    <Tabs
      tabBar={(props) => <MainTabBar {...props} />}
      screenOptions={{
        headerShown: false,
        sceneStyle: { backgroundColor: colors.background },
        tabBarStyle: {
          position: "absolute",
          backgroundColor: "transparent",
          borderTopWidth: 0,
          elevation: 0,
          height: FLOATING_TAB_BAR_HEIGHT,
          ...(Platform.OS === "ios" ? { shadowOpacity: 0 } : {}),
        },
      }}
    >
      <Tabs.Screen name="home" options={{ title: "Home" }} />
      <Tabs.Screen name="wallet" options={{ title: "Wallet" }} />
      <Tabs.Screen name="convert" options={{ title: "Convert" }} />
      <Tabs.Screen name="analytics" options={{ title: "Analytics" }} />
      <Tabs.Screen name="settings" options={{ title: "Settings" }} />
      <Tabs.Screen name="buy" options={{ href: null, title: "Buy" }} />
    </Tabs>
  );
}

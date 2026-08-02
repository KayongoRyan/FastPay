import { Redirect, Tabs } from "expo-router";
import { Home, Settings, Store } from "lucide-react-native";
import { Platform, View } from "react-native";

import {
  FLOATING_TAB_BAR_HEIGHT,
  FloatingPillTabBar,
} from "@/components/navigation/FloatingPillTabBar";
import { useBusinessAuthStore } from "@/store/businessAuthStore";
import { colors } from "@/theme/colors";

const BUSINESS_TABS = [
  { name: "index", icon: Home },
  { name: "branches", icon: Store, center: true },
  { name: "settings", icon: Settings },
] as const;

export default function BusinessAppLayout() {
  const { user, isReady } = useBusinessAuthStore();

  if (!isReady) {
    return null;
  }

  if (!user) {
    return <Redirect href="/business/login" />;
  }

  return (
    <View style={{ flex: 1 }}>
      <Tabs
        tabBar={(props) => <FloatingPillTabBar {...props} items={BUSINESS_TABS} />}
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
        <Tabs.Screen name="index" options={{ title: "Home" }} />
        <Tabs.Screen name="branches" options={{ title: "Branches" }} />
        <Tabs.Screen name="settings" options={{ title: "Settings" }} />
      </Tabs>
    </View>
  );
}

import { Redirect, Tabs } from "expo-router";
import { FileText, Home, Settings } from "lucide-react-native";
import { Platform, View } from "react-native";

import {
  FLOATING_TAB_BAR_HEIGHT,
  FloatingPillTabBar,
} from "@/components/navigation/FloatingPillTabBar";
import { useMerchantAuthStore } from "@/store/merchantAuthStore";
import { colors } from "@/theme/colors";

const MERCHANT_TABS = [
  { name: "index", icon: Home },
  { name: "invoices", icon: FileText, center: true },
  { name: "settings", icon: Settings },
] as const;

export default function MerchantAppLayout() {
  const { user, isReady } = useMerchantAuthStore();

  if (!isReady) {
    return null;
  }

  if (!user) {
    return <Redirect href="/merchant/login" />;
  }

  return (
    <View style={{ flex: 1 }}>
      <Tabs
        tabBar={(props) => <FloatingPillTabBar {...props} items={MERCHANT_TABS} />}
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
        <Tabs.Screen name="invoices" options={{ title: "Invoices" }} />
        <Tabs.Screen name="settings" options={{ title: "Settings" }} />
      </Tabs>
    </View>
  );
}

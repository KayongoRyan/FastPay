import { Stack } from "expo-router";
import { useEffect } from "react";

import { useMerchantAuthStore } from "@/store/merchantAuthStore";
import { colors } from "@/theme/colors";

export default function MerchantRootLayout() {
  const initialize = useMerchantAuthStore((s) => s.initialize);

  useEffect(() => {
    void initialize();
  }, [initialize]);

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
        animation: "fade",
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="login" />
      <Stack.Screen name="(app)" />
    </Stack>
  );
}

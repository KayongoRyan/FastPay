import "@/lib/polyfills";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";

import { useAuthStore } from "@/store/authStore";
import { colors } from "@/theme/colors";

export default function RootLayout() {
  const initialize = useAuthStore((state) => state.initialize);

  useEffect(() => {
    void initialize();
  }, [initialize]);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.background },
          animation: "fade",
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(main)" />
        <Stack.Screen name="biometric-unlock" />
        <Stack.Screen name="offline/send" options={{ headerShown: true, title: "Offline Send", headerStyle: { backgroundColor: colors.background }, headerTintColor: colors.white }} />
        <Stack.Screen name="offline/receive" options={{ headerShown: true, title: "Offline Receive", headerStyle: { backgroundColor: colors.background }, headerTintColor: colors.white }} />
      </Stack>
    </GestureHandlerRootView>
  );
}

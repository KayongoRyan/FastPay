import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";

import { useAuthStore } from "@/store/authStore";

export default function RootLayout() {
  const initialize = useAuthStore((state) => state.initialize);

  useEffect(() => {
    void initialize();
  }, [initialize]);

  return (
    <>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: "#0a0a0a" },
          headerTintColor: "#ffffff",
          contentStyle: { backgroundColor: "#0a0a0a" },
        }}
      >
        <Stack.Screen name="index" options={{ title: "FastPay Wallet" }} />
        <Stack.Screen name="login" options={{ title: "Sign in" }} />
        <Stack.Screen name="register" options={{ title: "Register" }} />
        <Stack.Screen
          name="biometric-unlock"
          options={{ title: "Unlock", headerShown: false }}
        />
        <Stack.Screen name="offline/send" options={{ title: "Offline Send" }} />
        <Stack.Screen
          name="offline/receive"
          options={{ title: "Offline Receive" }}
        />
      </Stack>
    </>
  );
}

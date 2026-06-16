import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";

export default function RootLayout() {
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
        <Stack.Screen name="offline/send" options={{ title: "Offline Send" }} />
        <Stack.Screen
          name="offline/receive"
          options={{ title: "Offline Receive" }}
        />
      </Stack>
    </>
  );
}

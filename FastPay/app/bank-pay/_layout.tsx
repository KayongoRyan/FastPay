import { Stack } from "expo-router";

import { colors } from "@/theme/colors";

export default function BankPayLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
        animation: "slide_from_right",
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="invoice" />
      <Stack.Screen name="pin" />
      <Stack.Screen
        name="success"
        options={{ animation: "fade", gestureEnabled: false }}
      />
    </Stack>
  );
}

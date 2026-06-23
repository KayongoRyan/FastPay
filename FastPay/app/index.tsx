import { Href, router } from "expo-router";
import { useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";

import { FastPayLogo } from "@/components/FastPayLogo";
import { useAuthStore } from "@/store/authStore";
import { colors } from "@/theme/colors";

export default function SplashScreen() {
  const { isReady, isLocked, user } = useAuthStore();

  useEffect(() => {
    if (!isReady) {
      return;
    }

    const timer = setTimeout(() => {
      if (isLocked) {
        router.replace("/biometric-unlock" as Href);
        return;
      }

      if (user) {
        router.replace("/(main)/home" as Href);
        return;
      }

      router.replace("/(auth)/login" as Href);
    }, 1800);

    return () => clearTimeout(timer);
  }, [isReady, isLocked, user]);

  return (
    <View style={styles.container}>
      <FastPayLogo size={72} />
      <Text style={styles.wordmark}>FASTPAY</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: "center",
    justifyContent: "center",
    gap: 20,
  },
  wordmark: {
    color: colors.white,
    fontSize: 28,
    fontWeight: "700",
    letterSpacing: 6,
  },
});

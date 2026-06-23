import { Href, router } from "expo-router";
import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { FastPayLogo } from "@/components/FastPayLogo";
import { NumericKeypad } from "@/components/ui/NumericKeypad";
import { PinDots } from "@/components/ui/PinDots";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { Screen } from "@/components/ui/Screen";
import { useAuthStore } from "@/store/authStore";
import { useOnboardingStore } from "@/store/onboardingStore";
import { colors } from "@/theme/colors";
import { spacing } from "@/theme/spacing";

const PIN_LENGTH = 4;

export default function PinSetupScreen() {
  const { register, isLoading, error } = useAuthStore();
  const { firstName, lastName, email, password, setPin } = useOnboardingStore();
  const [pin, setLocalPin] = useState("");

  const onKey = (key: string) => {
    if (pin.length < PIN_LENGTH) {
      setLocalPin((prev) => prev + key);
    }
  };

  const onDelete = () => {
    setLocalPin((prev) => prev.slice(0, -1));
  };

  const onNext = async () => {
    if (pin.length !== PIN_LENGTH) {
      return;
    }

    setPin(pin);

    try {
      await register({
        fullName: `${firstName.trim()} ${lastName.trim()}`,
        email: email.trim(),
        password,
      });
      router.replace("/(auth)/verify-email" as Href);
    } catch {
      // error in store
    }
  };

  return (
    <Screen>
      <View style={styles.header}>
        <FastPayLogo size={36} />
      </View>

      <Text style={styles.title}>Enter your Pin</Text>
      <PinDots length={pin.length} filled={pin.length} />

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <NumericKeypad onKey={onKey} onDelete={onDelete} />

      <PrimaryButton
        label="Next"
        onPress={() => void onNext()}
        loading={isLoading}
        disabled={pin.length !== PIN_LENGTH}
        style={styles.button}
      />

      <Pressable style={styles.forgot}>
        <Text style={styles.forgotText}>Forgot your pin?</Text>
      </Pressable>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    alignItems: "center",
    marginTop: spacing.lg,
    marginBottom: spacing.xl,
  },
  title: {
    color: colors.white,
    fontSize: 22,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: spacing.sm,
  },
  button: {
    marginTop: spacing.lg,
  },
  forgot: {
    alignItems: "center",
    paddingVertical: spacing.lg,
  },
  forgotText: {
    color: colors.textMuted,
    fontSize: 14,
  },
  error: {
    color: colors.error,
    textAlign: "center",
    marginBottom: spacing.sm,
  },
});

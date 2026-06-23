import { Href, router } from "expo-router";
import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";

import { FastPayLogo } from "@/components/FastPayLogo";
import { AuthFooter } from "@/components/ui/AuthFooter";
import { Input } from "@/components/ui/Input";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { Screen } from "@/components/ui/Screen";
import { useOnboardingStore } from "@/store/onboardingStore";
import { colors } from "@/theme/colors";
import { spacing } from "@/theme/spacing";

export default function RegisterScreen() {
  const {
    firstName,
    lastName,
    email,
    password,
    setFirstName,
    setLastName,
    setEmail,
    setPassword,
  } = useOnboardingStore();

  const [error, setError] = useState<string | null>(null);

  const canSubmit =
    firstName.trim().length > 0 &&
    lastName.trim().length > 0 &&
    email.trim().length > 0 &&
    password.length >= 8;

  const onSubmit = () => {
    if (!canSubmit) {
      setError("Fill all fields. Password must be at least 8 characters.");
      return;
    }

    setError(null);
    router.push("/(auth)/pin-setup" as Href);
  };

  return (
    <Screen
      scroll
      footer={
        <AuthFooter
          text="Already have an account?"
          linkText="Log in"
          href="/login"
        />
      }
    >
      <View style={styles.header}>
        <FastPayLogo size={40} />
      </View>

      <Input
        placeholder="Enter your Firstname"
        value={firstName}
        onChangeText={setFirstName}
        autoCapitalize="words"
      />
      <Input
        placeholder="Enter your Lastname"
        value={lastName}
        onChangeText={setLastName}
        autoCapitalize="words"
      />
      <Input
        placeholder="Enter your Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />
      <Input
        placeholder="Enter your Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <PrimaryButton
        label="Sign Up"
        onPress={onSubmit}
        disabled={!canSubmit}
        style={styles.button}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    alignItems: "center",
    marginBottom: spacing.xl,
    marginTop: spacing.lg,
  },
  button: {
    marginTop: spacing.sm,
  },
  error: {
    color: colors.error,
    fontSize: 13,
    marginBottom: spacing.sm,
    textAlign: "center",
  },
});

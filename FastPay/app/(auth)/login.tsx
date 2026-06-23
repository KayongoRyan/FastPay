import { Href, router } from "expo-router";
import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";

import { FastPayLogo } from "@/components/FastPayLogo";
import { AuthFooter } from "@/components/ui/AuthFooter";
import { Input } from "@/components/ui/Input";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { Screen } from "@/components/ui/Screen";
import { useAuthStore } from "@/store/authStore";
import { colors } from "@/theme/colors";
import { spacing } from "@/theme/spacing";

export default function LoginScreen() {
  const { login, isLoading, error } = useAuthStore();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");

  const onSubmit = async () => {
    try {
      await login({ identifier: identifier.trim(), password });
      router.replace("/(main)/home" as Href);
    } catch {
      // surfaced via store
    }
  };

  return (
    <Screen
      centered
      footer={
        <AuthFooter
          text="Don't have an account?"
          linkText="Sign Up"
          href="/register"
        />
      }
    >
      <View style={styles.inner}>
        <FastPayLogo size={40} />
        <View style={styles.form}>
          <Input
            placeholder="Email or Phone Number"
            autoCapitalize="none"
            keyboardType="email-address"
            value={identifier}
            onChangeText={setIdentifier}
          />
          <Input
            placeholder="Password"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />
          {error ? <Text style={styles.error}>{error}</Text> : null}
          <PrimaryButton
            label="Log In"
            onPress={() => void onSubmit()}
            loading={isLoading}
            disabled={!identifier || !password}
            style={styles.button}
          />
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  inner: {
    width: "100%",
    maxWidth: 400,
    alignItems: "center",
    gap: spacing.xl,
  },
  form: {
    width: "100%",
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

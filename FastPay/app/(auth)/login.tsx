import { Href, router } from "expo-router";
import { useState } from "react";
import { Keyboard, StyleSheet, Text, View } from "react-native";

import { FastPayLogo } from "@/components/FastPayLogo";
import { PortalAuthLinks } from "@/components/portal/PortalStepBar";
import { AuthFooter } from "@/components/ui/AuthFooter";
import { Input } from "@/components/ui/Input";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { Screen } from "@/components/ui/Screen";
import { useAuthStore } from "@/store/authStore";
import { colors } from "@/theme/colors";
import { spacing } from "@/theme/spacing";

export default function LoginScreen() {
  const login = useAuthStore((state) => state.login);
  const error = useAuthStore((state) => state.error);
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [localError, setLocalError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async () => {
    Keyboard.dismiss();
    setLocalError(null);

    const trimmed = identifier.trim();
    if (!trimmed || !password) {
      setLocalError("Enter your email or phone and password.");
      return;
    }

    setSubmitting(true);
    try {
      await login({ identifier: trimmed, password });
      router.replace("/home" as Href);
    } catch {
      // error surfaced via store
    } finally {
      setSubmitting(false);
    }
  };

  const displayError = localError ?? error;

  return (
    <Screen
      centered
      footer={
        <View>
          <AuthFooter
            text="Don't have an account?"
            linkText="Sign Up"
            href="/register"
          />
          <PortalAuthLinks
            onMerchant={() => router.push("/merchant/login" as Href)}
            onBusiness={() => router.push("/business/login" as Href)}
          />
        </View>
      }
    >
      <View style={styles.inner}>
        <FastPayLogo size={40} />
        <Text style={styles.subtitle}>Personal wallet</Text>
        <View style={styles.form}>
          <Input
            placeholder="Email or Phone Number"
            autoCapitalize="none"
            keyboardType="email-address"
            value={identifier}
            onChangeText={setIdentifier}
            onSubmitEditing={() => void onSubmit()}
            returnKeyType="go"
          />
          <Input
            placeholder="Password"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
            onSubmitEditing={() => void onSubmit()}
            returnKeyType="go"
          />
          {displayError ? (
            <Text style={styles.error}>{displayError}</Text>
          ) : null}
          <PrimaryButton
            label="Log In"
            onPress={() => void onSubmit()}
            loading={submitting}
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
  subtitle: {
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: "600",
    letterSpacing: 0.8,
    textTransform: "uppercase",
    marginTop: -spacing.md,
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

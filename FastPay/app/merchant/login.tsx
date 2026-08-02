import { Href, Redirect, router } from "expo-router";
import { useState } from "react";
import { Keyboard, Pressable, StyleSheet, Text, View } from "react-native";

import { FastPayLogo } from "@/components/FastPayLogo";
import { PortalAuthLinks, PortalStepBar } from "@/components/portal/PortalStepBar";
import { PortalTypePicker } from "@/components/portal/PortalTypePicker";
import { Input } from "@/components/ui/Input";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { Screen } from "@/components/ui/Screen";
import type { BusinessType } from "@/lib/portal/business-types";
import { businessTypeLabel } from "@/lib/portal/business-types";
import { useMerchantAuthStore } from "@/store/merchantAuthStore";
import { colors } from "@/theme/colors";
import { spacing } from "@/theme/spacing";

const REG_STEPS = ["Type", "Shop", "Account"];

export default function MerchantLoginScreen() {
  const { user, isReady, login, register, error, clearError } = useMerchantAuthStore();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [step, setStep] = useState(0);

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [category, setCategory] = useState<BusinessType | "">("");
  const [businessPhone, setBusinessPhone] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [taxId, setTaxId] = useState("");
  const [localError, setLocalError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  if (isReady && user) {
    return <Redirect href={"/merchant/(app)" as Href} />;
  }

  function switchMode(next: "login" | "register") {
    setMode(next);
    setStep(0);
    setLocalError(null);
    clearError();
  }

  function validateStep(): string | null {
    if (step === 0 && !category) return "Pick your shop type.";
    if (step === 1) {
      if (!businessName.trim()) return "Business name is required.";
      if (!address.trim()) return "Shop address is required.";
      if (!city.trim()) return "City is required.";
    }
    if (step === 2) {
      if (!fullName.trim()) return "Your name is required.";
      if (!email.trim() && !phone.trim()) return "Email or phone is required.";
      if (password.length < 8) return "Password must be at least 8 characters.";
    }
    return null;
  }

  async function onSubmit() {
    Keyboard.dismiss();
    setLocalError(null);
    clearError();

    if (mode === "register" && step < REG_STEPS.length - 1) {
      const msg = validateStep();
      if (msg) {
        setLocalError(msg);
        return;
      }
      setStep((s) => s + 1);
      return;
    }

    if (mode === "register") {
      const msg = validateStep();
      if (msg) {
        setLocalError(msg);
        return;
      }
    } else if (!identifier.trim() || !password) {
      setLocalError("Enter email/phone and password.");
      return;
    }

    setBusy(true);
    try {
      if (mode === "login") {
        await login(identifier.trim(), password);
      } else {
        await register({
          fullName: fullName.trim(),
          password,
          email: email.trim() || undefined,
          phone: phone.trim() || undefined,
          businessName: businessName.trim(),
          category: category as BusinessType,
          businessEmail: email.trim() || undefined,
          businessPhone: businessPhone.trim() || phone.trim() || undefined,
          address: address.trim(),
          city: city.trim(),
          taxId: taxId.trim() || undefined,
        });
      }
      router.replace("/merchant/(app)" as Href);
    } catch {
      // store error
    } finally {
      setBusy(false);
    }
  }

  const displayError = localError ?? error;

  return (
    <Screen
      scroll
      footer={
        <PortalAuthLinks
          onBusiness={() => router.push("/business/login" as Href)}
          onConsumer={() => router.push("/(auth)/login" as Href)}
        />
      }
    >
      <View style={styles.inner}>
        <FastPayLogo size={36} />
        <Text style={styles.eyebrow}>Merchant portal</Text>
        <Text style={styles.title}>
          {mode === "login" ? "Shop sign in" : "Register your shop"}
        </Text>
        <Pressable onPress={() => switchMode(mode === "login" ? "register" : "login")}>
          <Text style={styles.switch}>
            {mode === "login" ? "New business? Create account" : "Already registered? Sign in"}
          </Text>
        </Pressable>

        {mode === "register" ? <PortalStepBar steps={REG_STEPS} current={step} /> : null}

        {mode === "login" ? (
          <>
            <Input
              label="Email or phone"
              value={identifier}
              onChangeText={setIdentifier}
              autoCapitalize="none"
              keyboardType="email-address"
            />
            <Input
              label="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </>
        ) : null}

        {mode === "register" && step === 0 ? (
          <PortalTypePicker
            title="What type of shop is this?"
            value={category}
            onChange={setCategory}
          />
        ) : null}

        {mode === "register" && step === 1 ? (
          <>
            <Text style={styles.hint}>
              Registering a <Text style={styles.hintStrong}>{businessTypeLabel(category)}</Text>
            </Text>
            <Input
              label="Business / shop name"
              value={businessName}
              onChangeText={setBusinessName}
            />
            <Input
              label="Shop phone"
              value={businessPhone}
              onChangeText={setBusinessPhone}
              keyboardType="phone-pad"
            />
            <Input label="Street address" value={address} onChangeText={setAddress} />
            <Input label="City" value={city} onChangeText={setCity} />
            <Input label="TIN (optional)" value={taxId} onChangeText={setTaxId} />
          </>
        ) : null}

        {mode === "register" && step === 2 ? (
          <>
            <Input label="Your name" value={fullName} onChangeText={setFullName} />
            <Input
              label="Email"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />
            <Input
              label="Phone"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
            />
            <Input
              label="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </>
        ) : null}

        {displayError ? <Text style={styles.error}>{displayError}</Text> : null}

        <View style={styles.actions}>
          {mode === "register" && step > 0 ? (
            <Pressable
              onPress={() => {
                setLocalError(null);
                setStep((s) => s - 1);
              }}
              style={styles.back}
            >
              <Text style={styles.backText}>Back</Text>
            </Pressable>
          ) : (
            <View />
          )}
          <PrimaryButton
            label={
              busy
                ? "Please wait…"
                : mode === "login"
                  ? "Sign in"
                  : step < REG_STEPS.length - 1
                    ? "Continue"
                    : "Create merchant account"
            }
            onPress={() => void onSubmit()}
            loading={busy}
            style={styles.submit}
          />
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  inner: {
    width: "100%",
    maxWidth: 440,
    alignSelf: "center",
    paddingTop: spacing.lg,
  },
  eyebrow: {
    marginTop: spacing.md,
    color: colors.primary,
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  title: {
    color: colors.white,
    fontSize: 24,
    fontWeight: "700",
    marginTop: spacing.xs,
    marginBottom: spacing.sm,
  },
  switch: {
    color: colors.textMuted,
    fontSize: 14,
    marginBottom: spacing.lg,
  },
  hint: {
    color: colors.textMuted,
    marginBottom: spacing.md,
  },
  hintStrong: {
    color: colors.white,
    fontWeight: "600",
  },
  error: {
    color: colors.error,
    fontSize: 13,
    marginBottom: spacing.sm,
    textAlign: "center",
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.md,
    marginTop: spacing.sm,
  },
  back: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
  },
  backText: {
    color: colors.white,
    fontWeight: "600",
  },
  submit: {
    flex: 1,
  },
});

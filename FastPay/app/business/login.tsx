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
import { businessTypeLabel, COUNTRY_OPTIONS } from "@/lib/portal/business-types";
import { useBusinessAuthStore } from "@/store/businessAuthStore";
import { colors } from "@/theme/colors";
import { spacing } from "@/theme/spacing";

const REG_STEPS = ["Type", "Company", "Location", "Account"];

export default function BusinessLoginScreen() {
  const { user, isReady, login, register, error, clearError } = useBusinessAuthStore();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [step, setStep] = useState(0);

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  const [businessType, setBusinessType] = useState<BusinessType | "">("");
  const [companyName, setCompanyName] = useState("");
  const [industry, setIndustry] = useState("");
  const [taxId, setTaxId] = useState("");
  const [registrationNumber, setRegistrationNumber] = useState("");
  const [website, setWebsite] = useState("");
  const [description, setDescription] = useState("");
  const [companyEmail, setCompanyEmail] = useState("");
  const [companyPhone, setCompanyPhone] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("RW");

  const [localError, setLocalError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  if (isReady && user) {
    return <Redirect href={"/business/(app)" as Href} />;
  }

  function switchMode(next: "login" | "register") {
    setMode(next);
    setStep(0);
    setLocalError(null);
    clearError();
  }

  function validateStep(): string | null {
    if (step === 0 && !businessType) return "Pick a business type.";
    if (step === 1) {
      if (!companyName.trim()) return "Company name is required.";
      if (businessType === "other" && !industry.trim()) {
        return "Describe your industry when type is Other.";
      }
    }
    if (step === 2) {
      if (!companyEmail.trim() && !companyPhone.trim()) {
        return "Add a company email or phone.";
      }
      if (!address.trim()) return "Business address is required.";
      if (!city.trim()) return "City is required.";
    }
    if (step === 3) {
      if (!fullName.trim()) return "Your name is required.";
      if (!email.trim() && !phone.trim()) return "Account email or phone is required.";
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
          companyName: companyName.trim(),
          businessType: businessType as BusinessType,
          industry:
            industry.trim() ||
            (businessType ? businessTypeLabel(businessType) : undefined),
          companyEmail: companyEmail.trim() || email.trim() || undefined,
          companyPhone: companyPhone.trim() || phone.trim() || undefined,
          address: address.trim(),
          city: city.trim(),
          country,
          taxId: taxId.trim() || undefined,
          registrationNumber: registrationNumber.trim() || undefined,
          website: website.trim() || undefined,
          description: description.trim() || undefined,
        });
      }
      router.replace("/business/(app)" as Href);
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
          onMerchant={() => router.push("/merchant/login" as Href)}
          onConsumer={() => router.push("/(auth)/login" as Href)}
        />
      }
    >
      <View style={styles.inner}>
        <FastPayLogo size={36} />
        <Text style={styles.eyebrow}>Business HQ</Text>
        <Text style={styles.title}>
          {mode === "login" ? "Company sign in" : "Register your company"}
        </Text>
        <Pressable onPress={() => switchMode(mode === "login" ? "register" : "login")}>
          <Text style={styles.switch}>
            {mode === "login" ? "New company? Create HQ account" : "Already registered? Sign in"}
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
            <Input label="Password" value={password} onChangeText={setPassword} secureTextEntry />
          </>
        ) : null}

        {mode === "register" && step === 0 ? (
          <PortalTypePicker
            title="What kind of business is this?"
            value={businessType}
            onChange={setBusinessType}
          />
        ) : null}

        {mode === "register" && step === 1 ? (
          <>
            <Text style={styles.hint}>
              Registering as{" "}
              <Text style={styles.hintStrong}>{businessTypeLabel(businessType)}</Text>
            </Text>
            <Input label="Company / trading name" value={companyName} onChangeText={setCompanyName} />
            {(businessType === "other" || businessType === "professional_services") && (
              <Input
                label={businessType === "other" ? "Describe your industry" : "Specialty (optional)"}
                value={industry}
                onChangeText={setIndustry}
              />
            )}
            <Input label="TIN / tax ID" value={taxId} onChangeText={setTaxId} />
            <Input
              label="Company reg. no."
              value={registrationNumber}
              onChangeText={setRegistrationNumber}
            />
            <Input label="Website (optional)" value={website} onChangeText={setWebsite} />
            <Input
              label="Short description (optional)"
              value={description}
              onChangeText={setDescription}
              multiline
            />
          </>
        ) : null}

        {mode === "register" && step === 2 ? (
          <>
            <Input
              label="Company email"
              value={companyEmail}
              onChangeText={setCompanyEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />
            <Input
              label="Company phone"
              value={companyPhone}
              onChangeText={setCompanyPhone}
              keyboardType="phone-pad"
            />
            <Input label="Street address" value={address} onChangeText={setAddress} />
            <Input label="City" value={city} onChangeText={setCity} />
            <Text style={styles.countryLabel}>Country</Text>
            <View style={styles.countryRow}>
              {COUNTRY_OPTIONS.map((c) => (
                <Pressable
                  key={c.value}
                  onPress={() => setCountry(c.value)}
                  style={[styles.countryChip, country === c.value && styles.countryChipOn]}
                >
                  <Text
                    style={[styles.countryText, country === c.value && styles.countryTextOn]}
                  >
                    {c.label}
                  </Text>
                </Pressable>
              ))}
            </View>
          </>
        ) : null}

        {mode === "register" && step === 3 ? (
          <>
            <Input label="Your name (owner / admin)" value={fullName} onChangeText={setFullName} />
            <Input
              label="Login email"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />
            <Input
              label="Login phone"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
            />
            <Input label="Password" value={password} onChangeText={setPassword} secureTextEntry />
            <Text style={styles.legal}>
              Creating an HQ account for {companyName || "your company"} (
              {businessTypeLabel(businessType)}).
            </Text>
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
                    : "Create business account"
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
  hint: { color: colors.textMuted, marginBottom: spacing.md },
  hintStrong: { color: colors.white, fontWeight: "600" },
  countryLabel: {
    color: colors.textMuted,
    fontSize: 13,
    marginBottom: spacing.sm,
  },
  countryRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  countryChip: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  countryChipOn: {
    borderColor: colors.primary,
    backgroundColor: "rgba(0,174,239,0.15)",
  },
  countryText: { color: colors.textMuted, fontSize: 12 },
  countryTextOn: { color: colors.white, fontWeight: "600" },
  legal: {
    color: colors.textMuted,
    fontSize: 13,
    marginBottom: spacing.md,
    lineHeight: 18,
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
  back: { paddingVertical: spacing.md, paddingHorizontal: spacing.md },
  backText: { color: colors.white, fontWeight: "600" },
  submit: { flex: 1 },
});

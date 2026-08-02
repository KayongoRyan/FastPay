import { Href, router } from "expo-router";
import { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { PortalHeader } from "@/components/portal/PortalHeader";
import { PortalTypePicker } from "@/components/portal/PortalTypePicker";
import { Input } from "@/components/ui/Input";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { Screen } from "@/components/ui/Screen";
import { FLOATING_TAB_BAR_HEIGHT } from "@/components/navigation/FloatingPillTabBar";
import type { BusinessType } from "@/lib/portal/business-types";
import { COUNTRY_OPTIONS } from "@/lib/portal/business-types";
import { fetchBusinessOrg, updateBusinessOrg } from "@/lib/portal/business-api";
import { useBusinessAuthStore } from "@/store/businessAuthStore";
import { colors } from "@/theme/colors";
import { spacing } from "@/theme/spacing";

export default function BusinessSettingsScreen() {
  const { user, logout } = useBusinessAuthStore();
  const [companyName, setCompanyName] = useState("");
  const [businessType, setBusinessType] = useState<BusinessType | "">("");
  const [industry, setIndustry] = useState("");
  const [companyEmail, setCompanyEmail] = useState("");
  const [companyPhone, setCompanyPhone] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("RW");
  const [taxId, setTaxId] = useState("");
  const [registrationNumber, setRegistrationNumber] = useState("");
  const [website, setWebsite] = useState("");
  const [description, setDescription] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    fetchBusinessOrg()
      .then((o) => {
        if (!o) return;
        setCompanyName(o.companyName ?? "");
        setBusinessType((o.businessType as BusinessType) ?? "");
        setIndustry(o.industry ?? "");
        setCompanyEmail(o.companyEmail ?? "");
        setCompanyPhone(o.companyPhone ?? "");
        setAddress(o.address ?? "");
        setCity(o.city ?? "");
        setCountry(o.country ?? "RW");
        setTaxId(o.taxId ?? "");
        setRegistrationNumber(o.registrationNumber ?? "");
        setWebsite(o.website ?? "");
        setDescription(o.description ?? "");
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load"));
  }, []);

  async function onSave() {
    setBusy(true);
    setMsg(null);
    setError(null);
    try {
      await updateBusinessOrg({
        companyName: companyName.trim(),
        businessType: businessType || undefined,
        industry: industry.trim() || undefined,
        companyEmail: companyEmail.trim() || undefined,
        companyPhone: companyPhone.trim() || undefined,
        address: address.trim() || undefined,
        city: city.trim() || undefined,
        country,
        taxId: taxId.trim() || undefined,
        registrationNumber: registrationNumber.trim() || undefined,
        website: website.trim() || undefined,
        description: description.trim() || undefined,
      });
      setMsg("Saved.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Update failed");
    } finally {
      setBusy(false);
    }
  }

  async function onLogout() {
    await logout();
    router.replace("/business/login" as Href);
  }

  return (
    <Screen scroll style={{ paddingBottom: FLOATING_TAB_BAR_HEIGHT + spacing.lg }}>
      <PortalHeader
        eyebrow="Company"
        title="Settings"
        subtitle={`Business code ${user?.businessCode ?? "—"}`}
      />

      {msg ? <Text style={styles.ok}>{msg}</Text> : null}
      {error ? <Text style={styles.error}>{error}</Text> : null}

      <Input label="Company name" value={companyName} onChangeText={setCompanyName} />
      <PortalTypePicker value={businessType} onChange={setBusinessType} />
      <Input label="Industry detail" value={industry} onChangeText={setIndustry} />
      <Input label="TIN / tax ID" value={taxId} onChangeText={setTaxId} />
      <Input
        label="Company reg. no."
        value={registrationNumber}
        onChangeText={setRegistrationNumber}
      />
      <Input
        label="Email"
        value={companyEmail}
        onChangeText={setCompanyEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />
      <Input label="Phone" value={companyPhone} onChangeText={setCompanyPhone} />
      <Input label="Address" value={address} onChangeText={setAddress} />
      <Input label="City" value={city} onChangeText={setCity} />
      <Text style={styles.countryLabel}>Country</Text>
      <View style={styles.countryRow}>
        {COUNTRY_OPTIONS.map((c) => (
          <Pressable
            key={c.value}
            onPress={() => setCountry(c.value)}
            style={[styles.countryChip, country === c.value && styles.countryChipOn]}
          >
            <Text style={[styles.countryText, country === c.value && styles.countryTextOn]}>
              {c.label}
            </Text>
          </Pressable>
        ))}
      </View>
      <Input label="Website" value={website} onChangeText={setWebsite} />
      <Input
        label="Description"
        value={description}
        onChangeText={setDescription}
        multiline
      />

      <PrimaryButton label="Save changes" onPress={() => void onSave()} loading={busy} />
      <View style={{ height: spacing.md }} />
      <PrimaryButton
        label="Sign out"
        onPress={() => void onLogout()}
        style={styles.logout}
        labelStyle={{ color: colors.error }}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  ok: { color: colors.success, marginBottom: spacing.md },
  error: { color: colors.error, marginBottom: spacing.md },
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
  logout: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: colors.error,
  },
});

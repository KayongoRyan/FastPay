import { Href, router } from "expo-router";
import { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";

import { PortalHeader } from "@/components/portal/PortalHeader";
import { PortalTypePicker } from "@/components/portal/PortalTypePicker";
import { Input } from "@/components/ui/Input";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { Screen } from "@/components/ui/Screen";
import { FLOATING_TAB_BAR_HEIGHT } from "@/components/navigation/FloatingPillTabBar";
import type { BusinessType } from "@/lib/portal/business-types";
import {
  fetchMerchantOrg,
  updateMerchantOrg,
} from "@/lib/portal/merchant-api";
import { useMerchantAuthStore } from "@/store/merchantAuthStore";
import { colors } from "@/theme/colors";
import { spacing } from "@/theme/spacing";

export default function MerchantSettingsScreen() {
  const { user, logout } = useMerchantAuthStore();
  const [businessName, setBusinessName] = useState(user?.businessName ?? "");
  const [category, setCategory] = useState<BusinessType | "">("");
  const [businessPhone, setBusinessPhone] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [taxId, setTaxId] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    fetchMerchantOrg()
      .then((org) => {
        if (!org) return;
        setBusinessName(org.businessName);
        setCategory((org.category as BusinessType) ?? "");
        setBusinessPhone(org.businessPhone ?? "");
        setAddress(org.address ?? "");
        setCity(org.city ?? "");
        setTaxId(org.taxId ?? "");
      })
      .catch(() => undefined);
  }, []);

  async function onSave() {
    setBusy(true);
    setMsg(null);
    setError(null);
    try {
      await updateMerchantOrg({
        businessName,
        category: category || undefined,
        businessPhone,
        address,
        city,
        taxId,
      });
      setMsg("Profile updated.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Update failed");
    } finally {
      setBusy(false);
    }
  }

  async function onLogout() {
    await logout();
    router.replace("/merchant/login" as Href);
  }

  return (
    <Screen scroll style={{ paddingBottom: FLOATING_TAB_BAR_HEIGHT + spacing.lg }}>
      <PortalHeader
        eyebrow="Shop"
        title="Settings"
        subtitle={`Merchant code ${user?.merchantCode ?? "—"} cannot be changed.`}
      />

      {msg ? <Text style={styles.ok}>{msg}</Text> : null}
      {error ? <Text style={styles.error}>{error}</Text> : null}

      <Input label="Business name" value={businessName} onChangeText={setBusinessName} />
      <PortalTypePicker value={category} onChange={setCategory} />
      <Input label="Business phone" value={businessPhone} onChangeText={setBusinessPhone} />
      <Input label="Address" value={address} onChangeText={setAddress} />
      <Input label="City" value={city} onChangeText={setCity} />
      <Input label="TIN" value={taxId} onChangeText={setTaxId} />

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
  logout: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: colors.error,
  },
});

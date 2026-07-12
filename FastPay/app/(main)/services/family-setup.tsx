import { router } from "expo-router";
import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Users } from "lucide-react-native";

import { FeaturePageLayout, FeatureActions } from "@/components/feature";
import { Input } from "@/components/ui/Input";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { useHideTabBar } from "@/hooks/useHideTabBar";
import { featureRoutes } from "@/lib/navigation/feature-routes";
import { colors } from "@/theme/colors";
import { radius, spacing } from "@/theme/spacing";

export default function FamilySetupScreen() {
  useHideTabBar();
  const [familyName, setFamilyName] = useState("");
  const [memberPhone, setMemberPhone] = useState("");
  const [created, setCreated] = useState(false);

  const handleCreate = () => {
    if (!familyName.trim()) {
      return;
    }
    setCreated(true);
  };

  if (created) {
    return (
      <FeaturePageLayout
        title="Family Wallet"
        icon={Users}
        tag="CREATED"
        headline={`${familyName} is ready`}
        description="Invite members and set spending limits from your family dashboard."
        accentColor="#A78BFA"
      >
        <FeatureActions
          actions={[
            {
              label: "Open family budget",
              onPress: () => router.push(featureRoutes.analytics("budget")),
            },
            {
              label: "Go to wallet",
              onPress: () => router.push(featureRoutes.wallet),
              variant: "outline",
            },
          ]}
        />
      </FeaturePageLayout>
    );
  }

  return (
    <FeaturePageLayout
      title="Create Family Wallet"
      icon={Users}
      tag="SETUP"
      headline="Set up your household wallet"
      description="Name your family group and invite the first member to get started."
      accentColor="#A78BFA"
    >
      <View style={styles.form}>
        <Input
          label="Family name"
          value={familyName}
          onChangeText={setFamilyName}
          placeholder="e.g. Mukama Family"
        />
        <Input
          label="Invite member (phone)"
          value={memberPhone}
          onChangeText={setMemberPhone}
          keyboardType="phone-pad"
          placeholder="2507XX XXX XXX"
        />
        <PrimaryButton label="Create family wallet" onPress={handleCreate} />
      </View>
    </FeaturePageLayout>
  );
}

const styles = StyleSheet.create({
  form: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.md,
    backgroundColor: colors.inputBg,
    marginBottom: spacing.lg,
  },
});

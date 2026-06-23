import { Href, router } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import { Mail } from "lucide-react-native";

import { BackHeader } from "@/components/ui/BackHeader";
import { OutlineButton } from "@/components/ui/OutlineButton";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { Screen } from "@/components/ui/Screen";
import { useOnboardingStore } from "@/store/onboardingStore";
import { colors } from "@/theme/colors";
import { spacing } from "@/theme/spacing";

export default function VerifyEmailScreen() {
  const email = useOnboardingStore((s) => s.email);

  return (
    <Screen scroll>
      <BackHeader />

      <View style={styles.iconWrap}>
        <Mail color={colors.white} size={64} strokeWidth={1.5} />
      </View>

      <Text style={styles.title}>Verify your email</Text>
      <Text style={styles.body}>
        We sent a verification link to {email || "your email"}. Check your inbox
        and tap the link to continue.
      </Text>

      <PrimaryButton
        label="Check my Inbox"
        onPress={() => router.push("/(auth)/otp" as Href)}
        style={styles.primary}
      />
      <OutlineButton label="Resend email" onPress={() => {}} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  iconWrap: {
    alignSelf: "center",
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.xl,
    marginTop: spacing.md,
  },
  title: {
    color: colors.white,
    fontSize: 24,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: spacing.md,
  },
  body: {
    color: colors.textMuted,
    fontSize: 15,
    lineHeight: 22,
    textAlign: "center",
    marginBottom: spacing.xl,
    paddingHorizontal: spacing.sm,
  },
  primary: {
    marginBottom: spacing.md,
  },
});

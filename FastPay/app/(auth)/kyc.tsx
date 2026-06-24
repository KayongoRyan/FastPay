import { Href, router } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { ChevronRight, CreditCard, FileText } from "lucide-react-native";

import { BackHeader } from "@/components/ui/BackHeader";
import { Screen } from "@/components/ui/Screen";
import { useOnboardingStore } from "@/store/onboardingStore";
import { colors } from "@/theme/colors";
import { radius, spacing } from "@/theme/spacing";

export default function KycScreen() {
  const reset = useOnboardingStore((s) => s.reset);

  const onComplete = () => {
    reset();
    router.replace("/home" as Href);
  };

  return (
    <Screen scroll>
      <BackHeader title="Select your ID type" />

      <Text style={styles.body}>
        In order to verify your identity, we need you to take 2 pictures of your
        ID and Proof of Address (POA).
      </Text>

      <Pressable style={styles.card} onPress={onComplete}>
        <View style={styles.cardIcon}>
          <CreditCard color={colors.white} size={22} />
        </View>
        <Text style={styles.cardLabel}>ID Card</Text>
        <ChevronRight color={colors.textMuted} size={22} />
      </Pressable>

      <Pressable style={styles.card} onPress={onComplete}>
        <View style={styles.cardIcon}>
          <FileText color={colors.white} size={22} />
        </View>
        <Text style={styles.cardLabel}>Proof of Address</Text>
        <ChevronRight color={colors.textMuted} size={22} />
      </Pressable>

      <Text style={styles.lorem}>
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Identity
        verification helps keep your account secure.
      </Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: {
    color: colors.textMuted,
    fontSize: 14,
    lineHeight: 21,
    marginBottom: spacing.xl,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
    backgroundColor: colors.inputBg,
    gap: spacing.md,
  },
  cardIcon: {
    width: 44,
    height: 44,
    borderRadius: radius.sm,
    backgroundColor: "rgba(255,255,255,0.08)",
    alignItems: "center",
    justifyContent: "center",
  },
  cardLabel: {
    flex: 1,
    color: colors.white,
    fontSize: 16,
    fontWeight: "500",
  },
  lorem: {
    color: colors.textSubtle,
    fontSize: 12,
    lineHeight: 18,
    marginTop: spacing.xl,
  },
});

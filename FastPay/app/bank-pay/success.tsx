import { Href, router } from "expo-router";
import { useEffect, useRef } from "react";
import { Animated, Easing, StyleSheet, Text, View } from "react-native";
import { Check } from "lucide-react-native";

import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { Screen } from "@/components/ui/Screen";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { useBankPayStore } from "@/store/bankPayStore";
import { colors } from "@/theme/colors";
import { spacing } from "@/theme/spacing";

export default function BankPaySuccessScreen() {
  useRequireAuth();
  const draft = useBankPayStore((state) => state.draft);
  const clearDraft = useBankPayStore((state) => state.clearDraft);
  const scale = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!draft) {
      router.replace("/bank-pay" as Href);
      return;
    }

    Animated.parallel([
      Animated.spring(scale, {
        toValue: 1,
        friction: 5,
        tension: 70,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 400,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  }, [draft, opacity, scale]);

  if (!draft) {
    return null;
  }

  const handleDone = () => {
    clearDraft();
    router.replace("/home" as Href);
  };

  return (
    <Screen centered>
      <Animated.View
        style={[
          styles.iconWrap,
          {
            opacity,
            transform: [{ scale }],
          },
        ]}
      >
        <View style={styles.iconCircle}>
          <Check color={colors.white} size={56} strokeWidth={3} />
        </View>
      </Animated.View>

      <Animated.View style={{ opacity }}>
        <Text style={styles.title}>Payment verified</Text>
        <Text style={styles.subtitle}>
          {Number(draft.amount).toLocaleString()} RWF paid to {draft.merchantName}
        </Text>
        <Text style={styles.meta}>For {draft.beneficiaryName}</Text>
      </Animated.View>

      <PrimaryButton
        label="Done"
        onPress={handleDone}
        style={styles.button}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  iconWrap: {
    marginBottom: spacing.xl,
  },
  iconCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.success,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: colors.success,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.45,
    shadowRadius: 20,
    elevation: 12,
  },
  title: {
    color: colors.white,
    fontSize: 24,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: spacing.sm,
  },
  subtitle: {
    color: colors.white,
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: spacing.xs,
    paddingHorizontal: spacing.lg,
  },
  meta: {
    color: colors.textMuted,
    fontSize: 14,
    textAlign: "center",
    marginBottom: spacing.xl,
  },
  button: {
    width: "100%",
    maxWidth: 360,
    marginTop: spacing.lg,
  },
});

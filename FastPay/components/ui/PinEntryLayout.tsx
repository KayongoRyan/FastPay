import { useRouter } from "expo-router";
import { ReactNode } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import { ChevronLeft } from "lucide-react-native";
import * as Haptics from "expo-haptics";
import { SafeAreaView } from "react-native-safe-area-context";

import { FastPayLogo } from "@/components/FastPayLogo";
import { NumericKeypad } from "@/components/ui/NumericKeypad";
import { PinDots } from "@/components/ui/PinDots";
import { colors } from "@/theme/colors";
import { radius, spacing } from "@/theme/spacing";

interface PinEntryLayoutProps {
  title: string;
  subtitle?: string;
  userName?: string;
  pin: string;
  onKey: (key: string) => void;
  onDelete: () => void;
  error?: string | null;
  loading?: boolean;
  onBack?: () => void;
  forgotPasscode?: {
    label?: string;
    onPress: () => void;
  };
  secondaryAction?: {
    label: string;
    onPress: () => void;
  };
  topRight?: ReactNode;
}

export function PinEntryLayout({
  title,
  subtitle = "Enter your passcode",
  userName,
  pin,
  onKey,
  onDelete,
  error,
  loading = false,
  onBack,
  forgotPasscode,
  secondaryAction,
  topRight,
}: PinEntryLayoutProps) {
  const router = useRouter();

  const handleKey = (key: string) => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onKey(key);
  };

  const handleDelete = () => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onDelete();
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      <View style={styles.topBar}>
        <Pressable
          style={styles.backBtn}
          onPress={onBack ?? (() => router.back())}
          hitSlop={12}
        >
          <ChevronLeft color={colors.white} size={28} />
        </Pressable>
        {topRight ?? <FastPayLogo size={34} />}
      </View>

      <View style={styles.content}>
        {userName ? (
          <View style={styles.userPill}>
            <Text style={styles.userPillText} numberOfLines={1}>
              {userName}
            </Text>
          </View>
        ) : null}

        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>

        <PinDots filled={pin.length} error={!!error} variant="passcode" />

        {error ? <Text style={styles.error}>{error}</Text> : null}
        {loading ? (
          <ActivityIndicator color={colors.primary} style={styles.loader} />
        ) : null}

        <View style={styles.keypadWrap}>
          <NumericKeypad
            variant="passcode"
            onKey={handleKey}
            onDelete={handleDelete}
          />
        </View>
      </View>

      {(forgotPasscode || secondaryAction) ? (
        <View style={styles.footer}>
          <View style={styles.orRow}>
            <View style={styles.orLine} />
            <Text style={styles.orText}>OR</Text>
            <View style={styles.orLine} />
          </View>

          {forgotPasscode ? (
            <Pressable onPress={forgotPasscode.onPress} hitSlop={8}>
              <Text style={styles.forgotPasscode}>
                {forgotPasscode.label ?? "Forgot passcode?"}
              </Text>
            </Pressable>
          ) : null}

          {secondaryAction ? (
            <Pressable
              onPress={secondaryAction.onPress}
              hitSlop={8}
              style={forgotPasscode ? styles.secondaryBelowForgot : undefined}
            >
              <Text style={styles.secondaryAction}>{secondaryAction.label}</Text>
            </Pressable>
          ) : null}
        </View>
      ) : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    alignItems: "center",
  },
  userPill: {
    alignSelf: "center",
    backgroundColor: "rgba(36, 64, 102, 0.95)",
    borderRadius: radius.pill,
    paddingHorizontal: spacing.xl,
    paddingVertical: 14,
    marginBottom: spacing.xl,
    maxWidth: "92%",
  },
  userPillText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },
  title: {
    color: colors.white,
    fontSize: 34,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: spacing.sm,
  },
  subtitle: {
    color: "rgba(255,255,255,0.55)",
    fontSize: 16,
    textAlign: "center",
  },
  error: {
    color: colors.error,
    fontSize: 14,
    textAlign: "center",
    marginTop: -spacing.md,
    marginBottom: spacing.sm,
    fontWeight: "500",
  },
  loader: {
    marginTop: spacing.sm,
  },
  keypadWrap: {
    width: "100%",
    marginTop: spacing.lg,
    flex: 1,
    justifyContent: "center",
    maxWidth: 360,
  },
  footer: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
    alignItems: "center",
  },
  orRow: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    marginBottom: spacing.lg,
    gap: spacing.md,
  },
  orLine: {
    flex: 1,
    height: 1,
    backgroundColor: "rgba(255,255,255,0.18)",
  },
  orText: {
    color: "rgba(255,255,255,0.45)",
    fontSize: 13,
    fontWeight: "600",
    letterSpacing: 1,
  },
  secondaryAction: {
    color: colors.white,
    fontSize: 16,
    fontWeight: "500",
    textAlign: "center",
  },
  forgotPasscode: {
    color: "rgba(255,255,255,0.72)",
    fontSize: 15,
    fontWeight: "500",
    textAlign: "center",
  },
  secondaryBelowForgot: {
    marginTop: spacing.lg,
  },
});

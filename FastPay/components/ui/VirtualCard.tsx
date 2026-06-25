import { useState } from "react";
import { Href, Link } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Eye, EyeOff, QrCode } from "lucide-react-native";

import { FastPayLogo } from "@/components/FastPayLogo";
import { colors } from "@/theme/colors";
import { radius, spacing } from "@/theme/spacing";

interface VirtualCardProps {
  holderName: string;
  cardNumber?: string;
  expiry?: string;
  qrHref?: Href;
  revealed?: boolean;
  onToggleReveal?: () => void;
  gradientColors?: [string, string];
  hideDots?: boolean;
  tierLabel?: string;
}

export function VirtualCard({
  holderName,
  cardNumber = "2550 3456 7728 3504",
  expiry = "19/30",
  qrHref = "/offline/receive" as Href,
  revealed: revealedProp,
  onToggleReveal,
  gradientColors = ["#1F5C52", "#0F3D38"],
  hideDots = false,
  tierLabel,
}: VirtualCardProps) {
  const [internalRevealed, setInternalRevealed] = useState(false);
  const revealed = revealedProp ?? internalRevealed;

  const handleToggleReveal = () => {
    if (onToggleReveal) {
      onToggleReveal();
    } else {
      setInternalRevealed((v) => !v);
    }
  };

  const displayNumber = revealed
    ? cardNumber
    : "•••• •••• •••• ••••";

  return (
    <View>
      <LinearGradient
        colors={gradientColors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.card}
      >
        <View style={styles.topRow}>
          <View style={styles.logoBlock}>
            <FastPayLogo size={28} />
            {tierLabel ? (
              <View style={styles.tierBadge}>
                <Text style={styles.tierBadgeText}>{tierLabel.toUpperCase()}</Text>
              </View>
            ) : null}
          </View>
          <Link href={qrHref} asChild>
            <Pressable style={styles.qrBtn} hitSlop={8}>
              <QrCode color={colors.white} size={22} />
            </Pressable>
          </Link>
        </View>

        <Text style={styles.number}>{displayNumber}</Text>

        <View style={styles.bottomRow}>
          <View style={styles.expiryBlock}>
            <Text style={styles.expiry}>{expiry}</Text>
            <Text style={styles.holder}>{holderName.toUpperCase()}</Text>
          </View>
          <Pressable
            style={styles.eyeBtn}
            onPress={handleToggleReveal}
            hitSlop={8}
          >
            {revealed ? (
              <EyeOff color={colors.white} size={20} />
            ) : (
              <Eye color={colors.white} size={20} />
            )}
          </Pressable>
        </View>
      </LinearGradient>

      {!hideDots ? (
        <View style={styles.dots}>
          <View style={[styles.dot, styles.dotActive]} />
          <View style={styles.dot} />
          <View style={styles.dot} />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.lg,
    padding: spacing.lg,
    minHeight: 188,
    justifyContent: "space-between",
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  logoBlock: {
    gap: spacing.sm,
  },
  tierBadge: {
    alignSelf: "flex-start",
    backgroundColor: "rgba(255,255,255,0.16)",
    borderRadius: radius.pill,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  tierBadgeText: {
    color: colors.white,
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1,
  },
  qrBtn: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: "rgba(255,255,255,0.12)",
    alignItems: "center",
    justifyContent: "center",
  },
  number: {
    color: colors.white,
    fontSize: 19,
    letterSpacing: 2.5,
    fontWeight: "500",
    marginVertical: spacing.lg,
  },
  bottomRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  expiryBlock: {
    gap: 4,
  },
  expiry: {
    color: "rgba(255,255,255,0.75)",
    fontSize: 13,
    fontWeight: "500",
  },
  holder: {
    color: colors.white,
    fontSize: 13,
    fontWeight: "700",
    letterSpacing: 1,
  },
  eyeBtn: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  dots: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 6,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: "rgba(255,255,255,0.25)",
  },
  dotActive: {
    backgroundColor: colors.white,
    width: 8,
    height: 8,
  },
});

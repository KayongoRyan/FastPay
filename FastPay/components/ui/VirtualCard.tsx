import { LinearGradient } from "expo-linear-gradient";
import { StyleSheet, Text, View } from "react-native";

import { FastPayLogo } from "@/components/FastPayLogo";
import { colors } from "@/theme/colors";
import { radius, spacing } from "@/theme/spacing";

interface VirtualCardProps {
  holderName: string;
  cardNumber?: string;
  expiry?: string;
}

export function VirtualCard({
  holderName,
  cardNumber = "2550 3456 7728 3504",
  expiry = "12/28",
}: VirtualCardProps) {
  return (
    <LinearGradient
      colors={[colors.cardTeal, colors.cardTealDark]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.card}
    >
      <View style={styles.topRow}>
        <FastPayLogo size={28} />
        <View style={styles.chip} />
      </View>
      <Text style={styles.number}>{cardNumber}</Text>
      <View style={styles.bottomRow}>
        <View>
          <Text style={styles.meta}>CARD HOLDER</Text>
          <Text style={styles.holder}>{holderName.toUpperCase()}</Text>
        </View>
        <View>
          <Text style={styles.meta}>EXPIRES</Text>
          <Text style={styles.holder}>{expiry}</Text>
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.lg,
    padding: spacing.lg,
    minHeight: 180,
    justifyContent: "space-between",
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  chip: {
    width: 36,
    height: 26,
    borderRadius: 4,
    backgroundColor: "rgba(255,255,255,0.25)",
  },
  number: {
    color: colors.white,
    fontSize: 18,
    letterSpacing: 2,
    fontWeight: "500",
    marginVertical: spacing.md,
  },
  bottomRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  meta: {
    color: "rgba(255,255,255,0.5)",
    fontSize: 9,
    letterSpacing: 1,
    marginBottom: 2,
  },
  holder: {
    color: colors.white,
    fontSize: 13,
    fontWeight: "600",
    letterSpacing: 0.5,
  },
});

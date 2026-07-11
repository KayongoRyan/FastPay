import { Href, router } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { ArrowDownLeft, ArrowUpRight, WifiOff } from "lucide-react-native";

import { ServiceScreenShell } from "@/components/services";
import { colors } from "@/theme/colors";
import { radius, spacing } from "@/theme/spacing";

export default function OfflinePayScreen() {
  return (
    <ServiceScreenShell
      title="Offline Pay"
      icon={WifiOff}
      description="Sign payments without internet and relay them when you are back online."
      features={[
        "Generate signed payment QR codes",
        "Scan and store offline transactions",
        "Auto-relay when connectivity returns",
        "Works with Stellar-backed wallets",
      ]}
    >
      <View style={styles.actions}>
        <Pressable
          style={styles.actionCard}
          onPress={() => router.push("/offline/send" as Href)}
        >
          <View style={styles.actionIcon}>
            <ArrowUpRight color={colors.white} size={22} />
          </View>
          <View style={styles.actionCopy}>
            <Text style={styles.actionTitle}>Send offline</Text>
            <Text style={styles.actionMeta}>Create a signed payment QR</Text>
          </View>
        </Pressable>
        <Pressable
          style={styles.actionCard}
          onPress={() => router.push("/offline/receive" as Href)}
        >
          <View style={styles.actionIcon}>
            <ArrowDownLeft color={colors.white} size={22} />
          </View>
          <View style={styles.actionCopy}>
            <Text style={styles.actionTitle}>Receive offline</Text>
            <Text style={styles.actionMeta}>Scan and relay when online</Text>
          </View>
        </Pressable>
      </View>
    </ServiceScreenShell>
  );
}

const styles = StyleSheet.create({
  actions: {
    marginTop: spacing.lg,
    gap: spacing.sm,
  },
  actionCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.md,
    backgroundColor: colors.inputBg,
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: radius.sm,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.06)",
  },
  actionCopy: {
    flex: 1,
  },
  actionTitle: {
    color: colors.white,
    fontSize: 15,
    fontWeight: "600",
  },
  actionMeta: {
    color: colors.textMuted,
    fontSize: 13,
    marginTop: 2,
  },
});

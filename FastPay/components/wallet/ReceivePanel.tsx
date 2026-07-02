import { useMemo, useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import QRCode from "react-native-qrcode-svg";
import * as Clipboard from "expo-clipboard";
import { Copy, QrCode } from "lucide-react-native";

import { useTabBarPadding } from "@/components/layout/TabScreenLayout";
import { colors } from "@/theme/colors";
import { radius, spacing } from "@/theme/spacing";

interface ReceivePanelProps {
  publicKey: string;
  holderName: string;
}

export function ReceivePanel({ publicKey, holderName }: ReceivePanelProps) {
  const tabBarPadding = useTabBarPadding();
  const [copied, setCopied] = useState(false);

  const receiveQrValue = useMemo(
    () =>
      JSON.stringify({
        v: 1,
        type: "fastpay-receive",
        publicKey,
        name: holderName,
      }),
    [publicKey, holderName],
  );

  const copyKey = async () => {
    await Clipboard.setStringAsync(publicKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={{
        paddingBottom: tabBarPadding + spacing.md,
      }}
      style={styles.scroll}
    >
      <Text style={styles.pageTag}>RECEIVE</Text>
      <Text style={styles.subtitle}>
        Share your QR or wallet address so others can pay you.
      </Text>

      <View style={styles.heroCard}>
        <View style={styles.heroIcon}>
          <QrCode color={colors.primary} size={22} />
        </View>
        <Text style={styles.heroName}>{holderName}</Text>
        <View style={styles.qrWrap}>
          <QRCode
            value={receiveQrValue}
            size={196}
            backgroundColor="#ffffff"
            color="#08182F"
          />
        </View>
        <Text style={styles.qrHint}>Scan to pay this wallet</Text>
      </View>

      <View style={styles.steps}>
        {[
          "Share your QR or address",
          "Sender completes payment",
          "Funds appear in your wallet",
        ].map((step, index) => (
          <View key={step} style={styles.stepRow}>
            <View style={styles.stepBadge}>
              <Text style={styles.stepBadgeText}>{index + 1}</Text>
            </View>
            <Text style={styles.stepText}>{step}</Text>
          </View>
        ))}
      </View>

      <View style={styles.addressCard}>
        <Text style={styles.addressLabel}>Wallet address</Text>
        <Text style={styles.addressValue} selectable>
          {publicKey}
        </Text>
        <Pressable style={styles.copyBtn} onPress={() => void copyKey()}>
          <Copy color={colors.primary} size={16} />
          <Text style={styles.copyBtnText}>
            {copied ? "Copied" : "Copy address"}
          </Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
  },
  pageTag: {
    color: colors.white,
    fontSize: 14,
    fontWeight: "700",
    letterSpacing: 2,
    textAlign: "center",
    marginBottom: spacing.sm,
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: 14,
    lineHeight: 20,
    textAlign: "center",
    marginBottom: spacing.lg,
  },
  heroCard: {
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    backgroundColor: colors.inputBg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  heroIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(0,174,239,0.12)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.sm,
  },
  heroName: {
    color: colors.white,
    fontSize: 16,
    fontWeight: "700",
    marginBottom: spacing.md,
  },
  qrWrap: {
    padding: spacing.md,
    backgroundColor: colors.white,
    borderRadius: radius.md,
  },
  qrHint: {
    color: colors.textMuted,
    fontSize: 13,
    marginTop: spacing.md,
  },
  steps: {
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  stepRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  stepBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "rgba(0,174,239,0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  stepBadgeText: {
    color: colors.primary,
    fontWeight: "700",
    fontSize: 13,
  },
  stepText: {
    color: colors.white,
    fontSize: 14,
    flex: 1,
  },
  addressCard: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.md,
    backgroundColor: colors.inputBg,
  },
  addressLabel: {
    color: colors.textMuted,
    fontSize: 12,
    textTransform: "uppercase",
    marginBottom: spacing.sm,
  },
  addressValue: {
    color: colors.white,
    fontSize: 13,
    lineHeight: 20,
    marginBottom: spacing.md,
  },
  copyBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    alignSelf: "flex-start",
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
  },
  copyBtnText: {
    color: colors.primary,
    fontWeight: "600",
    fontSize: 13,
  },
});

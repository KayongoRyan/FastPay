import { ReactNode } from "react";
import { StyleSheet, Text, View } from "react-native";

import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { colors } from "@/theme/colors";
import { spacing } from "@/theme/spacing";

interface WalletGateProps {
  walletReady: boolean;
  wallet: unknown;
  walletLoading: boolean;
  onCreateWallet: () => void;
  children: ReactNode;
}

export function WalletGate({
  walletReady,
  wallet,
  walletLoading,
  onCreateWallet,
  children,
}: WalletGateProps) {
  if (!walletReady) {
    return <Text style={styles.muted}>Loading wallet...</Text>;
  }

  if (!wallet) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyTitle}>Wallet required</Text>
        <Text style={styles.emptyText}>
          Create a Stellar wallet to send and receive funds on FastPay.
        </Text>
        <PrimaryButton
          label={walletLoading ? "Creating..." : "Create wallet"}
          onPress={onCreateWallet}
          loading={walletLoading}
        />
      </View>
    );
  }

  return <>{children}</>;
}

const styles = StyleSheet.create({
  muted: { color: colors.textMuted },
  empty: {
    gap: spacing.md,
    paddingVertical: spacing.lg,
  },
  emptyTitle: {
    color: colors.white,
    fontSize: 18,
    fontWeight: "700",
  },
  emptyText: {
    color: colors.textMuted,
    fontSize: 14,
    lineHeight: 20,
  },
});

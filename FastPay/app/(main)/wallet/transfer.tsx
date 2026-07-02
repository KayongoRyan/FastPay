import { router } from "expo-router";
import { useEffect } from "react";
import { StyleSheet, Text } from "react-native";

import { BackHeader } from "@/components/ui/BackHeader";
import { TransferPanel } from "@/components/wallet/TransferPanel";
import { WalletGate } from "@/components/wallet/WalletGate";
import { TabScreenLayout } from "@/components/layout/TabScreenLayout";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { useWalletStore } from "@/store/walletStore";
import { colors } from "@/theme/colors";

export default function TransferScreen() {
  const { user, isReady, isLoading } = useRequireAuth();
  const {
    wallet,
    initialize,
    createWallet,
    isLoading: walletLoading,
    isReady: walletReady,
  } = useWalletStore();

  useEffect(() => {
    if (user) void initialize();
  }, [user, initialize]);

  if (!isReady || isLoading || !user) {
    return (
      <TabScreenLayout scroll={false}>
        <Text style={styles.muted}>Loading...</Text>
      </TabScreenLayout>
    );
  }

  return (
    <TabScreenLayout scroll={false} style={styles.container}>
      <BackHeader title="Transfer" onBack={() => router.back()} />
      <WalletGate
        walletReady={walletReady}
        wallet={wallet}
        walletLoading={walletLoading}
        onCreateWallet={() => void createWallet()}
      >
        {wallet ? <TransferPanel /> : null}
      </WalletGate>
    </TabScreenLayout>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  muted: { color: colors.textMuted },
});

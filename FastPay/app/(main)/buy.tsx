import { router } from "expo-router";
import { useState } from "react";
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { ChevronDown, Keyboard, X } from "lucide-react-native";

import { BackHeader } from "@/components/ui/BackHeader";
import { NumericKeypad } from "@/components/ui/NumericKeypad";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { TabScreenLayout } from "@/components/layout/TabScreenLayout";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import {
  formatAmount,
  formatUsdt,
} from "@/lib/convert/currencies";
import {
  getMobileMoneyProvider,
  MOBILE_MONEY_PROVIDERS,
  MobileMoneyProviderId,
} from "@/lib/buy/mobile-money";
import { colors } from "@/theme/colors";
import { radius, spacing } from "@/theme/spacing";

const RWF_TO_USDT = 0.0000108245;

export default function BuyScreen() {
  useRequireAuth();

  const [amount, setAmount] = useState("10000");
  const [providerId, setProviderId] = useState<MobileMoneyProviderId>("mtn");
  const [providerPickerOpen, setProviderPickerOpen] = useState(false);
  const [keypadOpen, setKeypadOpen] = useState(false);

  const provider = getMobileMoneyProvider(providerId);
  const numericAmount = Number(amount) || 0;
  const usdtAmount = numericAmount * RWF_TO_USDT;

  const onKey = (key: string) => {
    if (key === "*") return;
    setAmount((prev) => `${prev}${key}`.replace(/^0+(?=\d)/, ""));
  };

  const onDelete = () =>
    setAmount((prev) => (prev.length <= 1 ? "0" : prev.slice(0, -1)));

  return (
    <TabScreenLayout scroll={false} style={styles.container}>
      <BackHeader title="Voucher" onBack={() => router.back()} />

      <View style={styles.main}>
        <View style={styles.content}>
          <Text style={styles.header}>BUY USDT</Text>

          <View style={styles.currencyBadge}>
            <Text style={styles.currencyText}>RWF</Text>
          </View>

          <Pressable
            style={styles.amountWrap}
            onPress={() => setKeypadOpen(true)}
          >
            <Text style={styles.amount}>{formatAmount(numericAmount)} RWF</Text>
            {keypadOpen ? <View style={styles.cursor} /> : null}
          </Pressable>

          <Text style={styles.convertedLabel}>You receive</Text>
          <Text style={styles.converted}>{formatUsdt(usdtAmount)} USDT</Text>

          <Pressable
            style={styles.paymentBtn}
            onPress={() => {
              setProviderPickerOpen(true);
              setKeypadOpen(false);
            }}
          >
            <Text style={styles.paymentText}>{provider.label}</Text>
            <ChevronDown color={colors.white} size={18} />
          </Pressable>

          <PrimaryButton label="CONVERT" onPress={() => {}} style={styles.convertBtn} />

          {keypadOpen ? (
            <View style={styles.keypadWrap}>
              <NumericKeypad
                onKey={onKey}
                onDelete={onDelete}
                variant="convert"
                onClose={() => setKeypadOpen(false)}
              />
            </View>
          ) : null}
        </View>

        {!keypadOpen ? (
          <Pressable
            style={styles.openKeypadBtn}
            onPress={() => setKeypadOpen(true)}
            hitSlop={8}
          >
            <Keyboard color={colors.white} size={24} />
          </Pressable>
        ) : null}
      </View>

      <Modal visible={providerPickerOpen} transparent animationType="fade">
        <Pressable
          style={styles.modalBackdrop}
          onPress={() => setProviderPickerOpen(false)}
        >
          <Pressable style={styles.modalSheet} onPress={(e) => e.stopPropagation()}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Pay with</Text>
              <Pressable onPress={() => setProviderPickerOpen(false)} hitSlop={8}>
                <X color={colors.white} size={22} />
              </Pressable>
            </View>
            <Text style={styles.modalHint}>Choose your mobile money provider</Text>
            {MOBILE_MONEY_PROVIDERS.map((item) => {
              const active = item.id === providerId;
              return (
                <Pressable
                  key={item.id}
                  style={[styles.providerRow, active && styles.providerRowActive]}
                  onPress={() => {
                    setProviderId(item.id);
                    setProviderPickerOpen(false);
                  }}
                >
                  <Text style={styles.providerLabel}>{item.label}</Text>
                  {active ? <Text style={styles.checkmark}>✓</Text> : null}
                </Pressable>
              );
            })}
          </Pressable>
        </Pressable>
      </Modal>
    </TabScreenLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingBottom: 0,
  },
  main: {
    flex: 1,
    justifyContent: "space-between",
  },
  content: {
    flexShrink: 1,
  },
  header: {
    color: colors.white,
    fontSize: 14,
    fontWeight: "700",
    letterSpacing: 2,
    textAlign: "center",
    marginBottom: spacing.lg,
  },
  currencyBadge: {
    alignSelf: "center",
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    marginBottom: spacing.md,
  },
  currencyText: { color: colors.white, fontWeight: "600", fontSize: 15 },
  amountWrap: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    marginBottom: spacing.sm,
  },
  amount: {
    color: colors.white,
    fontSize: 34,
    fontWeight: "700",
    textAlign: "center",
  },
  cursor: {
    width: 2,
    height: 28,
    backgroundColor: colors.primary,
    marginLeft: 4,
    borderRadius: 1,
  },
  convertedLabel: {
    color: colors.textMuted,
    textAlign: "center",
    fontSize: 13,
    marginBottom: 4,
  },
  converted: {
    color: colors.white,
    textAlign: "center",
    fontSize: 20,
    fontWeight: "600",
    marginBottom: spacing.md,
  },
  paymentBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.pill,
    paddingVertical: 12,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  paymentText: { color: colors.white, fontSize: 15, fontWeight: "600" },
  convertBtn: {
    marginBottom: 0,
  },
  keypadWrap: {
    marginTop: 12,
  },
  openKeypadBtn: {
    alignSelf: "flex-end",
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.55)",
    justifyContent: "flex-end",
  },
  modalSheet: {
    backgroundColor: colors.backgroundDeep,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: spacing.lg,
    paddingBottom: spacing.xl,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.xs,
  },
  modalTitle: {
    color: colors.white,
    fontSize: 18,
    fontWeight: "700",
  },
  modalHint: {
    color: colors.textMuted,
    fontSize: 13,
    marginBottom: spacing.md,
  },
  providerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.md,
    marginBottom: spacing.xs,
  },
  providerRowActive: {
    backgroundColor: "rgba(0,174,239,0.12)",
  },
  providerLabel: {
    color: colors.white,
    fontSize: 16,
    fontWeight: "600",
  },
  checkmark: {
    color: colors.primary,
    fontSize: 18,
    fontWeight: "700",
  },
});

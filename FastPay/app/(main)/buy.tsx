import { router } from "expo-router";
import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { ChevronDown } from "lucide-react-native";

import { BackHeader } from "@/components/ui/BackHeader";
import { NumericKeypad } from "@/components/ui/NumericKeypad";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { TabScreenLayout } from "@/components/layout/TabScreenLayout";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { colors } from "@/theme/colors";
import { radius, spacing } from "@/theme/spacing";

const RWF_TO_USDT = 0.0000108245;

export default function BuyScreen() {
  useRequireAuth();
  const [amount, setAmount] = useState("10000");
  const [payment, setPayment] = useState("MTN/ MOMO");

  const onKey = (key: string) => setAmount((prev) => `${prev}${key}`.replace(/^0+(?=\d)/, ""));
  const onDelete = () => setAmount((prev) => (prev.length <= 1 ? "0" : prev.slice(0, -1)));

  const numericAmount = Number(amount) || 0;
  const converted = (numericAmount * RWF_TO_USDT).toFixed(6);

  return (
    <TabScreenLayout scroll={false} style={styles.container}>
      <BackHeader title="Buy USDT" onBack={() => router.back()} />

      <Pressable style={styles.currencyBtn}>
        <Text style={styles.currencyText}>RWF</Text>
        <ChevronDown color={colors.white} size={18} />
      </Pressable>

      <Text style={styles.amount}>{numericAmount.toLocaleString()}</Text>
      <Text style={styles.converted}>~ {converted}</Text>

      <Pressable style={styles.paymentBtn}>
        <Text style={styles.paymentText}>{payment}</Text>
        <ChevronDown color={colors.white} size={18} />
      </Pressable>

      <PrimaryButton label="CONVERT" onPress={() => {}} style={styles.convertBtn} />

      <View style={styles.keypadWrap}>
        <NumericKeypad onKey={onKey} onDelete={onDelete} variant="light" />
      </View>
    </TabScreenLayout>
  );
}

const styles = StyleSheet.create({
  container: { paddingBottom: 0 },
  currencyBtn: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "center",
    gap: 6,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    marginBottom: spacing.lg,
  },
  currencyText: { color: colors.white, fontWeight: "600" },
  amount: {
    color: colors.white,
    fontSize: 40,
    fontWeight: "700",
    textAlign: "center",
  },
  converted: {
    color: colors.textMuted,
    textAlign: "center",
    marginTop: spacing.sm,
    marginBottom: spacing.lg,
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
    marginBottom: spacing.lg,
  },
  paymentText: { color: colors.white, fontSize: 15 },
  convertBtn: { marginBottom: spacing.md },
  keypadWrap: { flex: 1, justifyContent: "flex-end", marginHorizontal: -spacing.lg },
});

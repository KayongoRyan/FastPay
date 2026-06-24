import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { ChevronDown } from "lucide-react-native";

import { TabScreenLayout } from "@/components/layout/TabScreenLayout";
import { NumericKeypad } from "@/components/ui/NumericKeypad";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { colors } from "@/theme/colors";
import { radius, spacing } from "@/theme/spacing";

const RWF_TO_USDT = 0.0000108245;

export default function ConvertScreen() {
  useRequireAuth();
  const [amount, setAmount] = useState("10000");

  const onKey = (key: string) => setAmount((prev) => `${prev}${key}`.replace(/^0+(?=\d)/, ""));
  const onDelete = () => setAmount((prev) => (prev.length <= 1 ? "0" : prev.slice(0, -1)));

  const numericAmount = Number(amount) || 0;
  const converted = (numericAmount * RWF_TO_USDT).toFixed(6);

  return (
    <TabScreenLayout scroll={false} style={styles.container}>
      <Text style={styles.header}>CONVERT</Text>

      <Pressable style={styles.currencyBtn}>
        <Text style={styles.currencyText}>RWF</Text>
        <ChevronDown color={colors.white} size={18} />
      </Pressable>

      <Text style={styles.amount}>{numericAmount.toLocaleString()} RWF</Text>
      <Text style={styles.converted}>- {converted}</Text>

      <PrimaryButton
        label="CONVERT"
        onPress={() => {}}
        style={styles.convertBtn}
      />

      <View style={styles.keypadWrap}>
        <NumericKeypad onKey={onKey} onDelete={onDelete} variant="light" />
      </View>
    </TabScreenLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingBottom: 0,
    justifyContent: "flex-start",
  },
  header: {
    color: colors.white,
    fontSize: 14,
    fontWeight: "700",
    letterSpacing: 2,
    textAlign: "center",
    marginBottom: spacing.xl,
  },
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
    fontSize: 36,
    fontWeight: "700",
    textAlign: "center",
  },
  converted: {
    color: colors.textMuted,
    textAlign: "center",
    marginTop: spacing.sm,
    marginBottom: spacing.lg,
  },
  convertBtn: { marginBottom: spacing.md },
  keypadWrap: { flex: 1, justifyContent: "flex-end", marginHorizontal: -spacing.lg },
});

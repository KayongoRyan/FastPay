import { useState } from "react";
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { ArrowDown, ChevronDown, Keyboard, X } from "lucide-react-native";

import {
  TAB_BAR_PADDING,
  TabScreenLayout,
} from "@/components/layout/TabScreenLayout";
import { NumericKeypad } from "@/components/ui/NumericKeypad";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import {
  convertToUsdt,
  CURRENCIES,
  Currency,
  CurrencyCode,
  formatAmount,
  formatUsdt,
  getCurrency,
} from "@/lib/convert/currencies";
import { colors } from "@/theme/colors";
import { radius, spacing } from "@/theme/spacing";

export default function ConvertScreen() {
  useRequireAuth();

  const [amount, setAmount] = useState("10000");
  const [currencyCode, setCurrencyCode] = useState<CurrencyCode>("RWF");
  const [pickerOpen, setPickerOpen] = useState(false);
  const [keypadOpen, setKeypadOpen] = useState(false);

  const currency = getCurrency(currencyCode);
  const numericAmount = Number(amount) || 0;
  const usdtAmount = convertToUsdt(numericAmount, currency);

  const onKey = (key: string) => {
    if (key === "*") return;
    setAmount((prev) => `${prev}${key}`.replace(/^0+(?=\d)/, ""));
  };

  const onDelete = () =>
    setAmount((prev) => (prev.length <= 1 ? "0" : prev.slice(0, -1)));

  const selectCurrency = (next: Currency) => {
    setCurrencyCode(next.code);
    setPickerOpen(false);
  };

  return (
    <TabScreenLayout
      scroll={false}
      bottomInset={keypadOpen ? 0 : TAB_BAR_PADDING}
      style={styles.container}
      footer={
        keypadOpen ? (
          <View style={styles.keypadFooter}>
            <NumericKeypad
              onKey={onKey}
              onDelete={onDelete}
              variant="convert"
              onClose={() => setKeypadOpen(false)}
            />
          </View>
        ) : null
      }
    >
      <View style={styles.main}>
        <View style={styles.content}>
          <Text style={styles.header}>CONVERT</Text>

          <View style={styles.flow}>
            <Pressable
              style={styles.currencyBtn}
              onPress={() => {
                setPickerOpen(true);
                setKeypadOpen(false);
              }}
            >
              <Text style={styles.currencyText}>{currency.code}</Text>
              <ChevronDown color={colors.white} size={18} />
            </Pressable>

            <ArrowDown color={colors.textMuted} size={20} style={styles.arrow} />

            <View style={styles.usdtBadge}>
              <Text style={styles.usdtText}>USDT</Text>
            </View>
          </View>

          <Pressable
            style={styles.amountWrap}
            onPress={() => setKeypadOpen(true)}
          >
            <Text style={styles.amount}>
              {formatAmount(numericAmount)} {currency.code}
            </Text>
            {keypadOpen ? <View style={styles.cursor} /> : null}
          </Pressable>

          <Text style={styles.convertedLabel}>You receive</Text>
          <Text style={styles.converted}>{formatUsdt(usdtAmount)} USDT</Text>

          <PrimaryButton
            label="CONVERT"
            onPress={() => {}}
            style={styles.convertBtn}
          />
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

      <Modal visible={pickerOpen} transparent animationType="fade">
        <Pressable style={styles.modalBackdrop} onPress={() => setPickerOpen(false)}>
          <Pressable style={styles.modalSheet} onPress={(e) => e.stopPropagation()}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>From currency</Text>
              <Pressable onPress={() => setPickerOpen(false)} hitSlop={8}>
                <X color={colors.white} size={22} />
              </Pressable>
            </View>
            <Text style={styles.modalHint}>All amounts convert to USDT</Text>
            {CURRENCIES.map((item) => {
              const active = item.code === currencyCode;
              return (
                <Pressable
                  key={item.code}
                  style={[styles.currencyRow, active && styles.currencyRowActive]}
                  onPress={() => selectCurrency(item)}
                >
                  <View>
                    <Text style={styles.currencyRowCode}>{item.code}</Text>
                    <Text style={styles.currencyRowLabel}>{item.label}</Text>
                  </View>
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
  flow: {
    alignItems: "center",
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  currencyBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
  },
  currencyText: { color: colors.white, fontWeight: "600", fontSize: 15 },
  arrow: { marginVertical: 2 },
  usdtBadge: {
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.lg,
    paddingVertical: 8,
    backgroundColor: "rgba(0,174,239,0.12)",
  },
  usdtText: {
    color: colors.primary,
    fontWeight: "700",
    fontSize: 15,
  },
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
  convertBtn: {
    marginBottom: spacing.sm,
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
  keypadFooter: {
    marginHorizontal: -spacing.lg,
    paddingBottom: TAB_BAR_PADDING,
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
    maxHeight: "70%",
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
  currencyRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.md,
    marginBottom: spacing.xs,
  },
  currencyRowActive: {
    backgroundColor: "rgba(0,174,239,0.12)",
  },
  currencyRowCode: {
    color: colors.white,
    fontSize: 16,
    fontWeight: "600",
  },
  currencyRowLabel: {
    color: colors.textMuted,
    fontSize: 13,
    marginTop: 2,
  },
  checkmark: {
    color: colors.primary,
    fontSize: 18,
    fontWeight: "700",
  },
});

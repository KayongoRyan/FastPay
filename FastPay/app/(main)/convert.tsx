import { useMemo, useRef, useState } from "react";
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import {
  ArrowDown,
  ArrowLeftRight,
  Check,
  ChevronDown,
  Sparkles,
  X,
  Zap,
} from "lucide-react-native";

import { TabScreenLayout } from "@/components/layout/TabScreenLayout";
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

const STEPS = [
  { icon: ArrowLeftRight, text: "Pick your source currency" },
  { icon: Sparkles, text: "See the live rate before you confirm" },
  { icon: Zap, text: "USDT lands in your wallet instantly" },
] as const;

function sanitizeAmount(raw: string): string {
  const digits = raw.replace(/[^\d]/g, "");
  if (!digits) {
    return "0";
  }
  return digits.replace(/^0+(?=\d)/, "");
}

export default function ConvertScreen() {
  useRequireAuth();

  const inputRef = useRef<TextInput>(null);
  const [amount, setAmount] = useState("10000");
  const [currencyCode, setCurrencyCode] = useState<CurrencyCode>("RWF");
  const [pickerOpen, setPickerOpen] = useState(false);

  const currency = getCurrency(currencyCode);
  const numericAmount = Number(amount) || 0;
  const usdtAmount = convertToUsdt(numericAmount, currency);

  const rateLabel = useMemo(() => {
    const perUnit = currency.rateToUsdt;
    if (perUnit >= 0.01) {
      return `1 ${currency.code} ≈ ${perUnit.toFixed(4)} USDT`;
    }
    return `1 ${currency.code} ≈ ${perUnit.toFixed(8)} USDT`;
  }, [currency]);

  const selectCurrency = (next: Currency) => {
    setCurrencyCode(next.code);
    setPickerOpen(false);
  };

  return (
    <TabScreenLayout scroll adjustForKeyboard style={styles.container}>
      <View style={styles.hero}>
        <View style={styles.heroIcon}>
          <ArrowLeftRight color={colors.primary} size={22} />
        </View>
        <Text style={styles.title}>Convert to USDT</Text>
        <Text style={styles.subtitle}>
          Exchange RWF, USD, EUR, and more at competitive rates — right inside
          your wallet.
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardLabel}>You pay</Text>
        <Pressable
          style={styles.currencyChip}
          onPress={() => setPickerOpen(true)}
        >
          <Text style={styles.currencyChipCode}>{currency.code}</Text>
          <Text style={styles.currencyChipName}>{currency.label}</Text>
          <ChevronDown color={colors.textMuted} size={18} />
        </Pressable>

        <Pressable
          style={styles.amountField}
          onPress={() => inputRef.current?.focus()}
        >
          <TextInput
            ref={inputRef}
            value={amount === "0" ? "" : amount}
            onChangeText={(text) => setAmount(sanitizeAmount(text))}
            keyboardType="number-pad"
            returnKeyType="done"
            placeholder="0"
            placeholderTextColor={colors.textSubtle}
            cursorColor={colors.primary}
            selectionColor="rgba(0,174,239,0.35)"
            style={styles.amountInput}
            maxLength={12}
          />
          <Text style={styles.amountSuffix}>{currency.code}</Text>
        </Pressable>
      </View>

      <View style={styles.swapRail}>
        <View style={styles.swapLine} />
        <View style={styles.swapBadge}>
          <ArrowDown color={colors.primary} size={18} />
        </View>
        <View style={styles.swapLine} />
      </View>

      <View style={[styles.card, styles.receiveCard]}>
        <Text style={styles.cardLabel}>You receive</Text>
        <View style={styles.usdtRow}>
          <View style={styles.usdtBadge}>
            <Text style={styles.usdtBadgeText}>USDT</Text>
          </View>
          <Text style={styles.receiveAmount}>{formatUsdt(usdtAmount)}</Text>
        </View>
        <Text style={styles.rateText}>{rateLabel}</Text>
        <Text style={styles.feeText}>No conversion fee · Instant settlement</Text>
      </View>

      <View style={styles.summaryRow}>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryValue}>
            {formatAmount(numericAmount)}
          </Text>
          <Text style={styles.summaryKey}>{currency.code}</Text>
        </View>
        <ArrowLeftRight color={colors.textMuted} size={16} />
        <View style={styles.summaryItem}>
          <Text style={styles.summaryValue}>{formatUsdt(usdtAmount)}</Text>
          <Text style={styles.summaryKey}>USDT</Text>
        </View>
      </View>

      <PrimaryButton label="CONVERT" onPress={() => {}} style={styles.cta} />

      <View style={styles.stepsCard}>
        <Text style={styles.stepsTitle}>How it works</Text>
        {STEPS.map(({ icon: Icon, text }) => (
          <View key={text} style={styles.stepRow}>
            <View style={styles.stepIcon}>
              <Icon color={colors.primary} size={16} />
            </View>
            <Text style={styles.stepText}>{text}</Text>
          </View>
        ))}
      </View>

      <View style={styles.pairsCard}>
        <Text style={styles.pairsTitle}>Supported currencies</Text>
        <View style={styles.pairChips}>
          {CURRENCIES.map((item) => {
            const active = item.code === currencyCode;
            return (
              <Pressable
                key={item.code}
                style={[styles.pairChip, active && styles.pairChipActive]}
                onPress={() => selectCurrency(item)}
              >
                <Text
                  style={[styles.pairChipText, active && styles.pairChipTextActive]}
                >
                  {item.code}
                </Text>
              </Pressable>
            );
          })}
        </View>
        <Text style={styles.pairsHint}>
          All conversions settle as USDT in your FastPay wallet for spending,
          transfers, and savings.
        </Text>
      </View>

      <Modal visible={pickerOpen} transparent animationType="fade">
        <Pressable
          style={styles.modalBackdrop}
          onPress={() => setPickerOpen(false)}
        >
          <Pressable
            style={styles.modalSheet}
            onPress={(e) => e.stopPropagation()}
          >
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>From currency</Text>
              <Pressable onPress={() => setPickerOpen(false)} hitSlop={8}>
                <X color={colors.white} size={22} />
              </Pressable>
            </View>
            <Text style={styles.modalHint}>
              Pick a currency — amount converts to USDT at the live rate.
            </Text>
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
                  {active ? (
                    <Check color={colors.primary} size={20} />
                  ) : null}
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
    paddingBottom: spacing.md,
  },
  hero: {
    alignItems: "center",
    marginBottom: spacing.lg,
    gap: spacing.sm,
  },
  heroIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(0,174,239,0.12)",
    borderWidth: 1,
    borderColor: "rgba(0,174,239,0.25)",
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    color: colors.white,
    fontSize: 24,
    fontWeight: "700",
    textAlign: "center",
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: 14,
    lineHeight: 21,
    textAlign: "center",
    maxWidth: 320,
  },
  card: {
    backgroundColor: colors.inputBg,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: spacing.md,
    gap: spacing.sm,
  },
  receiveCard: {
    borderColor: "rgba(0,174,239,0.35)",
    backgroundColor: "rgba(0,174,239,0.06)",
  },
  cardLabel: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },
  currencyChip: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    backgroundColor: "rgba(255,255,255,0.03)",
  },
  currencyChipCode: {
    color: colors.white,
    fontWeight: "700",
    fontSize: 15,
  },
  currencyChipName: {
    color: colors.textMuted,
    fontSize: 13,
  },
  amountField: {
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingBottom: spacing.sm,
    marginTop: spacing.xs,
  },
  amountInput: {
    flex: 1,
    color: colors.white,
    fontSize: 36,
    fontWeight: "700",
    paddingVertical: spacing.xs,
    minHeight: 48,
  },
  amountSuffix: {
    color: colors.textMuted,
    fontSize: 16,
    fontWeight: "600",
    marginLeft: spacing.sm,
  },
  swapRail: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: spacing.sm,
    gap: spacing.sm,
  },
  swapLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border,
  },
  swapBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(0,174,239,0.15)",
    borderWidth: 1,
    borderColor: "rgba(0,174,239,0.35)",
    alignItems: "center",
    justifyContent: "center",
  },
  usdtRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: spacing.sm,
    flexWrap: "wrap",
  },
  usdtBadge: {
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: 4,
    backgroundColor: "rgba(0,174,239,0.12)",
  },
  usdtBadgeText: {
    color: colors.primary,
    fontWeight: "700",
    fontSize: 13,
  },
  receiveAmount: {
    color: colors.white,
    fontSize: 32,
    fontWeight: "700",
  },
  rateText: {
    color: colors.textMuted,
    fontSize: 13,
    marginTop: spacing.xs,
  },
  feeText: {
    color: colors.success,
    fontSize: 12,
    fontWeight: "600",
    marginTop: 2,
  },
  summaryRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.md,
    marginTop: spacing.md,
    marginBottom: spacing.md,
    paddingVertical: spacing.sm,
  },
  summaryItem: {
    alignItems: "center",
    minWidth: 100,
  },
  summaryValue: {
    color: colors.white,
    fontSize: 16,
    fontWeight: "700",
  },
  summaryKey: {
    color: colors.textMuted,
    fontSize: 12,
    marginTop: 2,
  },
  cta: {
    marginBottom: spacing.lg,
  },
  stepsCard: {
    backgroundColor: colors.inputBg,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  stepsTitle: {
    color: colors.white,
    fontSize: 15,
    fontWeight: "700",
    marginBottom: spacing.xs,
  },
  stepRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  stepIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "rgba(0,174,239,0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  stepText: {
    color: colors.textMuted,
    fontSize: 14,
    flex: 1,
    lineHeight: 20,
  },
  pairsCard: {
    backgroundColor: colors.inputBg,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  pairsTitle: {
    color: colors.white,
    fontSize: 15,
    fontWeight: "700",
    marginBottom: spacing.sm,
  },
  pairChips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  pairChip: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    backgroundColor: "rgba(255,255,255,0.03)",
  },
  pairChipActive: {
    borderColor: colors.primary,
    backgroundColor: "rgba(0,174,239,0.12)",
  },
  pairChipText: {
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: "600",
  },
  pairChipTextActive: {
    color: colors.primary,
  },
  pairsHint: {
    color: colors.textMuted,
    fontSize: 12,
    lineHeight: 18,
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
});

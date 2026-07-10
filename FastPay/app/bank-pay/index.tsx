import { Href, router } from "expo-router";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { ChevronRight } from "lucide-react-native";

import { BeneficiaryPicker } from "@/components/bank-pay/BeneficiaryPicker";
import { ReadOnlyField } from "@/components/bank-pay/ReadOnlyField";
import { TabScreenLayout } from "@/components/layout/TabScreenLayout";
import { BackHeader } from "@/components/ui/BackHeader";
import { Input } from "@/components/ui/Input";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import {
  formatFastPayAccountNumber,
  formatFastPayCode,
  getBeneficiaryById,
  lookupMerchant,
  validateBankPayForm,
} from "@/lib/bank-pay/data";
import type { BankPayBeneficiary } from "@/lib/bank-pay/types";
import { useBankPayStore } from "@/store/bankPayStore";
import { useWalletStore } from "@/store/walletStore";
import { colors } from "@/theme/colors";
import { radius, spacing } from "@/theme/spacing";

export default function BankPayScreen() {
  const { user } = useRequireAuth();
  const { wallet, initialize } = useWalletStore();
  const setDraft = useBankPayStore((state) => state.setDraft);
  const scrollRef = useRef<ScrollView>(null);
  const amountSectionY = useRef(0);

  const [beneficiaryId, setBeneficiaryId] = useState<string | null>(null);
  const [merchantCode, setMerchantCode] = useState("");
  const [amount, setAmount] = useState("");
  const [pickerOpen, setPickerOpen] = useState(false);

  useEffect(() => {
    void initialize();
  }, [initialize]);

  const accountNumber = useMemo(
    () => formatFastPayAccountNumber(user?.id ?? "", wallet?.publicKey),
    [user?.id, wallet?.publicKey],
  );

  const payToCode = useMemo(
    () => formatFastPayCode(wallet?.publicKey),
    [wallet?.publicKey],
  );

  const beneficiary = getBeneficiaryById(beneficiaryId);
  const merchant = lookupMerchant(merchantCode);

  const scrollAmountIntoView = () => {
    scrollRef.current?.scrollTo({
      y: Math.max(0, amountSectionY.current - spacing.lg),
      animated: true,
    });
  };

  const handleAmountFocus = () => {
    scrollAmountIntoView();
    setTimeout(scrollAmountIntoView, Platform.OS === "ios" ? 320 : 120);
  };

  const handleSelectBeneficiary = (item: BankPayBeneficiary) => {
    setBeneficiaryId(item.id);
  };

  const handlePayment = () => {
    const error = validateBankPayForm({ beneficiaryId, merchantCode, amount });
    if (error) {
      Alert.alert("Bank Pay", error);
      return;
    }

    setDraft({
      beneficiaryId: beneficiaryId!,
      beneficiaryName: beneficiary!.name,
      beneficiaryCategory: beneficiary!.category,
      merchantCode: merchant!.code,
      merchantName: merchant!.name,
      amount,
      payFromName: user?.fullName ?? "—",
      payFromAccount: accountNumber,
      payToCode,
    });

    router.push("/bank-pay/invoice" as Href);
  };

  return (
    <TabScreenLayout
      scrollRef={scrollRef}
      bottomInset={spacing.xl}
      adjustForKeyboard
    >
      <BackHeader title="Bank Pay" />

      <ReadOnlyField
        label="Pay from"
        value={user?.fullName ?? "—"}
        subValue={accountNumber}
      />

      <ReadOnlyField
        label="Pay to"
        value={payToCode}
        subValue="Your FastPay code"
      />

      <View style={styles.field}>
        <Text style={styles.label}>Pay for</Text>
        <Pressable
          style={styles.selector}
          onPress={() => setPickerOpen(true)}
        >
          <View style={styles.selectorContent}>
            <Text
              style={[
                styles.selectorValue,
                !beneficiary && styles.selectorPlaceholder,
              ]}
            >
              {beneficiary?.name ?? "Tap to select beneficiary"}
            </Text>
            {beneficiary ? (
              <Text style={styles.selectorMeta}>{beneficiary.category}</Text>
            ) : null}
          </View>
          <ChevronRight color={colors.textMuted} size={20} />
        </Pressable>
      </View>

      <Input
        label="Merchant code *"
        value={merchantCode}
        onChangeText={setMerchantCode}
        placeholder="Enter merchant code"
        autoCapitalize="characters"
        autoCorrect={false}
      />

      {merchant ? (
        <View style={styles.merchantNameBox}>
          <Text style={styles.merchantName}>{merchant.name}</Text>
        </View>
      ) : null}

      <View
        onLayout={(event) => {
          amountSectionY.current = event.nativeEvent.layout.y;
        }}
      >
        <Input
          label="Amount (RWF)"
          value={amount}
          onChangeText={setAmount}
          onFocus={handleAmountFocus}
          placeholder="0"
          keyboardType="decimal-pad"
          returnKeyType="done"
        />
      </View>

      <PrimaryButton
        label="Make Payment"
        onPress={handlePayment}
        disabled={!beneficiary || !merchantCode.trim() || !amount.trim()}
        style={styles.submitBtn}
      />

      <BeneficiaryPicker
        visible={pickerOpen}
        selectedId={beneficiaryId}
        onClose={() => setPickerOpen(false)}
        onSelect={handleSelectBeneficiary}
      />
    </TabScreenLayout>
  );
}

const styles = StyleSheet.create({
  field: {
    marginBottom: spacing.md,
  },
  label: {
    color: colors.textMuted,
    fontSize: 13,
    marginBottom: spacing.sm,
    fontWeight: "600",
  },
  selector: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 14,
    backgroundColor: colors.inputBg,
  },
  selectorContent: {
    flex: 1,
  },
  selectorValue: {
    color: colors.white,
    fontSize: 15,
    fontWeight: "500",
  },
  selectorPlaceholder: {
    color: colors.textSubtle,
    fontWeight: "400",
  },
  selectorMeta: {
    color: colors.textMuted,
    fontSize: 12,
    marginTop: 4,
  },
  merchantNameBox: {
    marginTop: -spacing.sm,
    marginBottom: spacing.md,
    paddingHorizontal: spacing.sm,
  },
  merchantName: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: "600",
  },
  submitBtn: {
    marginTop: spacing.sm,
  },
});

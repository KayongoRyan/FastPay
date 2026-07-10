import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Pressable,
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
import { useWalletStore } from "@/store/walletStore";
import { colors } from "@/theme/colors";
import { radius, spacing } from "@/theme/spacing";

export default function BankPayScreen() {
  const { user } = useRequireAuth();
  const { wallet, initialize } = useWalletStore();

  const [beneficiaryId, setBeneficiaryId] = useState<string | null>(null);
  const [merchantCode, setMerchantCode] = useState("");
  const [amount, setAmount] = useState("");
  const [pickerOpen, setPickerOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

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

  const handleSelectBeneficiary = (item: BankPayBeneficiary) => {
    setBeneficiaryId(item.id);
  };

  const handlePayment = async () => {
    const error = validateBankPayForm({ beneficiaryId, merchantCode, amount });
    if (error) {
      Alert.alert("Bank Pay", error);
      return;
    }

    setSubmitting(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 800));
      Alert.alert(
        "Payment submitted",
        `RWF ${Number(amount).toLocaleString()} sent to ${merchant!.name} for ${beneficiary!.name}.`,
        [{ text: "OK" }],
      );
      setMerchantCode("");
      setAmount("");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <TabScreenLayout bottomInset={spacing.xl}>
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
      ) : merchantCode.trim().length >= 3 ? (
        <Text style={styles.merchantHint}>No merchant found for this code</Text>
      ) : null}

      <Input
        label="Amount (RWF)"
        value={amount}
        onChangeText={setAmount}
        placeholder="0"
        keyboardType="decimal-pad"
      />

      <PrimaryButton
        label="Make Payment"
        onPress={() => void handlePayment()}
        loading={submitting}
        disabled={!beneficiary || !merchant || !amount.trim()}
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
  merchantHint: {
    color: colors.textMuted,
    fontSize: 13,
    marginTop: -spacing.sm,
    marginBottom: spacing.md,
    paddingHorizontal: spacing.sm,
  },
  submitBtn: {
    marginTop: spacing.sm,
  },
});

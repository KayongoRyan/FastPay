import { Href, router } from "expo-router";
import { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";

import { BackHeader } from "@/components/ui/BackHeader";
import { NumericKeypad } from "@/components/ui/NumericKeypad";
import { PinDots } from "@/components/ui/PinDots";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { Screen } from "@/components/ui/Screen";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { verifyTransactionPin } from "@/lib/auth/storage";
import { useBankPayStore } from "@/store/bankPayStore";
import { colors } from "@/theme/colors";
import { spacing } from "@/theme/spacing";

const PIN_LENGTH = 4;

export default function BankPayPinScreen() {
  useRequireAuth();
  const draft = useBankPayStore((state) => state.draft);
  const [pin, setPin] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!draft) {
      router.replace("/bank-pay" as Href);
    }
  }, [draft]);

  if (!draft) {
    return null;
  }

  const onKey = (key: string) => {
    if (pin.length < PIN_LENGTH) {
      setPin((prev) => prev + key);
      setError(null);
    }
  };

  const onDelete = () => {
    setPin((prev) => prev.slice(0, -1));
    setError(null);
  };

  const handlePay = async () => {
    if (pin.length !== PIN_LENGTH) {
      return;
    }

    setSubmitting(true);
    try {
      const valid = await verifyTransactionPin(pin);
      if (!valid) {
        setError("Incorrect PIN. Try again.");
        setPin("");
        return;
      }

      router.replace("/bank-pay/success" as Href);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Screen>
      <BackHeader title="Confirm payment" />

      <Text style={styles.title}>Enter your PIN</Text>
      <Text style={styles.subtitle}>
        Use the 4-digit PIN you set when signing up
      </Text>

      <PinDots length={pin.length} filled={pin.length} />

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <View style={styles.amountBox}>
        <Text style={styles.amountLabel}>Amount</Text>
        <Text style={styles.amount}>
          {Number(draft.amount).toLocaleString()} RWF
        </Text>
        <Text style={styles.merchant}>{draft.merchantName}</Text>
      </View>

      <NumericKeypad onKey={onKey} onDelete={onDelete} />

      <PrimaryButton
        label="Pay"
        onPress={() => void handlePay()}
        loading={submitting}
        disabled={pin.length !== PIN_LENGTH}
        style={styles.button}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: {
    color: colors.white,
    fontSize: 22,
    fontWeight: "600",
    textAlign: "center",
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: 14,
    textAlign: "center",
    marginBottom: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  amountBox: {
    alignItems: "center",
    marginBottom: spacing.md,
    paddingVertical: spacing.md,
  },
  amountLabel: {
    color: colors.textMuted,
    fontSize: 13,
    marginBottom: 4,
  },
  amount: {
    color: colors.white,
    fontSize: 28,
    fontWeight: "700",
  },
  merchant: {
    color: colors.primary,
    fontSize: 14,
    marginTop: 4,
    fontWeight: "600",
  },
  error: {
    color: colors.error,
    textAlign: "center",
    marginBottom: spacing.sm,
  },
  button: {
    marginTop: spacing.lg,
  },
});

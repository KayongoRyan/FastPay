import { useEffect, useState } from "react";
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { X } from "lucide-react-native";

import { Input } from "@/components/ui/Input";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import {
  CARD_TIERS,
  formatRwf,
  parseRwfInput,
  PurchasableTierId,
  validateTierReceiveAmount,
} from "@/lib/cards/tiers";
import { useCardSubscriptionStore } from "@/store/cardSubscriptionStore";
import { colors } from "@/theme/colors";
import { radius, spacing } from "@/theme/spacing";

interface CardApplicationModalProps {
  tierId: PurchasableTierId | null;
  visible: boolean;
  onClose: () => void;
}

export function CardApplicationModal({
  tierId,
  visible,
  onClose,
}: CardApplicationModalProps) {
  const { submitTierApplication, isSubmitting, error, tierReceiveAmounts } =
    useCardSubscriptionStore();
  const [amount, setAmount] = useState("");
  const [localError, setLocalError] = useState<string | null>(null);

  const tier = tierId ? CARD_TIERS[tierId] : null;

  useEffect(() => {
    if (!visible || !tierId) {
      return;
    }

    const existing = tierReceiveAmounts[tierId];
    const defaultAmount =
      existing ?? CARD_TIERS[tierId].minMonthlyReceiveRwf;
    setAmount(defaultAmount.toLocaleString());
    setLocalError(null);
  }, [visible, tierId, tierReceiveAmounts]);

  const handleSubmit = async () => {
    if (!tierId) {
      return;
    }

    const numericAmount = parseRwfInput(amount);
    const validationError = validateTierReceiveAmount(tierId, numericAmount);
    if (validationError) {
      setLocalError(validationError);
      return;
    }

    const success = await submitTierApplication(tierId, numericAmount);
    if (success) {
      onClose();
    }
  };

  if (!tier) {
    return null;
  }

  const displayError = localError ?? error;

  return (
    <Modal visible={visible} transparent animationType="slide">
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={(e) => e.stopPropagation()}>
          <View style={styles.header}>
            <Text style={styles.title}>Apply for {tier.label}</Text>
            <Pressable onPress={onClose} hitSlop={8}>
              <X color={colors.white} size={22} />
            </Pressable>
          </View>

          <Text style={styles.hint}>
            Complete your payment profile. You cannot go below the minimum monthly
            receive amount for this card tier.
          </Text>

          <View style={styles.minBox}>
            <Text style={styles.minLabel}>Minimum required</Text>
            <Text style={styles.minValue}>
              {formatRwf(tier.minMonthlyReceiveRwf)} / month
            </Text>
          </View>

          <Input
            label="Expected monthly receive (RWF)"
            value={amount}
            onChangeText={(text) => {
              setAmount(text);
              setLocalError(null);
            }}
            keyboardType="numeric"
            placeholder={tier.minMonthlyReceiveRwf.toLocaleString()}
          />

          {displayError ? (
            <Text style={styles.error}>{displayError}</Text>
          ) : null}

          <PrimaryButton
            label={isSubmitting ? "Submitting..." : "Complete application"}
            onPress={() => void handleSubmit()}
            loading={isSubmitting}
            style={styles.submitBtn}
          />
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.55)",
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: colors.backgroundDeep,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: spacing.lg,
    paddingBottom: spacing.xl,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  title: {
    color: colors.white,
    fontSize: 18,
    fontWeight: "700",
  },
  hint: {
    color: colors.textMuted,
    fontSize: 13,
    lineHeight: 19,
    marginBottom: spacing.md,
  },
  minBox: {
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
    backgroundColor: "rgba(0,174,239,0.08)",
  },
  minLabel: {
    color: colors.textMuted,
    fontSize: 12,
    marginBottom: 4,
  },
  minValue: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: "700",
  },
  error: {
    color: colors.error,
    fontSize: 13,
    marginBottom: spacing.sm,
  },
  submitBtn: {
    marginTop: spacing.sm,
  },
});

import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { CheckCircle2, X, XCircle } from "lucide-react-native";

import { Input } from "@/components/ui/Input";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { validateApplicationForm } from "@/lib/cards/application";
import {
  CARD_TIERS,
  formatRwf,
  parseRwfInput,
  PurchasableTierId,
} from "@/lib/cards/tiers";
import { useAuthStore } from "@/store/authStore";
import { useCardSubscriptionStore } from "@/store/cardSubscriptionStore";
import { colors } from "@/theme/colors";
import { radius, spacing } from "@/theme/spacing";

type ApplicationStep = "form" | "verifying" | "result";

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
  const user = useAuthStore((s) => s.user);
  const { submitTierApplication, isSubmitting, tierReceiveAmounts } =
    useCardSubscriptionStore();

  const [step, setStep] = useState<ApplicationStep>("form");
  const [amount, setAmount] = useState("");
  const [accountPhone, setAccountPhone] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [localError, setLocalError] = useState<string | null>(null);
  const [resultMessage, setResultMessage] = useState("");
  const [approved, setApproved] = useState(false);

  const tier = tierId ? CARD_TIERS[tierId] : null;

  useEffect(() => {
    if (!visible || !tierId) {
      return;
    }

    const existing = tierReceiveAmounts[tierId];
    const defaultAmount =
      existing ?? CARD_TIERS[tierId].minMonthlyReceiveRwf;
    setAmount(defaultAmount.toLocaleString());
    setAccountPhone(user?.phone ?? "");
    setBusinessName("");
    setLocalError(null);
    setResultMessage("");
    setApproved(false);
    setStep("form");
  }, [visible, tierId, tierReceiveAmounts, user?.phone]);

  const handleClose = () => {
    if (isSubmitting) {
      return;
    }
    onClose();
  };

  const handleSubmit = async () => {
    if (!tierId || !user) {
      return;
    }

    const form = {
      tierId,
      monthlyReceiveRwf: parseRwfInput(amount),
      accountPhone,
      businessName,
    };

    const validationError = validateApplicationForm(form, {
      userId: user.id,
      userPhone: user.phone,
    });
    if (validationError) {
      setLocalError(validationError);
      return;
    }

    setLocalError(null);
    setStep("verifying");

    const verification = await submitTierApplication(form, {
      userId: user.id,
      userPhone: user.phone,
    });

    setApproved(verification.approved);
    setResultMessage(verification.message);
    setStep("result");
  };

  if (!tier) {
    return null;
  }

  return (
    <Modal visible={visible} transparent animationType="slide">
      <Pressable style={styles.backdrop} onPress={handleClose}>
        <Pressable style={styles.sheet} onPress={(e) => e.stopPropagation()}>
          <View style={styles.header}>
            <Text style={styles.title}>
              {step === "result" && approved
                ? `${tier.label} approved`
                : `Apply for ${tier.label}`}
            </Text>
            <Pressable onPress={handleClose} hitSlop={8} disabled={isSubmitting}>
              <X color={colors.white} size={22} />
            </Pressable>
          </View>

          {step === "form" ? (
            <ScrollView
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              <Text style={styles.hint}>
                Complete your payment profile. We verify your monthly receive
                against account records before issuing the card.
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

              <Input
                label="Account phone number"
                value={accountPhone}
                onChangeText={(text) => {
                  setAccountPhone(text);
                  setLocalError(null);
                }}
                keyboardType="phone-pad"
                placeholder="+250 7XX XXX XXX"
                autoComplete="tel"
              />

              <Input
                label="Business / primary payment source"
                value={businessName}
                onChangeText={(text) => {
                  setBusinessName(text);
                  setLocalError(null);
                }}
                placeholder="e.g. Retail shop, freelance clients"
              />

              {localError ? (
                <Text style={styles.error}>{localError}</Text>
              ) : null}

              <PrimaryButton
                label="Submit for verification"
                onPress={() => void handleSubmit()}
                style={styles.submitBtn}
              />
            </ScrollView>
          ) : null}

          {step === "verifying" ? (
            <View style={styles.statusWrap}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text style={styles.statusTitle}>Verifying your profile</Text>
              <Text style={styles.statusHint}>
                Checking payment history and monthly receive against {tier.label}{" "}
                requirements...
              </Text>
            </View>
          ) : null}

          {step === "result" ? (
            <View style={styles.statusWrap}>
              {approved ? (
                <CheckCircle2 color={colors.success} size={48} />
              ) : (
                <XCircle color={colors.error} size={48} />
              )}
              <Text style={styles.statusTitle}>
                {approved ? "Application approved" : "Not eligible yet"}
              </Text>
              <Text style={styles.statusHint}>{resultMessage}</Text>
              <PrimaryButton
                label={approved ? "Done" : "Update application"}
                onPress={() => {
                  if (approved) {
                    handleClose();
                    return;
                  }
                  setStep("form");
                }}
                style={styles.submitBtn}
              />
            </View>
          ) : null}
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
    maxHeight: "88%",
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
  statusWrap: {
    alignItems: "center",
    paddingVertical: spacing.lg,
    gap: spacing.sm,
  },
  statusTitle: {
    color: colors.white,
    fontSize: 17,
    fontWeight: "700",
    textAlign: "center",
  },
  statusHint: {
    color: colors.textMuted,
    fontSize: 14,
    lineHeight: 20,
    textAlign: "center",
    marginBottom: spacing.md,
  },
});

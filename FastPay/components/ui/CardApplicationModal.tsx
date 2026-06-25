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
import {
  CardTierApplicationForm,
  validateApplicationForm,
} from "@/lib/cards/application";
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

  const [currentTierId, setCurrentTierId] = useState<PurchasableTierId | null>(
    tierId,
  );
  const [step, setStep] = useState<ApplicationStep>("form");
  const [amount, setAmount] = useState("");
  const [accountPhone, setAccountPhone] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [localError, setLocalError] = useState<string | null>(null);
  const [resultMessage, setResultMessage] = useState("");
  const [approved, setApproved] = useState(false);
  const [verifiedReceiveRwf, setVerifiedReceiveRwf] = useState<number | null>(
    null,
  );
  const [suggestedTierId, setSuggestedTierId] =
    useState<PurchasableTierId | null>(null);

  const tier = currentTierId ? CARD_TIERS[currentTierId] : null;
  const suggestedTier = suggestedTierId ? CARD_TIERS[suggestedTierId] : null;

  useEffect(() => {
    if (!visible || !tierId) {
      return;
    }

    setCurrentTierId(tierId);
    const existing = tierReceiveAmounts[tierId];
    const defaultAmount =
      existing ?? CARD_TIERS[tierId].minMonthlyReceiveRwf;
    setAmount(defaultAmount.toLocaleString());
    setAccountPhone(user?.phone ?? "");
    setBusinessName("");
    setLocalError(null);
    setResultMessage("");
    setApproved(false);
    setVerifiedReceiveRwf(null);
    setSuggestedTierId(null);
    setStep("form");
  }, [visible, tierId, tierReceiveAmounts, user?.phone]);

  const handleClose = () => {
    if (isSubmitting) {
      return;
    }
    onClose();
  };

  const runVerification = async (form: CardTierApplicationForm) => {
    if (!user) {
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
    setVerifiedReceiveRwf(verification.actualMonthlyReceiveRwf ?? null);
    setSuggestedTierId(verification.suggestedTierId ?? null);
    setStep("result");
  };

  const handleSubmit = async () => {
    if (!currentTierId || !user) {
      return;
    }

    const form: CardTierApplicationForm = {
      tierId: currentTierId,
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

    await runVerification(form);
  };

  const handleApplySuggested = async () => {
    if (!user || !suggestedTierId || verifiedReceiveRwf === null) {
      return;
    }

    if (businessName.trim().length < 2) {
      setStep("form");
      setLocalError("Enter your business or primary payment source first.");
      return;
    }

    const phone = accountPhone.replace(/\D/g, "");
    if (phone.length < 9) {
      setStep("form");
      setLocalError("Enter a valid account phone number first.");
      return;
    }

    setCurrentTierId(suggestedTierId);
    setAmount(verifiedReceiveRwf.toLocaleString());

    await runVerification({
      tierId: suggestedTierId,
      monthlyReceiveRwf: verifiedReceiveRwf,
      accountPhone,
      businessName,
    });
  };

  if (!tier) {
    return null;
  }

  const showSuggestion =
    !approved &&
    suggestedTier &&
    verifiedReceiveRwf !== null &&
    suggestedTierId !== currentTierId;

  const showApplyWithVerified =
    !approved &&
    suggestedTierId &&
    verifiedReceiveRwf !== null &&
    suggestedTierId === currentTierId;

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
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.resultContent}
            >
              <View style={styles.statusWrap}>
                {approved ? (
                  <CheckCircle2 color={colors.success} size={48} />
                ) : (
                  <XCircle color={colors.error} size={48} />
                )}
                <Text style={styles.statusTitle}>
                  {approved ? "Application approved" : "Not eligible for this tier"}
                </Text>
                <Text style={styles.statusHint}>{resultMessage}</Text>
              </View>

              {showSuggestion ? (
                <View style={styles.suggestionBox}>
                  <Text style={styles.suggestionLabel}>Suggested for you</Text>
                  <View style={styles.suggestionRow}>
                    <View
                      style={[
                        styles.swatch,
                        {
                          backgroundColor: suggestedTier.gradientColors[0],
                        },
                      ]}
                    />
                    <View style={styles.suggestionInfo}>
                      <Text style={styles.suggestionTitle}>
                        {suggestedTier.label}
                      </Text>
                      <Text style={styles.suggestionDesc}>
                        Matches your verified receive of{" "}
                        {formatRwf(verifiedReceiveRwf!)}
                      </Text>
                      <Text style={styles.suggestionReq}>
                        {suggestedTier.requirementLabel}
                      </Text>
                    </View>
                  </View>
                  <PrimaryButton
                    label={`Apply for ${suggestedTier.label}`}
                    onPress={() => void handleApplySuggested()}
                    loading={isSubmitting}
                    style={styles.suggestionBtn}
                  />
                </View>
              ) : null}

              {showApplyWithVerified ? (
                <PrimaryButton
                  label={`Apply with ${formatRwf(verifiedReceiveRwf!)}`}
                  onPress={() => void handleApplySuggested()}
                  loading={isSubmitting}
                  style={styles.submitBtn}
                />
              ) : null}

              <PrimaryButton
                label={approved ? "Done" : "Edit application"}
                onPress={() => {
                  if (approved) {
                    handleClose();
                    return;
                  }
                  setStep("form");
                }}
                style={styles.submitBtn}
              />
            </ScrollView>
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
  resultContent: {
    paddingBottom: spacing.sm,
  },
  statusWrap: {
    alignItems: "center",
    paddingVertical: spacing.md,
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
  },
  suggestionBox: {
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    backgroundColor: "rgba(0,174,239,0.06)",
  },
  suggestionLabel: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.6,
    marginBottom: spacing.sm,
  },
  suggestionRow: {
    flexDirection: "row",
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  swatch: {
    width: 44,
    height: 44,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
  },
  suggestionInfo: {
    flex: 1,
    gap: 2,
  },
  suggestionTitle: {
    color: colors.white,
    fontSize: 16,
    fontWeight: "700",
  },
  suggestionDesc: {
    color: colors.textMuted,
    fontSize: 13,
    lineHeight: 18,
  },
  suggestionReq: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: "600",
    marginTop: 2,
  },
  suggestionBtn: {
    marginTop: 0,
  },
});

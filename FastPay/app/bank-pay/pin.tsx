import { Href, router } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { Alert } from "react-native";
import * as Haptics from "expo-haptics";

import { PinEntryLayout } from "@/components/ui/PinEntryLayout";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { verifyTransactionPin } from "@/lib/auth/storage";
import { useBankPayStore } from "@/store/bankPayStore";

const PIN_LENGTH = 4;

export default function BankPayPinScreen() {
  const { user } = useRequireAuth();
  const draft = useBankPayStore((state) => state.draft);
  const [pin, setPin] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const submittedRef = useRef(false);

  useEffect(() => {
    if (!draft) {
      router.replace("/bank-pay" as Href);
    }
  }, [draft]);

  const onKey = (key: string) => {
    if (pin.length < PIN_LENGTH) {
      setPin((prev) => prev + key);
      setError(null);
      submittedRef.current = false;
    }
  };

  const onDelete = () => {
    setPin((prev) => prev.slice(0, -1));
    setError(null);
    submittedRef.current = false;
  };

  const handlePay = useCallback(async () => {
    if (pin.length !== PIN_LENGTH || submitting || submittedRef.current) {
      return;
    }

    submittedRef.current = true;
    setSubmitting(true);
    try {
      const valid = await verifyTransactionPin(pin);
      if (!valid) {
        void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        setError("Incorrect passcode. Try again.");
        setPin("");
        submittedRef.current = false;
        return;
      }

      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.replace("/bank-pay/success" as Href);
    } finally {
      setSubmitting(false);
    }
  }, [pin, submitting]);

  useEffect(() => {
    if (pin.length === PIN_LENGTH) {
      void handlePay();
    }
  }, [pin.length, handlePay]);

  if (!draft) {
    return null;
  }

  return (
    <PinEntryLayout
      title="Payment"
      subtitle="Enter your passcode"
      userName={user?.fullName}
      pin={pin}
      onKey={onKey}
      onDelete={onDelete}
      error={error}
      loading={submitting}
      forgotPasscode={{
        onPress: () =>
          Alert.alert(
            "Forgot passcode?",
            "Contact support to reset your transaction PIN.",
          ),
      }}
      secondaryAction={{
        label: "Cancel payment",
        onPress: () => router.back(),
      }}
    />
  );
}

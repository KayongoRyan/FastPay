import { Href, router } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import * as Haptics from "expo-haptics";

import { PinEntryLayout } from "@/components/ui/PinEntryLayout";
import { useAuthStore } from "@/store/authStore";
import { saveTransactionPin } from "@/lib/auth/storage";
import { useOnboardingStore } from "@/store/onboardingStore";

const PIN_LENGTH = 4;

export default function PinSetupScreen() {
  const register = useAuthStore((state) => state.register);
  const authError = useAuthStore((state) => state.error);
  const { firstName, lastName, email, password, setPin } = useOnboardingStore();
  const [pin, setLocalPin] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const submittedRef = useRef(false);

  const fullName = `${firstName.trim()} ${lastName.trim()}`.trim();

  const onKey = (key: string) => {
    if (pin.length < PIN_LENGTH) {
      setLocalPin((prev) => prev + key);
      submittedRef.current = false;
    }
  };

  const onDelete = () => {
    setLocalPin((prev) => prev.slice(0, -1));
    submittedRef.current = false;
  };

  const onNext = useCallback(async () => {
    if (pin.length !== PIN_LENGTH || submitting || submittedRef.current) {
      return;
    }

    submittedRef.current = true;
    setPin(pin);
    await saveTransactionPin(pin);

    setSubmitting(true);
    try {
      await register({
        fullName,
        email: email.trim(),
        password,
      });
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.replace("/verify-email" as Href);
    } catch {
      submittedRef.current = false;
    } finally {
      setSubmitting(false);
    }
  }, [email, fullName, password, pin, register, setPin, submitting]);

  useEffect(() => {
    if (pin.length === PIN_LENGTH) {
      void onNext();
    }
  }, [pin.length, onNext]);

  return (
    <PinEntryLayout
      title="Create PIN"
      subtitle="Enter your passcode"
      userName={fullName || undefined}
      pin={pin}
      onKey={onKey}
      onDelete={onDelete}
      error={authError}
      loading={submitting}
      onBack={() => router.back()}
      secondaryAction={{
        label: "Back to sign up",
        onPress: () => router.back(),
      }}
    />
  );
}

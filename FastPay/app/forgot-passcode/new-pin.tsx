import { Href, router, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import * as Haptics from "expo-haptics";

import { PinEntryLayout } from "@/components/ui/PinEntryLayout";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { saveTransactionPin } from "@/lib/auth/storage";
import { usePasscodeResetStore } from "@/store/passcodeResetStore";

const PIN_LENGTH = 4;

export default function ForgotPasscodeNewPinScreen() {
  const { user } = useRequireAuth();
  const { returnTo } = useLocalSearchParams<{ returnTo?: string }>();
  const isVerified = usePasscodeResetStore((state) => state.isVerified);
  const clearVerification = usePasscodeResetStore((state) => state.clear);

  const [step, setStep] = useState<"create" | "confirm">("create");
  const [pin, setPin] = useState("");
  const [draftPin, setDraftPin] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const submittedRef = useRef(false);

  useEffect(() => {
    if (!isVerified()) {
      router.replace("/forgot-passcode" as Href);
    }
  }, [isVerified]);

  const resetEntry = () => {
    setPin("");
    submittedRef.current = false;
  };

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

  const finishReset = useCallback(async () => {
    if (pin.length !== PIN_LENGTH || submitting || submittedRef.current) {
      return;
    }

    submittedRef.current = true;
    setSubmitting(true);

    try {
      await saveTransactionPin(pin);
      clearVerification();
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      const destination = (returnTo as string | undefined) ?? "/home";
      if (destination === "/bank-pay/pin") {
        router.replace("/bank-pay/pin" as Href);
        return;
      }

      router.replace(destination as Href);
    } catch {
      setError("Could not save your new passcode. Try again.");
      resetEntry();
    } finally {
      setSubmitting(false);
    }
  }, [pin, submitting, clearVerification, returnTo]);

  const handlePinComplete = useCallback(async () => {
    if (pin.length !== PIN_LENGTH || submitting || submittedRef.current) {
      return;
    }

    if (step === "create") {
      setDraftPin(pin);
      setStep("confirm");
      resetEntry();
      return;
    }

    if (pin !== draftPin) {
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setError("Passcodes do not match. Try again.");
      setStep("create");
      setDraftPin("");
      resetEntry();
      return;
    }

    await finishReset();
  }, [pin, step, draftPin, submitting, finishReset]);

  useEffect(() => {
    if (pin.length === PIN_LENGTH) {
      void handlePinComplete();
    }
  }, [pin.length, handlePinComplete]);

  return (
    <PinEntryLayout
      title={step === "create" ? "New passcode" : "Confirm passcode"}
      subtitle={
        step === "create"
          ? "Choose a new 4-digit passcode"
          : "Enter the same passcode again"
      }
      userName={user?.fullName}
      pin={pin}
      onKey={onKey}
      onDelete={onDelete}
      error={error}
      loading={submitting}
      onBack={() => {
        if (step === "confirm") {
          setStep("create");
          setDraftPin("");
          resetEntry();
          setError(null);
          return;
        }
        router.back();
      }}
      secondaryAction={{
        label: "Cancel reset",
        onPress: () => {
          clearVerification();
          router.back();
        },
      }}
    />
  );
}

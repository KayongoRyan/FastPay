import { Lock, X } from "lucide-react";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { verifyPin } from "../lib/pin";
import { PinInput } from "./PinInput";

type PinModalProps = {
  title?: string;
  subtitle?: string;
  onSuccess: () => void;
  onClose: () => void;
};

export function PinModal({ title = "Enter your PIN", subtitle, onSuccess, onClose }: PinModalProps) {
  const { user } = useAuth();
  const [pin, setPin] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [checking, setChecking] = useState(false);

  async function handleConfirm() {
    if (!user || pin.length !== 4) {
      setError("Enter your 4-digit PIN.");
      return;
    }
    setChecking(true);
    const ok = await verifyPin(user.id, pin);
    setChecking(false);

    if (!ok) {
      setError("Wrong PIN. Try again.");
      setPin("");
      return;
    }
    onSuccess();
  }

  return (
    <div className="pin-modal" role="dialog" aria-modal="true" aria-label={title}>
      <div className="pin-modal__backdrop" onClick={onClose} role="presentation" />
      <div className="pin-modal__card">
        <button type="button" className="pin-modal__close" aria-label="Cancel" onClick={onClose}>
          <X size={18} />
        </button>

        <span className="pin-setup__icon">
          <Lock size={22} />
        </span>
        <h2>{title}</h2>
        {subtitle && <p>{subtitle}</p>}

        {error && <p className="auth-form__error" role="alert">{error}</p>}

        <PinInput value={pin} onChange={setPin} autoFocus />

        <button
          type="button"
          className="auth-form__submit pin-setup__submit"
          disabled={checking}
          onClick={handleConfirm}
        >
          {checking ? "Checking…" : "Confirm"}
        </button>
      </div>
    </div>
  );
}

import { KeyRound, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { PinInput } from "../components/PinInput";
import { useAuth } from "../context/AuthContext";
import { savePin } from "../lib/pin";

export function PinSetupPage() {
  const { user, ready, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [stage, setStage] = useState<"enter" | "confirm">("enter");
  const [pin, setPin] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  if (ready && !isAuthenticated) {
    return <Navigate to="/signup" replace />;
  }

  function handleContinue() {
    setError(null);
    if (pin.length !== 4) {
      setError("Enter a 4-digit PIN.");
      return;
    }
    if (/^(\d)\1{3}$/.test(pin) || pin === "1234" || pin === "0000") {
      setError("That PIN is too easy to guess. Pick another.");
      return;
    }
    setStage("confirm");
  }

  async function handleConfirm() {
    setError(null);
    if (confirm.length !== 4) {
      setError("Re-enter your 4-digit PIN.");
      return;
    }
    if (confirm !== pin) {
      setError("PINs do not match. Start again.");
      setStage("enter");
      setPin("");
      setConfirm("");
      return;
    }
    if (!user) return;

    setSaving(true);
    try {
      await savePin(user.id, pin);
      navigate("/app", { replace: true });
    } finally {
      setSaving(false);
    }
  }

  const isConfirm = stage === "confirm";

  return (
    <main className="pin-setup">
      <div className="pin-setup__card">
        <span className="pin-setup__icon">
          {isConfirm ? <ShieldCheck size={26} /> : <KeyRound size={26} />}
        </span>

        <h1>{isConfirm ? "Confirm your PIN" : "Create your PIN"}</h1>
        <p>
          {isConfirm
            ? "Type the same 4 digits once more to lock it in."
            : "This 4-digit PIN approves transfers and payments on this device."}
        </p>

        {error && <p className="auth-form__error" role="alert">{error}</p>}

        {isConfirm ? (
          <PinInput key="confirm" value={confirm} onChange={setConfirm} autoFocus />
        ) : (
          <PinInput key="enter" value={pin} onChange={setPin} autoFocus />
        )}

        <button
          type="button"
          className="auth-form__submit pin-setup__submit"
          disabled={saving}
          onClick={isConfirm ? handleConfirm : handleContinue}
        >
          {saving ? "Saving…" : isConfirm ? "Finish setup" : "Continue"}
        </button>

        {isConfirm && (
          <button
            type="button"
            className="pin-setup__back"
            onClick={() => {
              setStage("enter");
              setConfirm("");
              setError(null);
            }}
          >
            Start over
          </button>
        )}
      </div>
    </main>
  );
}

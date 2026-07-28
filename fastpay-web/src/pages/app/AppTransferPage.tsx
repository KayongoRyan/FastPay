import { CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { PinModal } from "../../components/PinModal";
import { useWallet } from "../../hooks/useWallet";
import { formatRwf, transferFunds } from "../../lib/wallet-api";

export function AppTransferPage() {
  const { wallet, refresh } = useWallet();
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pinOpen, setPinOpen] = useState(false);
  const [done, setDone] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const numericAmount = Number(amount.replace(/[^\d]/g, ""));
  const balance = wallet?.balance ?? 0;

  function handleReview(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!recipient.trim()) {
      setError("Add a recipient account or Stellar public key.");
      return;
    }
    if (!numericAmount || numericAmount < 100) {
      setError("Amount must be at least RWF 100.");
      return;
    }
    if (numericAmount > balance) {
      setError("Amount exceeds your available balance.");
      return;
    }
    setPinOpen(true);
  }

  async function confirmTransfer() {
    setSubmitting(true);
    setError(null);
    try {
      await transferFunds({
        destination: recipient.trim(),
        amountRwf: numericAmount,
        memo: note.trim() || undefined,
      });
      await refresh();
      setPinOpen(false);
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Transfer failed");
      setPinOpen(false);
    } finally {
      setSubmitting(false);
    }
  }

  if (done) {
    return (
      <div className="wapp-page">
        <section className="wapp-card wapp-result">
          <CheckCircle2 size={44} className="wapp-result__icon" />
          <h2>Transfer sent</h2>
          <p>
            {formatRwf(numericAmount)} to <strong>{recipient}</strong>
            {note ? ` · “${note}”` : ""}. It will appear in recent activity shortly.
          </p>
          <div className="wapp-result__actions">
            <button
              type="button"
              className="auth-form__submit"
              onClick={() => {
                setDone(false);
                setRecipient("");
                setAmount("");
                setNote("");
              }}
            >
              New transfer
            </button>
            <Link to="/app" className="btn-ghost-navy wapp-result__home">
              Back home
            </Link>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="wapp-page">
      <section className="wapp-card wapp-form-card">
        <header className="wapp-card__head">
          <h2>Send money</h2>
        </header>
        <p className="wapp-form-card__hint">
          Balance: <strong>{formatRwf(balance)}</strong>
        </p>

        <form className="settings-form" onSubmit={handleReview}>
          {error && <p className="auth-form__error" role="alert">{error}</p>}

          <label>
            <span>Recipient (FastPay account or G… key)</span>
            <input
              type="text"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              placeholder="FP-1104-2291-0034 or G…"
            />
          </label>

          <label>
            <span>Amount (RWF)</span>
            <input
              type="text"
              inputMode="numeric"
              value={amount}
              onChange={(e) => setAmount(e.target.value.replace(/[^\d]/g, ""))}
              placeholder="50,000"
            />
          </label>

          <label>
            <span>Note (optional)</span>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Rent, groceries…"
            />
          </label>

          <button type="submit" className="auth-form__submit" disabled={submitting}>
            Review & confirm
          </button>
        </form>
      </section>

      {pinOpen && (
        <PinModal
          title="Confirm transfer"
          subtitle={`${formatRwf(numericAmount)} to ${recipient}`}
          onClose={() => setPinOpen(false)}
          onSuccess={() => {
            void confirmTransfer();
          }}
        />
      )}
    </div>
  );
}

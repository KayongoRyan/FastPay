import { CheckCircle2, Receipt } from "lucide-react";
import { useMemo, useState } from "react";
import { PinModal } from "../../components/PinModal";
import { useWallet } from "../../hooks/useWallet";
import { billers } from "../../lib/wallet-data";
import { formatRwf, payBill } from "../../lib/wallet-api";

export function AppBillsPage() {
  const { history, refresh } = useWallet();
  const [billerId, setBillerId] = useState(billers[0].id);
  const [reference, setReference] = useState("");
  const [amount, setAmount] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pinOpen, setPinOpen] = useState(false);
  const [paidMsg, setPaidMsg] = useState<string | null>(null);
  const [payError, setPayError] = useState<string | null>(null);

  const billHistory = useMemo(
    () =>
      history
        .filter((item) => item.direction === "out")
        .slice(0, 8)
        .map((item) => ({
          id: item.id,
          biller: item.counterparty || "Bill payment",
          ref: item.txHash.slice(0, 12),
          date: new Date(item.createdAt).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          }),
          amount: Number(item.amount) * 1420,
          status: item.status,
        })),
    [history],
  );

  const biller = billers.find((b) => b.id === billerId)!;
  const numericAmount = Number(amount.replace(/[^\d]/g, ""));

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setPaidMsg(null);

    if (!reference.trim()) {
      setError(`Enter the ${biller.hint.toLowerCase()}.`);
      return;
    }
    if (!numericAmount || numericAmount < 100) {
      setError("Amount must be at least RWF 100.");
      return;
    }
    setPinOpen(true);
  }

  return (
    <div className="wapp-page">
      <div className="wapp-grid-2">
        <section className="wapp-card wapp-form-card">
          <header className="wapp-card__head">
            <h2>
              <Receipt size={18} /> Pay a bill
            </h2>
          </header>

          {paidMsg && (
            <p className="settings-note wapp-paid-note">
              <CheckCircle2 size={16} /> {paidMsg}
            </p>
          )}

          <form className="settings-form" onSubmit={handleSubmit}>
            {error && <p className="auth-form__error" role="alert">{error}</p>}
            {payError && <p className="auth-form__error" role="alert">{payError}</p>}

            <label>
              <span>Biller</span>
              <select value={billerId} onChange={(e) => setBillerId(e.target.value)}>
                {billers.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </label>

            <label>
              <span>{biller.hint}</span>
              <input
                type="text"
                value={reference}
                onChange={(e) => setReference(e.target.value)}
                placeholder={biller.hint}
              />
            </label>

            <label>
              <span>Amount (RWF)</span>
              <input
                type="text"
                inputMode="numeric"
                value={amount}
                onChange={(e) => setAmount(e.target.value.replace(/[^\d]/g, ""))}
                placeholder="12,800"
              />
            </label>

            <button type="submit" className="auth-form__submit">
              Pay bill
            </button>
          </form>
        </section>

        <section className="wapp-card">
          <header className="wapp-card__head">
            <h2>Payment history</h2>
          </header>
          <ul className="wapp-bill-history">
            {billHistory.map((b) => (
              <li key={b.id}>
                <div>
                  <strong>{b.biller}</strong>
                  <small>
                    {b.ref} · {b.date}
                  </small>
                </div>
                <div className="wapp-bill-history__right">
                  <span>{formatRwf(b.amount)}</span>
                  <em>{b.status}</em>
                </div>
              </li>
            ))}
          </ul>
        </section>
      </div>

      {pinOpen && (
        <PinModal
          title="Confirm bill payment"
          subtitle={`${formatRwf(numericAmount)} · ${biller.name}`}
          onClose={() => setPinOpen(false)}
          onSuccess={async () => {
            setPinOpen(false);
            setPayError(null);
            try {
              await payBill({
                billerId,
                reference: reference.trim(),
                amountRwf: numericAmount,
              });
              await refresh();
              setPaidMsg(`${biller.name} paid — ${formatRwf(numericAmount)} (${reference}).`);
              setReference("");
              setAmount("");
            } catch (err) {
              setPayError(err instanceof Error ? err.message : "Bill payment failed.");
            }
          }}
        />
      )}
    </div>
  );
}

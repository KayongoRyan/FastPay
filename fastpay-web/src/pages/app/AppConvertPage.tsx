import { ArrowDownUp, CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { PinModal } from "../../components/PinModal";
import { convertRates, formatRwf, walletAccount } from "../../lib/wallet-data";

const targets = Object.keys(convertRates) as Array<keyof typeof convertRates>;

export function AppConvertPage() {
  const [amount, setAmount] = useState("");
  const [target, setTarget] = useState<string>("USDT");
  const [error, setError] = useState<string | null>(null);
  const [pinOpen, setPinOpen] = useState(false);
  const [done, setDone] = useState(false);

  const numericAmount = Number(amount.replace(/[^\d]/g, ""));
  const rate = convertRates[target];
  const received = numericAmount ? numericAmount / rate : 0;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!numericAmount || numericAmount < 1000) {
      setError("Minimum conversion is RWF 1,000.");
      return;
    }
    if (numericAmount > walletAccount.balance) {
      setError("Amount exceeds your available balance.");
      return;
    }
    setPinOpen(true);
  }

  if (done) {
    return (
      <div className="wapp-page">
        <section className="wapp-card wapp-result">
          <CheckCircle2 size={44} className="wapp-result__icon" />
          <h2>Conversion complete</h2>
          <p>
            {formatRwf(numericAmount)} → <strong>{received.toFixed(2)} {target}</strong> at rate{" "}
            {rate.toLocaleString()}.
          </p>
          <button
            type="button"
            className="auth-form__submit"
            onClick={() => {
              setDone(false);
              setAmount("");
            }}
          >
            Convert again
          </button>
        </section>
      </div>
    );
  }

  return (
    <div className="wapp-page">
      <section className="wapp-card wapp-form-card">
        <header className="wapp-card__head">
          <h2>Convert RWF</h2>
        </header>
        <p className="wapp-form-card__hint">
          Balance: <strong>{formatRwf(walletAccount.balance)}</strong>
        </p>

        <form className="settings-form" onSubmit={handleSubmit}>
          {error && <p className="auth-form__error" role="alert">{error}</p>}

          <label>
            <span>You pay (RWF)</span>
            <input
              type="text"
              inputMode="numeric"
              value={amount}
              onChange={(e) => setAmount(e.target.value.replace(/[^\d]/g, ""))}
              placeholder="142,000"
            />
          </label>

          <div className="wapp-convert-mid" aria-hidden="true">
            <span>
              <ArrowDownUp size={16} />
            </span>
            <small>Rate 1 {target} = {rate.toLocaleString()} RWF</small>
          </div>

          <label>
            <span>You receive</span>
            <div className="wapp-convert-out">
              <strong>{received ? received.toFixed(2) : "0.00"}</strong>
              <select value={target} onChange={(e) => setTarget(e.target.value)}>
                {targets.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
          </label>

          <button type="submit" className="auth-form__submit">
            Convert
          </button>
        </form>
      </section>

      {pinOpen && (
        <PinModal
          title="Confirm conversion"
          subtitle={`${formatRwf(numericAmount)} → ${received.toFixed(2)} ${target}`}
          onClose={() => setPinOpen(false)}
          onSuccess={() => {
            setPinOpen(false);
            setDone(true);
          }}
        />
      )}
    </div>
  );
}

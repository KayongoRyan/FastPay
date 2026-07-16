import { CheckCircle2, Smartphone } from "lucide-react";
import { useState } from "react";
import { PinModal } from "../../components/PinModal";
import { formatRwf } from "../../lib/wallet-data";

const providers = [
  { id: "mtn", name: "MTN MoMo", tone: "gold" },
  { id: "airtel", name: "Airtel Money", tone: "red" },
] as const;

const presets = [1000, 5000, 10000, 20000];

export function AppBuyPage() {
  const [provider, setProvider] = useState<(typeof providers)[number]["id"]>("mtn");
  const [phone, setPhone] = useState("");
  const [amount, setAmount] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pinOpen, setPinOpen] = useState(false);
  const [done, setDone] = useState(false);

  const numericAmount = Number(amount.replace(/[^\d]/g, ""));
  const providerName = providers.find((p) => p.id === provider)!.name;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!/^\+?250\d{9}$|^07\d{8}$/.test(phone.replace(/\s/g, ""))) {
      setError("Enter a valid Rwandan number (07… or +2507…).");
      return;
    }
    if (!numericAmount || numericAmount < 100) {
      setError("Minimum top-up is RWF 100.");
      return;
    }
    setPinOpen(true);
  }

  if (done) {
    return (
      <div className="wapp-page">
        <section className="wapp-card wapp-result">
          <CheckCircle2 size={44} className="wapp-result__icon" />
          <h2>Top-up sent</h2>
          <p>
            {formatRwf(numericAmount)} airtime via <strong>{providerName}</strong> to {phone}.
          </p>
          <button
            type="button"
            className="auth-form__submit"
            onClick={() => {
              setDone(false);
              setPhone("");
              setAmount("");
            }}
          >
            New top-up
          </button>
        </section>
      </div>
    );
  }

  return (
    <div className="wapp-page">
      <section className="wapp-card wapp-form-card">
        <header className="wapp-card__head">
          <h2>
            <Smartphone size={18} /> Buy airtime & data
          </h2>
        </header>

        <div className="wapp-provider">
          {providers.map((p) => (
            <button
              key={p.id}
              type="button"
              className={`wapp-provider__item wapp-provider__item--${p.tone}${
                provider === p.id ? " is-active" : ""
              }`}
              onClick={() => setProvider(p.id)}
            >
              {p.name}
            </button>
          ))}
        </div>

        <form className="settings-form" onSubmit={handleSubmit}>
          {error && <p className="auth-form__error" role="alert">{error}</p>}

          <label>
            <span>Phone number</span>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+250 7XX XXX XXX"
            />
          </label>

          <label>
            <span>Amount (RWF)</span>
            <input
              type="text"
              inputMode="numeric"
              value={amount}
              onChange={(e) => setAmount(e.target.value.replace(/[^\d]/g, ""))}
              placeholder="5,000"
            />
          </label>

          <div className="wapp-presets">
            {presets.map((p) => (
              <button key={p} type="button" onClick={() => setAmount(String(p))}>
                {formatRwf(p)}
              </button>
            ))}
          </div>

          <button type="submit" className="auth-form__submit">
            Buy now
          </button>
        </form>
      </section>

      {pinOpen && (
        <PinModal
          title="Confirm top-up"
          subtitle={`${formatRwf(numericAmount)} · ${providerName} · ${phone}`}
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

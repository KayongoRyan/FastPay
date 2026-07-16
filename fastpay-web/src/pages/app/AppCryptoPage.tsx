import {
  ArrowLeftRight,
  CalendarDays,
  CandlestickChart,
  Newspaper,
} from "lucide-react";
import { useMemo, useState } from "react";
import { PinModal } from "../../components/PinModal";
import { formatRwf, trendingTokens, walletAccount } from "../../lib/wallet-data";

type Tab = "market" | "news" | "calendar" | "convert";

const cryptoRatesRwf: Record<string, number> = {
  BTC: 92400000,
  ETH: 4850000,
  USDT: 1420,
  XLM: 142,
  SOL: 210000,
};

const news = [
  {
    id: "n1",
    title: "BNB climbs as Rwanda fintech rails expand regional remittances",
    source: "FastPay Markets",
    time: "2h ago",
    tag: "RW",
  },
  {
    id: "n2",
    title: "USDT liquidity deepens on Kigali OTC desks — spreads under 0.3%",
    source: "East Africa Desk",
    time: "5h ago",
    tag: "Stablecoin",
  },
  {
    id: "n3",
    title: "Bitcoin holds above RWF 90M as ETF inflows stabilize",
    source: "Wire",
    time: "Yesterday",
    tag: "BTC",
  },
  {
    id: "n4",
    title: "Stellar corridor pilots for RWF merchant settlement gain traction",
    source: "FastPay Labs",
    time: "Jul 14",
    tag: "XLM",
  },
];

const calendarEvents = [
  { day: 16, label: "USDT ↔ RWF desk open", kind: "liquidity" as const },
  { day: 18, label: "BTC options expiry (global)", kind: "macro" as const },
  { day: 21, label: "FastPay crypto KYC webinar", kind: "local" as const },
  { day: 24, label: "ETH Fusaka upgrade watch", kind: "macro" as const },
  { day: 28, label: "Month-end RWF settlement window", kind: "liquidity" as const },
];

const coins = Object.keys(cryptoRatesRwf);

export function AppCryptoPage() {
  const [tab, setTab] = useState<Tab>("market");
  const [coin, setCoin] = useState("USDT");
  const [amount, setAmount] = useState("");
  const [direction, setDirection] = useState<"buy" | "sell">("buy");
  const [error, setError] = useState<string | null>(null);
  const [pinOpen, setPinOpen] = useState(false);
  const [done, setDone] = useState<string | null>(null);

  const rate = cryptoRatesRwf[coin];
  const numeric = Number(amount.replace(/[^\d.]/g, ""));

  const preview = useMemo(() => {
    if (!numeric || !rate) return null;
    if (direction === "buy") {
      return { pay: formatRwf(numeric), get: `${(numeric / rate).toFixed(6)} ${coin}` };
    }
    return { pay: `${numeric} ${coin}`, get: formatRwf(Math.round(numeric * rate)) };
  }, [numeric, rate, direction, coin]);

  const daysInMonth = 31;
  const eventByDay = useMemo(() => {
    const map = new Map<number, (typeof calendarEvents)[number]>();
    calendarEvents.forEach((e) => map.set(e.day, e));
    return map;
  }, []);

  function handleConvert(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setDone(null);
    if (!numeric || numeric <= 0) {
      setError("Enter a valid amount.");
      return;
    }
    if (direction === "buy" && numeric > walletAccount.balance) {
      setError("Amount exceeds your RWF balance.");
      return;
    }
    setPinOpen(true);
  }

  const tabs: { id: Tab; label: string; icon: typeof Newspaper }[] = [
    { id: "market", label: "Market", icon: CandlestickChart },
    { id: "news", label: "News", icon: Newspaper },
    { id: "calendar", label: "Calendar", icon: CalendarDays },
    { id: "convert", label: "Convert to RWF", icon: ArrowLeftRight },
  ];

  return (
    <div className="wapp-page">
      <section className="wapp-card">
        <header className="wapp-card__head">
          <h2>
            <CandlestickChart size={18} /> Crypto market
          </h2>
        </header>
        <p className="wapp-form-card__hint">
          Live-style prices in Rwandan francs, market news, event calendar, and convert ↔ RWF.
        </p>
        <div className="wapp-tabs" role="tablist">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={tab === id}
              className={`wapp-tabs__btn${tab === id ? " is-active" : ""}`}
              onClick={() => setTab(id)}
            >
              <Icon size={15} />
              {label}
            </button>
          ))}
        </div>
      </section>

      {tab === "market" && (
        <section className="wapp-card">
          <header className="wapp-card__head">
            <h2>Prices (RWF)</h2>
          </header>
          <ul className="wapp-tokens">
            {trendingTokens.map((t) => (
              <li key={t.symbol} className="wapp-tokens__row">
                <span className="wapp-tokens__symbol">{t.symbol}</span>
                <div>
                  <strong>{t.name}</strong>
                  <small>{t.price}</small>
                </div>
                <span className={`wapp-tokens__change${t.up ? " is-up" : " is-down"}`}>
                  {t.change}
                </span>
              </li>
            ))}
            {Object.entries(cryptoRatesRwf)
              .filter(([sym]) => !trendingTokens.some((t) => t.symbol === sym))
              .map(([sym, price]) => (
                <li key={sym} className="wapp-tokens__row">
                  <span className="wapp-tokens__symbol">{sym}</span>
                  <div>
                    <strong>{sym}</strong>
                    <small>{formatRwf(price)}</small>
                  </div>
                  <span className="wapp-tokens__change is-up">—</span>
                </li>
              ))}
          </ul>
        </section>
      )}

      {tab === "news" && (
        <section className="wapp-card">
          <header className="wapp-card__head">
            <h2>
              <Newspaper size={18} /> Market news
            </h2>
          </header>
          <ul className="wapp-news">
            {news.map((n) => (
              <li key={n.id}>
                <em>{n.tag}</em>
                <strong>{n.title}</strong>
                <small>
                  {n.source} · {n.time}
                </small>
              </li>
            ))}
          </ul>
        </section>
      )}

      {tab === "calendar" && (
        <section className="wapp-card">
          <header className="wapp-card__head">
            <h2>
              <CalendarDays size={18} /> July 2026
            </h2>
          </header>
          <div className="wapp-cal">
            {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
              <span key={d} className="wapp-cal__dow">
                {d}
              </span>
            ))}
            {Array.from({ length: 2 }, (_, i) => (
              <span key={`pad-${i}`} className="wapp-cal__day is-empty" />
            ))}
            {Array.from({ length: daysInMonth }, (_, i) => {
              const day = i + 1;
              const ev = eventByDay.get(day);
              return (
                <button
                  key={day}
                  type="button"
                  className={`wapp-cal__day${ev ? " has-event" : ""}${day === 16 ? " is-today" : ""}`}
                  title={ev?.label}
                >
                  <strong>{day}</strong>
                  {ev && <span className={`wapp-cal__dot wapp-cal__dot--${ev.kind}`} />}
                </button>
              );
            })}
          </div>
          <ul className="wapp-cal-list">
            {calendarEvents.map((e) => (
              <li key={e.day}>
                <strong>Jul {e.day}</strong>
                <span>{e.label}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {tab === "convert" && (
        <section className="wapp-card wapp-form-card">
          <header className="wapp-card__head">
            <h2>
              <ArrowLeftRight size={18} /> Convert into Rwandan francs
            </h2>
          </header>
          <p className="wapp-form-card__hint">
            Balance: <strong>{formatRwf(walletAccount.balance)}</strong> · Holding mock USDT{" "}
            <strong>{walletAccount.usdt}</strong>
          </p>
          {done && <p className="settings-note">{done}</p>}
          <form className="settings-form" onSubmit={handleConvert}>
            {error && (
              <p className="auth-form__error" role="alert">
                {error}
              </p>
            )}
            <div className="wapp-provider">
              <button
                type="button"
                className={`wapp-provider__item${direction === "buy" ? " is-active" : ""}`}
                onClick={() => setDirection("buy")}
              >
                RWF → Crypto
              </button>
              <button
                type="button"
                className={`wapp-provider__item${direction === "sell" ? " is-active" : ""}`}
                onClick={() => setDirection("sell")}
              >
                Crypto → RWF
              </button>
            </div>
            <label>
              <span>Asset</span>
              <select value={coin} onChange={(e) => setCoin(e.target.value)}>
                {coins.map((c) => (
                  <option key={c} value={c}>
                    {c} · {formatRwf(cryptoRatesRwf[c])}
                  </option>
                ))}
              </select>
            </label>
            <label>
              <span>{direction === "buy" ? "You pay (RWF)" : `You sell (${coin})`}</span>
              <input
                type="text"
                inputMode="decimal"
                value={amount}
                onChange={(e) => setAmount(e.target.value.replace(/[^\d.]/g, ""))}
                placeholder={direction === "buy" ? "142000" : "10"}
              />
            </label>
            {preview && (
              <p className="wapp-form-card__hint">
                You get <strong>{preview.get}</strong> for {preview.pay}
              </p>
            )}
            <button type="submit" className="auth-form__submit">
              Convert
            </button>
          </form>
        </section>
      )}

      {pinOpen && (
        <PinModal
          title="Confirm crypto conversion"
          subtitle={preview ? `${preview.pay} → ${preview.get}` : undefined}
          onClose={() => setPinOpen(false)}
          onSuccess={() => {
            setPinOpen(false);
            setDone(
              direction === "buy"
                ? `Bought ${(numeric / rate).toFixed(6)} ${coin} for ${formatRwf(numeric)}.`
                : `Sold ${numeric} ${coin} for ${formatRwf(Math.round(numeric * rate))}.`,
            );
            setAmount("");
          }}
        />
      )}
    </div>
  );
}

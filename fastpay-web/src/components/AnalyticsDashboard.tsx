import { useState } from "react";
import {
  ArrowDownUp,
  ArrowLeft,
  ArrowRight,
  Building2,
  ChevronDown,
  CreditCard,
  Gift,
  Globe2,
  Grid3X3,
  Home,
  MessageCircle,
  Music2,
  Plus,
  Receipt,
  Settings,
  Shield,
  TrendingDown,
  TrendingUp,
  Wifi,
} from "lucide-react";

const navItems = [
  { id: "Accounts", icon: Home },
  { id: "Paybill", icon: Receipt },
  { id: "Transfer", icon: ArrowDownUp },
  { id: "Reward", icon: Gift },
] as const;

const ticker = [
  { name: "MTN MoMo", value: "RWF 12.4", up: true },
  { name: "BK Group", value: "RWF 1,820", up: false },
  { name: "Equity BCDC", value: "RWF 940", up: true },
  { name: "Airtel Money", value: "RWF 8.2", up: false },
];

const cards = [
  {
    holder: "F. PLUTO",
    number: "4821 •••• •••• 9012",
    expiry: "12/28",
    label: "Everyday",
    theme: "aqua",
  },
  {
    holder: "F. PLUTO",
    number: "5533 •••• •••• 7741",
    expiry: "08/27",
    label: "Business",
    theme: "navy",
  },
  {
    holder: "F. PLUTO",
    number: "4012 •••• •••• 3340",
    expiry: "03/29",
    label: "Savings",
    theme: "gold",
  },
] as const;

const transactions = [
  {
    name: "Home Insurance",
    date: "07/01/2026",
    amount: "-RWF 230,990",
    tone: "gold",
    icon: Shield,
  },
  {
    name: "Newcom Internet",
    date: "07/04/2026",
    amount: "-RWF 67,230",
    tone: "blue",
    icon: Wifi,
  },
  {
    name: "Spotify Plan",
    date: "06/25/2026",
    amount: "-RWF 9,990",
    tone: "green",
    icon: Music2,
  },
];

type Corridor = {
  code: string;
  country: string;
  role: string;
  amount: string;
  currency: string;
  icon: typeof Globe2;
};

const corridors: Corridor[] = [
  {
    code: "RW",
    country: "RWANDA",
    role: "Sender",
    amount: "245,700",
    currency: "RWF",
    icon: Building2,
  },
  {
    code: "KE",
    country: "KENYA",
    role: "Receiver",
    amount: "26,840",
    currency: "KES",
    icon: Globe2,
  },
  {
    code: "UG",
    country: "UGANDA",
    role: "Recipient gets",
    amount: "684,200",
    currency: "UGX",
    icon: CreditCard,
  },
];

function FastPayMark({ className = "" }: { className?: string }) {
  return (
    <span className={`dash-fp-mark ${className}`} aria-hidden="true">
      <span className="dash-fp-mark__a" />
      <span className="dash-fp-mark__b" />
    </span>
  );
}

export function AnalyticsDashboard() {
  const [activeNav, setActiveNav] = useState<(typeof navItems)[number]["id"]>("Accounts");
  const [activeCard, setActiveCard] = useState(0);

  return (
    <div className="dash">
      <header className="dash__top">
        <div className="dash__brand" aria-hidden="true">
          <FastPayMark />
        </div>

        <nav className="dash__nav" aria-label="Dashboard sections">
          {navItems.map(({ id, icon: Icon }) => (
            <button
              key={id}
              type="button"
              className={`dash__nav-item${activeNav === id ? " is-active" : ""}`}
              onClick={() => setActiveNav(id)}
            >
              <Icon className="dash__nav-icon" strokeWidth={2.25} aria-hidden="true" />
              <span>{id}</span>
            </button>
          ))}
        </nav>

        <div className="dash__ticker" aria-label="Market movers">
          {ticker.map((item) => (
            <div key={item.name} className="dash__ticker-item">
              <span>{item.name}</span>
              <strong className={item.up ? "is-up" : "is-down"}>
                {item.up ? (
                  <TrendingUp className="dash__trend-icon" aria-hidden="true" />
                ) : (
                  <TrendingDown className="dash__trend-icon" aria-hidden="true" />
                )}
                {item.value}
              </strong>
            </div>
          ))}
        </div>

        <div className="dash__utils">
          <button type="button" className="dash__icon-btn" aria-label="Messages">
            <MessageCircle className="dash__responsive-icon" />
          </button>
          <div className="dash__avatar" aria-hidden="true">
            K
          </div>
          <button type="button" className="dash__icon-btn" aria-label="Apps">
            <Grid3X3 className="dash__responsive-icon" />
          </button>
        </div>
      </header>

      <div className="dash__body">
        <section className="dash__col dash__col--cards">
          <div className="dash__col-head">
            <button type="button" className="dash__icon-btn" aria-label="Back">
              <ArrowLeft className="dash__responsive-icon" />
            </button>
            <h2>My Cards</h2>
            <button type="button" className="dash__add" aria-label="Add card">
              <Plus className="dash__responsive-icon" />
            </button>
          </div>

          <div className="dash__balance-row">
            <div>
              <span>Your current balance</span>
              <strong>RWF 4,457,000</strong>
            </div>
            <button type="button" className="dash__mini-arrow" aria-label="View balance">
              <ArrowRight className="dash__responsive-icon dash__responsive-icon--sm" />
            </button>
          </div>

          <div className="dash__balance-row">
            <div>
              <span>Your spending limit</span>
              <strong>RWF 6,500,000</strong>
            </div>
            <button type="button" className="dash__mini-arrow" aria-label="View limit">
              <ArrowRight className="dash__responsive-icon dash__responsive-icon--sm" />
            </button>
          </div>

          <div className="dash__card-stack">
            {cards.map((card, i) => (
              <button
                key={card.number}
                type="button"
                className={`dash-card dash-card--${card.theme}${activeCard === i ? " is-active" : ""}`}
                style={{ zIndex: cards.length - i, transform: `translateY(${i * 30}px)` }}
                onClick={() => setActiveCard(i)}
              >
                <div className="dash-card__top">
                  <div className="dash-card__brand">
                    <FastPayMark className="dash-fp-mark--on-card" />
                    <span>FASTPAY</span>
                  </div>
                  <span className="dash-card__label">{card.label}</span>
                </div>

                <div className="dash-card__mid">
                  <span className="dash-card__chip" aria-hidden="true" />
                  <span className="dash-card__contactless" aria-hidden="true">
                    )))
                  </span>
                </div>

                <div className={`dash-card__glass${i === 0 ? " is-visible" : ""}`}>
                  <span>{card.number}</span>
                  <small>{card.expiry}</small>
                </div>

                <div className="dash-card__footer">
                  <div>
                    <small>CARDHOLDER</small>
                    <strong>{card.holder}</strong>
                  </div>
                  <div>
                    <small>VALID THRU</small>
                    <strong>{card.expiry}</strong>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </section>

        <section className="dash__col dash__col--send">
          <div className="dash__col-head dash__col-head--solo">
            <h2>Send Money</h2>
          </div>

          <div className="dash-send">
            {corridors.map((c, i) => {
              const RailIcon = c.icon;
              return (
                <div key={c.country} className="dash-send__step">
                  <div className="dash-send__rail">
                    <span className="dash-send__flag" aria-hidden="true">
                      <RailIcon className="dash__responsive-icon" strokeWidth={2.25} />
                      <em>{c.code}</em>
                    </span>
                    {i < corridors.length - 1 && <span className="dash-send__line" />}
                  </div>

                  <div className="dash-send__body">
                    <button type="button" className="dash-send__country">
                      {c.country}
                      <ChevronDown className="dash__responsive-icon dash__responsive-icon--sm" />
                    </button>

                    <div className="dash-send__box">
                      <span>{c.role}</span>
                      <strong>
                        {c.amount} <em>{c.currency}</em>
                      </strong>
                    </div>

                    {i === 0 && (
                      <p className="dash-send__rate">
                        Rate = 109.20 · Jul 15 3:40 PM UTC
                      </p>
                    )}

                    {i === 0 && (
                      <button type="button" className="dash-send__swap" aria-label="Swap currencies">
                        <ArrowDownUp className="dash__responsive-icon" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section className="dash__col dash__col--tx">
          <div className="dash__col-head">
            <h2>All Transaction</h2>
            <div className="dash__col-actions">
              <button type="button" className="dash__icon-btn" aria-label="Previous">
                <ArrowLeft className="dash__responsive-icon dash__responsive-icon--sm" />
              </button>
              <button type="button" className="dash__icon-btn" aria-label="Next">
                <ArrowRight className="dash__responsive-icon dash__responsive-icon--sm" />
              </button>
              <button type="button" className="dash__icon-btn" aria-label="Settings">
                <Settings className="dash__responsive-icon dash__responsive-icon--sm" />
              </button>
            </div>
          </div>

          <ul className="dash-tx">
            {transactions.map((tx) => {
              const TxIcon = tx.icon;
              return (
                <li key={tx.name} className="dash-tx__row">
                  <span className={`dash-tx__icon dash-tx__icon--${tx.tone}`}>
                    <TxIcon className="dash__responsive-icon" strokeWidth={2.25} />
                  </span>
                  <div>
                    <strong>{tx.name}</strong>
                    <small>{tx.date}</small>
                  </div>
                  <span className="dash-tx__amount">{tx.amount}</span>
                </li>
              );
            })}
          </ul>

          <div className="dash-score">
            <svg
              className="dash-score__gauge"
              viewBox="0 0 220 120"
              role="img"
              aria-label="Budget health pretty good"
            >
              <defs>
                <linearGradient id="dashScoreGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#3b82f6" />
                  <stop offset="35%" stopColor="#22d3ee" />
                  <stop offset="65%" stopColor="#4ade80" />
                  <stop offset="100%" stopColor="#facc15" />
                </linearGradient>
              </defs>
              <path
                d="M20 110 A90 90 0 0 1 200 110"
                fill="none"
                stroke="url(#dashScoreGrad)"
                strokeWidth="18"
                strokeLinecap="round"
              />
              <g className="dash-score__needle" transform="rotate(48 110 110)">
                <line x1="110" y1="110" x2="110" y2="38" stroke="#fff" strokeWidth="4" strokeLinecap="round" />
                <circle cx="110" cy="110" r="8" fill="#fff" />
              </g>
            </svg>
            <span className="dash-score__label">Your budget health</span>
            <strong className="dash-score__value">Pretty Good</strong>
          </div>
        </section>
      </div>
    </div>
  );
}

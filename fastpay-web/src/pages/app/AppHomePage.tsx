import {
  ArrowDownLeft,
  ArrowDownToLine,
  ArrowLeftRight,
  ArrowUpRight,
  Banknote,
  Building2,
  CandlestickChart,
  FileText,
  HandCoins,
  Landmark,
  LayoutGrid,
  PiggyBank,
  Receipt,
  ShieldCheck,
  Smartphone,
  Target,
  Ticket,
  Users,
  Wifi,
  Zap,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useWallet } from "../../hooks/useWallet";
import { loadSettings } from "../../lib/auth-api";
import { formatRwf } from "../../lib/wallet-api";

const quickActions = [
  { to: "/app/features", label: "Features", icon: LayoutGrid },
  { to: "/app/convert", label: "Convert", icon: ArrowLeftRight },
  { to: "/app/bills", label: "Bills", icon: Receipt },
  { to: "/app/goals", label: "Goals", icon: Target },
  { to: "/app/crypto", label: "Crypto", icon: CandlestickChart },
];

type Tile = {
  label: string;
  icon: typeof Zap;
  to?: string;
  hint: string;
};

const quickLinks: Tile[] = [
  { label: "MoMo top-up", icon: Smartphone, to: "/app/buy", hint: "MTN & Airtel" },
  { label: "Airtime & data", icon: Wifi, to: "/app/buy", hint: "Bundles for any number" },
  { label: "Utilities", icon: Zap, to: "/app/bills", hint: "EUCL & WASAC tokens" },
  { label: "Pay tax", icon: Landmark, to: "/app/bills", hint: "RRA & Irembo bills" },
  { label: "Forex", icon: ArrowLeftRight, to: "/app/convert", hint: "RWF ⇄ USDT, USD, KES" },
  { label: "Statement", icon: FileText, to: "/app/wallet", hint: "Full transaction history" },
  { label: "Savings", icon: PiggyBank, to: "/app/savings", hint: "Open a savings account" },
  { label: "Crypto", icon: CandlestickChart, to: "/app/crypto", hint: "News, calendar, RWF convert" },
  { label: "Get loan", icon: HandCoins, hint: "Personal & business" },
];

const services: Tile[] = [
  { label: "Send money", icon: ArrowUpRight, to: "/app/transfer", hint: "FastPay & phone numbers" },
  { label: "Bill payments", icon: Receipt, to: "/app/bills", hint: "Utilities, TV, school fees" },
  { label: "Bank pay", icon: Building2, hint: "Pay merchants by bank" },
  { label: "Vouchers", icon: Ticket, hint: "Buy & redeem vouchers" },
  { label: "Family wallet", icon: Users, to: "/app/family", hint: "Shared budgets & approvals" },
  { label: "Insurance", icon: ShieldCheck, hint: "Health & device cover" },
  { label: "Escrow", icon: Banknote, hint: "Protected buyer-seller deals" },
  { label: "Offline pay", icon: ArrowDownToLine, hint: "Pay without internet" },
];

function TileGrid({ tiles }: { tiles: Tile[] }) {
  return (
    <div className="wapp-tiles">
      {tiles.map(({ label, icon: Icon, to, hint }) =>
        to ? (
          <Link key={label} to={to} className="wapp-tiles__item">
            <span className="wapp-tiles__icon">
              <Icon size={18} strokeWidth={2.1} />
            </span>
            <strong>{label}</strong>
            <small>{hint}</small>
          </Link>
        ) : (
          <div key={label} className="wapp-tiles__item is-soon" aria-disabled="true">
            <span className="wapp-tiles__icon">
              <Icon size={18} strokeWidth={2.1} />
            </span>
            <strong>
              {label}
              <em>Soon</em>
            </strong>
            <small>{hint}</small>
          </div>
        ),
      )}
    </div>
  );
}

const weekBars = [42, 58, 48, 72, 65, 80, 68];

export function AppHomePage() {
  const { user } = useAuth();
  const { wallet, history, loading, error } = useWallet();
  const hideBalance = loadSettings().hideBalance;
  const balance = wallet?.balance ?? 0;
  const accountNumber = wallet?.accountNumber ?? "—";

  return (
    <div className="wapp-page">
      {error && <p className="auth-form__error" role="alert">{error}</p>}
      <section className="wapp-hero-card">
        <div>
          <span className="wapp-hero-card__label">Available balance</span>
          <strong className="wapp-hero-card__balance">
            {loading ? "…" : hideBalance ? "RWF ••••••" : formatRwf(balance)}
          </strong>
          <span className="wapp-hero-card__delta">Live wallet balance</span>
        </div>
        <div className="wapp-hero-card__account">
          <small>Account</small>
          <span>{accountNumber}</span>
          <em>{user?.kycStatus === "verified" ? "KYC verified" : "KYC pending"}</em>
        </div>
      </section>

      <section className="wapp-quick">
        {quickActions.map(({ to, label, icon: Icon }) => (
          <Link key={to} to={to} className="wapp-quick__item">
            <span className="wapp-quick__icon">
              <Icon size={18} strokeWidth={2.2} />
            </span>
            {label}
          </Link>
        ))}
      </section>

      <section className="wapp-card">
        <header className="wapp-card__head">
          <h2>Quick links</h2>
        </header>
        <TileGrid tiles={quickLinks} />
      </section>

      <section className="wapp-card">
        <header className="wapp-card__head">
          <h2>Services</h2>
        </header>
        <TileGrid tiles={services} />
      </section>

      <div className="wapp-grid-2">
        <section className="wapp-card">
          <header className="wapp-card__head">
            <h2>Recent activity</h2>
            <Link to="/app/wallet">View all</Link>
          </header>
          <ul className="wapp-tx">
            {history.slice(0, 5).map((tx) => (
              <li key={tx.id} className="wapp-tx__row">
                <span className={`wapp-tx__icon wapp-tx__icon--${tx.direction}`}>
                  {tx.direction === "in" ? <ArrowDownLeft size={16} /> : <ArrowUpRight size={16} />}
                </span>
                <div>
                  <strong>{tx.counterparty}</strong>
                  <small>
                    {tx.amount} {tx.asset} · {tx.status}
                  </small>
                </div>
                <span className={`wapp-tx__amount${tx.direction === "in" ? " is-in" : ""}`}>
                  {tx.direction === "in" ? "+" : "−"}
                  {tx.amount} {tx.asset}
                </span>
              </li>
            ))}
            {!loading && history.length === 0 && (
              <li className="wapp-tx__row">
                <div>
                  <strong>No activity yet</strong>
                  <small>Transfers will appear here.</small>
                </div>
              </li>
            )}
          </ul>
        </section>

        <section className="wapp-card">
          <header className="wapp-card__head">
            <h2>Weekly spending</h2>
            <Link to="/app/analytics">Analytics</Link>
          </header>
          <p className="wapp-card__big">{hideBalance ? "RWF ••••" : "RWF 186,400"}</p>
          <div className="wapp-bars">
            {weekBars.map((h, i) => (
              <span
                key={i}
                className={i === 5 ? "is-active" : ""}
                style={{ height: `${h}%` }}
              />
            ))}
          </div>
          <div className="wapp-bars__labels">
            {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
              <span key={i}>{d}</span>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

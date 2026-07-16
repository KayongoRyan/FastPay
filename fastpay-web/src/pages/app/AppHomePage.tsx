import {
  ArrowDownLeft,
  ArrowDownToLine,
  ArrowLeftRight,
  ArrowUpRight,
  Receipt,
  Smartphone,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { loadSettings } from "../../lib/auth-api";
import { formatRwf, recentTransactions, walletAccount } from "../../lib/wallet-data";

const quickActions = [
  { to: "/app/transfer", label: "Transfer", icon: ArrowUpRight },
  { to: "/app/receive", label: "Receive", icon: ArrowDownToLine },
  { to: "/app/buy", label: "Top-up", icon: Smartphone },
  { to: "/app/convert", label: "Convert", icon: ArrowLeftRight },
  { to: "/app/bills", label: "Bills", icon: Receipt },
];

const weekBars = [42, 58, 48, 72, 65, 80, 68];

export function AppHomePage() {
  const { user } = useAuth();
  const hideBalance = loadSettings().hideBalance;

  return (
    <div className="wapp-page">
      <section className="wapp-hero-card">
        <div>
          <span className="wapp-hero-card__label">Available balance</span>
          <strong className="wapp-hero-card__balance">
            {hideBalance ? "RWF ••••••" : formatRwf(walletAccount.balance)}
          </strong>
          <span className="wapp-hero-card__delta">{walletAccount.weeklyChange} this week</span>
        </div>
        <div className="wapp-hero-card__account">
          <small>Account</small>
          <span>{walletAccount.accountNumber}</span>
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

      <div className="wapp-grid-2">
        <section className="wapp-card">
          <header className="wapp-card__head">
            <h2>Recent activity</h2>
            <Link to="/app/wallet">View all</Link>
          </header>
          <ul className="wapp-tx">
            {recentTransactions.slice(0, 5).map((tx) => (
              <li key={tx.id} className="wapp-tx__row">
                <span className={`wapp-tx__icon wapp-tx__icon--${tx.direction}`}>
                  {tx.direction === "in" ? <ArrowDownLeft size={16} /> : <ArrowUpRight size={16} />}
                </span>
                <div>
                  <strong>{tx.name}</strong>
                  <small>
                    {tx.detail} · {tx.date}
                  </small>
                </div>
                <span className={`wapp-tx__amount${tx.direction === "in" ? " is-in" : ""}`}>
                  {tx.direction === "in" ? "+" : "−"}
                  {formatRwf(tx.amount)}
                </span>
              </li>
            ))}
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

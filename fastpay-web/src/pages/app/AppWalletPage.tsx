import { ArrowDownLeft, ArrowUpRight, Copy, TrendingDown, TrendingUp } from "lucide-react";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { loadSettings } from "../../lib/auth-api";
import {
  loadSavingsAccounts,
  totalSavingsBalance,
} from "../../lib/savings-accounts";
import {
  formatRwf,
  recentTransactions,
  trendingTokens,
  walletAccount,
  walletCards,
} from "../../lib/wallet-data";

export function AppWalletPage() {
  const [copied, setCopied] = useState(false);
  const hideBalance = loadSettings().hideBalance;
  const savingsTotal = useMemo(() => {
    const accounts = loadSavingsAccounts();
    const opened = totalSavingsBalance(accounts);
    return opened > 0 ? opened : walletAccount.savings;
  }, []);

  async function copyAccount() {
    await navigator.clipboard.writeText(walletAccount.accountNumber).catch(() => undefined);
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  }

  return (
    <div className="wapp-page">
      <div className="wapp-grid-2 wapp-grid-2--wallet">
        <section className="wapp-card">
          <header className="wapp-card__head">
            <h2>Balances</h2>
          </header>

          <div className="wapp-balances">
            <div className="wapp-balances__row">
              <span>Main balance</span>
              <strong>{hideBalance ? "RWF ••••••" : formatRwf(walletAccount.balance)}</strong>
            </div>
            <div className="wapp-balances__row">
              <span>
                Savings pocket · <Link to="/app/savings">Manage</Link>
              </span>
              <strong>{hideBalance ? "RWF ••••••" : formatRwf(savingsTotal)}</strong>
            </div>
            <div className="wapp-balances__row">
              <span>USDT</span>
              <strong>{hideBalance ? "••••" : `${walletAccount.usdt} USDT`}</strong>
            </div>
          </div>

          <button type="button" className="wapp-account-line" onClick={copyAccount}>
            <span>{walletAccount.accountNumber}</span>
            <Copy size={15} />
            {copied && <em>Copied</em>}
          </button>
        </section>

        <section className="wapp-card">
          <header className="wapp-card__head">
            <h2>Cards</h2>
          </header>
          <div className="wapp-cards">
            {walletCards.map((card) => (
              <div key={card.id} className={`wapp-mini-card wapp-mini-card--${card.theme}`}>
                <div className="wapp-mini-card__top">
                  <span>FASTPAY</span>
                  <em>{card.label}</em>
                </div>
                <p>{card.number}</p>
                <small>{card.expiry}</small>
              </div>
            ))}
          </div>
        </section>
      </div>

      <div className="wapp-grid-2">
        <section className="wapp-card">
          <header className="wapp-card__head">
            <h2>All transactions</h2>
          </header>
          <ul className="wapp-tx">
            {recentTransactions.map((tx) => (
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
            <h2>Trending tokens</h2>
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
                  {t.up ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                  {t.change}
                </span>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}

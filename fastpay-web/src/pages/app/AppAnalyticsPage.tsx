import { useMemo, useState } from "react";
import { categories as mockCategories } from "../../data/budget";
import { useWallet } from "../../hooks/useWallet";
import {
  buildAnalyticsFromHistory,
  formatRwfCompact,
  type AnalyticsPeriod,
} from "../../lib/analytics-utils";
import { loadSavingsAccounts, totalSavingsBalance } from "../../lib/savings-accounts";

const periodLabels: Record<AnalyticsPeriod, string> = {
  weekly: "Weekly",
  monthly: "Monthly",
  yearly: "Yearly",
};

export function AppAnalyticsPage() {
  const { history, wallet, loading, error } = useWallet();
  const [period, setPeriod] = useState<AnalyticsPeriod>("monthly");

  const data = useMemo(
    () => buildAnalyticsFromHistory(history, period),
    [history, period],
  );

  const savingsTotal = useMemo(() => totalSavingsBalance(loadSavingsAccounts()), []);
  const maxBar = Math.max(...data.bars, 1);
  const budget = Math.max(data.spent * 1.6, 1);
  const pct = Math.min(100, Math.round((data.spent / budget) * 100));

  const categories =
    data.categories.length > 0
      ? data.categories.map((c) => ({
          name: c.name,
          amount: formatRwfCompact(c.amount),
          pct: c.pct,
          color: c.color,
        }))
      : mockCategories;

  const goals = loadSavingsAccounts().slice(0, 3).map((account) => ({
    name: account.name,
    pct: account.target
      ? Math.min(100, Math.round((account.balance / account.target) * 100))
      : Math.min(100, Math.round((account.balance / Math.max(savingsTotal, 1)) * 100)),
  }));

  return (
    <div className="wapp-page">
      {error && <p className="auth-form__error">{error}</p>}
      {loading && <p className="wapp-form-card__hint">Loading analytics…</p>}

      <div className="wapp-grid-2">
        <section className="wapp-card">
          <header className="wapp-card__head">
            <h2>Spending</h2>
            <div className="wapp-tabs">
              {(Object.keys(periodLabels) as AnalyticsPeriod[]).map((p) => (
                <button
                  key={p}
                  type="button"
                  className={period === p ? "is-active" : ""}
                  onClick={() => setPeriod(p)}
                >
                  {periodLabels[p]}
                </button>
              ))}
            </div>
          </header>

          <p className="wapp-card__big">{formatRwfCompact(data.spent)}</p>
          <p className="wapp-form-card__hint">
            {data.label} · {pct}% of estimated {formatRwfCompact(budget)} budget
            {wallet ? ` · wallet ${formatRwfCompact(wallet.balance)}` : ""}
          </p>

          <div className="wapp-bars wapp-bars--tall">
            {data.bars.map((h, i) => (
              <span
                key={i}
                className={h === maxBar ? "is-active" : ""}
                style={{ height: `${(h / maxBar) * 100}%` }}
              />
            ))}
          </div>

          <div className="wapp-progress">
            <span style={{ width: `${pct}%` }} />
          </div>
        </section>

        <div className="wapp-stack">
          <section className="wapp-card">
            <header className="wapp-card__head">
              <h2>By category</h2>
            </header>
            <ul className="wapp-categories">
              {categories.map((c) => (
                <li key={c.name}>
                  <div className="wapp-categories__top">
                    <span>{c.name}</span>
                    <strong>{c.amount}</strong>
                  </div>
                  <div className="wapp-categories__track">
                    <span style={{ width: `${c.pct}%`, background: c.color }} />
                  </div>
                </li>
              ))}
            </ul>
          </section>

          <section className="wapp-card">
            <header className="wapp-card__head">
              <h2>Savings goals</h2>
            </header>
            {goals.length === 0 ? (
              <p className="wapp-form-card__hint">Open a savings pocket to track goals here.</p>
            ) : (
              <ul className="wapp-goals">
                {goals.map((g) => (
                  <li key={g.name}>
                    <div className="wapp-categories__top">
                      <span>{g.name}</span>
                      <strong>{g.pct}%</strong>
                    </div>
                    <div className="wapp-progress">
                      <span style={{ width: `${g.pct}%` }} />
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}

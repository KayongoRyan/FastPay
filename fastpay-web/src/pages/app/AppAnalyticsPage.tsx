import { useState } from "react";
import { categories } from "../../data/budget";

type Period = "weekly" | "monthly" | "yearly";

const periodData: Record<
  Period,
  { label: string; spent: string; budget: string; pct: number; bars: number[] }
> = {
  weekly: { label: "This week", spent: "RWF 186,400", budget: "RWF 300,000", pct: 62, bars: [45, 72, 38, 90, 55, 68, 42] },
  monthly: { label: "This month", spent: "RWF 742,000", budget: "RWF 1,200,000", pct: 62, bars: [60, 85, 70, 95, 55, 78, 62, 88, 45, 72, 80, 50] },
  yearly: { label: "This year", spent: "RWF 8.4M", budget: "RWF 14.4M", pct: 58, bars: [55, 78, 65, 88, 72, 90, 68, 82, 75, 60, 85, 70] },
};

const goals = [
  { name: "Emergency fund", pct: 42 },
  { name: "Family savings", pct: 58 },
  { name: "Home deposit", pct: 31 },
];

export function AppAnalyticsPage() {
  const [period, setPeriod] = useState<Period>("monthly");
  const data = periodData[period];
  const maxBar = Math.max(...data.bars);

  return (
    <div className="wapp-page">
      <div className="wapp-grid-2">
        <section className="wapp-card">
          <header className="wapp-card__head">
            <h2>Spending</h2>
            <div className="wapp-tabs">
              {(Object.keys(periodData) as Period[]).map((p) => (
                <button
                  key={p}
                  type="button"
                  className={period === p ? "is-active" : ""}
                  onClick={() => setPeriod(p)}
                >
                  {p[0].toUpperCase() + p.slice(1)}
                </button>
              ))}
            </div>
          </header>

          <p className="wapp-card__big">{data.spent}</p>
          <p className="wapp-form-card__hint">
            {data.label} · {data.pct}% of {data.budget} budget
          </p>

          <div className="wapp-bars wapp-bars--tall">
            {data.bars.map((h, i) => (
              <span key={i} className={h === maxBar ? "is-active" : ""} style={{ height: `${(h / maxBar) * 100}%` }} />
            ))}
          </div>

          <div className="wapp-progress">
            <span style={{ width: `${data.pct}%` }} />
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
          </section>
        </div>
      </div>
    </div>
  );
}

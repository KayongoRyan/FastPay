import { Bell, PieChart, Target, TrendingUp, Wallet, BarChart3 } from "lucide-react";
import { AnalyticsDashboard } from "../components/AnalyticsDashboard";
import { CtaStrip } from "../components/CtaStrip";
import { Reveal } from "../components/Reveal";
import { categories } from "../data/budget";

const capabilities = [
  {
    icon: PieChart,
    title: "Category Breakdown",
    desc: "See exactly where your money goes with auto-categorized transactions and custom tags.",
  },
  {
    icon: Target,
    title: "Goal Tracking",
    desc: "Set savings goals and watch progress across weekly, monthly, and yearly horizons.",
  },
  {
    icon: TrendingUp,
    title: "Trend Analysis",
    desc: "Compare periods side-by-side to spot spending spikes and seasonal patterns.",
  },
  {
    icon: Bell,
    title: "Smart Alerts",
    desc: "Get notified when you hit 80% of a budget or when unusual activity is detected.",
  },
  {
    icon: Wallet,
    title: "Multi-Account View",
    desc: "Aggregate balances across cards, wallets, and linked accounts in one dashboard.",
  },
  {
    icon: BarChart3,
    title: "Export & Reports",
    desc: "Download CSV or PDF reports for tax prep, expense claims, or team reviews.",
  },
];

export function AnalyticsPage() {
  return (
    <>
      <section className="analytics-shell">
        <div className="container analytics-shell__intro">
          <Reveal>
            <div className="section-label">Analytics</div>
            <h1 className="analytics-shell__title">
              Your money, one clear dashboard
            </h1>
          </Reveal>
          <Reveal delay={80}>
            <p className="analytics-shell__subtitle">
              Cards, transfers, and spending health in a single light workspace —
              built for RWF-first decisions, MoMo, and cross-border remittances.
            </p>
          </Reveal>
        </div>

        <div className="container">
          <Reveal delay={120}>
            <AnalyticsDashboard />
          </Reveal>
        </div>
      </section>

      <section className="page-section page-section--alt">
        <div className="container">
          <div className="page-section__header">
            <div className="section-label">Breakdown</div>
            <h2 className="section-title">Spending By Category</h2>
            <p className="section-subtitle">
              Auto-categorized transactions with manual override. Drill into any
              category for transaction-level detail.
            </p>
          </div>
          <div className="category-grid">
            {categories.map((cat) => (
              <article key={cat.name} className="category-card">
                <div className="category-card__top">
                  <span className="category-card__name">{cat.name}</span>
                  <span className="category-card__amount">{cat.amount}</span>
                </div>
                <div className="category-card__bar-track">
                  <div
                    className="category-card__bar-fill"
                    style={{ width: `${cat.pct}%`, background: cat.color }}
                  />
                </div>
                <span className="category-card__pct">{cat.pct}% of total</span>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="page-section">
        <div className="container">
          <div className="page-section__header page-section__header--center">
            <div className="section-label">Capabilities</div>
            <h2 className="section-title">Analytics Built For Real Decisions</h2>
          </div>
          <div className="capabilities-grid">
            {capabilities.map((c) => (
              <article key={c.title} className="capability-card">
                <div className="capability-card__icon">
                  <c.icon size={22} />
                </div>
                <h3>{c.title}</h3>
                <p>{c.desc}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <CtaStrip
        title="Ready to see your full financial picture?"
        subtitle="Start with a free account and unlock weekly, monthly, and yearly analytics."
      />
    </>
  );
}

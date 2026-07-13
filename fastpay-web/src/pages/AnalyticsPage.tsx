import { BarChart3, Bell, PieChart, Target, TrendingUp, Wallet } from "lucide-react";
import { PageHero } from "../components/PageHero";
import { BudgetDemo } from "../components/BudgetDemo";
import { CtaStrip } from "../components/CtaStrip";
import { analyticsMetrics, categories } from "../data/budget";

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
      <PageHero
        label="Analytics"
        title="Understand Every Dollar You Spend"
        subtitle="Weekly, monthly, and yearly views give you the full picture — from daily habits to annual trends."
        dark
      />

      <section className="page-section">
        <div className="container analytics-page__intro">
          <div className="analytics-page__demo-wrap">
            <BudgetDemo large />
            <div className="analytics__float-card analytics-page__float-card">
              <div style={{ opacity: 0.8, marginBottom: "0.5rem" }}>FastPay Card</div>
              <div style={{ fontSize: "1.1rem", fontWeight: 700 }}>$3,403.09</div>
            </div>
          </div>
          <div>
            <h2 className="section-title">Budget Views That Scale With You</h2>
            <p className="section-subtitle">
              Toggle between weekly, monthly, and yearly periods without losing context.
              Each view recalculates limits, remaining budget, and category splits
              automatically.
            </p>
            <div className="metrics-grid" style={{ marginTop: "2rem" }}>
              {analyticsMetrics.map((m) => (
                <div key={m.label} className="metric-card">
                  <span className="metric-card__label">{m.label}</span>
                  <span className="metric-card__value">{m.value}</span>
                  <span className="metric-card__change">{m.change}</span>
                </div>
              ))}
            </div>
          </div>
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

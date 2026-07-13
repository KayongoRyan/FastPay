import { useState } from "react";
import { Building2, Globe2, Wifi } from "lucide-react";

type BudgetPeriod = "weekly" | "monthly" | "yearly";

const budgetData: Record<
  BudgetPeriod,
  { label: string; bars: number[]; total: string }
> = {
  weekly: {
    label: "This Week",
    bars: [45, 72, 38, 90, 55, 68, 42],
    total: "$1,240",
  },
  monthly: {
    label: "This Month",
    bars: [60, 85, 70, 95, 55, 78, 62, 88, 45, 72, 80, 50],
    total: "$4,820",
  },
  yearly: {
    label: "This Year",
    bars: [55, 78, 65, 88, 72, 90, 68, 82, 75, 60, 85, 70],
    total: "$58,400",
  },
};

const features = [
  {
    icon: Building2,
    title: "Local Business Finance",
    desc: "Manage payroll, invoices, and vendor payments from a single dashboard built for SMBs.",
  },
  {
    icon: Globe2,
    title: "Built For Global Payments",
    desc: "Send and receive in 40+ currencies with transparent rates and same-day settlement.",
  },
  {
    icon: Wifi,
    title: "Internet Of Money",
    desc: "Connect wallets, cards, and crypto rails into one seamless money movement layer.",
  },
];

export function AnalyticsSection() {
  const [period, setPeriod] = useState<BudgetPeriod>("monthly");
  const data = budgetData[period];
  const maxBar = Math.max(...data.bars);

  return (
    <section className="analytics" id="analytics">
      <div className="container">
        <div className="analytics__phone-wrap">
          <div className="analytics__phone">
            <div className="analytics__phone-screen">
              <div className="analytics__budget-tabs" role="tablist">
                {(["weekly", "monthly", "yearly"] as const).map((p) => (
                  <button
                    key={p}
                    type="button"
                    role="tab"
                    aria-selected={period === p}
                    className={`analytics__budget-tab${period === p ? " active" : ""}`}
                    onClick={() => setPeriod(p)}
                  >
                    {p.charAt(0).toUpperCase() + p.slice(1)}
                  </button>
                ))}
              </div>
              <div className="analytics__chart-title">Budget / Spending</div>
              <div className="analytics__chart-sub">
                {data.label} · {data.total} spent
              </div>
              <div className="analytics__bars">
                {data.bars.map((h, i) => (
                  <div
                    key={i}
                    className={`analytics__bar${h === maxBar ? " active" : ""}`}
                    style={{ height: `${(h / maxBar) * 100}%` }}
                  />
                ))}
              </div>
            </div>
          </div>
          <div className="analytics__float-card">
            <div style={{ opacity: 0.8, marginBottom: "0.5rem" }}>FastPay Card</div>
            <div style={{ fontSize: "1.1rem", fontWeight: 700 }}>$3,403.09</div>
          </div>
        </div>

        <div>
          <div className="section-label">Analytics</div>
          <h2 className="section-title">
            Let&apos;s Take Your Analytics To The Next Level
          </h2>
          <p className="section-subtitle">
            Switch between weekly, monthly, and yearly views to understand spending
            patterns and stay on track with your financial goals.
          </p>
          <div className="analytics__features" style={{ marginTop: "2.5rem" }}>
            {features.map((f) => (
              <div key={f.title} className="analytics__feature">
                <div className="analytics__feature-icon">
                  <f.icon size={22} />
                </div>
                <div>
                  <h3>{f.title}</h3>
                  <p>{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

import { useState } from "react";
import { Building2, Globe2, TrendingUp } from "lucide-react";
import {
  AppAnalyticsPreview,
  type AnalyticsPreviewData,
} from "./AppAnalyticsPreview";
import { Reveal } from "./Reveal";

type BudgetPeriod = "weekly" | "monthly" | "yearly";

const budgetData: Record<BudgetPeriod, AnalyticsPreviewData> = {
  weekly: {
    label: "This week",
    spent: "RWF 186,400",
    budget: "RWF 300,000",
    remaining: "RWF 113,600",
    usedPct: 62,
    bars: [45, 72, 38, 90, 55, 68, 42],
    goal: "Emergency fund",
    goalPct: 42,
  },
  monthly: {
    label: "This month",
    spent: "RWF 742,000",
    budget: "RWF 1,200,000",
    remaining: "RWF 458,000",
    usedPct: 62,
    bars: [60, 85, 70, 95, 55, 78, 62, 88, 45, 72, 80, 50],
    goal: "Family savings",
    goalPct: 58,
  },
  yearly: {
    label: "This year",
    spent: "RWF 8.4M",
    budget: "RWF 14.4M",
    remaining: "RWF 6.0M",
    usedPct: 58,
    bars: [55, 78, 65, 88, 72, 90, 68, 82, 75, 60, 85, 70],
    goal: "Home deposit",
    goalPct: 31,
  },
};

const features = [
  {
    icon: TrendingUp,
    title: "Smart Budget Tracking",
    desc: "Weekly, monthly, and yearly views help you spot trends before they become problems.",
  },
  {
    icon: Building2,
    title: "Built For Local Finance",
    desc: "Track MoMo, bills, and Stellar payments in one place with RWF-first insights.",
  },
  {
    icon: Globe2,
    title: "Goals That Stay On Track",
    desc: "Savings goals, family plans, and spending limits keep your money moving with purpose.",
  },
];

export function AnalyticsSection() {
  const [period, setPeriod] = useState<BudgetPeriod>("monthly");
  const data = budgetData[period];

  return (
    <section className="analytics" id="analytics">
      <div className="analytics__ambient" aria-hidden="true">
        <span className="analytics__orb analytics__orb--1" />
        <span className="analytics__orb analytics__orb--2" />
      </div>

      <div className="container">
        <Reveal className="analytics__phone-wrap" delay={80}>
          <div className="analytics__device">
            <div className="analytics__phone-notch" />
            <div className="analytics__phone-screen">
              <AppAnalyticsPreview
                period={period}
                onPeriodChange={setPeriod}
                data={data}
              />
            </div>
          </div>

          <div className="analytics__float-card">
            <small>Budget remaining</small>
            <strong>{data.remaining}</strong>
            <span>{data.usedPct}% used · {data.label}</span>
          </div>
        </Reveal>

        <div className="analytics__copy">
          <Reveal>
            <div className="section-label">Analytics</div>
            <h2 className="section-title">
              Take your spending insights to the next level
            </h2>
          </Reveal>
          <Reveal delay={100}>
            <p className="section-subtitle">
              Switch between weekly, monthly, and yearly views to understand spending
              patterns and stay on track with your financial goals.
            </p>
          </Reveal>

          <div className="analytics__features">
            {features.map((f, index) => (
              <Reveal key={f.title} delay={160 + index * 80}>
                <div className="analytics__feature">
                  <div className="analytics__feature-icon">
                    <f.icon size={22} />
                  </div>
                  <div>
                    <h3>{f.title}</h3>
                    <p>{f.desc}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

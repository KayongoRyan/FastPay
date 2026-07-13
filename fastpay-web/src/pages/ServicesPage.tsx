import { ArrowRight, Check } from "lucide-react";
import { Link } from "react-router-dom";
import { PageHero } from "../components/PageHero";
import { CtaStrip } from "../components/CtaStrip";
import { howItWorks, services } from "../data/services";

export function ServicesPage() {
  return (
    <>
      <PageHero
        label="Services"
        title="Everything You Need To Move Money"
        subtitle="Cards, convert, budgeting, security, and AI — one platform for personal and business finance."
      />

      <section className="page-section">
        <div className="container">
          <div className="services-page__grid">
            {services.map((s) => (
              <article key={s.title} className="service-detail-card">
                <div className="service-detail-card__icon">
                  <s.icon size={24} />
                </div>
                <h3>{s.title}</h3>
                <p>{s.desc}</p>
                {s.bullets && (
                  <ul className="service-detail-card__bullets">
                    {s.bullets.map((b) => (
                      <li key={b}>
                        <Check size={14} />
                        {b}
                      </li>
                    ))}
                  </ul>
                )}
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="page-section page-section--dark">
        <div className="container">
          <div className="page-section__header page-section__header--center">
            <div className="section-label">How It Works</div>
            <h2 className="section-title" style={{ color: "var(--white)" }}>
              Up And Running In Three Steps
            </h2>
            <p className="section-subtitle" style={{ color: "rgba(255,255,255,0.65)", marginInline: "auto" }}>
              No lengthy onboarding. Create an account, fund your wallet, and start
              transacting within minutes.
            </p>
          </div>
          <div className="steps-grid">
            {howItWorks.map((step) => (
              <article key={step.step} className="step-card">
                <span className="step-card__number">{step.step}</span>
                <h3>{step.title}</h3>
                <p>{step.desc}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="page-section page-section--alt">
        <div className="container split-panel">
          <div className="split-panel__content">
            <div className="section-label">For Business</div>
            <h2 className="section-title">Scale With Team Controls</h2>
            <p className="section-subtitle">
              Issue cards per employee, set department budgets, and approve expenses
              from a central dashboard. API access and webhooks on Business plans.
            </p>
            <ul className="split-panel__list">
              <li><Check size={16} /> Multi-seat access with role permissions</li>
              <li><Check size={16} /> Custom spending policies per card</li>
              <li><Check size={16} /> Real-time expense reporting</li>
              <li><Check size={16} /> Webhook notifications for transactions</li>
            </ul>
            <Link to="/pricing" className="btn btn-primary" style={{ marginTop: "1.5rem" }}>
              View Business Plans
              <ArrowRight size={18} />
            </Link>
          </div>
          <div className="split-panel__visual">
            <div className="split-panel__mockup">
              <div className="split-panel__mockup-row">
                <span>Team Cards</span>
                <strong>12 active</strong>
              </div>
              <div className="split-panel__mockup-row">
                <span>Monthly Spend</span>
                <strong>$24,180</strong>
              </div>
              <div className="split-panel__mockup-row">
                <span>Budget Remaining</span>
                <strong style={{ color: "var(--aqua)" }}>$8,420</strong>
              </div>
              <div className="split-panel__mockup-bars">
                {["Mon", "Tue", "Wed", "Thu", "Fri"].map((d, i) => (
                  <div key={d} className="split-panel__mockup-bar-wrap">
                    <div
                      className="split-panel__mockup-bar"
                      style={{ height: `${[55, 80, 45, 90, 65][i]}%` }}
                    />
                    <span>{d}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <CtaStrip
        title="Start moving money smarter today"
        subtitle="Free Starter plan. Upgrade when you need global convert and yearly budgets."
      />
    </>
  );
}

import { Check } from "lucide-react";
import { Link } from "react-router-dom";
import { plans } from "../data/plans";

export function Pricing() {
  return (
    <section className="pricing" id="pricing">
      <div className="container">
        <div className="pricing__header">
          <div className="section-label">Pricing</div>
          <h2 className="section-title">Choose The Best Plan</h2>
          <p className="section-subtitle">
            Start free and upgrade as you grow. No hidden fees, cancel anytime.
          </p>
        </div>
        <div className="pricing__grid">
          {plans.map((plan) => (
            <article
              key={plan.name}
              className={`pricing-card${plan.featured ? " pricing-card--featured" : ""}`}
            >
              <div className="pricing-card__name">{plan.name}</div>
              {plan.featured ? (
                <Link
                  to="/app/subscriptions"
                  className="pricing-card__price pricing-card__price--link"
                  title="Manage subscriptions & budget"
                >
                  {plan.price}
                  {plan.period && <span>{plan.period}</span>}
                </Link>
              ) : (
                <div className="pricing-card__price">
                  {plan.price}
                  {plan.period && <span>{plan.period}</span>}
                </div>
              )}
              <p className="pricing-card__desc">{plan.desc}</p>
              <ul className="pricing-card__features">
                {plan.features.map((f) => (
                  <li key={f} className="pricing-card__feature">
                    <Check size={16} />
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                to="/contact"
                className={`btn ${plan.featured ? "btn-primary" : "btn-outline"}`}
              >
                Get Started
              </Link>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

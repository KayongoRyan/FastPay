import { Check } from "lucide-react";

const plans = [
  {
    name: "Starter",
    price: "Free",
    period: "",
    desc: "Perfect for personal use and getting started.",
    features: [
      "1 virtual card",
      "Weekly & monthly budgets",
      "Domestic transfers",
      "Basic AI assistant",
    ],
    featured: false,
  },
  {
    name: "Pro",
    price: "$9",
    period: "/mo",
    desc: "For power users who need global access.",
    features: [
      "5 virtual + 1 physical card",
      "Weekly, monthly & yearly budgets",
      "40+ currency convert",
      "Priority AI assistant",
      "FX rate alerts",
    ],
    featured: true,
  },
  {
    name: "Business",
    price: "$29",
    period: "/mo",
    desc: "Built for teams and growing companies.",
    features: [
      "Unlimited cards & team seats",
      "Multi-entity dashboards",
      "API access & webhooks",
      "Dedicated support",
      "Custom spending policies",
    ],
    featured: false,
  },
];

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
              <div className="pricing-card__price">
                {plan.price}
                {plan.period && <span>{plan.period}</span>}
              </div>
              <p className="pricing-card__desc">{plan.desc}</p>
              <ul className="pricing-card__features">
                {plan.features.map((f) => (
                  <li key={f} className="pricing-card__feature">
                    <Check size={16} />
                    {f}
                  </li>
                ))}
              </ul>
              <a
                href="#contact"
                className={`btn ${plan.featured ? "btn-primary" : "btn-outline"}`}
              >
                Get Started
              </a>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

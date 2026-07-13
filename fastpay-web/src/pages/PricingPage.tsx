import { useState } from "react";
import { Check, ChevronDown } from "lucide-react";
import { Link } from "react-router-dom";
import { PageHero } from "../components/PageHero";
import { CtaStrip } from "../components/CtaStrip";
import { comparisonRows, plans } from "../data/plans";

const pricingFaqs = [
  {
    q: "Can I switch plans anytime?",
    a: "Yes. Upgrade or downgrade at any time. Changes take effect immediately and we prorate the difference.",
  },
  {
    q: "Is there a free trial for Pro?",
    a: "Pro includes a 14-day free trial. No credit card required to start Starter.",
  },
  {
    q: "What payment methods do you accept?",
    a: "Visa, Mastercard, Amex, and bank transfer for Business annual plans.",
  },
];

export function PricingPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  return (
    <>
      <PageHero
        label="Pricing"
        title="Choose The Best Plan For You"
        subtitle="Start free and scale as you grow. Transparent pricing with no hidden fees."
      />

      <section className="page-section">
        <div className="container">
          <div className="pricing__grid pricing-page__cards">
            {plans.map((plan) => (
              <article
                key={plan.name}
                className={`pricing-card${plan.featured ? " pricing-card--featured" : ""}`}
              >
                {plan.featured && <span className="pricing-card__badge">Most Popular</span>}
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

      <section className="page-section page-section--alt">
        <div className="container">
          <div className="page-section__header page-section__header--center">
            <div className="section-label">Compare</div>
            <h2 className="section-title">Feature Comparison</h2>
            <p className="section-subtitle">
              See exactly what&apos;s included in each plan.
            </p>
          </div>
          <div className="comparison-table-wrap">
            <table className="comparison-table">
              <thead>
                <tr>
                  <th>Feature</th>
                  <th>Starter</th>
                  <th className="comparison-table__featured">Pro</th>
                  <th>Business</th>
                </tr>
              </thead>
              <tbody>
                {comparisonRows.map((row) => (
                  <tr key={row.feature}>
                    <td>{row.feature}</td>
                    <td>{row.starter}</td>
                    <td className="comparison-table__featured">{row.pro}</td>
                    <td>{row.business}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="page-section">
        <div className="container pricing-page__faq">
          <div>
            <div className="section-label">FAQ</div>
            <h2 className="section-title">Pricing Questions</h2>
            <p className="section-subtitle">
              Still unsure? Reach out and we&apos;ll help you pick the right plan.
            </p>
            <Link to="/contact" className="btn btn-outline" style={{ marginTop: "1.5rem" }}>
              Contact Sales
            </Link>
          </div>
          <div className="faq__list">
            {pricingFaqs.map((item, i) => (
              <div
                key={item.q}
                className={`faq__item${openFaq === i ? " open" : ""}`}
              >
                <button
                  type="button"
                  className="faq__question"
                  aria-expanded={openFaq === i}
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                >
                  {item.q}
                  <ChevronDown size={18} />
                </button>
                {openFaq === i && <p className="faq__answer">{item.a}</p>}
              </div>
            ))}
          </div>
        </div>
      </section>

      <CtaStrip
        title="Start free, upgrade when you're ready"
        subtitle="No credit card required for Starter. 14-day Pro trial available."
        ctaLabel="Create Account"
        ctaTo="/contact"
      />
    </>
  );
}

import {
  ArrowRight,
  CheckCircle2,
  Headphones,
  Shield,
  ShieldCheck,
  Star,
  UserRound,
  Zap,
} from "lucide-react";
import { Link } from "react-router-dom";

const pillars = [
  {
    icon: Shield,
    title: "Bank-grade Security",
    text: "Your assets are protected with encryption, session control, and fraud monitoring.",
  },
  {
    icon: CheckCircle2,
    title: "Transparent & Reliable",
    text: "Clear fees, real-time balances, and full audit trails on every payment.",
  },
  {
    icon: Headphones,
    title: "Always Here",
    text: "24/7 AI assistant and human support when you need help with your wallet.",
  },
  {
    icon: Zap,
    title: "Fast & Efficient",
    text: "Instant Stellar transfers and mobile-money top-ups with low fees.",
  },
];

const values = [
  {
    num: "01",
    title: "Expertise at Every Step",
    text: "Get smart budgets, spending insights, and guided flows built for everyday finance.",
    tone: "mint",
    icon: UserRound,
    decor: "chart",
  },
  {
    num: "02",
    title: "Industry Best Practices",
    text: "We follow modern security standards to keep your wallet, sessions, and payments safe.",
    tone: "navy",
    icon: Star,
    link: "/security",
  },
  {
    num: "03",
    title: "Protected Transactions",
    text: "Every transfer is screened by rules-based fraud checks before it leaves your account.",
    tone: "peach",
    icon: ShieldCheck,
  },
];

export function FeatureCards() {
  return (
    <section className="trust" id="features">
      <div className="container">
        <div className="trust__intro">
          <h2 className="trust__title">
            Your <span>trusted</span> partner in digital finance.
          </h2>
          <p className="trust__subtitle">
            We combine innovative technology with industry best practices to
            deliver a secure and seamless experience for everyone.
          </p>
        </div>

        <div className="trust__pillars">
          {pillars.map((item) => (
            <article key={item.title} className="trust-pillar">
              <span className="trust-pillar__icon">
                <item.icon size={18} strokeWidth={2.2} />
              </span>
              <h3>{item.title}</h3>
              <p>{item.text}</p>
            </article>
          ))}
        </div>

        <div className="trust__values">
          {values.map((item) => (
            <article key={item.num} className={`trust-value trust-value--${item.tone}`}>
              <div className="trust-value__top">
                <span className="trust-value__num">{item.num}.</span>
                <span className="trust-value__icon">
                  <item.icon size={16} strokeWidth={2.2} />
                </span>
              </div>
              <h3>{item.title}</h3>
              <p>{item.text}</p>

              {item.decor === "chart" && (
                <svg className="trust-value__chart" viewBox="0 0 200 50" aria-hidden="true">
                  <path
                    d="M0 38 L30 32 L60 36 L90 24 L120 28 L150 16 L180 20 L200 12"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />
                </svg>
              )}

              {item.link && (
                <Link to={item.link} className="trust-value__link">
                  Learn More
                  <ArrowRight size={16} />
                </Link>
              )}
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

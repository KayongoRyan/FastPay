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
import { Reveal } from "./Reveal";

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
      <div className="trust__ambient" aria-hidden="true" />
      <div className="container">
        <div className="trust__intro">
          <Reveal>
            <h2 className="trust__title">
              Your <span>trusted</span> partner in digital finance.
            </h2>
          </Reveal>
          <Reveal delay={100}>
            <p className="trust__subtitle">
              We combine innovative technology with industry best practices to
              deliver a secure and seamless experience for everyone.
            </p>
          </Reveal>
        </div>

        <div className="trust__pillars">
          {pillars.map((item, index) => (
            <Reveal key={item.title} delay={index * 80}>
              <article className="trust-pillar">
                <span className="trust-pillar__icon">
                  <item.icon size={18} strokeWidth={2.2} />
                </span>
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </article>
            </Reveal>
          ))}
        </div>

        <div className="trust__values">
          {values.map((item, index) => (
            <Reveal key={item.num} delay={index * 100}>
              <article className={`trust-value trust-value--${item.tone}`}>
                <div className="trust-value__top">
                  <span className="trust-value__num">{item.num}.</span>
                  <span className="trust-value__icon">
                    <item.icon size={16} strokeWidth={2.2} />
                  </span>
                </div>
                <h3>{item.title}</h3>
                <p>{item.text}</p>

                {item.decor === "chart" && (
                  <svg className="trust-value__chart" viewBox="0 0 240 80" aria-hidden="true">
                    <defs>
                      <linearGradient id="trustChartFill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#00aeef" stopOpacity="0.32" />
                        <stop offset="100%" stopColor="#00aeef" stopOpacity="0" />
                      </linearGradient>
                      <linearGradient id="trustChartStroke" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="#00aeef" stopOpacity="0.35" />
                        <stop offset="55%" stopColor="#00aeef" stopOpacity="0.85" />
                        <stop offset="100%" stopColor="#00c4ff" />
                      </linearGradient>
                    </defs>
                    <path
                      className="trust-value__chart-area"
                      d="M0 62 C28 58, 48 54, 72 48 C96 42, 118 38, 142 32 C166 26, 196 20, 240 14 L240 80 L0 80 Z"
                      fill="url(#trustChartFill)"
                    />
                    <path
                      className="trust-value__chart-line"
                      d="M0 62 C28 58, 48 54, 72 48 C96 42, 118 38, 142 32 C166 26, 196 20, 240 14"
                      fill="none"
                      stroke="url(#trustChartStroke)"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
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
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

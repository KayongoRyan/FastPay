import { CreditCard, PiggyBank, RefreshCw, Shield, Smartphone, Zap } from "lucide-react";

const services = [
  {
    icon: CreditCard,
    title: "Virtual & Physical Cards",
    desc: "Instant card issuance with customizable limits, categories, and freeze controls.",
  },
  {
    icon: RefreshCw,
    title: "Currency Convert",
    desc: "Real-time exchange rates with zero hidden markup on 40+ currency pairs.",
  },
  {
    icon: PiggyBank,
    title: "Smart Budgeting",
    desc: "Weekly, monthly, and yearly budget builders with alerts when you approach limits.",
  },
  {
    icon: Shield,
    title: "Bank-Grade Security",
    desc: "Biometric login, device binding, and transaction signing on every payment.",
  },
  {
    icon: Smartphone,
    title: "Mobile First",
    desc: "Native iOS and Android apps with offline-ready transaction history.",
  },
  {
    icon: Zap,
    title: "AI Assistant",
    desc: "Ask about balances, affordability, and savings — get answers grounded in your data.",
  },
];

export function Services() {
  return (
    <section className="services" id="services">
      <div className="container">
        <div className="services__header">
          <div className="section-label">What We Offer</div>
          <h2 className="section-title">Everything You Need To Move Money</h2>
          <p className="section-subtitle">
            From everyday spending to cross-border transfers, FastPay gives you the
            tools to manage, grow, and protect your finances.
          </p>
        </div>
        <div className="services__grid">
          {services.map((s) => (
            <article key={s.title} className="service-item">
              <div className="service-item__icon">
                <s.icon size={22} />
              </div>
              <h3>{s.title}</h3>
              <p>{s.desc}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

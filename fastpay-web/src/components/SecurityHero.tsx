import { Cloud, ShieldCheck, Zap } from "lucide-react";

export function SecurityHero() {
  return (
    <section className="sec-hero">
      <div className="sec-hero__glow sec-hero__glow--left" aria-hidden="true" />
      <div className="sec-hero__glow sec-hero__glow--right" aria-hidden="true" />

      <div className="container sec-hero__inner">
        <span className="sec-hero__badge">New Security Platform</span>

        <h1 className="sec-hero__title">
          <span className="sec-hero__title-row">
            <span className="sec-hero__chip sec-hero__chip--cloud" aria-hidden="true">
              <Cloud strokeWidth={2.25} />
            </span>
            <span className="sec-hero__chip sec-hero__chip--trend" aria-hidden="true">
              <ShieldCheck strokeWidth={2.25} />
            </span>
            <span className="sec-hero__line">Protect Your Money with</span>
          </span>
          <span className="sec-hero__title-row">
            <span className="sec-hero__gradient">Advanced Access Solutions</span>
            <span className="sec-hero__chip sec-hero__chip--bolt" aria-hidden="true">
              <Zap strokeWidth={2.25} />
            </span>
          </span>
        </h1>

        <p className="sec-hero__copy">
          Switch to dependable, bank-grade protection built into FastPay. Device binding,
          signed payments, and fraud intelligence — designed for every wallet, transfer,
          and user with ease.
        </p>
      </div>
    </section>
  );
}

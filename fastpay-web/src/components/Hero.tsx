import { ArrowRight, Star } from "lucide-react";

const avatars = ["JK", "AM", "SR", "LT"];

export function Hero() {
  return (
    <section className="hero" id="home">
      <div className="hero__grid" aria-hidden="true" />
      <div className="container">
        <div className="hero__content">
          <div className="hero__badge">Welcome to FastPay</div>
          <h1 className="hero__title">
            Secure Your <span>Fintech Success</span> For The Future
          </h1>
          <p className="hero__text">
            Move money globally, track spending with weekly, monthly, and yearly
            budgets, and get AI-powered insights — all in one secure wallet built
            for modern finance.
          </p>
          <div className="hero__cta">
            <a href="#pricing" className="btn btn-primary">
              Get Started
              <ArrowRight size={18} />
            </a>
            <a href="#services" className="btn btn-outline">
              Explore Services
            </a>
          </div>
        </div>

        <div className="hero__proof">
          <div className="hero__rating">
            <div className="hero__rating-score">
              4.9<span>/5</span>
            </div>
            <div className="hero__stars" aria-label="4.9 out of 5 stars">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} size={16} fill="currentColor" />
              ))}
            </div>
            <p style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
              Trusted by 50,000+ users
            </p>
          </div>
          <div className="hero__avatars">
            {avatars.map((initials) => (
              <div key={initials} className="hero__avatar">
                {initials}
              </div>
            ))}
            <span className="hero__avatar-count">+2k this week</span>
          </div>
        </div>
      </div>
    </section>
  );
}

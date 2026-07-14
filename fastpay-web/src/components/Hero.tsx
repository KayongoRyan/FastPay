import { Link } from "react-router-dom";
import { HeroVisual } from "./HeroVisual";

export function Hero() {
  return (
    <section className="hero" id="home">
      <div className="container">
        <div className="hero__content">
          <div className="hero__badge">Low fees on global transfers</div>

          <h1 className="hero__title">
            Join the best{" "}
            <span className="hero__title-mark">
              <span className="hero__title-circle" aria-hidden="true" />
              Digital Wallet
            </span>{" "}
            Platform
          </h1>

          <p className="hero__text">
            Send money, track budgets, and manage your finances with a secure
            wallet built for Stellar payments, mobile money, and smart analytics.
          </p>

          <div className="hero__cta">
            <Link to="/pricing" className="btn hero__btn-start">
              Get Started
            </Link>
            <Link to="/contact" className="btn hero__btn-app">
              Get The App
            </Link>
          </div>
        </div>

        <div className="hero__visual">
          <HeroVisual />
        </div>
      </div>
    </section>
  );
}

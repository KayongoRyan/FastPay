import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { HeroVisual } from "./HeroVisual";
import { Reveal } from "./Reveal";

export function Hero() {
  return (
    <section className="hero" id="home">
      <div className="hero__ambient" aria-hidden="true">
        <span className="hero__orb hero__orb--1" />
        <span className="hero__orb hero__orb--2" />
      </div>

      <div className="container">
        <div className="hero__content">
          <Reveal delay={0}>
            <div className="hero__badge">
              <span className="hero__badge-dot" />
              Low fees on global transfers
            </div>
          </Reveal>

          <Reveal delay={80}>
            <h1 className="hero__title">
              Join the best{" "}
              <span className="hero__title-mark">
                <span className="hero__title-circle" aria-hidden="true" />
                Digital Wallet
              </span>{" "}
              Platform
            </h1>
          </Reveal>

          <Reveal delay={160}>
            <p className="hero__text">
              Send money, track budgets, and manage your finances with a secure
              wallet built for Stellar payments, mobile money, and smart analytics.
            </p>
          </Reveal>

          <Reveal delay={240}>
            <div className="hero__cta">
              <Link to="/signup" className="btn hero__btn-start">
                Get Started
                <ArrowRight size={18} />
              </Link>
              <Link to="/contact" className="btn hero__btn-app">
                Get The App
              </Link>
            </div>
          </Reveal>
        </div>

        <Reveal className="hero__visual" delay={120}>
          <HeroVisual />
        </Reveal>
      </div>
    </section>
  );
}

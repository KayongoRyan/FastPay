import { ArrowRight, Play, Shield } from "lucide-react";
import { Link } from "react-router-dom";
import { HeroPhoneMockups } from "./HeroPhoneMockups";

const avatars = [
  { initials: "JK", color: "#5b8def" },
  { initials: "AM", color: "#e85d8a" },
  { initials: "SR", color: "#f5a623" },
  { initials: "LT", color: "#50c878" },
  { initials: "DP", color: "#9b59b6" },
];

export function Hero() {
  return (
    <section className="hero" id="home">
      <div className="container">
        <div className="hero__content">
          <div className="hero__badge">
            <Shield size={14} />
            Keep Your Money Safe
          </div>
          <h1 className="hero__title">
            The best <span>digital wallet</span> platform for your future.
          </h1>
          <p className="hero__text">
            Send, spend, and grow your money with the most secure and intelligent
            platform — budgets, global transfers, and AI insights in one app.
          </p>

          <div className="hero__social">
            <div className="hero__avatars">
              {avatars.map((a) => (
                <div
                  key={a.initials}
                  className="hero__avatar"
                  style={{ background: a.color }}
                >
                  {a.initials}
                </div>
              ))}
            </div>
            <div className="hero__social-text">
              <strong>250K+</strong>
              <span>Happy Users</span>
            </div>
          </div>

          <div className="hero__cta">
            <Link to="/pricing" className="btn btn-primary hero__btn-primary">
              Get Started
              <ArrowRight size={18} />
            </Link>
            <button type="button" className="hero__video-btn">
              <span className="hero__video-icon">
                <Play size={16} fill="currentColor" />
              </span>
              <span className="hero__video-copy">
                <strong>Watch Video</strong>
                <small>2 min video</small>
              </span>
            </button>
          </div>
        </div>

        <div className="hero__visual">
          <HeroPhoneMockups />
        </div>
      </div>
    </section>
  );
}

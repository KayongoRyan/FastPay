import { AppHomePreview, HeroFloatCards } from "./AppHomePreview";

export function HeroVisual() {
  return (
    <div className="hero-visual">
      <div className="hero-visual__stripe" />

      <span className="hero-visual__dot hero-visual__dot--1" />
      <span className="hero-visual__dot hero-visual__dot--2" />
      <span className="hero-visual__dot hero-visual__dot--3" />

      <HeroFloatCards />

      <div className="hero-visual__device">
        <div className="hero-visual__phone">
          <div className="hero-visual__phone-notch" />
          <div className="hero-visual__phone-screen">
            <AppHomePreview />
          </div>
        </div>
      </div>
    </div>
  );
}

import { Hero } from "../components/Hero";
import { FeatureCards } from "../components/FeatureCards";
import { AnalyticsSection } from "../components/AnalyticsSection";
import { LogoStrip } from "../components/LogoStrip";
import { Services } from "../components/Services";
import { Testimonials } from "../components/Testimonials";
import { Pricing } from "../components/Pricing";
import { FAQ } from "../components/FAQ";

export function HomePage() {
  return (
    <>
      <Hero />
      <FeatureCards />
      <AnalyticsSection />
      <LogoStrip />
      <Services />
      <Testimonials />
      <Pricing />
      <FAQ />
    </>
  );
}

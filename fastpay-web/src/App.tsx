import { TopBar } from "./components/TopBar";
import { Navbar } from "./components/Navbar";
import { Hero } from "./components/Hero";
import { FeatureCards } from "./components/FeatureCards";
import { AnalyticsSection } from "./components/AnalyticsSection";
import { LogoStrip } from "./components/LogoStrip";
import { Services } from "./components/Services";
import { Testimonials } from "./components/Testimonials";
import { Pricing } from "./components/Pricing";
import { FAQ } from "./components/FAQ";
import { Footer } from "./components/Footer";

export default function App() {
  return (
    <>
      <TopBar />
      <Navbar />
      <main>
        <Hero />
        <FeatureCards />
        <AnalyticsSection />
        <LogoStrip />
        <Services />
        <Testimonials />
        <Pricing />
        <FAQ />
      </main>
      <Footer />
    </>
  );
}

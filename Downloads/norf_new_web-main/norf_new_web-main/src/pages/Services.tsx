import { Navigation } from "@/components/Navigation";
import { ServicesStackingHero } from "@/components/ServicesStackingHero";
import { Footer } from "@/components/Footer";

const Services = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="pt-20">
        <ServicesStackingHero />
      </div>
      <Footer />
    </div>
  );
};

export default Services;
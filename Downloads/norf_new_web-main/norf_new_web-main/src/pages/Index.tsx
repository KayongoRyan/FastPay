import { Navigation } from "@/components/Navigation";
import { HeroSection } from "@/components/HeroSection";
import { WorksPreview } from "@/components/WorksPreview";
import { ServicesListSection } from "@/components/ServicesListSection";
import { BehindTheLens } from "@/components/BehindTheLens";
import { Footer } from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <HeroSection />
      <WorksPreview />
      <ServicesListSection />
      <BehindTheLens />
      <Footer />
    </div>
  );
};

export default Index;

import { Navigation } from "@/components/Navigation";
import { WorksSection } from "@/components/WorksSection";
import { Footer } from "@/components/Footer";

const Work = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="pt-20">
        <WorksSection />
      </div>
      <Footer />
    </div>
  );
};

export default Work;
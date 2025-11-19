import { Navigation } from "@/components/Navigation";
import { GallerySection } from "@/components/GallerySection";
import { Footer } from "@/components/Footer";

const Gallery = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="pt-20">
        <GallerySection />
      </div>
      <Footer />
    </div>
  );
};

export default Gallery;
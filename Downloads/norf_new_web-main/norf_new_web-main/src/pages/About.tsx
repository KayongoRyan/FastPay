import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { TeamSection } from "@/components/TeamSection";
import { MissionSection } from "@/components/MissionSection";
const About = () => {
  return <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center overflow-hidden">
        {/* Background Video */}
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        >
          <source src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4" type="video/mp4" />
        </video>
        
        {/* Overlay */}
        <div className="absolute inset-0 bg-black/40" />
        
        <div className="relative z-10 max-w-7xl mx-auto px-6 py-20 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center w-full">
          {/* Left Content */}
          <div className="space-y-8 animate-fade-in">
            <h1 className="text-6xl md:text-7xl lg:text-8xl font-bold text-white leading-tight">
              Cre8ing Together
            </h1>
            <p className="text-xl md:text-2xl text-white/90">
              We are Norf Cre8ions, visual storytellers from Rwanda
            </p>
          </div>

        </div>
      </section>

      {/* About Content Section */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <p className="text-[54px] text-muted-foreground leading-[1.3]">
            Norf Cre8ions is a content-driven creative studio and agency based in Musanze, Rwanda. We are passionate about transforming ideas into impactful visual experiences that resonate. Specializing in digital marketing, content creation, and visual storytelling, we bring creativity and strategy together to help brands communicate their message effectively and stand out in today's dynamic landscape.
          </p>
        </div>
      </section>

      <TeamSection />

      <MissionSection />

      <Footer />
    </div>;
};
export default About;

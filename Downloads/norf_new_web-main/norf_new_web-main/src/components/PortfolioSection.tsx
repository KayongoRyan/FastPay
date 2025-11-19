import { Card } from "@/components/ui/card";
import { Play } from "lucide-react";

export const PortfolioSection = () => {
  const projects = [
    {
      id: 1,
      title: "Soundmint - Back In Time",
      client: "SoundMint",
      category: "Music Video",
      thumbnail: "https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=800&h=600&fit=crop",
      duration: "01:35"
    },
    {
      id: 2,
      title: "Urban Exploration",
      client: "DJI",
      category: "Commercial",
      thumbnail: "https://images.unsplash.com/photo-1547036967-23d11aacaee0?w=800&h=600&fit=crop",
      duration: "02:45"
    },
    {
      id: 3,
      title: "Fashion Forward",
      client: "Hypebeast",
      category: "Fashion Film",
      thumbnail: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&h=600&fit=crop",
      duration: "03:12"
    },
    {
      id: 4,
      title: "Speed Demons",
      client: "Porsche",
      category: "Automotive",
      thumbnail: "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=800&h=600&fit=crop",
      duration: "01:58"
    },
    {
      id: 5,
      title: "Golden Hour",
      client: "Blue Hour",
      category: "Documentary",
      thumbnail: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop",
      duration: "04:33"
    },
    {
      id: 6,
      title: "Cinematic Journey",
      client: "Film Supply",
      category: "Short Film",
      thumbnail: "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=800&h=600&fit=crop",
      duration: "06:21"
    }
  ];

  return (
    <section id="portfolio" className="py-20">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="display-lg text-primary mb-6">Featured Work</h2>
          <p className="body-lg text-brand-light max-w-2xl mx-auto">
            A selection of recent projects showcasing cinematic storytelling and visual excellence.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {projects.map((project, index) => (
            <Card
              key={project.id}
              className="group bg-card border-border/20 overflow-hidden hover-lift cursor-pointer animate-fade-in"
              style={{
                animationDelay: `${index * 0.1}s`,
              }}
            >
              <div className="relative aspect-video overflow-hidden">
                <img
                  src={project.thumbnail}
                  alt={project.title}
                  className="w-full h-full object-cover transition-elegant group-hover:scale-105"
                />
                
                {/* Play Button Overlay */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-elegant flex items-center justify-center">
                  <div className="w-16 h-16 bg-primary/90 rounded-full flex items-center justify-center backdrop-blur-sm">
                    <Play className="w-6 h-6 text-background ml-1" fill="currentColor" />
                  </div>
                </div>
                
                {/* Duration */}
                <div className="absolute bottom-4 right-4 bg-black/70 text-primary text-xs px-2 py-1 rounded backdrop-blur-sm">
                  {project.duration}
                </div>
              </div>
              
              <div className="p-6">
                <div className="mb-2">
                  <span className="text-xs text-brand-light font-medium tracking-wider uppercase">
                    {project.client}
                  </span>
                </div>
                <h3 className="text-lg font-medium text-primary mb-1 group-hover:text-brand-light transition-smooth">
                  {project.title}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {project.category}
                </p>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};
import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import { createSlug } from "@/lib/slugify";
import { useProjects } from "@/hooks/useProjects";

export const WorksSection = () => {
  const [activeFilter, setActiveFilter] = useState("All");
  const { projects, loading } = useProjects();

  const categories = ["All", "Branding", "Photography", "Film Production", "Music Video", "Web Design"];

  const isVideoFile = (url?: string | null) => {
    if (!url) return false;
    try {
      return /\.(mp4|webm|ogg|mov)$/i.test(url);
    } catch {
      return false;
    }
  };

  const shouldRenderAsVideo = (mediaType?: string | null) => {
    return mediaType === 'video';
  };

  const filteredProjects = (activeFilter === "All" 
    ? projects 
    : projects.filter(project => (project.categories || []).includes(activeFilter)))
    .sort((a, b) => new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime());

  if (loading) {
    return (
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center text-muted-foreground">Loading projects...</div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20">
      <div className="max-w-7xl mx-auto px-4">
        {/* Filter Tabs - Left Aligned */}
        <div className="flex flex-wrap gap-8 mb-12">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setActiveFilter(category)}
              className={`text-[2rem] font-medium tracking-wide transition-elegant ${
                activeFilter === category
                  ? "text-brand-light"
                  : "text-brand-gray hover:text-brand-light"
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project, index) => (
            <Link
              key={project.id}
              to={`/work/${project.slug || createSlug(project.title)}`}
              className="group cursor-pointer animate-fade-in border border-brand-light/20 rounded-lg overflow-hidden block"
              style={{
                animationDelay: `${index * 0.1}s`,
              }}
            >
              {/* Rectangular Media (Image or Video) */}
              <div className="aspect-[16/10] overflow-hidden rounded-lg mb-0">
                {shouldRenderAsVideo(project.media_type) ? (
                  <video
                    src={project.thumbnail}
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="w-full h-full object-cover transition-elegant group-hover:scale-105"
                  />
                ) : (
                  <img
                    src={project.thumbnail}
                    alt={project.title}
                    className="w-full h-full object-cover transition-elegant group-hover:scale-105"
                  />
                )}
              </div>
              
              {/* Text Content Section */}
              <div className="bg-brand-dark rounded-b-lg p-6">
                {/* Top - Role and Year */}
                <div className="flex justify-end items-start mb-4">
                  <span className="text-brand-light text-sm font-light">
                    {project.year || new Date(project.created_at || '').getFullYear()}
                  </span>
                </div>

                {/* Title and Subtitle */}
                <h3 className="text-brand-light text-2xl font-medium mb-2 leading-tight">
                  {project.title}
                </h3>
                
                {/* View Project Button */}
                <button className="group/btn flex items-center gap-3 text-brand-light hover:text-primary transition-smooth">
                  <div className="w-10 h-10 border border-brand-light/30 rounded-full flex items-center justify-center group-hover/btn:border-primary transition-smooth">
                    <ArrowUpRight className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-medium tracking-wider">VIEW PROJECT</span>
                </button>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};
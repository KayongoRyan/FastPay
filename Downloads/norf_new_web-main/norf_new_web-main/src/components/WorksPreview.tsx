import { ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useProjects } from "@/hooks/useProjects";
import { createSlug } from "@/lib/slugify";

export const WorksPreview = () => {
  const { projects, loading } = useProjects();
  
  const isVideoFile = (url?: string | null) => {
    if (!url) return false;
    try {
      // Check if URL has video file extension
      return /\.(mp4|webm|ogg|mov)$/i.test(url);
    } catch {
      return false;
    }
  };

  // Check if we should render as video based on media_type
  const shouldRenderAsVideo = (mediaType?: string | null, thumbnail?: string | null) => {
    if (!mediaType) return false;
    return mediaType === 'video';
  };
  
  // Get the 3 most recent projects
  const featuredWorks = projects
    .sort((a, b) => new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime())
    .slice(0, 3);

  if (loading) {
    return (
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse bg-brand-dark/50 rounded-lg h-[400px]" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 bg-background relative z-20">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex justify-between items-end mb-12">
          <div>
            <h2 className="text-3xl md:text-4xl font-light text-brand-light mb-4">
              CLIENT CASE STUDIES
            </h2>
          </div>
          <Link 
            to="/work"
            className="text-sm font-medium tracking-widest text-brand-gray hover:text-brand-light transition-smooth"
          >
            SEE MORE WORK
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredWorks.length > 0 ? (
            featuredWorks.map((work, index) => (
              <Link
                key={work.id}
                to={`/work/${work.slug || createSlug(work.title)}`}
                className="group cursor-pointer animate-fade-in border border-brand-light/20 rounded-lg overflow-hidden block"
                style={{
                  animationDelay: `${index * 0.1}s`,
                }}
              >
                {/* Rectangular Media Preview */}
                <div className="aspect-[16/10] overflow-hidden rounded-lg mb-0">
                  {shouldRenderAsVideo(work.media_type, work.thumbnail) ? (
                    <video
                      src={work.thumbnail}
                      autoPlay
                      loop
                      muted
                      playsInline
                      className="w-full h-full object-cover transition-elegant group-hover:scale-105"
                    />
                  ) : (
                    <img
                      src={work.thumbnail}
                      alt={work.title}
                      className="w-full h-full object-cover transition-elegant group-hover:scale-105"
                    />
                  )}
                </div>
                
                {/* Text Content Section */}
                <div className="bg-brand-dark rounded-b-lg p-6">
                  {/* Top - Year */}
                  <div className="flex justify-end items-start mb-4">
                    <span className="text-brand-light text-sm font-light">
                      {work.year || new Date(work.created_at || '').getFullYear()}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="text-brand-light text-2xl font-light mb-8 leading-tight">
                    {work.title}
                  </h3>
                  
                  {/* View Project Button */}
                  <button className="group/btn flex items-center gap-3 text-brand-light hover:text-primary transition-smooth">
                    <div className="w-10 h-10 border border-brand-light/30 rounded-full flex items-center justify-center group-hover/btn:border-primary transition-smooth">
                      <ArrowUpRight className="w-4 h-4" />
                    </div>
                    <span className="text-sm font-medium tracking-wider">VIEW PROJECT</span>
                  </button>
                </div>
              </Link>
            ))
          ) : (
            <div className="col-span-full text-center text-brand-gray py-12">
              No projects available yet.
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
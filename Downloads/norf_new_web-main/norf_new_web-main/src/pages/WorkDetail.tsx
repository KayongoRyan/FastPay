import { useParams, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { ContactModal } from "@/components/ContactModal";
import { extractTitle, createSlug } from "@/lib/slugify";
import { useProjects } from "@/hooks/useProjects";

const WorkDetail = () => {
  const { id: slug } = useParams();
  const [contactModalOpen, setContactModalOpen] = useState(false);
  const { projects, loading } = useProjects();

  const project = projects.find(p => {
    const param = slug || "";
    return (
      p.slug === param ||
      p.id === param ||
      createSlug(p.title) === param
    );
  });

  const toEmbedUrl = (url?: string | null) => {
    if (!url) return null;
    try {
      const u = new URL(url);
      const origin = typeof window !== 'undefined' ? window.location.origin : '';

      // YouTube handling
      if (u.hostname.includes('youtu.be') || u.hostname.includes('youtube.com')) {
        let videoId = '';
        if (u.hostname.includes('youtu.be')) {
          videoId = u.pathname.replace('/', '');
        } else {
          videoId = u.searchParams.get('v') || '';
          if (u.pathname.startsWith('/embed/')) {
            const match = u.pathname.match(/\/embed\/([^/?]+)/);
            if (match) videoId = match[1];
          }
          if (!videoId && u.pathname.startsWith('/shorts/')) {
            const match = u.pathname.match(/\/shorts\/([^/?]+)/);
            if (match) videoId = match[1];
          }
        }
        if (videoId) {
          const params = new URLSearchParams({ autoplay: '1', mute: '1', playsinline: '1', rel: '0', controls: '0', origin });
          return `https://www.youtube.com/embed/${videoId}?${params.toString()}`;
        }
      }

      // Vimeo handling
      if (u.hostname.includes('vimeo.com')) {
        // If already a player URL, preserve path but ensure params
        if (u.hostname.includes('player.vimeo.com') && u.pathname.startsWith('/video/')) {
          const params = new URLSearchParams({ autoplay: '1', muted: '1', playsinline: '1' });
          return `https://player.vimeo.com${u.pathname}?${params.toString()}`;
        }

        // Extract numeric ID from common Vimeo URL shapes
        const match = url.match(/vimeo\.com\/(?:.*\/)?(\d+)/);
        const id = match ? match[1] : '';
        if (id) {
          const params = new URLSearchParams({ autoplay: '1', muted: '1', playsinline: '1' });
          return `https://player.vimeo.com/video/${id}?${params.toString()}`;
        }
      }
    } catch {}
    return url;
  };

  // Helper to determine if a URL is a video file
  const isVideoFile = (url: string): boolean => {
    if (!url) return false;
    return /\.(mp4|webm|ogg|mov)$/i.test(url);
  };

  // Helper to determine if a URL is from Vimeo
  const isVimeo = (url: string): boolean => {
    if (!url) return false;
    return url.includes('vimeo.com');
  };

  // Get media items to display under the primary player
  const getMediaItems = () => {
    if (!project) return [];

    // If a primary video URL exists, we only show the embed above and skip gallery
    if (project.video_url) {
      return [];
    }

    // For video projects, prefer provided images array; many cloud URLs lack file extensions
    if (project.media_type === 'video') {
      if (project.images && Array.isArray(project.images) && project.images.length > 0) {
        return project.images;
      }
      // fallback to thumbnail if present (may be a video url)
      if (project.thumbnail) return [project.thumbnail];
      return [];
    }

    // For image projects, prefer full images array, else fall back to thumbnail
    if (project.images && Array.isArray(project.images) && project.images.length > 0) {
      return project.images;
    }

    if (project.thumbnail) {
      return [project.thumbnail];
    }

    return [];
  };

  useEffect(() => {
    if (!loading && !project) {
      console.log(`[WorkDetail] Project not found for param: ${slug}`);
    }
  }, [loading, project, slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="pt-32 text-center">
          <h1 className="text-4xl mb-4">Loading...</h1>
        </div>
        <Footer />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="pt-32 text-center">
          <h1 className="text-4xl mb-4">Project not found</h1>
          <Link to="/work" className="text-primary hover:underline">
            Back to Work
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="pt-20 min-h-screen">
        <div className="grid grid-cols-1 lg:grid-cols-3 min-h-screen">
          {/* Left Side - Media Content */}
          <div className="bg-background p-8 lg:p-12 space-y-8 lg:col-span-2">
            {/* Priority 1: YouTube URL if provided */}
            {project.video_url && (
              <div className="w-full aspect-video rounded-lg overflow-hidden">
                <iframe
                  src={toEmbedUrl(project.video_url) || undefined}
                  title={`${project.title} - Video`}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
                  referrerPolicy="origin-when-cross-origin"
                  allowFullScreen
                  frameBorder="0"
                />
                <div className="mt-3">
                  <a
                    href={project.video_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm underline text-foreground/70 hover:text-foreground"
                  >
                    {(() => {
                      try {
                        const h = new URL(project.video_url!).hostname;
                        if (h.includes('vimeo')) return 'Open on Vimeo';
                        if (h.includes('youtu')) return 'Open on YouTube';
                        return 'Open original';
                      } catch {
                        return 'Open original';
                      }
                    })()}
                  </a>
                </div>
              </div>
            )}

            {/* Gallery of all media items */}
            {getMediaItems().map((mediaUrl, index) => {
              const urlString = String(mediaUrl);
              const isVideo = isVideoFile(urlString);
              const isVimeoVideo = isVimeo(urlString);
              
              return (
                <div key={index} className="w-full">
                  {isVimeoVideo ? (
                    <div className="w-full aspect-video">
                      <iframe
                        src={`${urlString.replace('vimeo.com/', 'player.vimeo.com/video/').split('?')[0]}?autoplay=1&muted=1&playsinline=1&background=1`}
                        title={`${project.title} - Video ${index + 1}`}
                        className="w-full h-full rounded-lg"
                        allow="autoplay; fullscreen; picture-in-picture"
                        allowFullScreen
                      />
                    </div>
                  ) : (isVideo || (project.media_type === 'video' && index === 0)) ? (
                    <video
                      src={urlString}
                      className="w-full h-auto object-cover rounded-lg"
                      autoPlay
                      loop
                      muted
                      playsInline
                      preload="auto"
                      controls={false}
                    />
                  ) : (
                    <img
                      src={urlString}
                      alt={`${project.title} - ${index === 0 && project.media_type === 'image' ? 'Preview' : `Image ${index + 1}`}`}
                      className="w-full h-auto object-contain rounded-lg max-h-[80vh] mx-auto"
                      loading={index === 0 ? "eager" : "lazy"}
                    />
                  )}
                </div>
              );
            })}
          </div>

          {/* Right Side - Content */}
          <div className="bg-background pt-8 pr-8 pb-8 lg:pt-12 lg:pr-12 lg:pb-12 lg:sticky lg:top-20 lg:h-screen lg:overflow-y-auto lg:col-span-1">
            <div className="max-w-xl">
              {/* Title */}
              <h1 className="text-4xl lg:text-5xl font-light mb-8 text-foreground">
                {extractTitle(project.title)}
              </h1>

              {/* Description */}
              <div className="mb-12 text-foreground/80 space-y-6">
                {project.description.split('\n\n').map((paragraph, index) => (
                  <p key={index} className="text-base leading-relaxed font-light mb-4" style={{ fontFamily: 'monospace' }}>
                    {paragraph}
                  </p>
                ))}
              </div>

              {/* Credits */}
              <div className="space-y-3 mb-12">
                {project.credits.map((credit, index) => (
                  <div key={index} className="text-foreground/80 font-light" style={{ fontFamily: 'monospace' }}>
                    <span className="text-sm">{credit.label}: {credit.value}</span>
                  </div>
                ))}
              </div>

              {/* CTA Button */}
              <button 
                onClick={() => setContactModalOpen(true)}
                className="w-full border border-foreground/20 py-6 text-center text-foreground hover:bg-foreground/5 transition-smooth"
              >
                <span className="text-lg font-light tracking-wider">let's cre8 together</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <Footer />
      <ContactModal open={contactModalOpen} onOpenChange={setContactModalOpen} />
    </div>
  );
};

export default WorkDetail;

import { useEffect, useRef, useMemo } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Link } from "react-router-dom";
import { useProjects } from "@/hooks/useProjects";
gsap.registerPlugin(ScrollTrigger);

export const HeroSection = () => {
  const { projects, loading } = useProjects();
  const sectionRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const scrollTriggerRef = useRef<ScrollTrigger | null>(null);
  
  // Get the most recent project (memoized to avoid re-sorting on every render)
  const latestProject = useMemo(() => {
    if (projects.length === 0) return null;
    return [...projects].sort((a, b) => 
      new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime()
    )[0];
  }, [projects]);
  
  useEffect(() => {
    if (!sectionRef.current || !scrollContainerRef.current) return;
    const section = sectionRef.current;
    const scrollContainer = scrollContainerRef.current;

    // Wait for projects to load before calculating scroll width
    if (loading) return;

    // Use requestAnimationFrame to ensure DOM is ready
    const rafId = requestAnimationFrame(() => {
      // Calculate total scroll width
      const scrollWidth = scrollContainer.scrollWidth - window.innerWidth;

      if (scrollWidth <= 0) {
        ScrollTrigger.refresh();
        return;
      }

      // Create horizontal scroll animation
      // The end should be scrollWidth to match the horizontal scroll distance
      const horizontalScroll = gsap.to(scrollContainer, {
        x: -scrollWidth,
        ease: "none",
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: `+=${scrollWidth}`,
          scrub: 1,
          pin: true,
          pinSpacing: true,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          // Ensure proper cleanup when scrolling past
          onLeave: () => {
            gsap.set(scrollContainer, { x: -scrollWidth });
          },
          onEnterBack: () => {
            gsap.set(scrollContainer, { x: 0 });
          }
        }
      });
      
      // Store the ScrollTrigger instance
      scrollTriggerRef.current = horizontalScroll.scrollTrigger || null;
      
      // Refresh to ensure proper calculations
      ScrollTrigger.refresh();
    });

    return () => {
      cancelAnimationFrame(rafId);
      if (scrollTriggerRef.current) {
        scrollTriggerRef.current.kill();
        scrollTriggerRef.current = null;
      }
    };
  }, [loading, projects]);
  // Get the thumbnail URL to display (avoiding flash of wrong image)
  const thumbnailUrl = useMemo(() => {
    /* if (loading || !latestProject) {
      return "https://res.cloudinary.com/dpk7o7zlw/image/upload/v1760611653/teacher_vg8mfj.webp";
    } */
    return latestProject?.thumbnail /* || "https://res.cloudinary.com/dpk7o7zlw/image/upload/v1760611653/teacher_vg8mfj.webp" */;
  }, [loading, latestProject]);

  // Check if we should render as video
  const shouldRenderAsVideo = (mediaType?: string | null) => {
    return mediaType === 'video';
  };

  return <section ref={sectionRef} className="relative h-screen overflow-hidden bg-black">
      {/* Fixed Background Image or Video */}
      <div className="absolute inset-0 z-0">
        {!loading && latestProject && thumbnailUrl ? (
          <>
            {shouldRenderAsVideo(latestProject.media_type) ? (
              <video
                src={thumbnailUrl}
                autoPlay
                loop
                muted
                playsInline
                className="h-full w-full object-cover transition-opacity duration-500"
              />
            ) : (
              <img 
                src={thumbnailUrl}
                alt={latestProject.title} 
                className="h-full w-full object-cover transition-opacity duration-500" 
              />
            )}
          </>
        ) : (
          <div className="h-full w-full bg-black" />
        )}
        <div className="absolute inset-0 bg-black/60" />
      </div>

      {/* Horizontally Scrolling Text Content */}
      <div className="sticky top-0 z-10 h-screen flex items-center overflow-hidden">
        <div ref={scrollContainerRef} className="flex">
          
          {/* First Text Block - Full Screen Width */}
          <div className="flex flex-col justify-center w-screen px-8 md:px-16 shrink-0 ml-8 md:ml-16">
            <h2 className="mb-6 font-display text-6xl tracking-tighter text-white md:text-8xl lg:text-9xl leading-none">
              {latestProject?.title || ""}
            </h2>
            <p className="mb-12 font-display text-lg text-white/80 md:text-xl tracking-wide">
              {latestProject?.categories?.[0] || ""}
            </p>
            <Link 
              to={latestProject ? `/work/${latestProject.slug || latestProject.id}` : "/work"}
              className="font-display text-sm text-white tracking-wide underline underline-offset-4 hover:opacity-80 transition-opacity"
            >
              VIEW PROJECTS
            </Link>
          </div>

          {/* Second Text Block - Full Screen Width */}
          <div className="flex flex-col justify-center w-screen px-8 md:px-16 shrink-0">
            <p className="mb-12 font-display text-2xl text-white/80 md:text-4xl tracking-wide max-w-5xl">
              Norf Cre8ions is a content-driven creative studio and agency based in Musanze, Rwanda. We are passionate about transforming ideas into impactful visual experiences that resonate. Specializing in digital marketing, content creation, and visual storytelling, we bring creativity and strategy together to help brands communicate their message effectively and stand out in today's dynamic landscape.
            </p>
            <Link to="/about" className="font-display text-sm text-white tracking-wide underline underline-offset-4 cursor-pointer hover:opacity-80 transition-opacity">VIEW MORE</Link>
          </div>

        </div>
      </div>
    </section>;
};
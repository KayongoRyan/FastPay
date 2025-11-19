import { useEffect, useRef } from "react";
import { useTeamMembers } from "@/hooks/useTeamMembers";

export const BehindTheLens = () => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const { members, loading } = useTeamMembers();
  
  // Get team member images
  const images = members.map(member => member.image_url);

  useEffect(() => {
    const scrollContainer = scrollRef.current;
    if (!scrollContainer || images.length === 0) return;

    let animationFrameId: number;
    const scrollSpeed = 0.5; // pixels per frame

    const scroll = () => {
      if (scrollContainer) {
        scrollContainer.scrollLeft += scrollSpeed;
        
        // Reset scroll position for infinite loop
        const maxScroll = scrollContainer.scrollWidth / 2;
        if (scrollContainer.scrollLeft >= maxScroll) {
          scrollContainer.scrollLeft = 0;
        }
      }
      animationFrameId = requestAnimationFrame(scroll);
    };

    animationFrameId = requestAnimationFrame(scroll);

    return () => cancelAnimationFrame(animationFrameId);
  }, [images]);

  return (
    <section className="py-32 border-t border-brand-light/10">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="mb-12">
          <h3 className="text-sm font-light tracking-widest text-brand-gray uppercase mb-8">
            BEHIND THE WORK —
          </h3>
        </div>

        {/* Large Quote */}
        <div className="mb-20">
          <blockquote className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-light text-brand-light leading-tight">
            Norf is a collective of creative minds based in Musanze, Rwanda. United by curiosity and craft, we create, refine, and grow ideas as one team.          </blockquote>
        </div>

      </div>

      {/* Full-width Infinite Image Carousel */}
      {loading ? (
        <div className="flex gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex-none w-full md:w-1/3 aspect-[4/3] bg-brand-dark/50 animate-pulse rounded" />
          ))}
        </div>
      ) : images.length > 0 ? (
        <div 
          ref={scrollRef}
          className="flex gap-4 overflow-x-hidden"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {/* First set of images */}
          {images.map((src, index) => (
            <div key={`img-1-${index}`} className="flex-none w-full md:w-1/3 aspect-[4/3] overflow-hidden">
              <img
                src={src}
                alt={`Team member ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </div>
          ))}
          {/* Duplicate set for infinite loop */}
          {images.map((src, index) => (
            <div key={`img-2-${index}`} className="flex-none w-full md:w-1/3 aspect-[4/3] overflow-hidden">
              <img
                src={src}
                alt={`Team member ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center text-brand-gray py-12">
          No team photos available yet.
        </div>
      )}
    </section>
  );
};

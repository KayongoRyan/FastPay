import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export const ServicesStackingHero = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  const services = [
    {
      number: "1",
      // category: "(Identities)",
      title: "Branding",
      description: "Your brand is more than just a logo—it’s the story you tell, the impression you leave, and the way your audience connects with you. We help businesses define their identity, build a strong foundation, and stand out in a crowded market.",
      bgColor: "hsl(142, 76%, 36%)"
    },
    {
      number: "2", 
      // category: "(Commercial)",
      title: "Content Creation & Storytelling",
      description: "Good content builds trust and keeps your audience engaged. We create compelling visual and written content to help businesses connect with their customers in meaningful ways.",
      bgColor: "hsl(217, 91%, 60%)"
    },
    {
      number: "3",
      // category: "(Film Production)", 
      title: "Web Design & Development",
      description: "Your website is your digital storefront. We build visually striking, high-performing websites that turn visitors into customers. Whether you need a sleek business site or a full-fledged e-commerce platform, we’ve got you covered.",
      bgColor: "hsl(271, 76%, 53%)"
    },
    {
      number: "4",
      // category: "(Music Videos)",
      title: "Marketing & Growth", 
      description: "Growing your business requires a smart marketing strategy. We use data-driven insights and creative campaigns to boost visibility, drive engagement, and increase conversions.",
      bgColor: "hsl(24, 95%, 53%)"
    }
  ];

  useEffect(() => {
    const sections = gsap.utils.toArray<HTMLElement>(".service-section");
    
    sections.forEach((section, index) => {
      if (index < sections.length - 1) {
        ScrollTrigger.create({
          trigger: section,
          start: "top top",
          end: "bottom top",
          pin: true,
          pinSpacing: false,
          anticipatePin: 1,
        });
      }
    });

    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, []);

  return (
    <div ref={containerRef} className="relative">
      {services.map((service, index) => (
        <section 
          key={index} 
          className="service-section min-h-screen flex items-center justify-center relative"
          style={{ backgroundColor: index === 1 || index === 3 ? "#eee9e6" : "#090909" }}
        >
          <div className="max-w-7xl mx-auto px-4 w-full">
            <div className="grid grid-cols-12 gap-8 items-center">
              {/* Large Number - Left Side */}
              <div className="col-span-12 lg:col-span-5">
                <div 
                  className="text-[240px] lg:text-[320px] xl:text-[400px] font-bold leading-none opacity-20"
                  style={{ color: index === 1 || index === 3 ? "#090909" : "#ffffff" }}
                >
                  {service.number}
                </div>
              </div>

              {/* Content - Right Side */}
              <div className="col-span-12 lg:col-span-7 flex flex-col justify-start">
                {/* Category */}
                <div 
                  className="text-lg mb-8"
                  style={{ color: index === 1 || index === 3 ? "#090909" : "rgba(255, 255, 255, 0.7)" }}
                >
                  {/* {service.category} */}
                </div>

                {/* Title */}
                <h1 
                  className="text-4xl lg:text-5xl xl:text-6xl font-light leading-tight mb-12"
                  style={{ color: index === 1 || index === 3 ? "#090909" : "#ffffff" }}
                >
                  {service.title}
                </h1>

                {/* Description */}
                <p 
                  className="text-lg lg:text-xl leading-relaxed max-w-2xl"
                  style={{ color: index === 1 || index === 3 ? "#090909" : "rgba(255, 255, 255, 0.8)" }}
                >
                  {service.description}
                </p>
              </div>
            </div>
          </div>
        </section>
      ))}
    </div>
  );
};

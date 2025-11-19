import { useState } from "react";

export const GallerySection = () => {
  const [activeFilter, setActiveFilter] = useState("All");

  const categories = ["All", "Street Photography", "Portraits", "Events", "Weddings", "Landscape", "Architecture"];

  const photos = [
    {
      id: 1,
      title: "Urban Shadows",
      category: "Street Photography",
      src: "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=600&h=800&fit=crop",
      aspect: "tall"
    },
    {
      id: 2,
      title: "Golden Hour Portrait",
      category: "Portraits",
      src: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop",
      aspect: "wide"
    },
    {
      id: 3,
      title: "City Reflections",
      category: "Street Photography",
      src: "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=600&h=900&fit=crop",
      aspect: "tall"
    },
    {
      id: 4,
      title: "Wedding Ceremony",
      category: "Weddings",
      src: "https://images.unsplash.com/photo-1606216794074-735e91aa2c92?w=800&h=600&fit=crop",
      aspect: "wide"
    },
    {
      id: 5,
      title: "Mountain Vista",
      category: "Landscape",
      src: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&h=800&fit=crop",
      aspect: "tall"
    },
    {
      id: 6,
      title: "Corporate Event",
      category: "Events",
      src: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&h=600&fit=crop",
      aspect: "wide"
    },
    {
      id: 7,
      title: "Modern Architecture",
      category: "Architecture",
      src: "https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=600&h=700&fit=crop",
      aspect: "medium"
    },
    {
      id: 8,
      title: "Candid Moment",
      category: "Street Photography",
      src: "https://images.unsplash.com/photo-1547036967-23d11aacaee0?w=800&h=600&fit=crop",
      aspect: "wide"
    },
    {
      id: 9,
      title: "Intimate Portrait",
      category: "Portraits",
      src: "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=600&h=800&fit=crop",
      aspect: "tall"
    },
    {
      id: 10,
      title: "Wedding Reception",
      category: "Weddings",
      src: "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=600&h=700&fit=crop",
      aspect: "medium"
    },
    {
      id: 11,
      title: "Ocean Sunset",
      category: "Landscape",
      src: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop",
      aspect: "wide"
    },
    {
      id: 12,
      title: "Conference Speaker",
      category: "Events",
      src: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600&h=800&fit=crop",
      aspect: "tall"
    }
  ];

  const filteredPhotos = activeFilter === "All" 
    ? photos 
    : photos.filter(photo => photo.category === activeFilter);

  const getGridClasses = (aspect: string) => {
    switch (aspect) {
      case "tall":
        return "row-span-2";
      case "wide":
        return "col-span-2";
      case "medium":
        return "row-span-1";
      default:
        return "";
    }
  };

  return (
    <section className="py-20">
      <div className="max-w-7xl mx-auto px-4">
        {/* Page Title */}
        <div className="mb-16">
          <h1 className="text-4xl lg:text-6xl font-light text-foreground mb-4">
            Photography Gallery
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl">
            A curated collection of moments captured through the lens, spanning various styles and subjects.
          </p>
        </div>

        {/* Filter Categories */}
        <div className="flex flex-wrap gap-8 mb-12">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setActiveFilter(category)}
              className={`text-lg font-light tracking-wide transition-all duration-300 ${
                activeFilter === category
                  ? "text-foreground border-b border-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Masonry Grid */}
        <div className="columns-2 md:columns-3 lg:columns-4 xl:columns-5 gap-2">
          {filteredPhotos.map((photo, index) => (
            <div
              key={photo.id}
              className="break-inside-avoid mb-2 animate-fade-in"
              style={{
                animationDelay: `${index * 0.05}s`,
              }}
            >
              <img
                src={photo.src}
                alt={photo.title}
                className="w-full h-auto block"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
import { Button } from "@/components/ui/button";

export const TeamSnippet = () => {
  const teamMembers = [
    {
      id: 1,
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop&crop=face",
    },
    {
      id: 2,
      image: "https://images.unsplash.com/photo-1494790108755-2616b612b3fe?w=300&h=300&fit=crop&crop=face",
    },
    {
      id: 3,
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&h=300&fit=crop&crop=face",
    },
    {
      id: 4,
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=300&h=300&fit=crop&crop=face",
    },
    {
      id: 5,
      image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&h=300&fit=crop&crop=face",
    },
  ];

  return (
    <section className="py-20 bg-muted/20">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-light text-brand-light mb-8 leading-tight">
            A TEAM OF CREATIVE MINDS<br />
            BEHIND EVERY PROJECT
          </h2>
        </div>

        {/* Team Grid */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-6 mb-12">
          {teamMembers.map((member, index) => (
            <div
              key={member.id}
              className="aspect-square overflow-hidden rounded-lg animate-fade-in hover-lift"
              style={{
                animationDelay: `${index * 0.1}s`,
              }}
            >
              <img
                src={member.image}
                alt={`Team member ${member.id}`}
                className="w-full h-full object-cover transition-elegant hover:scale-105"
              />
            </div>
          ))}
        </div>

        {/* CTA Button */}
        <div className="text-center">
          <Button
            variant="outline"
            size="lg"
            className="bg-transparent border-brand-gray text-brand-light hover:bg-brand-light hover:text-brand-dark transition-elegant px-8 py-4 text-sm font-medium tracking-widest"
          >
            VIEW ALL
          </Button>
        </div>
      </div>
    </section>
  );
};
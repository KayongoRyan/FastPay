import { useTeamMembers } from '@/hooks/useTeamMembers';

export const TeamSection = () => {
  const { members, loading } = useTeamMembers();

  return (
    <section className="py-32 border-t border-foreground/10 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="mb-12">
          <h3 className="text-sm font-light tracking-widest text-black uppercase mb-8">
            BEHIND THE WORK —
          </h3>
        </div>

        {/* Large Quote */}
        <div className="mb-20">
          <blockquote className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-light text-black leading-tight">
            Norf is a collective of creative minds based in Musanze, Rwanda. United by curiosity and craft, we create, refine, and grow ideas as one team.   
          </blockquote>
        </div>

        {/* Grid Images */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div 
                key={i} 
                className="relative aspect-[3/4] bg-gray-200 animate-pulse"
                style={{ minHeight: '400px' }}
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 auto-rows-fr">
            {members.length > 0 ? (
              members.map((member) => (
                <div 
                  key={member.id} 
                  className="relative aspect-[3/4] overflow-hidden group w-full"
                  style={{ 
                    minHeight: '400px'
                  }}
                >
                  <img
                    src={member.image_url}
                    alt={member.name}
                    className="w-full h-full object-cover object-center"
                    style={{ 
                      objectFit: 'cover',
                      objectPosition: 'center',
                      width: '100%',
                      height: '100%',
                      display: 'block'
                    }}
                    loading="lazy"
                    onError={(e) => {
                      // Fallback to placeholder if image fails to load
                      const target = e.target as HTMLImageElement;
                      target.src = 'https://via.placeholder.com/300x400?text=Team+Member';
                    }}
                  />
                  <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent">
                    <p className="text-white font-medium text-lg">{member.name}</p>
                    <p className="text-white/80 text-sm">{member.role}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full text-center text-gray-500 py-12">
                No team members available
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
};

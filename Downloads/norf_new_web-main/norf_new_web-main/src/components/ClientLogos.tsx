export const ClientLogos = () => {
  const clients = [
    { name: "SoundMint", logo: "SOUNDMINT" },
    { name: "DJI", logo: "DJI" },
    { name: "Hypebeast", logo: "HYPEBEAST" },
    { name: "Porsche", logo: "🏁" },
    { name: "Blue Hour", logo: "BLUEHOUR" },
    { name: "Film Supply", logo: "FILMSUPPLY" },
  ];

  return (
    <section className="py-20 border-t border-border/10">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 items-center">
          {clients.map((client, index) => (
            <div
              key={client.name}
              className="flex items-center justify-center h-16 animate-slide-in transition-smooth hover:scale-105"
              style={{
                animationDelay: `${index * 0.1}s`,
              }}
            >
              <span className="text-brand-gray font-medium text-xs tracking-wider uppercase opacity-70 hover:opacity-100 transition-smooth">
                {client.logo}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
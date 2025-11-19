export const ServicesHero = () => {
  const services = [
    {
      number: "1",
      category: "(Identities)",
      title: "Creating motion identities that are compelling and distinct.",
      description: "We craft motion identities that embody the core and character of brands. Each identity is created with intention—to be distinct, differentiated, compelling and scalable into broader systems.",
      colorClass: "bg-green-500"
    },
    {
      number: "2", 
      category: "(Commercial)",
      title: "Crafting commercial content that drives engagement and results.",
      description: "Our commercial work combines strategic thinking with creative execution to deliver content that not only looks stunning but also achieves measurable business outcomes for our clients.",
      colorClass: "bg-blue-500"
    },
    {
      number: "3",
      category: "(Film Production)", 
      title: "Producing cinematic experiences that captivate audiences.",
      description: "From concept to final cut, we handle every aspect of film production with meticulous attention to detail, ensuring each project tells a compelling story that resonates with viewers.",
      colorClass: "bg-purple-500"
    },
    {
      number: "4",
      category: "(Music Videos)",
      title: "Creating visual narratives that amplify musical expression.", 
      description: "We transform musical concepts into visual experiences, working closely with artists to create music videos that enhance their artistic vision and connect with their audience.",
      colorClass: "bg-orange-500"
    }
  ];

  return (
    <div className="py-20">
      <div className="max-w-7xl mx-auto px-4">
        {/* All Services Displayed Vertically */}
        {services.map((service, index) => (
          <section key={index} className="min-h-screen mb-20 last:mb-0">
            <div className="grid grid-cols-12 gap-8 min-h-[80vh]">
              {/* Large Number - Left Side */}
              <div className="col-span-12 lg:col-span-5">
                <div className="text-[240px] lg:text-[320px] xl:text-[400px] font-bold text-foreground leading-none">
                  {service.number}
                </div>
              </div>

              {/* Content - Right Side */}
              <div className="col-span-12 lg:col-span-7 flex flex-col justify-start pt-8 lg:pt-16">
                {/* Category */}
                <div className="text-muted-foreground text-lg mb-8">
                  {service.category}
                </div>

                {/* Title */}
                <h1 className="text-4xl lg:text-5xl xl:text-6xl font-light leading-tight text-foreground mb-12">
                  {service.title}
                </h1>

                {/* Description */}
                <p className="text-muted-foreground text-lg lg:text-xl leading-relaxed max-w-2xl">
                  {service.description}
                </p>
              </div>
            </div>
          </section>
        ))}
      </div>
    </div>
  );
};
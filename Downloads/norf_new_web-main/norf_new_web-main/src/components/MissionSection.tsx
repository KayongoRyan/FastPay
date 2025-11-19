import { Instagram } from "lucide-react";

export const MissionSection = () => {
  return <section className="w-full bg-[#B8ADA0]">
      {/* Text Section */}
      <div className="w-full bg-background py-16 px-12 md:px-16 lg:px-20">
        <p className="text-[54px] text-foreground max-w-7xl mx-auto">
          Within Norf Cre8ions, we have various divisions: Norf Creatives, Nor4Artists, and Sports Palettes, each dedicated to different aspects of creative expression.
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 min-h-screen">
        {/* Top Left - Tagline */}
        <div className="relative flex items-center justify-center p-12 md:p-16 lg:p-20 border-b md:border-b-0 md:border-r group cursor-pointer border" style={{
        backgroundColor: '#090909',
        borderColor: '#eee9e6'
      }}>
          <h2 className="text-[20px] font-light leading-tight" style={{ color: '#eee9e6' }}>
Benestrories is a dedicated storytelling platform by Norf Cre8ions, created to share the real stories of people in our community. We believe that everyone has a unique journey worth hearing, and we’re here to help amplify those voices.          </h2>
          <a 
            href="https://www.instagram.com/benestories/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          >
            <Instagram className="w-16 h-16 text-white" />
          </a>
        </div>

        {/* Top Right - Brand Name */}
        <div className="flex items-center justify-center p-12 md:p-16 lg:p-20 border-b border" style={{ backgroundColor: '#090909', borderColor: '#eee9e6' }}>
          <h3 className="text-7xl md:text-8xl lg:text-9xl font-bold" style={{
          color: '#eee9e6',
          fontFamily: 'Clash Display, sans-serif'
        }}>
            Norf
          </h3>
        </div>

        {/* Bottom Left - Description */}
        <div className="relative flex items-center justify-center p-12 md:p-16 lg:p-20 md:border-r group cursor-pointer border" style={{
        backgroundColor: '#090909',
        borderColor: '#eee9e6'
      }}>
          <p className="text-base md:text-lg lg:text-xl leading-relaxed max-w-lg" style={{ color: '#eee9e6' }}>
            Nor4Artists is a dedicated music marketing division of Norf Cre8ions, focused on helping aspiring musicians grow and establish their brands. We understand the challenges of breaking into the industry, which is why we provide tailored marketing strategies designed to amplify an artist's reach and impact.
          </p>
          <a 
            href="https://www.instagram.com/nor4artists/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          >
            <Instagram className="w-16 h-16 text-white" />
          </a>
        </div>

        {/* Bottom Right - Image */}
        <div className="relative flex items-center justify-center p-12 md:p-16 lg:p-20 group cursor-pointer border" style={{
        backgroundColor: '#090909',
        borderColor: '#eee9e6'
      }}>
          <p className="text-base md:text-lg lg:text-xl leading-relaxed max-w-lg" style={{ color: '#eee9e6' }}>Sports Palettes is a creative division of Norf Cre8ions, dedicated to elevating the digital presence of sports teams in Rwanda. Specializing in dynamic branding, innovative content creation, and eye-catching graphics, we collaborate with teams to craft vibrant and engaging visuals.</p>
          <a 
            href="https://www.instagram.com/sportpalettes/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          >
            <Instagram className="w-16 h-16 text-white" />
          </a>
        </div>
      </div>
    </section>;
};

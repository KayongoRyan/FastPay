import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ContactModal } from "./ContactModal";
export const Navigation = () => {
  const [activeLink, setActiveLink] = useState("home");
  const [contactModalOpen, setContactModalOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentY = window.scrollY || 0;
      const scrolledDown = currentY > lastScrollY;
      const hasPassedThreshold = currentY > 10;

      if (scrolledDown && hasPassedThreshold) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }
      setLastScrollY(currentY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);
  const navLinks = [{
    id: "about",
    label: "ABOUT",
    href: "/about"
  }, {
    id: "work",
    label: "WORK",
    href: "/work"
  }, {
    id: "gallery",
    label: "GALLERY",
    href: "#"
  }, {
    id: "services",
    label: "SERVICES",
    href: "/services"
  }, {
    id: "contact",
    label: "CONTACT",
    href: "#contact"
  }];
  return <nav className={`fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-white/10 border-white/10 transition-transform duration-300 ${isVisible ? "translate-y-0" : "-translate-y-full"}`}>
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link
            to="/"
            className="text-brand-light font-medium text-lg tracking-wide transition-smooth hover:text-primary"
            onClick={() => setActiveLink("home")}
          >
            <img
              src="https://res.cloudinary.com/dpk7o7zlw/image/upload/v1760606184/Norf_8_w_logo_jlcwso.png"
              alt="Norf Logo"
              className="h-4 w-auto"
            />
          </Link>

          {/* Navigation Links */}
          <div className="flex items-center space-x-8">
            {navLinks.map(link => {
            if (link.id === "contact") {
              return <button key={link.id} onClick={() => {
                setActiveLink(link.id);
                setContactModalOpen(true);
              }} className={`text-sm font-medium tracking-widest transition-smooth hover:text-white ${activeLink === link.id ? "text-white" : "text-white"}`}>
                    {link.label}
                  </button>;
            }
            return <Link key={link.id} to={link.href} className={`text-sm font-medium tracking-widest transition-smooth hover:text-white ${activeLink === link.id ? "text-white" : "text-white"}`} onClick={() => setActiveLink(link.id)}>
                  {link.label}
                </Link>;
          })}
          </div>
        </div>
      </div>
      
      <ContactModal open={contactModalOpen} onOpenChange={setContactModalOpen} />
    </nav>;
};
import { Menu, Search, X } from "lucide-react";
import { useState } from "react";

const links = [
  { href: "#home", label: "Home" },
  { href: "#services", label: "Services" },
  { href: "#analytics", label: "Analytics" },
  { href: "#pricing", label: "Pricing" },
  { href: "#faq", label: "FAQ" },
  { href: "#contact", label: "Contact" },
];

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      <nav className="navbar">
        <div className="container">
          <a href="#home" className="navbar__brand">
            <span className="navbar__logo">F</span>
            FastPay
          </a>

          <div className="navbar__links">
            {links.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className={link.href === "#home" ? "active" : undefined}
              >
                {link.label}
              </a>
            ))}
          </div>

          <div className="navbar__actions">
            <button type="button" className="navbar__search" aria-label="Search">
              <Search size={18} />
            </button>
            <a href="#login" className="btn btn-ghost">
              Log In
            </a>
            <a href="#pricing" className="btn btn-primary">
              Get Started
            </a>
            <button
              type="button"
              className="navbar__toggle"
              aria-label="Open menu"
              onClick={() => setMobileOpen(true)}
            >
              <Menu size={22} />
            </button>
          </div>
        </div>
      </nav>

      <div
        className={`mobile-nav${mobileOpen ? " open" : ""}`}
        onClick={() => setMobileOpen(false)}
        role="presentation"
      >
        <div
          className="mobile-nav__panel"
          onClick={(e) => e.stopPropagation()}
          role="dialog"
          aria-label="Mobile navigation"
        >
          <button
            type="button"
            className="mobile-nav__close"
            aria-label="Close menu"
            onClick={() => setMobileOpen(false)}
          >
            <X size={22} />
          </button>
          {links.map((link) => (
            <a key={link.href} href={link.href} onClick={() => setMobileOpen(false)}>
              {link.label}
            </a>
          ))}
          <a href="#login" className="btn btn-outline" onClick={() => setMobileOpen(false)}>
            Log In
          </a>
          <a href="#pricing" className="btn btn-primary" onClick={() => setMobileOpen(false)}>
            Get Started
          </a>
        </div>
      </div>
    </>
  );
}

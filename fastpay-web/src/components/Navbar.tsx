import { Menu, Search, X } from "lucide-react";
import { useState } from "react";
import { Link, NavLink } from "react-router-dom";

const links = [
  { to: "/", label: "Home" },
  { to: "/services", label: "Services" },
  { to: "/analytics", label: "Analytics" },
  { to: "/pricing", label: "Pricing" },
  { to: "/security", label: "Security" },
  { to: "/contact", label: "Contact" },
];

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      <nav className="navbar">
        <div className="container">
          <Link to="/" className="navbar__brand">
            <span className="navbar__logo">F</span>
            FastPay
          </Link>

          <div className="navbar__links">
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === "/"}
                className={({ isActive }) => (isActive ? "active" : undefined)}
              >
                {link.label}
              </NavLink>
            ))}
          </div>

          <div className="navbar__actions">
            <button type="button" className="navbar__search" aria-label="Search">
              <Search size={18} />
            </button>
            <Link to="/contact" className="btn btn-ghost">
              Log In
            </Link>
            <Link to="/pricing" className="btn btn-primary">
              Get Started
            </Link>
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
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === "/"}
              onClick={() => setMobileOpen(false)}
            >
              {link.label}
            </NavLink>
          ))}
          <Link to="/contact" className="btn btn-outline" onClick={() => setMobileOpen(false)}>
            Log In
          </Link>
          <Link to="/pricing" className="btn btn-primary" onClick={() => setMobileOpen(false)}>
            Get Started
          </Link>
        </div>
      </div>
    </>
  );
}

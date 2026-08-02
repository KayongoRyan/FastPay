import { Github, Linkedin, Twitter } from "lucide-react";
import { Link } from "react-router-dom";

const columns = [
  {
    title: "Product",
    links: [
      { label: "Services", to: "/services" },
      { label: "Analytics", to: "/analytics" },
      { label: "Security", to: "/security" },
      { label: "Pricing", to: "/pricing" },
      { label: "Merchant portal", to: "/merchant/login" },
      { label: "Business portal", to: "/business/login" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", to: "/contact" },
      { label: "Careers", to: "/contact" },
      { label: "Partners", to: "/contact" },
    ],
  },
  {
    title: "Support",
    links: [
      { label: "Contact", to: "/contact" },
      { label: "Log in", to: "/login" },
      { label: "Sign up", to: "/signup" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer__top">
          <div>
            <Link to="/" className="footer__brand">
              Fast<span>Pay</span>
            </Link>
            <p style={{ fontSize: "0.9rem", maxWidth: "32ch" }}>
              Secure fintech for the future. Move, manage, and grow your money
              with confidence.
            </p>
            <form className="footer__newsletter" onSubmit={(e) => e.preventDefault()}>
              <input type="email" placeholder="Your email" aria-label="Email for newsletter" />
              <button type="submit" className="btn btn-primary">
                Subscribe
              </button>
            </form>
          </div>
          {columns.map((col) => (
            <div key={col.title} className="footer__col">
              <h4>{col.title}</h4>
              <ul>
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link to={link.to}>{link.label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="footer__bottom">
          <span>© {new Date().getFullYear()} FastPay. All rights reserved.</span>
          <div className="footer__social">
            <a href="#" aria-label="Twitter">
              <Twitter size={16} />
            </a>
            <a href="#" aria-label="LinkedIn">
              <Linkedin size={16} />
            </a>
            <a href="#" aria-label="GitHub">
              <Github size={16} />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

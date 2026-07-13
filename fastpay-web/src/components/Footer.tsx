import { Github, Linkedin, Twitter } from "lucide-react";

const columns = [
  {
    title: "Product",
    links: ["Features", "Pricing", "Convert", "Analytics", "Cards"],
  },
  {
    title: "Company",
    links: ["About", "Blog", "Careers", "Press", "Partners"],
  },
  {
    title: "Legal",
    links: ["Privacy", "Terms", "Security", "Compliance"],
  },
];

export function Footer() {
  return (
    <footer className="footer" id="contact">
      <div className="container">
        <div className="footer__top">
          <div>
            <div className="footer__brand">
              Fast<span>Pay</span>
            </div>
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
                  <li key={link}>
                    <a href="#">{link}</a>
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

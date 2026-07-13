import { Mail, Phone } from "lucide-react";

export function TopBar() {
  return (
    <div className="top-bar">
      <div className="container">
        <div className="top-bar__left">
          <span className="top-bar__item">
            <Phone size={14} />
            +1 (800) 555-FAST
          </span>
          <span className="top-bar__item">
            <Mail size={14} />
            support@fastpay.com
          </span>
        </div>
        <div className="top-bar__right">
          <a href="#support" className="top-bar__link">
            Support
          </a>
          <a href="#faq" className="top-bar__link">
            Help
          </a>
          <span className="top-bar__link">EN</span>
        </div>
      </div>
    </div>
  );
}

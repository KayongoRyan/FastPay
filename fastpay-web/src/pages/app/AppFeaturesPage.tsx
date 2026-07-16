import {
  ArrowDownToLine,
  ArrowUpRight,
  LayoutGrid,
  Smartphone,
} from "lucide-react";
import { Link } from "react-router-dom";

const features = [
  {
    to: "/app/transfer",
    label: "Transfer",
    hint: "Send to FastPay IDs, phone numbers, or bank accounts",
    icon: ArrowUpRight,
  },
  {
    to: "/app/receive",
    label: "Receive",
    hint: "Share your QR code or account number to get paid",
    icon: ArrowDownToLine,
  },
  {
    to: "/app/buy",
    label: "Buy / Top-up",
    hint: "Airtime, data, and mobile money top-ups",
    icon: Smartphone,
  },
];

export function AppFeaturesPage() {
  return (
    <div className="wapp-page">
      <section className="wapp-card">
        <header className="wapp-card__head">
          <h2>
            <LayoutGrid size={18} /> Features
          </h2>
        </header>
        <p className="wapp-form-card__hint">
          Core money moves — transfer, receive, and top-up from one place.
        </p>
        <div className="wapp-feature-grid">
          {features.map(({ to, label, hint, icon: Icon }) => (
            <Link key={to} to={to} className="wapp-feature-card">
              <span className="wapp-feature-card__icon">
                <Icon size={22} strokeWidth={2.1} />
              </span>
              <strong>{label}</strong>
              <small>{hint}</small>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}

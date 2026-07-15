import {
  Bell,
  ChevronRight,
  Mail,
  Phone,
  Settings,
  ShieldCheck,
  Smartphone,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth, userInitials } from "../context/AuthContext";
import { RequireAuth } from "../components/RequireAuth";

function ProfileContent() {
  const { user } = useAuth();
  if (!user) return null;

  const kyc = user.kycStatus ?? "pending";

  return (
    <>
      <section className="account-hero">
        <div className="container account-hero__inner">
          <p className="account-hero__brand">FastPay</p>
          <h1 className="account-hero__title">Your profile</h1>
          <p className="account-hero__lede">
            Account details tied to the same wallet you use in the app.
          </p>
        </div>
      </section>

      <section className="account-main">
        <div className="container account-layout">
          <aside className="account-card account-card--identity">
            <div className="account-avatar" aria-hidden="true">
              {userInitials(user.fullName)}
            </div>
            <h2>{user.fullName}</h2>
            <p className="account-card__muted">{user.email || user.phone}</p>
            <span className={`account-badge account-badge--${kyc}`}>
              KYC · {kyc}
            </span>
            <Link to="/settings" className="account-card__cta">
              <Settings size={16} />
              Open settings
            </Link>
          </aside>

          <div className="account-stack">
            <article className="account-card">
              <h3>Contact</h3>
              <ul className="account-list">
                <li>
                  <Mail size={18} />
                  <div>
                    <span>Email</span>
                    <strong>{user.email || "Not set"}</strong>
                  </div>
                </li>
                <li>
                  <Phone size={18} />
                  <div>
                    <span>Phone</span>
                    <strong>{user.phone || "Not set"}</strong>
                  </div>
                </li>
              </ul>
            </article>

            <article className="account-card">
              <h3>Security snapshot</h3>
              <ul className="account-list">
                <li>
                  <ShieldCheck size={18} />
                  <div>
                    <span>KYC level</span>
                    <strong>Level {user.kycLevel ?? 0}</strong>
                  </div>
                </li>
                <li>
                  <Smartphone size={18} />
                  <div>
                    <span>Biometric unlock</span>
                    <strong>{user.biometricEnabled ? "Enabled" : "Not enrolled"}</strong>
                  </div>
                </li>
                <li>
                  <Bell size={18} />
                  <div>
                    <span>Account status</span>
                    <strong>{user.isActive === false ? "Restricted" : "Active"}</strong>
                  </div>
                </li>
              </ul>
            </article>

            <Link to="/settings" className="account-link-row">
              <div>
                <strong>Manage preferences</strong>
                <span>Password, alerts, currency, freeze account</span>
              </div>
              <ChevronRight size={18} />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

export function ProfilePage() {
  return (
    <RequireAuth>
      <ProfileContent />
    </RequireAuth>
  );
}

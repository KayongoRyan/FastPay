import { Link, Outlet } from "react-router-dom";

export function AuthLayout() {
  return (
    <div className="auth-shell">
      <header className="auth-shell__bar">
        <Link to="/" className="auth-shell__brand">
          <span className="auth-shell__mark">F</span>
          FastPay
        </Link>
        <Link to="/contact" className="auth-shell__help">
          Need help?
        </Link>
      </header>
      <Outlet />
    </div>
  );
}

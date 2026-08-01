import {
  FileText,
  LayoutDashboard,
  LogOut,
  Menu,
  Package,
  Receipt,
  Settings,
  Store,
  Target,
  Users,
  X,
} from "lucide-react";
import { useState } from "react";
import { Link, Navigate, NavLink, Outlet, useNavigate } from "react-router-dom";
import { useMerchantAuth } from "../context/MerchantAuthContext";

const navItems = [
  { to: "/merchant", end: true, label: "Dashboard", icon: LayoutDashboard },
  { to: "/merchant/inventory", label: "Inventory", icon: Package },
  { to: "/merchant/team", label: "Team & payroll", icon: Users },
  { to: "/merchant/goals", label: "Goals", icon: Target },
  { to: "/merchant/invoices", label: "Invoices", icon: FileText },
  { to: "/merchant/transactions", label: "Transactions", icon: Receipt },
  { to: "/merchant/settings", label: "Settings", icon: Settings },
];

export function MerchantShell() {
  const { user, ready, isAuthenticated, logout } = useMerchantAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  if (!ready) {
    return (
      <div className="auth-loading">
        <p>Loading merchant portal…</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/merchant/login" replace />;
  }

  if (user && user.accountType !== "merchant") {
    return <Navigate to="/app" replace />;
  }

  function handleLogout() {
    logout();
    navigate("/merchant/login");
  }

  const nav = (
    <nav className="wapp-nav" aria-label="Merchant navigation">
      <div className="wapp-nav__group">
        <span className="wapp-nav__label">Merchant</span>
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) => `wapp-nav__item${isActive ? " is-active" : ""}`}
            onClick={() => setMobileOpen(false)}
          >
            <item.icon size={18} strokeWidth={2.1} />
            {item.label}
          </NavLink>
        ))}
      </div>
    </nav>
  );

  return (
    <div className="wapp">
      <aside className={`wapp__sidebar${mobileOpen ? " is-open" : ""}`}>
        <div className="wapp__sidebar-head">
          <Link to="/merchant" className="wapp__brand" onClick={() => setMobileOpen(false)}>
            <span className="wapp__brand-mark">
              <Store size={16} strokeWidth={2.4} />
            </span>
            FastPay Merchant
          </Link>
          <button
            type="button"
            className="wapp__sidebar-close"
            aria-label="Close menu"
            onClick={() => setMobileOpen(false)}
          >
            <X size={20} />
          </button>
        </div>

        {nav}

        <button type="button" className="wapp-nav__item wapp-nav__logout" onClick={handleLogout}>
          <LogOut size={18} strokeWidth={2.1} />
          Sign out
        </button>
      </aside>

      {mobileOpen && (
        <div className="wapp__scrim" role="presentation" onClick={() => setMobileOpen(false)} />
      )}

      <div className="wapp__main">
        <header className="wapp__topbar">
          <button
            type="button"
            className="wapp__menu-btn"
            aria-label="Open menu"
            onClick={() => setMobileOpen(true)}
          >
            <Menu size={20} />
          </button>

          <div className="wapp__topbar-title">
            <small>{user?.businessName ?? "Merchant portal"}</small>
            <strong>{user?.merchantCode ? `Code ${user.merchantCode}` : user?.fullName}</strong>
          </div>

          <Link to="/merchant/settings" className="wapp__topbar-user">
            <span className="user-menu__avatar">
              {(user?.businessName ?? user?.fullName ?? "M").slice(0, 2).toUpperCase()}
            </span>
          </Link>
        </header>

        <main className="wapp__content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

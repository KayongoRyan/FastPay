import {
  FileText,
  LayoutDashboard,
  LogOut,
  Menu,
  Receipt,
  Settings,
  Store,
  X,
} from "lucide-react";
import { useState } from "react";
import { Link, Navigate, NavLink, Outlet, useNavigate } from "react-router-dom";
import { useMerchantAuth } from "../context/MerchantAuthContext";

const navItems = [
  { to: "/merchant", end: true, label: "Dashboard", icon: LayoutDashboard },
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
      <div className="wapp-loading">
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

  return (
    <div className="merchant-shell">
      <header className="merchant-shell__top">
        <button
          type="button"
          className="merchant-shell__menu-btn"
          aria-label="Open menu"
          onClick={() => setMobileOpen(true)}
        >
          <Menu size={20} />
        </button>
        <Link to="/merchant" className="merchant-shell__brand">
          <Store size={18} />
          <span>FastPay Merchant</span>
        </Link>
        <div className="merchant-shell__user">
          <strong>{user?.businessName ?? user?.fullName}</strong>
          {user?.merchantCode && <em>{user.merchantCode}</em>}
        </div>
      </header>

      <div className={`merchant-shell__drawer${mobileOpen ? " is-open" : ""}`}>
        <div className="merchant-shell__drawer-head">
          <span>Merchant menu</span>
          <button type="button" aria-label="Close menu" onClick={() => setMobileOpen(false)}>
            <X size={18} />
          </button>
        </div>
        <nav className="merchant-shell__nav">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) => (isActive ? "is-active" : undefined)}
            >
              <item.icon size={17} />
              {item.label}
            </NavLink>
          ))}
        </nav>
        <button type="button" className="merchant-shell__logout" onClick={handleLogout}>
          <LogOut size={16} /> Sign out
        </button>
      </div>

      <aside className="merchant-shell__sidebar">
        <div className="merchant-shell__brand merchant-shell__brand--sidebar">
          <Store size={18} />
          <span>FastPay Merchant</span>
        </div>
        <nav className="merchant-shell__nav">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) => (isActive ? "is-active" : undefined)}
            >
              <item.icon size={17} />
              {item.label}
            </NavLink>
          ))}
        </nav>
        <button type="button" className="merchant-shell__logout" onClick={handleLogout}>
          <LogOut size={16} /> Sign out
        </button>
      </aside>

      <main className="merchant-shell__main">
        <Outlet />
      </main>
    </div>
  );
}

import {
  ArrowLeftRight,
  BarChart3,
  CandlestickChart,
  Home,
  LayoutGrid,
  LogOut,
  Menu,
  Receipt,
  RefreshCcw,
  Settings,
  ShieldCheck,
  Target,
  Users,
  Wallet,
  X,
} from "lucide-react";
import { useState } from "react";
import { Link, Navigate, NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth, userInitials } from "../context/AuthContext";
import { logoutRequest } from "../lib/auth-api";
import { hasPin } from "../lib/pin";

const navGroups = [
  {
    label: "Overview",
    items: [
      { to: "/app", end: true, label: "Home", icon: Home },
      { to: "/app/wallet", label: "Wallet", icon: Wallet },
      { to: "/app/analytics", label: "Analytics", icon: BarChart3 },
    ],
  },
  {
    label: "Money",
    items: [
      { to: "/app/features", label: "Features", icon: LayoutGrid },
      { to: "/app/convert", label: "Convert", icon: ArrowLeftRight },
      { to: "/app/bills", label: "Bills", icon: Receipt },
      { to: "/app/subscriptions", label: "Subscriptions", icon: RefreshCcw },
      { to: "/app/family", label: "Family Plan", icon: Users },
      { to: "/app/goals", label: "Saved Goals", icon: Target },
      { to: "/app/crypto", label: "Crypto market", icon: CandlestickChart },
    ],
  },
  {
    label: "Account",
    items: [
      { to: "/app/security", label: "Security", icon: ShieldCheck },
      { to: "/app/settings", label: "Settings", icon: Settings },
    ],
  },
];

export function AppShell() {
  const { user, ready, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  if (!ready) {
    return (
      <div className="auth-loading">
        <p>Loading…</p>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  if (user.accountType === "merchant") {
    return <Navigate to="/merchant" replace />;
  }

  if (!hasPin(user.id)) {
    return <Navigate to="/pin-setup" replace />;
  }

  async function handleLogout() {
    await logoutRequest();
    logout();
    navigate("/login");
  }

  const nav = (
    <nav className="wapp-nav" aria-label="App navigation">
      {navGroups.map((group) => (
        <div key={group.label} className="wapp-nav__group">
          <span className="wapp-nav__label">{group.label}</span>
          {group.items.map(({ to, end, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) => `wapp-nav__item${isActive ? " is-active" : ""}`}
              onClick={() => setMobileOpen(false)}
            >
              <Icon size={18} strokeWidth={2.1} />
              {label}
            </NavLink>
          ))}
        </div>
      ))}
    </nav>
  );

  return (
    <div className="wapp">
      <aside className={`wapp__sidebar${mobileOpen ? " is-open" : ""}`}>
        <div className="wapp__sidebar-head">
          <Link to="/app" className="wapp__brand" onClick={() => setMobileOpen(false)}>
            <span className="wapp__brand-mark">F</span>
            FastPay
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
          Log out
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
            <small>FastPay Wallet</small>
            <strong>Hello, {user.fullName.split(" ")[0]}</strong>
          </div>

          <Link to="/app/profile" className="wapp__topbar-user">
            <span className="user-menu__avatar">{userInitials(user.fullName)}</span>
          </Link>
        </header>

        <main className="wapp__content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

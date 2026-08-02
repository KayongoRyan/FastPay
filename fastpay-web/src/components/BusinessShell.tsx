import {
  Building2,
  LayoutDashboard,
  LogOut,
  Menu,
  Settings,
  Store,
  Users,
  X,
} from "lucide-react";
import { useState } from "react";
import { Link, Navigate, NavLink, Outlet, useNavigate } from "react-router-dom";
import { useBusinessAuth } from "../context/BusinessAuthContext";

const navItems = [
  { to: "/business", end: true, label: "Overview", icon: LayoutDashboard },
  { to: "/business/branches", label: "Branches", icon: Store },
  { to: "/business/team", label: "Team", icon: Users },
  { to: "/business/settings", label: "Settings", icon: Settings },
];

export function BusinessShell() {
  const { user, ready, isAuthenticated, logout } = useBusinessAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  if (!ready) {
    return (
      <div className="auth-loading">
        <p>Loading business portal…</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/business/login" replace />;
  }

  if (user && user.accountType !== "business") {
    return <Navigate to="/app" replace />;
  }

  function handleLogout() {
    logout();
    navigate("/business/login");
  }

  const nav = (
    <nav className="wapp-nav" aria-label="Business navigation">
      <div className="wapp-nav__group">
        <span className="wapp-nav__label">Company</span>
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
          <Link to="/business" className="wapp__brand" onClick={() => setMobileOpen(false)}>
            <span className="wapp__brand-mark">
              <Building2 size={16} strokeWidth={2.4} />
            </span>
            FastPay Business
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
            <small>{user?.companyName ?? "Business portal"}</small>
            <strong>{user?.businessCode ? `Code ${user.businessCode}` : user?.fullName}</strong>
          </div>

          <Link to="/business/settings" className="wapp__topbar-user">
            <span className="user-menu__avatar">
              {(user?.companyName ?? user?.fullName ?? "B").slice(0, 2).toUpperCase()}
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

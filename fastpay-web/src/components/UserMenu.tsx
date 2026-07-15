import { ChevronDown, LogOut, Settings, UserRound } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth, userInitials } from "../context/AuthContext";
import { logoutRequest } from "../lib/auth-api";

export function UserMenu() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  if (!user) return null;

  async function handleLogout() {
    setOpen(false);
    await logoutRequest();
    logout();
    navigate("/login");
  }

  return (
    <div className="user-menu" ref={rootRef}>
      <button
        type="button"
        className="user-menu__trigger"
        aria-expanded={open}
        aria-haspopup="menu"
        onClick={() => setOpen((v) => !v)}
      >
        <span className="user-menu__avatar" aria-hidden="true">
          {userInitials(user.fullName)}
        </span>
        <span className="user-menu__name">{user.fullName.split(" ")[0]}</span>
        <ChevronDown size={16} className={`user-menu__chevron${open ? " is-open" : ""}`} />
      </button>

      {open && (
        <div className="user-menu__dropdown" role="menu">
          <div className="user-menu__header">
            <span className="user-menu__avatar user-menu__avatar--lg">
              {userInitials(user.fullName)}
            </span>
            <div>
              <strong>{user.fullName}</strong>
              <small>{user.email || user.phone || "FastPay member"}</small>
            </div>
          </div>

          <Link
            to="/profile"
            role="menuitem"
            className="user-menu__item"
            onClick={() => setOpen(false)}
          >
            <UserRound size={16} />
            Profile
          </Link>
          <Link
            to="/settings"
            role="menuitem"
            className="user-menu__item"
            onClick={() => setOpen(false)}
          >
            <Settings size={16} />
            Settings
          </Link>
          <button type="button" role="menuitem" className="user-menu__item" onClick={handleLogout}>
            <LogOut size={16} />
            Log out
          </button>
        </div>
      )}
    </div>
  );
}

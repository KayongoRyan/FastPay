import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  clearSession,
  fetchProfile,
  getStoredUser,
  persistSession,
  readAccessToken,
  type AuthResponse,
  type AuthUser,
} from "../lib/auth-api";

type AuthContextValue = {
  user: AuthUser | null;
  isAuthenticated: boolean;
  ready: boolean;
  setSession: (data: AuthResponse) => void;
  refreshUser: () => Promise<void>;
  updateUser: (user: AuthUser) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const stored = getStoredUser();
    const token = readAccessToken();
    if (stored && token) {
      setUser(stored);
      fetchProfile()
        .then((fresh) => {
          setUser(fresh);
          localStorage.setItem("fastpay_user", JSON.stringify(fresh));
        })
        .catch(async () => {
          const { refreshAccessToken, clearSession } = await import("../lib/auth-api");
          const refreshed = await refreshAccessToken();
          if (!refreshed) {
            clearSession();
            setUser(null);
            return;
          }
          try {
            const fresh = await fetchProfile();
            setUser(fresh);
            localStorage.setItem("fastpay_user", JSON.stringify(fresh));
          } catch {
            clearSession();
            setUser(null);
          }
        })
        .finally(() => setReady(true));
      return;
    }
    setReady(true);
  }, []);

  const setSession = useCallback((data: AuthResponse) => {
    persistSession(data);
    setUser(data.user);
  }, []);

  const updateUser = useCallback((next: AuthUser) => {
    setUser(next);
    localStorage.setItem("fastpay_user", JSON.stringify(next));
  }, []);

  const refreshUser = useCallback(async () => {
    const fresh = await fetchProfile();
    updateUser(fresh);
  }, [updateUser]);

  const logout = useCallback(() => {
    clearSession();
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      ready,
      setSession,
      refreshUser,
      updateUser,
      logout,
    }),
    [user, ready, setSession, refreshUser, updateUser, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

export function userInitials(name?: string) {
  if (!name?.trim()) return "FP";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0] ?? ""}${parts[1][0] ?? ""}`.toUpperCase();
}

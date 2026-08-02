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
  clearBusinessSession,
  getBusinessUser,
  persistBusinessSession,
  type BusinessUser,
} from "../lib/business-api";

type BusinessAuthContextValue = {
  user: BusinessUser | null;
  isAuthenticated: boolean;
  ready: boolean;
  setSession: (user: BusinessUser, tokens: { accessToken: string; refreshToken: string }) => void;
  logout: () => void;
};

const BusinessAuthContext = createContext<BusinessAuthContextValue | null>(null);

export function BusinessAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<BusinessUser | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setUser(getBusinessUser());
    setReady(true);
  }, []);

  const setSession = useCallback(
    (nextUser: BusinessUser, tokens: { accessToken: string; refreshToken: string }) => {
      persistBusinessSession({ user: nextUser, tokens });
      setUser(nextUser);
    },
    [],
  );

  const logout = useCallback(() => {
    clearBusinessSession();
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: Boolean(user?.accountType === "business"),
      ready,
      setSession,
      logout,
    }),
    [user, ready, setSession, logout],
  );

  return (
    <BusinessAuthContext.Provider value={value}>{children}</BusinessAuthContext.Provider>
  );
}

export function useBusinessAuth() {
  const ctx = useContext(BusinessAuthContext);
  if (!ctx) throw new Error("useBusinessAuth must be used within BusinessAuthProvider");
  return ctx;
}

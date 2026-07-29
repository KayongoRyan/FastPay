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
  clearMerchantSession,
  getMerchantUser,
  persistMerchantSession,
  type MerchantUser,
} from "../lib/merchant-api";

type MerchantAuthContextValue = {
  user: MerchantUser | null;
  isAuthenticated: boolean;
  ready: boolean;
  setSession: (user: MerchantUser, tokens: { accessToken: string; refreshToken: string }) => void;
  logout: () => void;
};

const MerchantAuthContext = createContext<MerchantAuthContextValue | null>(null);

export function MerchantAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<MerchantUser | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setUser(getMerchantUser());
    setReady(true);
  }, []);

  const setSession = useCallback(
    (nextUser: MerchantUser, tokens: { accessToken: string; refreshToken: string }) => {
      persistMerchantSession({ user: nextUser, tokens });
      setUser(nextUser);
    },
    [],
  );

  const logout = useCallback(() => {
    clearMerchantSession();
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: Boolean(user?.accountType === "merchant"),
      ready,
      setSession,
      logout,
    }),
    [user, ready, setSession, logout],
  );

  return (
    <MerchantAuthContext.Provider value={value}>{children}</MerchantAuthContext.Provider>
  );
}

export function useMerchantAuth() {
  const ctx = useContext(MerchantAuthContext);
  if (!ctx) throw new Error("useMerchantAuth must be used within MerchantAuthProvider");
  return ctx;
}

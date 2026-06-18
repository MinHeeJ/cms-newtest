import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { User } from "../../services/cmsTypes";
import { getSession, login as requestLogin, logout as requestLogout, register as requestRegister, type AuthSession } from "./auth.api";

interface AuthContextValue {
  session: AuthSession | null;
  user: User | null;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<AuthSession>;
  register: (username: string, password: string, passwordConfirm: string) => Promise<AuthSession>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;
    getSession()
      .then((nextSession) => {
        if (active) setSession(nextSession);
      })
      .catch(() => {
        if (active) setSession(null);
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const login = useCallback(async (username: string, password: string) => {
    const nextSession = await requestLogin({ username, password });
    setSession(nextSession);
    return nextSession;
  }, []);

  const register = useCallback(async (username: string, password: string, passwordConfirm: string) => {
    const nextSession = await requestRegister({ username, password, passwordConfirm });
    setSession(nextSession);
    return nextSession;
  }, []);

  const logout = useCallback(async () => {
    await requestLogout();
    setSession(null);
  }, []);

  const value = useMemo(
    () => ({ session, user: session?.user ?? null, isLoading, login, register, logout }),
    [isLoading, login, logout, register, session]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
}

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { client } from "../api";
import type { User } from "../types";

type AuthContextValue = {
  user: User | null;
  initializing: boolean;
  refresh: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [initializing, setInitializing] = useState(true);

  const refresh = async () => {
    if (!localStorage.getItem("token")) {
      setUser(null);
      return;
    }
    try {
      setUser(await client.me());
    } catch {
      setUser(null);
    }
  };

  useEffect(() => {
    void refresh().finally(() => setInitializing(false));
  }, []);

  const login = async (email: string, password: string) => {
    const { token } = await client.login({ email, password });
    localStorage.setItem("token", token);
    await refresh();
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
    location.assign("/");
  };

  const value = useMemo(
    () => ({ user, initializing, refresh, login, logout }),
    [user, initializing],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { getMe, login as apiLogin, logout as apiLogout, refreshToken, type Tokens, type User } from "@/lib/api";

interface AuthContextType {
  user: User | null;
  tokens: Tokens | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  setTokens: (tokens: Tokens) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [tokens, setTokensState] = useState<Tokens | null>(null);
  const [loading, setLoading] = useState(true);

  const setTokens = useCallback((t: Tokens) => {
    setTokensState(t);
    localStorage.setItem("access", t.access);
    localStorage.setItem("refresh", t.refresh);
  }, []);

  const clearTokens = useCallback(() => {
    setTokensState(null);
    setUser(null);
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
  }, []);

  useEffect(() => {
    const access = localStorage.getItem("access");
    const refresh = localStorage.getItem("refresh");
    if (access && refresh) {
      setTokensState({ access, refresh });
      getMe(access)
        .then(setUser)
        .catch(async () => {
          try {
            const newTokens = await refreshToken(refresh);
            setTokens(newTokens);
            const u = await getMe(newTokens.access);
            setUser(u);
          } catch {
            clearTokens();
          }
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [setTokens, clearTokens]);

  const login = useCallback(
    async (email: string, password: string) => {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/login/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || "Login failed");
      }
      const t: Tokens = await res.json();
      setTokens(t);
      const u = await getMe(t.access);
      setUser(u);
    },
    [setTokens]
  );

  const logout = useCallback(async () => {
    if (tokens) {
      await apiLogout(tokens.refresh, tokens.access).catch(() => {});
    }
    clearTokens();
  }, [tokens, clearTokens]);

  return (
    <AuthContext.Provider value={{ user, tokens, loading, login, logout, setTokens }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

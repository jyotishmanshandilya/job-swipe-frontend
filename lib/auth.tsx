"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import {
  API_URL,
  apiFetch,
  clearTokens,
  getRefreshToken,
  getToken,
  setTokens,
} from "./api";
import type { AuthResponse } from "./types";

interface AuthState {
  /** null = still checking localStorage */
  authenticated: boolean | null;
  login: (username: string, password: string) => Promise<void>;
  register: (data: {
    username: string;
    email: string;
    password: string;
    firstName: string;
    lastName: string;
  }) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);
  const router = useRouter();

  useEffect(() => {
    setAuthenticated(getToken() !== null);
  }, []);

  const login = useCallback(async (username: string, password: string) => {
    const res = await apiFetch<AuthResponse>("/api/auth/authenticate", {
      method: "POST",
      body: JSON.stringify({ username, password }),
    });
    setTokens(res.token, res.refreshToken);
    setAuthenticated(true);
  }, []);

  const register = useCallback(
    async (data: {
      username: string;
      email: string;
      password: string;
      firstName: string;
      lastName: string;
    }) => {
      const res = await apiFetch<AuthResponse>("/api/auth/register", {
        method: "POST",
        body: JSON.stringify(data),
      });
      setTokens(res.token, res.refreshToken);
      setAuthenticated(true);
    },
    [],
  );

  const logout = useCallback(() => {
    // Best-effort server-side revocation; local logout regardless.
    const refreshToken = getRefreshToken();
    if (refreshToken) {
      fetch(`${API_URL}/api/auth/logout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken }),
      }).catch(() => {});
    }
    clearTokens();
    setAuthenticated(false);
    router.push("/login");
  }, [router]);

  return (
    <AuthContext.Provider value={{ authenticated, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

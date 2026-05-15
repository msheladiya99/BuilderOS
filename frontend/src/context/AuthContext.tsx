import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import { api, setToken, setStoredUser, getStoredUser, getToken } from "../lib/api";
import type { User, UserRole } from "../types";

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string, subdomain?: string | null) => Promise<{ requiresOtp: boolean }>;
  verifyOtp: (email: string, otp: string, subdomain?: string | null) => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  logout: () => void;
  hasRole: (...roles: UserRole[]) => boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const ROLE_NAV: Record<UserRole, string[]> = {
  superadmin: ["superadmin", "dashboard", "settings", "users", "projects"],
  admin: ["*"],
  sales: ["dashboard", "projects", "units", "units-floorplan", "customers", "crm", "payments", "owner", "settings"],
  accounts: ["dashboard", "accounting", "accounting-pl", "accounting-balance", "accounting-gst", "payments", "customers", "settings"],
  site: ["dashboard", "projects", "construction", "inventory", "labour", "documents", "maintenance", "vendor", "settings"],
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => getStoredUser());
  const [isLoading, setIsLoading] = useState(!!getToken());

  useEffect(() => {
    if (!getToken()) {
      setIsLoading(false);
      return;
    }
    api
      .me()
      .then((u) => {
        setUser(u as User);
        setStoredUser(u);
      })
      .catch(() => {
        setToken(null);
        setStoredUser(null);
        setUser(null);
      })
      .finally(() => setIsLoading(false));
  }, []);

  const login = useCallback(async (email: string, password: string, subdomain?: string | null) => {
    const res = await api.login(email, password, subdomain);
    return { requiresOtp: res.requiresOtp };
  }, []);

  const verifyOtp = useCallback(async (email: string, otp: string, subdomain?: string | null) => {
    const res = await api.verifyOtp(email, otp, subdomain);
    setToken(res.token);
    setStoredUser(res.user);
    setUser(res.user as User);
  }, []);

  const forgotPassword = useCallback(async (email: string) => {
    await api.forgotPassword(email);
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    setStoredUser(null);
    setUser(null);
  }, []);

  const hasRole = useCallback(
    (...roles: UserRole[]) => {
      if (!user) return false;
      return roles.includes(user.role);
    },
    [user]
  );

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user && !!getToken(),
        login,
        verifyOtp,
        forgotPassword,
        logout,
        hasRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

export function canAccessView(role: UserRole, view: string): boolean {
  const allowed = ROLE_NAV[role];
  if (allowed.includes("*")) return true;
  return allowed.some((v) => view === v || view.startsWith(v));
}

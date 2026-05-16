import { TENANT_FALLBACK } from "./tenant-fallback";

const API_BASE = "/api";

export function getToken(): string | null {
  return localStorage.getItem("builderos_token");
}

export function setToken(token: string | null) {
  if (token) localStorage.setItem("builderos_token", token);
  else localStorage.removeItem("builderos_token");
}

export function getStoredUser() {
  const raw = localStorage.getItem("builderos_user");
  return raw ? JSON.parse(raw) : null;
}

export function setStoredUser(user: unknown | null) {
  if (user) localStorage.setItem("builderos_user", JSON.stringify(user));
  else localStorage.removeItem("builderos_user");
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.error || `Request failed: ${res.status}`);
  }
  return data as T;
}

const TENANT_SESSION_KEY = "builderos_tenant";

export function setLoginTenant(subdomain: string | null) {
  if (subdomain) sessionStorage.setItem(TENANT_SESSION_KEY, subdomain);
  else sessionStorage.removeItem(TENANT_SESSION_KEY);
}

export function getLoginTenant(): string | null {
  return sessionStorage.getItem(TENANT_SESSION_KEY);
}

export const api = {
  resolveTenant: async (subdomain: string) => {
    const key = subdomain.toLowerCase();
    const fallback = TENANT_FALLBACK[key];
    try {
      return await request<import("./tenant-types").TenantResolveResponse>(`/tenant/${key}`);
    } catch {
      if (fallback) return fallback;
      throw new Error("Project portal not found");
    }
  },

  login: (email: string, password: string, subdomain?: string | null) => {
    setLoginTenant(subdomain ?? null);
    return request<{ user: unknown; requiresOtp: boolean; email: string }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password, subdomain: subdomain || undefined }),
    });
  },

  verifyOtp: (email: string, otp: string, subdomain?: string | null) => {
    const tenant = subdomain ?? getLoginTenant();
    return request<{ token: string; user: unknown }>("/auth/verify-otp", {
      method: "POST",
      body: JSON.stringify({ email, otp, subdomain: tenant || undefined }),
    });
  },

  forgotPassword: (email: string) =>
    request<{ message: string }>("/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify({ email }),
    }),

  me: () => request<unknown>("/auth/me"),

  updateProfile: (body: { name?: string; avatar?: string }) =>
    request<import("../types").User>("/auth/profile", {
      method: "PATCH",
      body: JSON.stringify(body),
    }),

  bootstrap: () => request<Record<string, unknown>>("/bootstrap"),

  dashboard: () => request<import("../types").DashboardData>("/dashboard"),

  list: <T>(resource: string, params?: Record<string, string>) => {
    const qs = params ? "?" + new URLSearchParams(params).toString() : "";
    return request<T[]>(`/${resource}${qs}`);
  },

  get: <T>(resource: string, id: number) => request<T>(`/${resource}/${id}`),

  create: <T>(resource: string, body: Partial<T>) =>
    request<T>(`/${resource}`, { method: "POST", body: JSON.stringify(body) }),

  update: <T>(resource: string, id: number, body: Partial<T>) =>
    request<T>(`/${resource}/${id}`, { method: "PUT", body: JSON.stringify(body) }),

  delete: (resource: string, id: number) =>
    request<{ success: boolean }>(`/${resource}/${id}`, { method: "DELETE" }),

  notifications: () => request<import("../types").Notification[]>("/notifications"),

  markNotificationRead: (id: number) =>
    request<unknown>(`/notifications/${id}/read`, { method: "PATCH" }),

  addActivity: (text: string, color = "blue") =>
    request<unknown>("/activities", { method: "POST", body: JSON.stringify({ text, color }) }),
};

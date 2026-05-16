const API_V1 = "/api/v1";

function getToken(): string | null {
  return localStorage.getItem("builderos_token");
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_V1}${path}`, { ...options, headers });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `Request failed: ${res.status}`);
  return data as T;
}

export type Paginated<T> = {
  data: T[];
  meta: { page: number; limit: number; total: number; totalPages: number };
};

export type OwnerRow = {
  id: string;
  unit_id: string | null;
  name: string;
  mobile: string;
  email: string | null;
  aadhaar_no: string | null;
  pan_no: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  pincode: string | null;
  kyc_status: "pending" | "submitted" | "verified" | "rejected";
  kyc_notes: string | null;
  unit_no?: string;
  project_name?: string;
  documents?: { id: string; doc_type: string; file_url: string; verified: boolean }[];
};

export const apiV1 = {
  health: () => request<{ ok: boolean }>("/health"),

  resolveTenant: (subdomain: string) =>
    request<{ project: Record<string, unknown>; roles: unknown[] }>(`/tenant/${subdomain}`),

  login: (email: string, password: string, subdomain?: string) =>
    request<{ requiresOtp: boolean; email: string }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password, subdomain }),
    }),

  verifyOtp: (email: string, otp: string, subdomain?: string) =>
    request<{ token: string; user: unknown }>("/auth/verify-otp", {
      method: "POST",
      body: JSON.stringify({ email, otp, subdomain }),
    }),

  owners: {
    list: (params?: Record<string, string>) => {
      const q = new URLSearchParams(params).toString();
      return request<Paginated<OwnerRow>>(`/owners${q ? `?${q}` : ""}`);
    },
    get: (id: string) => request<OwnerRow>(`/owners/${id}`),
    create: (body: Record<string, unknown>) =>
      request<OwnerRow>("/owners", { method: "POST", body: JSON.stringify(body) }),
    update: (id: string, body: Record<string, unknown>) =>
      request<OwnerRow>(`/owners/${id}`, { method: "PATCH", body: JSON.stringify(body) }),
    updateKyc: (id: string, kycStatus: string, kycNotes?: string) =>
      request<OwnerRow>(`/owners/${id}/kyc`, {
        method: "PATCH",
        body: JSON.stringify({ kycStatus, kycNotes }),
      }),
    addDocument: (id: string, doc: { docType: string; fileUrl: string; fileName?: string }) =>
      request(`/owners/${id}/documents`, { method: "POST", body: JSON.stringify(doc) }),
    remove: (id: string) => request(`/owners/${id}`, { method: "DELETE" }),
  },

  projects: {
    list: (params?: Record<string, string>) => {
      const q = new URLSearchParams(params).toString();
      return request<Paginated<Record<string, unknown>>>(`/projects${q ? `?${q}` : ""}`);
    },
  },

  units: {
    list: (params?: Record<string, string>) => {
      const q = new URLSearchParams(params).toString();
      return request<Paginated<Record<string, unknown>>>(`/units${q ? `?${q}` : ""}`);
    },
  },
};

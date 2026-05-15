import type { TenantResolveResponse } from "./tenant-types";

/** Used when API is unreachable (e.g. dev server not started) */
export const TENANT_FALLBACK: Record<string, TenantResolveResponse> = {
  "skyline-heights": {
    project: {
      id: 1,
      name: "Skyline Heights",
      subdomain: "skyline-heights",
      location: "Andheri West, Mumbai",
      image: "SH",
      type: "Residential",
    },
    roles: [
      { id: "admin", label: "Administrator", desc: "Full system access", email: "arjun@builderos.in" },
      { id: "sales", label: "Sales Manager", desc: "CRM & bookings", email: "sales@builderos.in" },
      { id: "accounts", label: "Accounts", desc: "Finance & payments", email: "accounts@builderos.in" },
      { id: "site", label: "Site Manager", desc: "Construction & labour", email: "site@builderos.in" },
    ],
  },
  "green-valley": {
    project: {
      id: 2,
      name: "Green Valley",
      subdomain: "green-valley",
      location: "Wakad, Pune",
      image: "GV",
      type: "Residential",
    },
    roles: [
      { id: "admin", label: "Administrator", desc: "Full system access", email: "admin@greenvalley.in" },
      { id: "sales", label: "Sales Manager", desc: "CRM & bookings", email: "sales@greenvalley.in" },
      { id: "accounts", label: "Accounts", desc: "Finance & payments", email: "accounts@greenvalley.in" },
      { id: "site", label: "Site Manager", desc: "Construction & labour", email: "site@greenvalley.in" },
    ],
  },
  "marina-cove": {
    project: {
      id: 3,
      name: "Marina Cove",
      subdomain: "marina-cove",
      location: "Bandra, Mumbai",
      image: "MC",
      type: "Luxury Residential",
    },
    roles: [
      { id: "admin", label: "Administrator", desc: "Full system access", email: "arjun@builderos.in" },
    ],
  },
  "prestige-towers": {
    project: {
      id: 4,
      name: "Prestige Towers",
      subdomain: "prestige-towers",
      location: "Whitefield, Bangalore",
      image: "PT",
      type: "Commercial + Residential",
    },
    roles: [
      { id: "admin", label: "Administrator", desc: "Full system access", email: "arjun@builderos.in" },
    ],
  },
};

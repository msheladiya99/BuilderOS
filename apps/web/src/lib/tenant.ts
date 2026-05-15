/** Slug for subdomain from project name */
export function slugifyProjectName(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Current tenant subdomain, or null = main platform (super admin) */
export function getTenantSlug(): string | null {
  if (typeof window === "undefined") return null;

  const fromQuery = new URLSearchParams(window.location.search).get("tenant");
  if (fromQuery?.trim()) return fromQuery.trim().toLowerCase();

  const host = window.location.hostname.toLowerCase();
  if (host === "localhost" || host === "127.0.0.1") return null;

  const parts = host.split(".");
  if (parts.length >= 3 && parts[0] !== "www" && parts[0] !== "app") {
    return parts[0];
  }
  if (parts.length === 2 && parts[1] === "localhost" && parts[0] !== "www") {
    return parts[0];
  }
  return null;
}

export function isMainPortal(): boolean {
  return getTenantSlug() === null;
}

export function projectLoginUrl(subdomain: string): string {
  if (typeof window === "undefined") {
    return `https://${subdomain}.builderos.in/login`;
  }
  const { protocol, hostname, port } = window.location;
  const portSuffix = port && !["80", "443"].includes(port) ? `:${port}` : "";

  if (hostname === "localhost" || hostname === "127.0.0.1") {
    return `${protocol}//${subdomain}.localhost${portSuffix}/login?tenant=${subdomain}`;
  }
  const baseHost = hostname.replace(/^[^.]+\./, "");
  if (baseHost === hostname) {
    return `${protocol}//${subdomain}.${hostname}${portSuffix}/login`;
  }
  return `${protocol}//${subdomain}.${baseHost}${portSuffix}/login`;
}

export const MAIN_PLATFORM_HOST = "builderos.in";

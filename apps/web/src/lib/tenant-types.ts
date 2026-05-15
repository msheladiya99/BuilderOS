export interface TenantProject {
  id: number;
  name: string;
  subdomain: string;
  location: string;
  image: string;
  type: string;
}

export interface TenantRoleOption {
  id: string;
  label: string;
  desc: string;
  email: string;
}

export interface TenantResolveResponse {
  project: TenantProject;
  roles: TenantRoleOption[];
}

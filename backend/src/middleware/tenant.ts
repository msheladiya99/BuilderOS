import type { Request, Response, NextFunction } from "express";
import { findCompanyBySubdomain, type TenantContext } from "../db/tenant.js";
import { NotFoundError } from "../utils/errors.js";

export type TenantRequest = Request & { tenant: TenantContext };

/** Resolve tenant from subdomain param, X-Tenant header, or ?subdomain= */
export async function resolveTenant(req: Request, _res: Response, next: NextFunction) {
  const subdomain =
    (req.params.subdomain as string) ||
    (req.headers["x-tenant"] as string) ||
    (req.query.subdomain as string);

  if (!subdomain) return next();

  const company = await findCompanyBySubdomain(String(subdomain).toLowerCase());
  if (!company) return next(new NotFoundError("Project portal not found"));

  (req as TenantRequest).tenant = {
    companyId: company.id,
    subdomain: company.subdomain,
    schemaName: company.schema_name,
  };
  next();
}

export function requireTenantResolved(req: Request, _res: Response, next: NextFunction) {
  if (!(req as TenantRequest).tenant) return next(new NotFoundError("Project portal not found"));
  next();
}

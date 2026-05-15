import type { Request } from "express";
import { query } from "../db/pool.js";
import type { AuthRequest } from "../middleware/auth.js";
import type { TenantRequest } from "../middleware/tenant.js";

type AuditParams = {
  action: "create" | "update" | "delete" | "login" | "logout";
  tableName: string;
  recordId?: string;
  oldVal?: unknown;
  newVal?: unknown;
  req: Request;
  schemaName?: string | null;
};

export async function writeAudit(params: AuditParams) {
  const user = (params.req as AuthRequest).user;
  const tenant = (params.req as TenantRequest).tenant;
  const ip = params.req.ip || params.req.socket.remoteAddress;
  const userAgent = params.req.headers["user-agent"];

  if (params.schemaName) {
    await query(
      `INSERT INTO ${quoteIdent(params.schemaName)}.audit_log
       (user_id, action, table_name, record_id, old_val, new_val, ip)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [
        user?.sub ?? null,
        params.action,
        params.tableName,
        params.recordId ?? null,
        params.oldVal ? JSON.stringify(params.oldVal) : null,
        params.newVal ? JSON.stringify(params.newVal) : null,
        ip,
      ]
    );
    return;
  }

  await query(
    `INSERT INTO audit_log (company_id, user_id, action, table_name, record_id, old_val, new_val, ip, user_agent)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
    [
      tenant?.companyId ?? user?.companyId ?? null,
      user?.sub ?? null,
      params.action,
      params.tableName,
      params.recordId ?? null,
      params.oldVal ? JSON.stringify(params.oldVal) : null,
      params.newVal ? JSON.stringify(params.newVal) : null,
      ip,
      userAgent ?? null,
    ]
  );
}

function quoteIdent(name: string) {
  return `"${name.replace(/"/g, '""')}"`;
}

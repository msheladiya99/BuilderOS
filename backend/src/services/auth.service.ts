import bcrypt from "bcryptjs";
import { query } from "../db/pool.js";
import { findCompanyBySubdomain } from "../db/tenant.js";
import { signToken } from "../utils/jwt.js";
import { UnauthorizedError, ForbiddenError, NotFoundError } from "../utils/errors.js";
import { env } from "../config/env.js";
import { readStore, LEGACY_USER_IDS } from "./json-store.service.js";

const ROLE_META: Record<string, { label: string; desc: string }> = {
  admin: { label: "Administrator", desc: "Full system access" },
  sales: { label: "Sales Manager", desc: "CRM & bookings" },
  accounts: { label: "Accounts", desc: "Finance & payments" },
  site: { label: "Site Manager", desc: "Construction & labour" },
};

export async function login(email: string, password: string, subdomain?: string) {
  const { rows } = await query<{
    id: string;
    email: string;
    password_hash: string;
    name: string;
    role: string;
    company_id: string | null;
    avatar: string | null;
  }>(
    `SELECT id, email, password_hash, name, role, company_id, avatar
     FROM users WHERE email = $1 AND deleted_at IS NULL AND is_active = TRUE`,
    [email.toLowerCase()]
  );
  const user = rows[0];
  if (!user || !(await bcrypt.compare(password, user.password_hash))) {
    throw new UnauthorizedError("Invalid email or password");
  }

  if (subdomain) {
    const company = await findCompanyBySubdomain(subdomain);
    if (!company) throw new NotFoundError("Project portal not found");
    if (user.role === "superadmin") {
      throw new ForbiddenError("Super Admin must sign in on the main website");
    }
    if (user.company_id !== company.id) {
      throw new UnauthorizedError("Invalid email or password for this project");
    }
    return {
      requiresOtp: true,
      email: user.email,
      user: toSafeUser(user, company),
    };
  }

  if (user.role !== "superadmin") {
    let hint = "";
    if (user.company_id) {
      const { rows: companies } = await query<{ subdomain: string }>(
        `SELECT subdomain FROM companies WHERE id = $1`,
        [user.company_id]
      );
      if (companies[0]) hint = ` Sign in at ${companies[0].subdomain}.${env.MAIN_DOMAIN}`;
    }
    throw new ForbiddenError(`Project users cannot sign in here.${hint}`);
  }

  return { requiresOtp: true, email: user.email, user: toSafeUser(user, null) };
}

export async function verifyOtp(email: string, otp: string, subdomain?: string) {
  if (otp !== env.OTP_DEMO_CODE) {
    throw new UnauthorizedError("Invalid OTP. Use 123456 for demo.");
  }

  const { rows } = await query<{
    id: string;
    email: string;
    name: string;
    role: string;
    company_id: string | null;
    avatar: string | null;
  }>(
    `SELECT id, email, name, role, company_id, avatar FROM users
     WHERE email = $1 AND deleted_at IS NULL`,
    [email.toLowerCase()]
  );
  const user = rows[0];
  if (!user) throw new UnauthorizedError("User not found");

  let company = null;
  if (subdomain) {
    company = await findCompanyBySubdomain(subdomain);
    if (!company) throw new NotFoundError("Project portal not found");
    if (user.role === "superadmin" || user.company_id !== company.id) {
      throw new ForbiddenError("Not authorized for this project portal");
    }
  } else if (user.role !== "superadmin") {
    throw new ForbiddenError("Use your project subdomain to sign in");
  }

  await query(`UPDATE users SET last_login_at = NOW() WHERE id = $1`, [user.id]);

  const db = readStore();
  const legacyId = LEGACY_USER_IDS[user.email.toLowerCase()];
  
  // Find legacy project ID by subdomain
  let legacyProjectId: number | null = null;
  if (user.role !== "superadmin") {
    const subdomain = company?.subdomain || (user.email.includes("greenvalley") ? "greenvalley" : "builderos");
    const lp = (db.projects as { id: number; subdomain?: string }[]).find(
      (p) => p.subdomain === subdomain
    );
    legacyProjectId = lp?.id ?? (user.email.includes("greenvalley") ? 2 : 1);
  }

  const token = signToken({
    sub: user.id,
    email: user.email,
    role: user.role,
    name: user.name,
    companyId: company?.id ?? null,
    subdomain: company?.subdomain ?? null,
    schemaName: company?.schema_name ?? null,
    legacyId,
    legacyProjectId,
  });

  return { token, user: toSafeUser(user, company) };
}

export async function updateProfile(userId: string, data: { name?: string; avatar?: string }) {
  const updates: string[] = [];
  const params: unknown[] = [userId];
  let i = 2;

  if (data.name) {
    updates.push(`name = $${i++}`);
    params.push(data.name);
  }
  if (data.avatar) {
    updates.push(`avatar = $${i++}`);
    params.push(data.avatar);
  }

  if (updates.length === 0) return getMe(userId);

  const { rows } = await query(
    `UPDATE users SET ${updates.join(", ")}, updated_at = NOW()
     WHERE id = $1 AND deleted_at IS NULL RETURNING id, email, name, role, company_id, avatar`,
    params
  );
  
  if (!rows[0]) throw new NotFoundError("User not found");
  return rows[0];
}

export async function getMe(userId: string) {
  const { rows } = await query(
    `SELECT id, email, name, role, company_id, avatar, last_login_at
     FROM users WHERE id = $1 AND deleted_at IS NULL`,
    [userId]
  );
  if (!rows[0]) throw new NotFoundError("User not found");
  const { password_hash: _, ...safe } = rows[0] as Record<string, unknown>;
  return safe;
}

export async function resolveTenantPortal(subdomain: string) {
  const company = await findCompanyBySubdomain(subdomain);
  if (!company) throw new NotFoundError("Project portal not found");

  const { rows: users } = await query<{ role: string; email: string }>(
    `SELECT role, email FROM users
     WHERE company_id = $1 AND deleted_at IS NULL AND role <> 'superadmin'`,
    [company.id]
  );

  const roles = users.map((u) => ({
    id: u.role,
    label: ROLE_META[u.role]?.label || u.role,
    desc: ROLE_META[u.role]?.desc || "",
    email: u.email,
  }));

  return {
    company: {
      id: company.id,
      name: company.name,
      subdomain: company.subdomain,
      logoUrl: company.logo_url,
      gstNo: company.gst_no,
    },
    roles,
  };
}

function toSafeUser(
  user: { id: string; email: string; name: string; role: string; avatar: string | null; company_id: string | null },
  company: { id: string; subdomain: string; schema_name: string } | null
) {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    avatar: user.avatar,
    companyId: company?.id ?? user.company_id,
    subdomain: company?.subdomain ?? null,
  };
}

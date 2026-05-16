import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { query } from "./pool.js";
import { quoteIdent } from "../utils/sql.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const TEMPLATE_PATH = path.resolve(__dirname, "../../../../database/schema/002_tenant_template.sql");

export function schemaNameFromSubdomain(subdomain: string): string {
  return `tenant_${subdomain.replace(/-/g, "_")}`;
}

export async function findCompanyBySubdomain(subdomain: string) {
  const { rows } = await query<{
    id: string;
    name: string;
    subdomain: string;
    schema_name: string;
    logo_url: string | null;
    gst_no: string | null;
    status: string;
  }>(
    `SELECT id, name, subdomain, schema_name, logo_url, gst_no, status
     FROM companies
     WHERE subdomain = $1 AND deleted_at IS NULL AND status = 'active'`,
    [subdomain.toLowerCase()]
  );
  return rows[0] ?? null;
}

export async function provisionTenantSchema(schemaName: string) {
  await query(`CREATE SCHEMA IF NOT EXISTS ${quoteIdent(schemaName)}`);
  const sql = fs.readFileSync(TEMPLATE_PATH, "utf-8");
  const statements = sql
    .split(/;\s*$/m) // Better split that looks for semi-colon at end of line
    .map((s) => s.trim())
    .filter((s) => s.length > 0 && !s.startsWith("--"));

  const client = await (await import("./pool.js")).pool.connect();
  try {
    await client.query(`SET search_path TO ${quoteIdent(schemaName)}, public`);
    for (const stmt of statements) {
      if (stmt.includes("EXECUTE FUNCTION public.set_updated_at")) {
        await client.query(stmt.replace("EXECUTE FUNCTION public.set_updated_at", "EXECUTE FUNCTION set_updated_at"));
      } else {
        await client.query(stmt);
      }
    }
  } finally {
    client.release();
  }
}

export type TenantContext = {
  companyId: string;
  subdomain: string;
  schemaName: string;
};

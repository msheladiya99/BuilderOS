import bcrypt from "bcryptjs";
import pg from "pg";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import "./load-env.js";

const TEMPLATE_PATH = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../schema/002_tenant_template.sql"
);

function quoteIdent(name: string) {
  return `"${name.replace(/"/g, '""')}"`;
}

async function applyTenantSchema(client: pg.PoolClient, schemaName: string) {
  await client.query(`CREATE SCHEMA IF NOT EXISTS ${quoteIdent(schemaName)}`);
  const sql = fs.readFileSync(TEMPLATE_PATH, "utf-8");
  const statements = sql
    .split(";")
    .map((s) => s.trim())
    .filter((s) => s.length > 0 && !s.startsWith("--"));

  await client.query(`SET search_path TO ${quoteIdent(schemaName)}, public`);
  for (const stmt of statements) {
    try {
      await client.query(stmt);
    } catch (err) {
      const msg = (err as Error).message;
      if (msg.includes("already exists")) continue;
      throw err;
    }
  }
}

async function seed() {
  const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
  const client = await pool.connect();
  const hash = await bcrypt.hash("password", 10);

  try {
    await client.query("BEGIN");

    await client.query(`
      INSERT INTO subscription_plans (name, code, max_projects, max_users, price_monthly)
      VALUES ('Starter', 'starter', 3, 10, 4999),
             ('Professional', 'pro', 10, 50, 14999)
      ON CONFLICT (code) DO NOTHING
    `);

    const planRes = await client.query(`SELECT id FROM subscription_plans WHERE code = 'starter' LIMIT 1`);
    const planId = planRes.rows[0]?.id;

    await client.query(
      `INSERT INTO users (email, password_hash, name, role, avatar)
       VALUES ($1, $2, 'Super Admin', 'superadmin', 'SA')
       ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash`,
      ["superadmin@builderos.in", hash]
    );

    const schemaName = "tenant_skyline_heights";
    const companyRes = await client.query(
      `INSERT INTO companies (name, subdomain, schema_name, gst_no, status, plan_id)
       VALUES ('Skyline Heights', 'skyline-heights', $1, '27AABCU9603R1ZM', 'active', $2)
       ON CONFLICT (subdomain) DO UPDATE SET name = EXCLUDED.name
       RETURNING id, schema_name`,
      [schemaName, planId]
    );
    const companyId = companyRes.rows[0].id;

    await applyTenantSchema(client, schemaName);

    const tenantUsers = [
      { email: "arjun@builderos.in", name: "Arjun Kapoor", role: "admin", avatar: "AK" },
      { email: "sales@builderos.in", name: "Priya Sales", role: "sales", avatar: "PS" },
      { email: "accounts@builderos.in", name: "Rajesh Accounts", role: "accounts", avatar: "RA" },
      { email: "site@builderos.in", name: "Vikram Site", role: "site", avatar: "VS" },
    ];

    for (const u of tenantUsers) {
      await client.query(
        `INSERT INTO users (company_id, email, password_hash, name, role, avatar)
         VALUES ($1, $2, $3, $4, $5, $6)
         ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash`,
        [companyId, u.email, hash, u.name, u.role, u.avatar]
      );
    }

    const schema = quoteIdent(schemaName);
    const projRes = await client.query(
      `INSERT INTO ${schema}.projects (name, type, rera_no, location, status, budget, progress)
       VALUES ('Skyline Heights Phase 1', 'residential', 'P52100012345', 'Mumbai, Maharashtra', 'active', 450000000, 62)
       RETURNING id`
    );
    const projectId = projRes.rows[0]?.id;

    if (projectId) {
      const units = [
        ["A-101", "2BHK", 1, "Tower A", 950, "available", 8500000],
        ["A-102", "2BHK", 1, "Tower A", 950, "booked", 8500000],
        ["B-201", "3BHK", 2, "Tower B", 1250, "sold", 12000000],
        ["B-202", "3BHK", 2, "Tower B", 1250, "available", 12000000],
      ];
      for (const [unitNo, type, floor, tower, area, status, price] of units) {
        await client.query(
          `INSERT INTO ${schema}.units (project_id, unit_no, type, floor, tower, area_sqft, status, base_price)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
           ON CONFLICT (project_id, unit_no) DO NOTHING`,
          [projectId, unitNo, type, floor, tower, area, status, price]
        );
      }
    }

    await client.query("COMMIT");
    console.log("Seed complete.");
    console.log("  Super Admin: superadmin@builderos.in / password / OTP 123456");
    console.log("  Tenant:      http://skyline-heights.localhost:5173/login");
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
    await pool.end();
  }
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});

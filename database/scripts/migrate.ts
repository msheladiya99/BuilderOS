import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import pg from "pg";
import "./load-env.js";

const schemaDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../schema");

async function migrate() {
  const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
  const publicSql = fs.readFileSync(path.join(schemaDir, "001_public.sql"), "utf-8");

  console.log("Applying public schema...");
  await pool.query(publicSql);
  console.log("Migration complete.");
  await pool.end();
}

migrate().catch((err) => {
  console.error(err);
  process.exit(1);
});

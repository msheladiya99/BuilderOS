import pg from "pg";
import { env } from "../config/env.js";

export const pool = new pg.Pool({
  connectionString:
    env.DATABASE_URL ?? "postgresql://builderos:builderos_dev@localhost:5432/builderos",
  max: 20,
});

pool.on("error", (err) => {
  console.error("Unexpected PostgreSQL pool error", err);
});

export async function query<T extends pg.QueryResultRow = pg.QueryResultRow>(
  text: string,
  params?: unknown[]
) {
  return pool.query<T>(text, params);
}

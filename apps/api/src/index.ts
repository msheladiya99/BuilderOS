import express from "express";
import cors from "cors";
import { env } from "./config/env.js";
import { v1Router } from "./routes/v1/index.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { pool } from "./db/pool.js";

const app = express();

app.use(
  cors({
    origin: env.CORS_ORIGIN.split(",").map((s) => s.trim()),
    credentials: true,
  })
);
app.use(express.json({ limit: "10mb" }));

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, app: "BuilderOS API", postgres: true });
});

app.use("/api/v1", v1Router);

app.use(errorHandler);

async function start() {
  try {
    await pool.query("SELECT 1");
    console.log("PostgreSQL connected");
  } catch (err) {
    console.error("PostgreSQL connection failed:", (err as Error).message);
    console.error("Run: docker compose up -d && npm run db:migrate && npm run db:seed");
    process.exit(1);
  }

  app.listen(env.API_PORT, () => {
    console.log(`BuilderOS API v1 → http://localhost:${env.API_PORT}/api/v1`);
  });
}

start();

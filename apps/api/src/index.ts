import express from "express";
import cors from "cors";
import { env } from "./config/env.js";
import { v1Router, mountOwnersRoutes } from "./routes/v1/index.js";
import { compatRouter, checkPostgres } from "./routes/compat.routes.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { getJsonDb } from "./services/json-store.service.js";

const app = express();

app.use(
  cors({
    origin: env.CORS_ORIGIN.split(",").map((s) => s.trim()),
    credentials: true,
  })
);
app.use(express.json({ limit: "10mb" }));

app.get("/api/health", async (_req, res) => {
  const pg = await checkPostgres();
  res.json({
    ok: true,
    app: "BuilderOS API",
    postgres: pg,
    modules: "json-store",
  });
});

app.use("/api/v1", v1Router);
app.use("/api", compatRouter);

app.use(errorHandler);

async function start() {
  const pg = await checkPostgres();
  mountOwnersRoutes(pg);
  if (pg) {
    console.log("PostgreSQL connected — /api/v1/owners (database)");
  } else {
    console.warn("PostgreSQL unavailable — Owner KYC uses JSON store (/api/v1/owners)");
    console.warn("Optional: docker compose up -d && npm run db:migrate && npm run db:seed");
  }

  try {
    getJsonDb();
    console.log("JSON module store loaded (backend/data/store.json)");
  } catch (e) {
    console.error((e as Error).message);
    process.exit(1);
  }

  app.listen(env.API_PORT, () => {
    console.log(`BuilderOS backend → http://localhost:${env.API_PORT}`);
    console.log(`  Legacy UI:  /api/*`);
    console.log(`  REST v1:    /api/v1/*`);
  });
}

start();

import { Router } from "express";
import { authRoutes } from "./auth.routes.js";
import { tenantRoutes } from "./tenant.routes.js";
import { projectRoutes } from "./projects.routes.js";
import { unitRoutes } from "./units.routes.js";
import { ownerRoutes } from "./owners.routes.js";
import { ownersJsonRoutes } from "./owners-json.routes.js";

export const v1Router = Router();

v1Router.get("/health", (_req, res) => {
  res.json({ ok: true, version: "v1", app: "BuilderOS API" });
});

v1Router.use("/auth", authRoutes);
v1Router.use("/tenant", tenantRoutes);
v1Router.use("/projects", projectRoutes);
v1Router.use("/units", unitRoutes);

/** Mount PG or JSON owners API (call once at startup). */
export function mountOwnersRoutes(usePostgres: boolean) {
  v1Router.use("/owners", usePostgres ? ownerRoutes : ownersJsonRoutes);
}

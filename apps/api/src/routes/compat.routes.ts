import { Router } from "express";
import { loginSchema, verifyOtpSchema } from "../schemas/auth.js";
import { validateBody } from "../middleware/validate.js";
import { requireAuth, getAuthUser } from "../middleware/auth.js";
import { paramId } from "../utils/params.js";
import * as authService from "../services/auth.service.js";
import {
  jsonStore,
  getJsonDb,
  saveJsonDb,
  toLegacyUser,
  scopeBootstrap,
  resetJsonDb,
} from "../services/json-store.service.js";
import { pool } from "../db/pool.js";
import { env } from "../config/env.js";

const COLLECTIONS = [
  "projects",
  "units",
  "customers",
  "leads",
  "payments",
  "pendingDues",
  "materials",
  "purchaseOrders",
  "contractors",
  "workOrders",
  "tickets",
  "maintenanceBills",
  "vouchers",
  "documentFolders",
  "documentFiles",
  "erpUsers",
  "settings",
] as const;

export const compatRouter = Router();

let pgReady = false;

export async function checkPostgres() {
  try {
    await pool.query("SELECT 1");
    pgReady = true;
  } catch {
    pgReady = false;
  }
  return pgReady;
}

// ─── Tenant (public) ─────────────────────────────────────────────
compatRouter.get("/tenant/:subdomain", async (req, res, next) => {
  try {
    if (pgReady) {
      const result = await authService.resolveTenantPortal(req.params.subdomain);
      return res.json({
        project: {
          id: result.company.id,
          name: result.company.name,
          subdomain: result.company.subdomain,
          location: "",
          image: result.company.logoUrl,
          type: "Residential",
        },
        roles: result.roles,
      });
    }
    const db = getJsonDb();
    const subdomain = String(req.params.subdomain).toLowerCase();
    const project = (db.projects as { subdomain?: string; id: number; name: string; location?: string; image?: string; type?: string }[]).find(
      (p) => p.subdomain === subdomain
    );
    if (!project) return res.status(404).json({ error: "Project portal not found" });
    const roles = db.users
      .filter((u) => u.projectId === project.id && u.role !== "superadmin")
      .map((u) => ({
        id: u.role,
        label: String(u.role),
        desc: "",
        email: u.email,
      }));
    res.json({ project, roles });
  } catch (e) {
    next(e);
  }
});

// ─── Auth ────────────────────────────────────────────────────────
compatRouter.post("/auth/login", validateBody(loginSchema), async (req, res, next) => {
  try {
    if (pgReady) {
      const result = await authService.login(req.body.email, req.body.password, req.body.subdomain);
      return res.json({
        ...result,
        user: toLegacyUser(result.user as Parameters<typeof toLegacyUser>[0]),
      });
    }
    const user = jsonStore.findUserByEmail(req.body.email);
    if (!user || user.password !== req.body.password) {
      return res.status(401).json({ error: "Invalid email or password" });
    }
    res.json({
      requiresOtp: true,
      email: user.email,
      user: toLegacyUser({
        email: String(user.email),
        name: String(user.name),
        role: String(user.role),
        avatar: String(user.avatar),
        projectId: user.projectId as number | null,
      }),
    });
  } catch (e) {
    next(e);
  }
});

compatRouter.post("/auth/verify-otp", validateBody(verifyOtpSchema), async (req, res, next) => {
  try {
    if (pgReady) {
      const result = await authService.verifyOtp(req.body.email, req.body.otp, req.body.subdomain);
      const legacy = toLegacyUser(result.user as Parameters<typeof toLegacyUser>[0]);
      return res.json({ token: result.token, user: legacy });
    }
    if (req.body.otp !== env.OTP_DEMO_CODE) {
      return res.status(401).json({ error: "Invalid OTP. Use 123456 for demo." });
    }
    const user = jsonStore.findUserByEmail(req.body.email);
    if (!user) return res.status(401).json({ error: "User not found" });
    const legacy = toLegacyUser({
      email: String(user.email),
      name: String(user.name),
      role: String(user.role),
      avatar: String(user.avatar),
      projectId: user.projectId as number | null,
    });
    const { signToken } = await import("../utils/jwt.js");
    const token = signToken({
      sub: String(legacy.id),
      email: legacy.email,
      role: legacy.role,
      name: legacy.name,
      companyId: null,
      subdomain: legacy.subdomain ?? null,
      schemaName: null,
      legacyId: legacy.id,
      legacyProjectId: legacy.projectId ?? null,
    });
    res.json({ token, user: legacy });
  } catch (e) {
    next(e);
  }
});

compatRouter.get("/auth/me", requireAuth, async (req, res, next) => {
  try {
    const auth = getAuthUser(req);
    if (pgReady && auth.sub && auth.sub.includes("-")) {
      const user = await authService.getMe(auth.sub);
      return res.json(
        toLegacyUser({
          email: String(user.email),
          name: String(user.name),
          role: String(user.role),
          avatar: user.avatar as string,
        })
      );
    }
    const db = getJsonDb();
    const legacyId = (auth as { legacyId?: number }).legacyId ?? Number(auth.sub);
    const user = db.users.find((u) => u.id === legacyId);
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(toLegacyUser({
      email: String(user.email),
      name: String(user.name),
      role: String(user.role),
      avatar: String(user.avatar),
      projectId: user.projectId as number | null,
    }));
  } catch (e) {
    next(e);
  }
});

compatRouter.post("/auth/forgot-password", (_req, res) => {
  res.json({ message: "Reset link sent (demo mode)" });
});

// ─── Bootstrap & dashboard ───────────────────────────────────────
compatRouter.get("/bootstrap", requireAuth, (req, res) => {
  const auth = getAuthUser(req);
  const projectId = (auth as { legacyProjectId?: number | null }).legacyProjectId ?? null;
  const db = getJsonDb();
  const { users, _counters, ...data } = db;
  res.json(scopeBootstrap(data, projectId));
});

compatRouter.get("/dashboard", requireAuth, (_req, res) => {
  const db = getJsonDb();
  const monthlyData = [
    { month: "Nov", revenue: 38, expenses: 22, bookings: 12 },
    { month: "Dec", revenue: 52, expenses: 28, bookings: 18 },
    { month: "Jan", revenue: 45, expenses: 25, bookings: 14 },
    { month: "Feb", revenue: 61, expenses: 32, bookings: 22 },
    { month: "Mar", revenue: 78, expenses: 38, bookings: 28 },
    { month: "Apr", revenue: 69, expenses: 35, bookings: 24 },
    { month: "May", revenue: 92, expenses: 42, bookings: 35 },
  ];
  const projects = db.projects as { name: string; sold: number; available: number; booked: number; progress: number; stages: string[]; currentStage: number }[];
  const units = db.units as { status: string }[];
  const leads = db.leads as { stage: string }[];
  res.json({
    monthlyData,
    projectData: projects.map((p) => ({
      name: p.name.split(" ")[0],
      sold: p.sold,
      available: p.available,
      booked: p.booked,
    })),
    unitStatus: [
      { name: "Sold", value: units.filter((u) => u.status === "Sold").length, color: "#2563EB" },
      { name: "Booked", value: units.filter((u) => u.status === "Booked").length, color: "#F59E0B" },
      { name: "Available", value: units.filter((u) => u.status === "Available").length, color: "#10B981" },
      { name: "Reserved", value: units.filter((u) => u.status === "Reserved").length, color: "#8B5CF6" },
    ],
    recentPayments: (db.payments as unknown[]).slice(0, 5),
    activities: db.activities,
    constructionProgress: projects.map((p) => ({
      name: p.name,
      progress: p.progress,
      stage: p.stages[p.currentStage],
    })),
    stats: {
      revenue: "₹92.4L",
      revenueChange: "+18.2%",
      expenses: "₹42.1L",
      expensesChange: "+8.4%",
      pendingDues: (db.pendingDues as unknown[]).length,
      pendingAmount: "₹24.8L",
      unitsSold: units.filter((u) => u.status === "Sold").length,
      unitsTotal: units.length,
      activeLeads: leads.filter((l) => l.stage !== "Booking").length,
    },
  });
});

// ─── JSON CRUD (demo modules) ────────────────────────────────────
for (const key of COLLECTIONS) {
  compatRouter.get(`/${key}`, requireAuth, (req, res) => {
    const auth = getAuthUser(req);
    const projectId = (auth as { legacyProjectId?: number | null }).legacyProjectId;
    const items = jsonStore.list(key, projectId != null ? { projectId } : undefined);
    res.json(items);
  });

  compatRouter.get(`/${key}/:id`, requireAuth, (req, res) => {
    const id = Number(paramId(req));
    const item = jsonStore.get(key, id);
    if (!item) return res.status(404).json({ error: "Not found" });
    res.json(item);
  });

  compatRouter.post(`/${key}`, requireAuth, (req, res) => {
    const item = jsonStore.create(key, req.body);
    res.status(201).json(item);
  });

  compatRouter.put(`/${key}/:id`, requireAuth, (req, res) => {
    const item = jsonStore.update(key, Number(paramId(req)), req.body);
    if (!item) return res.status(404).json({ error: "Not found" });
    res.json(item);
  });

  compatRouter.delete(`/${key}/:id`, requireAuth, (req, res) => {
    const ok = jsonStore.remove(key, Number(paramId(req)));
    if (!ok) return res.status(404).json({ error: "Not found" });
    res.json({ success: true });
  });
}

compatRouter.get("/notifications", requireAuth, (_req, res) => {
  res.json(getJsonDb().notifications ?? []);
});

compatRouter.patch("/notifications/:id/read", requireAuth, (req, res) => {
  const db = getJsonDb();
  const notifications = (db.notifications as { id: number; read?: boolean }[]) ?? [];
  const n = notifications.find((x) => x.id === Number(paramId(req)));
  if (n) n.read = true;
  saveJsonDb(db);
  res.json(n ?? { error: "Not found" });
});

compatRouter.post("/activities", requireAuth, (req, res) => {
  const db = getJsonDb();
  const activities = (db.activities as Record<string, unknown>[]) ?? [];
  const item = { id: (db._counters.activities = (db._counters.activities || 0) + 1), time: "now", color: "blue", ...req.body };
  activities.unshift(item);
  if (activities.length > 20) activities.pop();
  db.activities = activities;
  saveJsonDb(db);
  res.status(201).json(item);
});

compatRouter.post("/admin/reset", (_req, res) => {
  resetJsonDb();
  res.json({ message: "Database reset to seed data" });
});

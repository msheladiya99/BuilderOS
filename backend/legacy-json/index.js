import express from "express";
import cors from "cors";
import crypto from "crypto";
import { getDb, saveDb, resetDb, crudRouter } from "./db.js";
import {
  scopeBootstrap,
  backfillOwnerProjectIds,
  filterOwnersForProject,
  ownerBelongsToProject,
  scopeDashboard,
} from "./tenant-scope.js";

const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || "builderos-dev-secret-change-in-production";

const sessions = new Map();

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

function signToken(payload) {
  const data = Buffer.from(JSON.stringify({ ...payload, exp: Date.now() + 7 * 24 * 60 * 60 * 1000 })).toString("base64url");
  const sig = crypto.createHmac("sha256", JWT_SECRET).update(data).digest("base64url");
  return `${data}.${sig}`;
}

function verifyToken(token) {
  if (!token) return null;
  const [data, sig] = token.split(".");
  if (!data || !sig) return null;
  const expected = crypto.createHmac("sha256", JWT_SECRET).update(data).digest("base64url");
  if (sig !== expected) return null;
  try {
    const payload = JSON.parse(Buffer.from(data, "base64url").toString());
    if (payload.exp < Date.now()) return null;
    return payload;
  } catch {
    return null;
  }
}

function auth(req, res, next) {
  const header = req.headers.authorization;
  const token = header?.startsWith("Bearer ") ? header.slice(7) : null;
  const user = verifyToken(token);
  if (!user) return res.status(401).json({ error: "Unauthorized" });
  req.user = user;
  next();
}

const collections = [
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
];

const routers = Object.fromEntries(collections.map((k) => [k, crudRouter(k)]));

const ROLE_META = {
  admin: { label: "Administrator", desc: "Full system access" },
  sales: { label: "Sales Manager", desc: "CRM & bookings" },
  accounts: { label: "Accounts", desc: "Finance & payments" },
  site: { label: "Site Manager", desc: "Construction & labour" },
};

function slugify(name) {
  return String(name || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function findProjectBySubdomain(db, subdomain) {
  if (!subdomain) return null;
  const key = String(subdomain).toLowerCase();
  return (
    db.projects.find(
      (p) =>
        (p.subdomain && String(p.subdomain).toLowerCase() === key) ||
        slugify(p.name) === key
    ) || null
  );
}

function toSafeUser(user, project) {
  const { password: _, ...safe } = user;
  if (project) {
    safe.projectId = project.id;
    safe.subdomain = project.subdomain;
  }
  return safe;
}

// Health
app.get("/api/health", (_, res) => res.json({ ok: true, app: "BuilderOS API" }));

// Public — resolve project portal by subdomain
app.get("/api/tenant/:subdomain", (req, res) => {
  const db = getDb();
  const subdomain = String(req.params.subdomain || "").toLowerCase();
  const project = findProjectBySubdomain(db, subdomain);
  if (!project) return res.status(404).json({ error: "Project portal not found" });

  const roles = db.users
    .filter((u) => u.projectId === project.id && u.role !== "superadmin")
    .map((u) => ({
      id: u.role,
      label: ROLE_META[u.role]?.label || u.role,
      desc: ROLE_META[u.role]?.desc || "",
      email: u.email,
    }));

  res.json({
    project: {
      id: project.id,
      name: project.name,
      subdomain: project.subdomain,
      location: project.location,
      image: project.image,
      type: project.type,
    },
    roles,
  });
});

// Auth
app.post("/api/auth/login", (req, res) => {
  const { email, password, subdomain } = req.body;
  const db = getDb();
  const user = db.users.find((u) => u.email === email && u.password === password);
  if (!user) return res.status(401).json({ error: "Invalid email or password" });

  if (subdomain) {
    const project = findProjectBySubdomain(db, String(subdomain).toLowerCase());
    if (!project) return res.status(404).json({ error: "Project portal not found" });
    if (user.role === "superadmin") {
      return res.status(403).json({ error: "Super Admin must sign in on the main website" });
    }
    if (user.projectId !== project.id) {
      return res.status(401).json({ error: "Invalid email or password for this project" });
    }
    return res.json({ requiresOtp: true, email: user.email, user: toSafeUser(user, project) });
  }

  if (user.role !== "superadmin") {
    const proj = user.projectId ? db.projects.find((p) => p.id === user.projectId) : null;
    const hint = proj?.subdomain ? ` Sign in at ${proj.subdomain}.builderos.in` : " Use your project subdomain.";
    return res.status(403).json({ error: `Project users cannot sign in here.${hint}` });
  }

  res.json({ requiresOtp: true, email: user.email, user: toSafeUser(user, null) });
});

app.post("/api/auth/verify-otp", (req, res) => {
  const { email, otp, subdomain } = req.body;
  const db = getDb();
  const user = db.users.find((u) => u.email === email);
  if (!user) return res.status(401).json({ error: "User not found" });
  if (!otp || !/^\d{6}$/.test(otp)) {
    return res.status(400).json({ error: "Invalid OTP. Use 123456 for demo." });
  }

  let project = null;
  if (subdomain) {
    project = findProjectBySubdomain(db, String(subdomain).toLowerCase());
    if (!project) return res.status(404).json({ error: "Project portal not found" });
    if (user.role === "superadmin" || user.projectId !== project.id) {
      return res.status(403).json({ error: "Not authorized for this project portal" });
    }
  } else if (user.role !== "superadmin") {
    return res.status(403).json({ error: "Use your project subdomain to sign in" });
  }

  const safe = toSafeUser(user, project);
  const token = signToken({
    id: user.id,
    email: user.email,
    role: user.role,
    name: user.name,
    projectId: project?.id ?? null,
    subdomain: project?.subdomain ?? null,
  });
  res.json({ token, user: safe });
});

app.get("/api/auth/me", auth, (req, res) => {
  const db = getDb();
  const user = db.users.find((u) => u.id === req.user.id);
  if (!user) return res.status(404).json({ error: "User not found" });
  const { password: _, ...safe } = user;
  res.json(safe);
});

app.patch("/api/auth/profile", auth, (req, res) => {
  const db = getDb();
  const user = db.users.find((u) => u.id === req.user.id);
  if (!user) return res.status(404).json({ error: "User not found" });
  const { name, avatar } = req.body || {};
  if (name && String(name).trim()) user.name = String(name).trim();
  if (avatar && String(avatar).trim()) user.avatar = String(avatar).trim().slice(0, 3).toUpperCase();
  const erpUsers = db.erpUsers || [];
  const erp = erpUsers.find((e) => e.email && e.email.toLowerCase() === user.email.toLowerCase());
  if (erp && name && String(name).trim()) erp.name = String(name).trim();
  saveDb(db);
  const { password: _, ...safe } = user;
  res.json(safe);
});

app.post("/api/auth/forgot-password", (req, res) => {
  res.json({ message: "Reset link sent (demo mode)" });
});

// Bootstrap — all data in one call
app.get("/api/bootstrap", auth, (req, res) => {
  const db = getDb();
  const { users, _counters, ...data } = db;
  res.json(scopeBootstrap(data, req.user.projectId || null));
});

// Dashboard aggregates
app.get("/api/dashboard", auth, (req, res) => {
  const db = getDb();
  const projectId = req.user.projectId || null;
  const { units, leads, payments, projects, pendingDues } = scopeDashboard(db, projectId);
  const monthlyData = [
    { month: "Nov", revenue: 38, expenses: 22, bookings: 12 },
    { month: "Dec", revenue: 52, expenses: 28, bookings: 18 },
    { month: "Jan", revenue: 45, expenses: 25, bookings: 14 },
    { month: "Feb", revenue: 61, expenses: 32, bookings: 22 },
    { month: "Mar", revenue: 78, expenses: 38, bookings: 28 },
    { month: "Apr", revenue: 69, expenses: 35, bookings: 24 },
    { month: "May", revenue: 92, expenses: 42, bookings: 35 },
  ];
  const projectData = projects.map((p) => ({
    name: p.name.split(" ")[0] + (p.name.includes(" ") ? " " + p.name.split(" ")[1]?.slice(0, 3) : ""),
    sold: p.sold,
    available: p.available,
    booked: p.booked,
  }));
  const unitStatus = [
    { name: "Sold", value: units.filter((u) => u.status === "Sold").length || 0, color: "#2563EB" },
    { name: "Booked", value: units.filter((u) => u.status === "Booked").length || 0, color: "#F59E0B" },
    { name: "Available", value: units.filter((u) => u.status === "Available").length || 0, color: "#10B981" },
    { name: "Reserved", value: units.filter((u) => u.status === "Reserved").length || 0, color: "#8B5CF6" },
  ];
  res.json({
    monthlyData,
    projectData,
    unitStatus,
    recentPayments: payments.slice(0, 5),
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
      pendingDues: pendingDues.length,
      pendingAmount: "₹24.8L",
      unitsSold: units.filter((u) => u.status === "Sold").length,
      unitsTotal: units.length,
      activeLeads: leads.filter((l) => l.stage !== "Booking").length,
    },
  });
});

// Generic CRUD for each collection
collections.forEach((key) => {
  const router = routers[key];

  app.get(`/api/${key}`, auth, (req, res) => {
    const db = getDb();
    res.json(router.list(db, req.query));
  });

  app.get(`/api/${key}/:id`, auth, (req, res) => {
    const db = getDb();
    const item = router.get(db, req.params.id);
    if (!item) return res.status(404).json({ error: "Not found" });
    res.json(item);
  });

  app.post(`/api/${key}`, auth, (req, res) => {
    const db = getDb();
    const body = { ...req.body };
    if (key === "projects" && !body.subdomain && body.name) {
      let base = slugify(body.name);
      let candidate = base;
      let n = 1;
      while (db.projects.some((p) => p.subdomain === candidate)) {
        candidate = `${base}-${++n}`;
      }
      body.subdomain = candidate;
    }
    const item = router.create(db, body);
    res.status(201).json(item);
  });

  app.put(`/api/${key}/:id`, auth, (req, res) => {
    const db = getDb();
    const item = router.update(db, req.params.id, req.body);
    if (!item) return res.status(404).json({ error: "Not found" });
    res.json(item);
  });

  app.delete(`/api/${key}/:id`, auth, (req, res) => {
    const db = getDb();
    const ok = router.remove(db, req.params.id);
    if (!ok) return res.status(404).json({ error: "Not found" });
    res.json({ success: true });
  });
});

// Notifications
app.get("/api/notifications", auth, (req, res) => {
  res.json(getDb().notifications);
});

app.patch("/api/notifications/:id/read", auth, (req, res) => {
  const db = getDb();
  const n = db.notifications.find((x) => x.id === Number(req.params.id));
  if (n) {
    n.read = true;
    saveDb(db);
  }
  res.json(n || { error: "Not found" });
});

// Activities
app.post("/api/activities", auth, (req, res) => {
  const db = getDb();
  const item = {
    id: (db._counters.activities = (db._counters.activities || 0) + 1),
    time: "now",
    color: "blue",
    ...req.body,
  };
  db.activities.unshift(item);
  if (db.activities.length > 20) db.activities.pop();
  saveDb(db);
  res.status(201).json(item);
});

// Reset database (dev only)
app.post("/api/admin/reset", (req, res) => {
  resetDb();
  res.json({ message: "Database reset to seed data" });
});

// ─── Owner KYC (JSON) — /api/v1/owners ───────────────────────────
function ensureOwners(db) {
  if (!db.owners) db.owners = [];
  if (!db.ownerDocuments) db.ownerDocuments = [];
}

function newOwnerId() {
  return `own_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

function mapOwnerRow(o, db) {
  let unit_no;
  let project_name;
  if (o.unit_id) {
    const unit = db.units.find((u) => String(u.id) === String(o.unit_id));
    if (unit) {
      unit_no = unit.unit;
      const proj = db.projects.find((p) => p.id === unit.projectId);
      project_name = proj?.name;
    }
  }
  const documents = (db.ownerDocuments || []).filter((d) => d.owner_id === o.id);
  return { ...o, unit_no, project_name, documents };
}

function ownersForProject(db, projectId) {
  ensureOwners(db);
  if (backfillOwnerProjectIds(db.owners, db.units)) saveDb(db);
  return filterOwnersForProject(db.owners, projectId, db.units);
}

function assertOwnerAccess(db, ownerId, projectId) {
  ensureOwners(db);
  const o = db.owners.find((x) => x.id === ownerId);
  if (!o) return null;
  if (!ownerBelongsToProject(o, projectId, db.units)) return null;
  return o;
}

function parseOwnerBody(body) {
  return {
    unit_id: body.unitId ? String(body.unitId) : null,
    name: String(body.name || "").trim(),
    mobile: String(body.mobile || "").trim(),
    email: body.email ? String(body.email).trim() : null,
    aadhaar_no: body.aadhaarNo ? String(body.aadhaarNo).trim() : null,
    pan_no: body.panNo ? String(body.panNo).trim().toUpperCase() : null,
    address: body.address ? String(body.address).trim() : null,
    city: body.city ? String(body.city).trim() : null,
    state: body.state ? String(body.state).trim() : null,
    pincode: body.pincode ? String(body.pincode).trim() : null,
  };
}

app.get("/api/v1/owners", auth, (req, res) => {
  const db = getDb();
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 20));
  const search = String(req.query.search || "").toLowerCase();
  const kycStatus = req.query.kycStatus;
  let rows = ownersForProject(db, req.user.projectId || null);
  if (kycStatus) rows = rows.filter((o) => o.kyc_status === kycStatus);
  if (search) {
    rows = rows.filter(
      (o) =>
        o.name.toLowerCase().includes(search) ||
        o.mobile.includes(search) ||
        (o.email && o.email.toLowerCase().includes(search))
    );
  }
  const total = rows.length;
  const start = (page - 1) * limit;
  res.json({
    data: rows.slice(start, start + limit).map((o) => mapOwnerRow(o, db)),
    meta: { page, limit, total, totalPages: Math.max(1, Math.ceil(total / limit)) },
  });
});

app.get("/api/v1/owners/:id", auth, (req, res) => {
  const db = getDb();
  const o = assertOwnerAccess(db, req.params.id, req.user.projectId || null);
  if (!o) return res.status(404).json({ error: "Owner not found" });
  res.json(mapOwnerRow(o, db));
});

app.post("/api/v1/owners", auth, (req, res) => {
  const db = getDb();
  ensureOwners(db);
  const projectId = req.user.projectId || null;
  if (!projectId) return res.status(400).json({ error: "Project context required to create an owner" });
  const parsed = parseOwnerBody(req.body || {});
  if (!parsed.name || parsed.name.length < 2) return res.status(400).json({ error: "Name is required" });
  if (!/^[6-9]\d{9}$/.test(parsed.mobile)) {
    return res.status(400).json({ error: "Valid 10-digit Indian mobile required" });
  }
  if (parsed.unit_id) {
    const unit = db.units.find((u) => String(u.id) === parsed.unit_id);
    if (!unit || unit.projectId !== projectId) {
      return res.status(400).json({ error: "Unit does not belong to this project" });
    }
  }
  const owner = {
    id: newOwnerId(),
    project_id: projectId,
    ...parsed,
    kyc_status: "pending",
    kyc_notes: null,
    created_at: new Date().toISOString(),
  };
  db.owners.unshift(owner);
  saveDb(db);
  res.status(201).json(mapOwnerRow(owner, db));
});

app.patch("/api/v1/owners/:id/kyc", auth, (req, res) => {
  const db = getDb();
  const o = assertOwnerAccess(db, req.params.id, req.user.projectId || null);
  if (!o) return res.status(404).json({ error: "Owner not found" });
  const status = req.body?.kycStatus;
  if (!["pending", "submitted", "verified", "rejected"].includes(status)) {
    return res.status(400).json({ error: "Invalid kycStatus" });
  }
  o.kyc_status = status;
  if (req.body?.kycNotes != null) o.kyc_notes = String(req.body.kycNotes);
  saveDb(db);
  res.json(mapOwnerRow(o, db));
});

app.patch("/api/v1/owners/:id", auth, (req, res) => {
  const db = getDb();
  const projectId = req.user.projectId || null;
  const o = assertOwnerAccess(db, req.params.id, projectId);
  if (!o) return res.status(404).json({ error: "Owner not found" });
  const parsed = parseOwnerBody({ ...o, ...req.body });
  if (parsed.unit_id && projectId) {
    const unit = db.units.find((u) => String(u.id) === parsed.unit_id);
    if (!unit || unit.projectId !== projectId) {
      return res.status(400).json({ error: "Unit does not belong to this project" });
    }
  }
  Object.assign(o, parsed);
  if (o.project_id == null && projectId) o.project_id = projectId;
  saveDb(db);
  res.json(mapOwnerRow(o, db));
});

app.post("/api/v1/owners/:id/documents", auth, (req, res) => {
  const db = getDb();
  const o = assertOwnerAccess(db, req.params.id, req.user.projectId || null);
  if (!o) return res.status(404).json({ error: "Owner not found" });
  const doc = {
    id: `doc_${Date.now()}`,
    owner_id: req.params.id,
    doc_type: String(req.body?.docType || "other"),
    file_url: String(req.body?.fileUrl || ""),
    file_name: req.body?.fileName ? String(req.body.fileName) : null,
    verified: false,
  };
  db.ownerDocuments.push(doc);
  saveDb(db);
  res.status(201).json(doc);
});

app.delete("/api/v1/owners/:id", auth, (req, res) => {
  const db = getDb();
  const o = assertOwnerAccess(db, req.params.id, req.user.projectId || null);
  if (!o) return res.status(404).json({ error: "Owner not found" });
  const before = db.owners.length;
  db.owners = db.owners.filter((x) => x.id !== o.id);
  db.ownerDocuments = (db.ownerDocuments || []).filter((d) => d.owner_id !== req.params.id);
  if (db.owners.length === before) return res.status(404).json({ error: "Owner not found" });
  saveDb(db);
  res.json({ success: true });
});

app.get("/api/v1/health", (_, res) => {
  res.json({ ok: true, version: "v1", app: "BuilderOS API", owners: "json" });
});

app.listen(PORT, () => {
  getDb();
  console.log(`BuilderOS API running at http://localhost:${PORT}`);
});

import { Router } from "express";
import { requireAuth, getAuthUser } from "../../middleware/auth.js";
import { getJsonDb, saveJsonDb } from "../../services/json-store.service.js";
import { paramId } from "../../utils/params.js";
import {
  filterOwnersForProject,
  ownerBelongsToProject,
} from "../../utils/tenant-scope.js";

export const ownersJsonRoutes = Router();

ownersJsonRoutes.use(requireAuth);

type OwnerRecord = {
  id: string;
  project_id: number | null;
  unit_id: string | null;
  name: string;
  mobile: string;
  email: string | null;
  aadhaar_no: string | null;
  pan_no: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  pincode: string | null;
  kyc_status: "pending" | "submitted" | "verified" | "rejected";
  kyc_notes: string | null;
  created_at: string;
};

type DocRecord = {
  id: string;
  owner_id: string;
  doc_type: string;
  file_url: string;
  file_name: string | null;
  verified: boolean;
};

function newId(prefix: string) {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

function ensureOwners(db: ReturnType<typeof getJsonDb>) {
  if (!db.owners) db.owners = [];
  if (!db.ownerDocuments) db.ownerDocuments = [];
  if (!db._counters.owners) db._counters.owners = 0;
}

function mapOwner(o: OwnerRecord, db: ReturnType<typeof getJsonDb>) {
  let unit_no: string | undefined;
  let project_name: string | undefined;
  if (o.unit_id) {
    const unit = (db.units as { id: number; unit: string; projectId: number }[]).find(
      (u) => String(u.id) === String(o.unit_id)
    );
    if (unit) {
      unit_no = unit.unit;
      const proj = (db.projects as { id: number; name: string }[]).find((p) => p.id === unit.projectId);
      project_name = proj?.name;
    }
  }
  const docs = ((db.ownerDocuments as DocRecord[]) || []).filter((d) => d.owner_id === o.id);
  return { ...o, unit_no, project_name, documents: docs };
}

function listForUser(db: ReturnType<typeof getJsonDb>, projectId: number | null | undefined) {
  ensureOwners(db);
  return filterOwnersForProject(db.owners as OwnerRecord[], projectId);
}

function assertOwnerAccess(
  db: ReturnType<typeof getJsonDb>,
  ownerId: string,
  projectId: number | null | undefined
): OwnerRecord | null {
  ensureOwners(db);
  const o = (db.owners as OwnerRecord[]).find((x) => x.id === ownerId);
  if (!o) return null;
  if (!ownerBelongsToProject(o, projectId)) return null;
  return o;
}

function parseBody(body: Record<string, unknown>) {
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

ownersJsonRoutes.get("/", (req, res) => {
  const db = getJsonDb();
  const auth = getAuthUser(req);
  const projectId = auth.legacyProjectId ?? null;
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 20));
  const search = String(req.query.search || "").toLowerCase();
  const kycStatus = req.query.kycStatus as string | undefined;

  let rows = listForUser(db, projectId);
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
  const data = rows.slice(start, start + limit).map((o) => mapOwner(o, db));
  res.json({
    data,
    meta: { page, limit, total, totalPages: Math.max(1, Math.ceil(total / limit)) },
  });
});

ownersJsonRoutes.get("/:id", (req, res) => {
  const db = getJsonDb();
  const auth = getAuthUser(req);
  const o = assertOwnerAccess(db, paramId(req), auth.legacyProjectId ?? null);
  if (!o) return res.status(404).json({ error: "Owner not found" });
  res.json(mapOwner(o, db));
});

ownersJsonRoutes.post("/", (req, res) => {
  const db = getJsonDb();
  const auth = getAuthUser(req);
  ensureOwners(db);
  const parsed = parseBody(req.body || {});
  if (!parsed.name || parsed.name.length < 2) {
    return res.status(400).json({ error: "Name is required" });
  }
  if (!/^[6-9]\d{9}$/.test(parsed.mobile)) {
    return res.status(400).json({ error: "Valid 10-digit Indian mobile required" });
  }

  const projectId = auth.legacyProjectId ?? null;
  if (!projectId) {
    return res.status(400).json({ error: "Project context required to create an owner" });
  }

  const units = db.units as { id: number; projectId: number }[];
  if (parsed.unit_id) {
    const unit = units.find((u) => String(u.id) === parsed.unit_id);
    if (!unit || unit.projectId !== projectId) {
      return res.status(400).json({ error: "Unit does not belong to this project" });
    }
  }

  const owner: OwnerRecord = {
    id: newId("own"),
    project_id: projectId,
    ...parsed,
    kyc_status: "pending",
    kyc_notes: null,
    created_at: new Date().toISOString(),
  };
  (db.owners as OwnerRecord[]).unshift(owner);
  saveJsonDb(db);
  res.status(201).json(mapOwner(owner, db));
});

ownersJsonRoutes.patch("/:id", (req, res) => {
  const db = getJsonDb();
  const auth = getAuthUser(req);
  const projectId = auth.legacyProjectId ?? null;
  const existing = assertOwnerAccess(db, paramId(req), projectId);
  if (!existing) return res.status(404).json({ error: "Owner not found" });

  const parsed = parseBody({ ...existing, ...req.body });
  const units = db.units as { id: number; projectId: number }[];
  if (parsed.unit_id && projectId) {
    const unit = units.find((u) => String(u.id) === parsed.unit_id);
    if (!unit || unit.projectId !== projectId) {
      return res.status(400).json({ error: "Unit does not belong to this project" });
    }
  }

  const owners = db.owners as OwnerRecord[];
  const idx = owners.findIndex((x) => x.id === existing.id);
  owners[idx] = { ...owners[idx], ...parsed, project_id: owners[idx].project_id ?? projectId };
  saveJsonDb(db);
  res.json(mapOwner(owners[idx], db));
});

ownersJsonRoutes.patch("/:id/kyc", (req, res) => {
  const db = getJsonDb();
  const auth = getAuthUser(req);
  const existing = assertOwnerAccess(db, paramId(req), auth.legacyProjectId ?? null);
  if (!existing) return res.status(404).json({ error: "Owner not found" });

  const status = req.body?.kycStatus;
  if (!["pending", "submitted", "verified", "rejected"].includes(status)) {
    return res.status(400).json({ error: "Invalid kycStatus" });
  }
  const owners = db.owners as OwnerRecord[];
  const idx = owners.findIndex((x) => x.id === existing.id);
  owners[idx].kyc_status = status;
  if (req.body?.kycNotes != null) owners[idx].kyc_notes = String(req.body.kycNotes);
  saveJsonDb(db);
  res.json(mapOwner(owners[idx], db));
});

ownersJsonRoutes.post("/:id/documents", (req, res) => {
  const db = getJsonDb();
  const auth = getAuthUser(req);
  const existing = assertOwnerAccess(db, paramId(req), auth.legacyProjectId ?? null);
  if (!existing) return res.status(404).json({ error: "Owner not found" });

  const doc: DocRecord = {
    id: newId("doc"),
    owner_id: existing.id,
    doc_type: String(req.body?.docType || "other"),
    file_url: String(req.body?.fileUrl || ""),
    file_name: req.body?.fileName ? String(req.body.fileName) : null,
    verified: false,
  };
  (db.ownerDocuments as DocRecord[]).push(doc);
  saveJsonDb(db);
  res.status(201).json(doc);
});

ownersJsonRoutes.delete("/:id", (req, res) => {
  const db = getJsonDb();
  const auth = getAuthUser(req);
  const existing = assertOwnerAccess(db, paramId(req), auth.legacyProjectId ?? null);
  if (!existing) return res.status(404).json({ error: "Owner not found" });

  const id = existing.id;
  const before = (db.owners as OwnerRecord[]).length;
  db.owners = (db.owners as OwnerRecord[]).filter((x) => x.id !== id);
  db.ownerDocuments = ((db.ownerDocuments as DocRecord[]) || []).filter((d) => d.owner_id !== id);
  if ((db.owners as OwnerRecord[]).length === before) {
    return res.status(404).json({ error: "Owner not found" });
  }
  saveJsonDb(db);
  res.json({ success: true });
});

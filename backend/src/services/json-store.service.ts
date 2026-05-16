import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.resolve(__dirname, "../../data");
const STORE_PATH = path.join(DATA_DIR, "store.json");
const SEED_PATH = path.join(DATA_DIR, "seed.json");

export type JsonDb = Record<string, unknown> & {
  _counters: Record<string, number>;
  users: Array<Record<string, unknown>>;
};

export function readStore(): JsonDb {
  if (!fs.existsSync(STORE_PATH)) {
    if (!fs.existsSync(SEED_PATH)) {
      throw new Error("Missing backend/data/seed.json");
    }
    fs.mkdirSync(DATA_DIR, { recursive: true });
    const seed = JSON.parse(fs.readFileSync(SEED_PATH, "utf-8")) as JsonDb;
    fs.writeFileSync(STORE_PATH, JSON.stringify(seed, null, 2));
    return seed;
  }
  return JSON.parse(fs.readFileSync(STORE_PATH, "utf-8")) as JsonDb;
}

function writeStore(data: JsonDb) {
  fs.writeFileSync(STORE_PATH, JSON.stringify(data, null, 2));
}

export function getJsonDb(): JsonDb {
  return readStore();
}

export function saveJsonDb(data: JsonDb) {
  writeStore(data);
}

export function resetJsonDb(): JsonDb {
  if (fs.existsSync(STORE_PATH)) fs.unlinkSync(STORE_PATH);
  return readStore();
}

function nextId(db: JsonDb, key: string): number {
  db._counters[key] = (db._counters[key] || 0) + 1;
  return db._counters[key];
}

export const jsonStore = {
  list<T extends Record<string, unknown>>(collection: string, filter?: { projectId?: number }): T[] {
    const db = readStore();
    let items = (db[collection] as T[]) || [];
    if (filter?.projectId != null) {
      items = items.filter((i) => i.projectId === filter.projectId);
    }
    return items;
  },

  get<T extends Record<string, unknown>>(collection: string, id: number): T | null {
    const db = readStore();
    const items = (db[collection] as T[]) || [];
    return items.find((i) => i.id === id) ?? null;
  },

  create<T extends Record<string, unknown>>(collection: string, body: Partial<T>): T {
    const db = readStore();
    if (!db[collection]) db[collection] = [];
    const item = { ...body, id: nextId(db, collection) } as unknown as T;
    (db[collection] as T[]).push(item);
    writeStore(db);
    return item;
  },

  update<T extends Record<string, unknown>>(collection: string, id: number, body: Partial<T>): T | null {
    const db = readStore();
    const items = (db[collection] as T[]) || [];
    const idx = items.findIndex((i) => i.id === id);
    if (idx === -1) return null;
    items[idx] = { ...items[idx], ...body, id };
    writeStore(db);
    return items[idx];
  },

  remove(collection: string, id: number): boolean {
    const db = readStore();
    const items = (db[collection] as Record<string, unknown>[]) || [];
    const idx = items.findIndex((i) => i.id === id);
    if (idx === -1) return false;
    items.splice(idx, 1);
    writeStore(db);
    return true;
  },

  findUserByEmail(email: string) {
    const db = readStore();
    return db.users.find((u) => String(u.email).toLowerCase() === email.toLowerCase());
  },
};

/** Map PostgreSQL user email to legacy numeric ids for the React app */
export const LEGACY_USER_IDS: Record<string, number> = {
  "superadmin@builderos.in": 0,
  "arjun@builderos.in": 1,
  "sales@builderos.in": 2,
  "accounts@builderos.in": 3,
  "site@builderos.in": 4,
  "admin@greenvalley.in": 5,
  "sales@greenvalley.in": 6,
  "accounts@greenvalley.in": 7,
  "site@greenvalley.in": 8,
};

export function toLegacyUser(user: {
  id?: string;
  email: string;
  name: string;
  role: string;
  avatar?: string | null;
  companyId?: string | null;
  subdomain?: string | null;
  projectId?: number | null;
}) {
  const projectId =
    user.projectId ??
    (user.email.includes("greenvalley") ? 2 : user.role === "superadmin" ? null : 1);
  return {
    id: LEGACY_USER_IDS[user.email.toLowerCase()] ?? 1,
    email: user.email,
    name: user.name,
    role: user.role,
    avatar: user.avatar ?? user.name.slice(0, 2).toUpperCase(),
    projectId,
    subdomain: user.subdomain ?? undefined,
  };
}

export { scopeBootstrap } from "../utils/tenant-scope.js";

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_PATH = path.join(__dirname, "data.json");
const SEED_PATH = path.join(__dirname, "seed.json");

function readDb() {
  if (!fs.existsSync(DB_PATH)) {
    const seed = JSON.parse(fs.readFileSync(SEED_PATH, "utf-8"));
    fs.writeFileSync(DB_PATH, JSON.stringify(seed, null, 2));
    return seed;
  }
  return JSON.parse(fs.readFileSync(DB_PATH, "utf-8"));
}

function writeDb(data) {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}

export function getDb() {
  return readDb();
}

export function saveDb(data) {
  writeDb(data);
}

export function resetDb() {
  if (fs.existsSync(DB_PATH)) fs.unlinkSync(DB_PATH);
  return readDb();
}

export function nextId(db, key) {
  db._counters[key] = (db._counters[key] || 0) + 1;
  return db._counters[key];
}

export function crudRouter(collectionKey) {
  return {
    list: (db, filter) => {
      let items = db[collectionKey] || [];
      if (filter?.projectId) {
        items = items.filter((i) => i.projectId === Number(filter.projectId));
      }
      return items;
    },
    get: (db, id) => (db[collectionKey] || []).find((i) => i.id === Number(id)),
    create: (db, body) => {
      const item = { ...body, id: nextId(db, collectionKey) };
      db[collectionKey].push(item);
      saveDb(db);
      return item;
    },
    update: (db, id, body) => {
      const idx = db[collectionKey].findIndex((i) => i.id === Number(id));
      if (idx === -1) return null;
      db[collectionKey][idx] = { ...db[collectionKey][idx], ...body, id: Number(id) };
      saveDb(db);
      return db[collectionKey][idx];
    },
    remove: (db, id) => {
      const idx = db[collectionKey].findIndex((i) => i.id === Number(id));
      if (idx === -1) return false;
      db[collectionKey].splice(idx, 1);
      saveDb(db);
      return true;
    },
  };
}

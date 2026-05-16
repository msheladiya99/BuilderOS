import type { DashboardData, Notification } from "../types";

function cacheKey(userId: number | null, projectId: number | null): string {
  return `builderos_offline_cache_${userId ?? "anon"}_${projectId ?? "all"}`;
}

const QUEUE_KEY = "builderos_offline_queue";

export interface OfflineCache {
  bootstrap: Record<string, unknown>;
  dashboard: DashboardData | null;
  notifications: Notification[];
  savedAt: number;
  userId: number | null;
  projectId: number | null;
}

export type QueuedOp =
  | "create"
  | "update"
  | "delete"
  | "activity"
  | "notifRead"
  | "profile";

export interface QueuedMutation {
  id: string;
  timestamp: number;
  op: QueuedOp;
  resource?: string;
  entityId?: number;
  tempId?: number;
  body?: unknown;
  activity?: string;
  activityColor?: string;
}

export function isOnline(): boolean {
  return typeof navigator === "undefined" ? true : navigator.onLine;
}

export function onConnectivityChange(handler: (online: boolean) => void): () => void {
  if (typeof window === "undefined") return () => undefined;
  const on = () => handler(true);
  const off = () => handler(false);
  window.addEventListener("online", on);
  window.addEventListener("offline", off);
  return () => {
    window.removeEventListener("online", on);
    window.removeEventListener("offline", off);
  };
}

export function loadCache(
  userId?: number | null,
  projectId?: number | null
): OfflineCache | null {
  try {
    const key = cacheKey(userId ?? null, projectId ?? null);
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const cache = JSON.parse(raw) as OfflineCache;
    if (userId != null && cache.userId !== userId) return null;
    if (projectId != null && cache.projectId !== projectId) return null;
    return cache;
  } catch {
    return null;
  }
}

export function saveCache(cache: OfflineCache): void {
  localStorage.setItem(
    cacheKey(cache.userId, cache.projectId),
    JSON.stringify(cache)
  );
}

export function clearCache(userId?: number | null, projectId?: number | null): void {
  if (userId != null || projectId != null) {
    localStorage.removeItem(cacheKey(userId ?? null, projectId ?? null));
    return;
  }
  for (let i = localStorage.length - 1; i >= 0; i--) {
    const k = localStorage.key(i);
    if (k?.startsWith("builderos_offline_cache_")) localStorage.removeItem(k);
  }
}

export function getQueue(): QueuedMutation[] {
  try {
    const raw = localStorage.getItem(QUEUE_KEY);
    return raw ? (JSON.parse(raw) as QueuedMutation[]) : [];
  } catch {
    return [];
  }
}

export function setQueue(queue: QueuedMutation[]): void {
  if (queue.length) localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
  else localStorage.removeItem(QUEUE_KEY);
}

export function enqueue(entry: Omit<QueuedMutation, "id" | "timestamp">): string {
  const id = `q_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  const queue = getQueue();
  queue.push({ ...entry, id, timestamp: Date.now() });
  setQueue(queue);
  return id;
}

export function queueLength(): number {
  return getQueue().length;
}

function nextTempId(items: { id: number }[]): number {
  if (!items.length) return -1;
  const min = Math.min(...items.map((i) => i.id));
  return min > 0 ? -1 : min - 1;
}

/** Apply create/update/delete to a bootstrap collection in memory. */
export function mutateBootstrapCollection(
  boot: Record<string, unknown>,
  resource: string,
  op: "create" | "update" | "delete",
  data: Record<string, unknown>,
  entityId?: number
): { boot: Record<string, unknown>; result: Record<string, unknown> } {
  const next = { ...boot };
  const list = [...((next[resource] as Record<string, unknown>[]) || [])];

  if (op === "delete" && entityId != null) {
    next[resource] = list.filter((row) => row.id !== entityId);
    return { boot: next, result: { id: entityId } };
  }

  if (op === "update" && entityId != null) {
    const idx = list.findIndex((row) => row.id === entityId);
    const merged = idx >= 0 ? { ...list[idx], ...data, id: entityId } : { ...data, id: entityId };
    if (idx >= 0) list[idx] = merged;
    else list.push(merged);
    next[resource] = list;
    return { boot: next, result: merged };
  }

  const tempId = nextTempId(list as { id: number }[]);
  const created = { ...data, id: tempId };
  list.unshift(created);
  next[resource] = list;
  return { boot: next, result: created };
}

export function markNotificationInCache(
  boot: Record<string, unknown>,
  notifications: Notification[],
  id: number
): { bootstrap: Record<string, unknown>; notifications: Notification[] } {
  return {
    bootstrap: boot,
    notifications: notifications.map((n) => (n.id === id ? { ...n, read: true } : n)),
  };
}

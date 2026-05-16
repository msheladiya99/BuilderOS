import { api } from "./api";
import { getQueue, setQueue, type QueuedMutation } from "./offline-store";

export async function flushOfflineQueue(): Promise<{ synced: number; failed: number }> {
  const queue = getQueue();
  if (!queue.length) return { synced: 0, failed: 0 };

  const remaining: QueuedMutation[] = [];
  const idMap = new Map<number, number>();
  let synced = 0;
  let failed = 0;

  for (const item of queue) {
    try {
      await runQueuedItem(item, idMap);
      synced++;
    } catch {
      failed++;
      remaining.push(item);
    }
  }

  setQueue(remaining);
  return { synced, failed };
}

async function runQueuedItem(item: QueuedMutation, idMap: Map<number, number>): Promise<void> {
  const resolveId = (id?: number) => {
    if (id == null) return id;
    return idMap.get(id) ?? id;
  };

  switch (item.op) {
    case "create": {
      if (!item.resource || !item.body) throw new Error("Invalid create");
      const res = await api.create<Record<string, unknown>>(item.resource, item.body as Record<string, unknown>);
      if (item.tempId != null && res.id != null) idMap.set(item.tempId, res.id as number);
      break;
    }
    case "update": {
      if (!item.resource || item.entityId == null || !item.body) throw new Error("Invalid update");
      await api.update(item.resource, resolveId(item.entityId)!, item.body as Record<string, unknown>);
      break;
    }
    case "delete": {
      if (!item.resource || item.entityId == null) throw new Error("Invalid delete");
      await api.delete(item.resource, resolveId(item.entityId)!);
      break;
    }
    case "activity": {
      if (!item.activity) throw new Error("Invalid activity");
      await api.addActivity(item.activity, item.activityColor ?? "blue");
      break;
    }
    case "notifRead": {
      if (item.entityId == null) throw new Error("Invalid notif");
      await api.markNotificationRead(item.entityId);
      break;
    }
    case "profile": {
      await api.updateProfile((item.body ?? {}) as { name?: string; avatar?: string });
      break;
    }
    default:
      throw new Error("Unknown op");
  }
}

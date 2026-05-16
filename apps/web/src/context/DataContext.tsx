import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import { api } from "../lib/api";
import { flushOfflineQueue } from "../lib/offline-sync";
import {
  enqueue,
  isOnline,
  loadCache,
  markNotificationInCache,
  mutateBootstrapCollection,
  onConnectivityChange,
  queueLength,
  saveCache,
  type OfflineCache,
} from "../lib/offline-store";
import { useAuth } from "./AuthContext";
import type {
  Project,
  Unit,
  Customer,
  Lead,
  Payment,
  PendingDue,
  Material,
  PurchaseOrder,
  Contractor,
  WorkOrder,
  Ticket,
  MaintenanceBill,
  Voucher,
  DocumentFolder,
  DocumentFile,
  ErpUser,
  Notification,
  Activity,
  DashboardData,
  AppSettings,
  ConstructionStage,
  ConstructionLog,
  ConstructionPhoto,
} from "../types";

export type ResourceKey =
  | "projects"
  | "units"
  | "customers"
  | "leads"
  | "payments"
  | "pendingDues"
  | "materials"
  | "purchaseOrders"
  | "contractors"
  | "workOrders"
  | "tickets"
  | "maintenanceBills"
  | "vouchers"
  | "documentFolders"
  | "documentFiles"
  | "erpUsers"
  | "constructionStages"
  | "constructionLogs"
  | "constructionPhotos";

interface DataContextValue {
  loading: boolean;
  saving: boolean;
  syncing: boolean;
  isOffline: boolean;
  pendingChanges: number;
  lastSyncedAt: number | null;
  error: string | null;
  syncMessage: string | null;
  refresh: () => Promise<void>;
  persist: <T>(resource: ResourceKey, data: Partial<T>, id?: number, activity?: string) => Promise<T>;
  remove: (resource: ResourceKey, id: number, activity?: string) => Promise<void>;
  dashboard: DashboardData | null;
  projects: Project[];
  units: Unit[];
  customers: Customer[];
  leads: Lead[];
  payments: Payment[];
  pendingDues: PendingDue[];
  materials: Material[];
  purchaseOrders: PurchaseOrder[];
  contractors: Contractor[];
  workOrders: WorkOrder[];
  tickets: Ticket[];
  maintenanceBills: MaintenanceBill[];
  vouchers: Voucher[];
  documentFolders: DocumentFolder[];
  documentFiles: DocumentFile[];
  erpUsers: ErpUser[];
  constructionStages: ConstructionStage[];
  constructionLogs: ConstructionLog[];
  constructionPhotos: ConstructionPhoto[];
  settings: AppSettings | null;
  notifications: Notification[];
  activities: Activity[];
  selectedProjectId: number | null;
  setSelectedProjectId: (id: number | null) => void;
  markNotificationRead: (id: number) => Promise<void>;
}

const DataContext = createContext<DataContextValue | null>(null);

export function DataProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated, user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [isOffline, setIsOffline] = useState(!isOnline());
  const [pendingChanges, setPendingChanges] = useState(queueLength());
  const [lastSyncedAt, setLastSyncedAt] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [pendingDues, setPendingDues] = useState<PendingDue[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [contractors, setContractors] = useState<Contractor[]>([]);
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [maintenanceBills, setMaintenanceBills] = useState<MaintenanceBill[]>([]);
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [documentFolders, setDocumentFolders] = useState<DocumentFolder[]>([]);
  const [documentFiles, setDocumentFiles] = useState<DocumentFile[]>([]);
  const [erpUsers, setErpUsers] = useState<ErpUser[]>([]);
  const [constructionStages, setConstructionStages] = useState<ConstructionStage[]>([]);
  const [constructionLogs, setConstructionLogs] = useState<ConstructionLog[]>([]);
  const [constructionPhotos, setConstructionPhotos] = useState<ConstructionPhoto[]>([]);
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(1);
  const [cacheBoot, setCacheBoot] = useState<Record<string, unknown>>({});

  const applyBootstrap = useCallback((boot: Record<string, unknown>, userProjectId?: number | null) => {
    const projList = (boot.projects as Project[]) || [];
    setProjects(projList);
    if (userProjectId && projList.some((p) => p.id === userProjectId)) {
      setSelectedProjectId(userProjectId);
    } else if (projList.length === 1) {
      setSelectedProjectId(projList[0].id);
    }
    setUnits((boot.units as Unit[]) || []);
    setCustomers((boot.customers as Customer[]) || []);
    setLeads((boot.leads as Lead[]) || []);
    setPayments((boot.payments as Payment[]) || []);
    setPendingDues((boot.pendingDues as PendingDue[]) || []);
    setMaterials((boot.materials as Material[]) || []);
    setPurchaseOrders((boot.purchaseOrders as PurchaseOrder[]) || []);
    setContractors((boot.contractors as Contractor[]) || []);
    setWorkOrders((boot.workOrders as WorkOrder[]) || []);
    setTickets((boot.tickets as Ticket[]) || []);
    setMaintenanceBills((boot.maintenanceBills as MaintenanceBill[]) || []);
    setVouchers((boot.vouchers as Voucher[]) || []);
    setDocumentFolders((boot.documentFolders as DocumentFolder[]) || []);
    setDocumentFiles((boot.documentFiles as DocumentFile[]) || []);
    setErpUsers((boot.erpUsers as ErpUser[]) || []);
    setConstructionStages((boot.constructionStages as ConstructionStage[]) || []);
    setConstructionLogs((boot.constructionLogs as ConstructionLog[]) || []);
    setConstructionPhotos((boot.constructionPhotos as ConstructionPhoto[]) || []);
    setSettings((boot.settings as AppSettings) || null);
    setActivities((boot.activities as Activity[]) || []);
    setCacheBoot(boot);
  }, []);

  const applyCache = useCallback(
    (cache: OfflineCache) => {
      applyBootstrap(cache.bootstrap, user?.projectId);
      setDashboard(cache.dashboard);
      setNotifications(cache.notifications);
      setLastSyncedAt(cache.savedAt);
    },
    [applyBootstrap, user?.projectId]
  );

  const persistCache = useCallback(
    (boot: Record<string, unknown>, dash: DashboardData | null, notifs: Notification[]) => {
      if (!user) return;
      const payload: OfflineCache = {
        bootstrap: boot,
        dashboard: dash,
        notifications: notifs,
        savedAt: Date.now(),
        userId: user.id,
        projectId: user.projectId ?? null,
      };
      saveCache(payload);
      setLastSyncedAt(payload.savedAt);
    },
    [user]
  );

  const hydrateFromLocal = useCallback(() => {
    const cached = loadCache(user?.id ?? null, user?.projectId ?? null);
    if (cached) {
      applyCache(cached);
      return true;
    }
    return false;
  }, [applyCache, user?.id]);

  const refresh = useCallback(
    async (opts?: { silent?: boolean }) => {
      if (!isAuthenticated) return;
      if (!opts?.silent) setLoading(true);
      setError(null);

      if (!isOnline()) {
        hydrateFromLocal();
        setPendingChanges(queueLength());
        if (!opts?.silent) setLoading(false);
        return;
      }

      try {
        const [boot, dash, notifs] = await Promise.all([
          api.bootstrap(),
          api.dashboard(),
          api.notifications(),
        ]);
        applyBootstrap(boot, user?.projectId);
        setDashboard(dash);
        setNotifications(notifs);
        persistCache(boot, dash, notifs);
        setPendingChanges(queueLength());
      } catch (e) {
        const hydrated = hydrateFromLocal();
        if (!hydrated) {
          setError(e instanceof Error ? e.message : "Failed to load data");
        } else {
          setError(null);
        }
      } finally {
        if (!opts?.silent) setLoading(false);
      }
    },
    [isAuthenticated, user?.projectId, applyBootstrap, persistCache, hydrateFromLocal]
  );

  const runSync = useCallback(async () => {
    if (!isAuthenticated || !isOnline()) return;
    const pending = queueLength();
    if (pending === 0) {
      await refresh({ silent: true });
      return;
    }
    setSyncing(true);
    setSyncMessage("Syncing offline changes…");
    try {
      const { synced, failed } = await flushOfflineQueue();
      setPendingChanges(queueLength());
      await refresh({ silent: true });
      if (failed > 0) {
        setSyncMessage(`${synced} saved, ${failed} still pending`);
      } else if (synced > 0) {
        setSyncMessage(`Back online — ${synced} change${synced === 1 ? "" : "s"} synced`);
      } else {
        setSyncMessage("Back online — data updated");
      }
      setTimeout(() => setSyncMessage(null), 4000);
    } catch {
      setSyncMessage("Sync failed — will retry when online");
      setTimeout(() => setSyncMessage(null), 4000);
    } finally {
      setSyncing(false);
    }
  }, [isAuthenticated, refresh]);

  useEffect(() => {
    if (!isAuthenticated) return;
    hydrateFromLocal();
    refresh();
  }, [isAuthenticated]);

  useEffect(() => {
    return onConnectivityChange((online) => {
      setIsOffline(!online);
      if (online && isAuthenticated) runSync();
    });
  }, [isAuthenticated, runSync]);

  const persist = useCallback(
    async <T,>(resource: ResourceKey, data: Partial<T>, id?: number, activity?: string) => {
      setSaving(true);
      setError(null);
      try {
        if (!isOnline()) {
          const op = id ? "update" : "create";
          const { boot, result } = mutateBootstrapCollection(
            cacheBoot,
            resource,
            op,
            data as Record<string, unknown>,
            id
          );
          let nextBoot = boot;
          if (activity) {
            const act: Activity = {
              id: -Date.now(),
              text: activity,
              time: "now",
              color: "emerald",
            };
            const acts = [act, ...((nextBoot.activities as Activity[]) || [])].slice(0, 20);
            nextBoot = { ...nextBoot, activities: acts };
            enqueue({ op: "activity", activity, activityColor: "emerald" });
          }
          enqueue({
            op,
            resource,
            entityId: id,
            tempId: !id ? (result.id as number) : undefined,
            body: data,
          });
          applyBootstrap(nextBoot, user?.projectId);
          persistCache(nextBoot, dashboard, notifications);
          setPendingChanges(queueLength());
          return result as T;
        }

        const result = id
          ? await api.update<T>(resource, id, data)
          : await api.create<T>(resource, data);
        if (activity) await api.addActivity(activity, "emerald");
        await refresh({ silent: true });
        return result;
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Save failed";
        setError(msg);
        throw e;
      } finally {
        setSaving(false);
      }
    },
    [cacheBoot, dashboard, notifications, refresh, applyBootstrap, persistCache, user?.projectId]
  );

  const remove = useCallback(
    async (resource: ResourceKey, id: number, activity?: string) => {
      setSaving(true);
      try {
        if (!isOnline()) {
          const { boot } = mutateBootstrapCollection(cacheBoot, resource, "delete", {}, id);
          let nextBoot = boot;
          if (activity) {
            enqueue({ op: "activity", activity, activityColor: "orange" });
            const act: Activity = { id: -Date.now(), text: activity, time: "now", color: "orange" };
            const acts = [act, ...((nextBoot.activities as Activity[]) || [])].slice(0, 20);
            nextBoot = { ...nextBoot, activities: acts };
          }
          enqueue({ op: "delete", resource, entityId: id });
          applyBootstrap(nextBoot, user?.projectId);
          persistCache(nextBoot, dashboard, notifications);
          setPendingChanges(queueLength());
          return;
        }
        await api.delete(resource, id);
        if (activity) await api.addActivity(activity, "orange");
        await refresh({ silent: true });
      } finally {
        setSaving(false);
      }
    },
    [cacheBoot, dashboard, notifications, refresh, applyBootstrap, persistCache, user?.projectId]
  );

  const markNotificationRead = async (id: number) => {
    if (!isOnline()) {
      const { notifications: nextNotifs } = markNotificationInCache(cacheBoot, notifications, id);
      setNotifications(nextNotifs);
      persistCache(cacheBoot, dashboard, nextNotifs);
      enqueue({ op: "notifRead", entityId: id });
      setPendingChanges(queueLength());
      return;
    }
    await api.markNotificationRead(id);
    setNotifications((n) => n.map((x) => (x.id === id ? { ...x, read: true } : x)));
  };

  return (
    <DataContext.Provider
      value={{
        loading,
        saving,
        syncing,
        isOffline,
        pendingChanges,
        lastSyncedAt,
        error,
        syncMessage,
        refresh,
        persist,
        remove,
        dashboard,
        projects,
        units,
        customers,
        leads,
        payments,
        pendingDues,
        materials,
        purchaseOrders,
        contractors,
        workOrders,
        tickets,
        maintenanceBills,
        vouchers,
        documentFolders,
        documentFiles,
        erpUsers,
        constructionStages,
        constructionLogs,
        constructionPhotos,
        settings,
        notifications,
        activities,
        selectedProjectId,
        setSelectedProjectId,
        markNotificationRead,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error("useData must be used within DataProvider");
  return ctx;
}

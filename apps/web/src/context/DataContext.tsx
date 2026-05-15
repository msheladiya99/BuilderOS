import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import { api } from "../lib/api";
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
  | "erpUsers";

interface DataContextValue {
  loading: boolean;
  saving: boolean;
  error: string | null;
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
  const [error, setError] = useState<string | null>(null);
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
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(1);

  const applyBootstrap = (boot: Record<string, unknown>, userProjectId?: number | null) => {
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
    setSettings((boot.settings as AppSettings) || null);
    setActivities((boot.activities as Activity[]) || []);
  };

  const refresh = useCallback(async () => {
    if (!isAuthenticated) return;
    setLoading(true);
    setError(null);
    try {
      const [boot, dash, notifs] = await Promise.all([
        api.bootstrap(),
        api.dashboard(),
        api.notifications(),
      ]);
      applyBootstrap(boot, user?.projectId);
      setDashboard(dash);
      setNotifications(notifs);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load data");
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, user?.projectId]);

  useEffect(() => {
    if (isAuthenticated) refresh();
  }, [isAuthenticated, refresh]);

  const persist = useCallback(
    async <T,>(resource: ResourceKey, data: Partial<T>, id?: number, activity?: string) => {
      setSaving(true);
      setError(null);
      try {
        const result = id
          ? await api.update<T>(resource, id, data)
          : await api.create<T>(resource, data);
        if (activity) await api.addActivity(activity, "emerald");
        await refresh();
        return result;
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Save failed";
        setError(msg);
        throw e;
      } finally {
        setSaving(false);
      }
    },
    [refresh]
  );

  const remove = useCallback(
    async (resource: ResourceKey, id: number, activity?: string) => {
      setSaving(true);
      try {
        await api.delete(resource, id);
        if (activity) await api.addActivity(activity, "orange");
        await refresh();
      } finally {
        setSaving(false);
      }
    },
    [refresh]
  );

  const markNotificationRead = async (id: number) => {
    await api.markNotificationRead(id);
    setNotifications((n) => n.map((x) => (x.id === id ? { ...x, read: true } : x)));
  };

  return (
    <DataContext.Provider
      value={{
        loading,
        saving,
        error,
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

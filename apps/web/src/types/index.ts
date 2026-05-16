export type UserRole = "superadmin" | "admin" | "sales" | "accounts" | "site";

export interface User {
  id: number;
  email: string;
  name: string;
  role: UserRole;
  avatar: string;
  projectId?: number | null;
  subdomain?: string;
}

export interface Project {
  id: number;
  name: string;
  subdomain: string;
  type: string;
  location: string;
  rera: string;
  totalUnits: number;
  sold: number;
  booked: number;
  available: number;
  area: string;
  launched: string;
  completion: string;
  status: string;
  progress: number;
  revenue: string;
  image: string;
  stages: string[];
  currentStage: number;
}

export interface Unit {
  id: number;
  projectId: number;
  unit: string;
  floor: number;
  tower: string;
  type: string;
  area: number;
  status: string;
  owner: string;
  contact: string;
  price: string;
  paid: string;
  balance: string;
  booking: string;
  possession: string;
  facing: string;
}

export interface Customer {
  id: number;
  name: string;
  email: string;
  phone: string;
  city: string;
  unit: string;
  status: string;
  kyc: string;
  totalPaid: string;
  balance: string;
  joinDate: string;
  type: string;
}

export interface Lead {
  id: number;
  name: string;
  phone: string;
  email: string;
  stage: string;
  interest: string;
  budget: string;
  source: string;
  agent: string;
  date: string;
  priority: string;
}

export interface Payment {
  id: number;
  receipt: string;
  customer: string;
  unit: string;
  amount: string;
  date: string;
  mode: string;
  type: string;
  status?: string;
}

export interface PendingDue {
  id: number;
  customer: string;
  unit: string;
  due: string;
  dueDate: string;
  overdue: number;
  mobile: string;
  type: string;
  totalPaid: string;
}

export interface Material {
  id: number;
  name: string;
  unit: string;
  stock: number;
  minStock: number;
  ordered: number;
  cost: string;
  category: string;
  vendor: string;
  status: string;
}

export interface PurchaseOrder {
  id: number;
  poNo: string;
  vendor: string;
  items: string;
  value: string;
  date: string;
  delivery: string;
  status: string;
}

export interface Contractor {
  id: number;
  name: string;
  type: string;
  contact: string;
  workers: number;
  location: string;
  rate: string;
  status: string;
  totalBilled: string;
}

export interface WorkOrder {
  id: number;
  woNo: string;
  contractor: string;
  work: string;
  start: string;
  end: string;
  value: string;
  status: string;
}

export interface Ticket {
  id: number;
  ticketNo: string;
  unit: string;
  owner: string;
  issue: string;
  category: string;
  priority: string;
  status: string;
  reported: string;
  assigned: string;
}

export interface MaintenanceBill {
  id: number;
  billNo: string;
  owner: string;
  unit: string;
  month: string;
  amount: string;
  due: string;
  status: string;
}

export interface Voucher {
  id: number;
  voucherNo: string;
  date: string;
  type: string;
  party: string;
  desc: string;
  amount: string;
  dr: string;
  cr: string;
  status: string;
}

export interface DocumentFolder {
  id: number;
  name: string;
  count: number;
  size: string;
  updated: string;
}

export interface DocumentFile {
  id: number;
  folderId: number;
  name: string;
  type: string;
  size: string;
  date: string;
  expiry: string;
  category: string;
}

export interface ErpUser {
  id: number;
  name: string;
  email: string;
  role: string;
  status: string;
  lastLogin: string;
  joined: string;
}

export interface AppSettings {
  companyName: string;
  gstin: string;
  address: string;
  website: string;
}

export interface Notification {
  id: number;
  title: string;
  message: string;
  time: string;
  read: boolean;
  type: string;
}

export interface Activity {
  id: number;
  text: string;
  time: string;
  color: string;
}

export interface DashboardData {
  monthlyData: { month: string; revenue: number; expenses: number; bookings: number }[];
  projectData: { name: string; sold: number; available: number; booked: number }[];
  unitStatus: { name: string; value: number; color: string }[];
  recentPayments: Payment[];
  activities: Activity[];
  constructionProgress: { name: string; progress: number; stage: string }[];
  stats: {
    revenue: string;
    revenueChange: string;
    expenses: string;
    expensesChange: string;
    pendingDues: number;
    pendingAmount: string;
    unitsSold: number;
    unitsTotal: number;
    activeLeads: number;
  };
}

export type ViewId =
  | "superadmin"
  | "dashboard"
  | "projects"
  | "units"
  | "units-floorplan"
  | "customers"
  | "accounting"
  | "accounting-pl"
  | "accounting-balance"
  | "accounting-gst"
  | "payments"
  | "crm"
  | "inventory"
  | "labour"
  | "construction"
  | "documents"
  | "maintenance"
  | "users"
  | "owner"
  | "vendor"
  | "settings"
  | "profile"
  | "help";

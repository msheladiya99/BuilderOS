import { useState } from "react";
import { useAuth, canAccessView } from "../../../context/AuthContext";
import { useData } from "../../../context/DataContext";
import { isMainPortal } from "../../../lib/tenant";
import {
  LayoutDashboard, Building2, Grid3x3, Users, Calculator, CreditCard,
  ShoppingCart, HardHat, FileText, Shield, Wrench, Home, Truck,
  TrendingUp, ChevronDown, ChevronRight, Building, Settings,
  LogOut, X, Layers, BarChart3, ShieldCheck
} from "lucide-react";

type NavItem = {
  id: string;
  label: string;
  icon: React.ElementType;
  badge?: number;
  subItems?: { id: string; label: string }[];
};

const NAV_ITEMS: NavItem[] = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  {
    id: "projects", label: "Projects", icon: Building2,
    subItems: [
      { id: "projects", label: "All Projects" },
      { id: "construction", label: "Construction Tracker" },
    ]
  },
  {
    id: "units", label: "Unit Registry", icon: Grid3x3,
    subItems: [
      { id: "units", label: "Unit List" },
      { id: "units-floorplan", label: "Floor Plan" },
    ]
  },
  { id: "customers", label: "Customers", icon: Users },
  { id: "crm", label: "Sales CRM", icon: TrendingUp, badge: 12 },
  {
    id: "accounting", label: "Accounting", icon: Calculator,
    subItems: [
      { id: "accounting", label: "Overview" },
      { id: "accounting-pl", label: "P&L Statement" },
      { id: "accounting-balance", label: "Balance Sheet" },
      { id: "accounting-gst", label: "GST Summary" },
    ]
  },
  { id: "payments", label: "Payments", icon: CreditCard, badge: 5 },
  { id: "inventory", label: "Inventory", icon: ShoppingCart },
  { id: "labour", label: "Labour & Contracts", icon: HardHat },
  { id: "documents", label: "Documents", icon: FileText },
  { id: "maintenance", label: "Maintenance", icon: Wrench },
  { id: "users", label: "Users & Roles", icon: Shield },
];

const PORTAL_ITEMS: NavItem[] = [
  { id: "owner", label: "Owner Portal", icon: Home },
  { id: "vendor", label: "Vendor Portal", icon: Truck },
];

const SUPER_ADMIN_ITEM: NavItem = {
  id: "superadmin",
  label: "Super Admin",
  icon: ShieldCheck,
};

type SidebarProps = {
  currentView: string;
  onNavigate: (view: string) => void;
  isOpen: boolean;
  onClose: () => void;
  isDark: boolean;
  onLogout?: () => void;
};

export function Sidebar({ currentView, onNavigate, isOpen, onClose, isDark, onLogout }: SidebarProps) {
  const { user, hasRole } = useAuth();
  const { projects, selectedProjectId, setSelectedProjectId } = useData();
  const isTenantPortal = !isMainPortal() || Boolean(user?.projectId);
  const [expandedItems, setExpandedItems] = useState<string[]>(isTenantPortal ? [] : ["projects"]);
  const [showProjectMenu, setShowProjectMenu] = useState(false);
  const selectedProject =
    projects.find((p) => p.id === selectedProjectId) ||
    projects.find((p) => p.id === user?.projectId) ||
    projects[0];

  const navItems: NavItem[] = NAV_ITEMS.map((item) => {
    if (!isTenantPortal || item.id !== "projects" || !item.subItems) return item;
    const subItems = [
      { id: "projects", label: "Overview" },
      ...item.subItems.filter(
        (s) => s.id !== "projects" && (!user || canAccessView(user.role, s.id))
      ),
    ];
    return {
      ...item,
      label: "Project",
      subItems: subItems.length > 1 ? subItems : undefined,
      ...(subItems.length === 1 ? { id: "projects" as const } : {}),
    };
  }).map((item) => {
    if (!isTenantPortal || item.id !== "projects" || item.subItems) return item;
    return { ...item, label: "Project Overview" };
  });

  const toggleExpanded = (id: string) => {
    setExpandedItems(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const isActive = (item: NavItem) => {
    if (item.subItems) return item.subItems.some(s => s.id === currentView) || currentView === item.id;
    return currentView === item.id;
  };

  const NavItemComponent = ({ item }: { item: NavItem }) => {
    const active = isActive(item);
    const expanded = expandedItems.includes(item.id);
    const Icon = item.icon;

    return (
      <div>
        <button
          onClick={() => {
            if (item.subItems) {
              toggleExpanded(item.id);
            } else {
              onNavigate(item.id);
              onClose();
            }
          }}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-150 group ${
            active
              ? "bg-blue-600 text-white"
              : isDark
              ? "text-slate-400 hover:text-white hover:bg-slate-700/60"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          }`}
        >
          <Icon size={16} className={active ? "text-white" : ""} />
          <span className="flex-1 text-left">{item.label}</span>
          {item.badge && (
            <span className={`text-xs px-1.5 py-0.5 rounded-full ${active ? "bg-blue-500 text-white" : "bg-blue-100 text-blue-700"}`}>
              {item.badge}
            </span>
          )}
          {item.subItems && (
            expanded
              ? <ChevronDown size={14} className="opacity-60" />
              : <ChevronRight size={14} className="opacity-60" />
          )}
        </button>
        {item.subItems && expanded && (
          <div className="ml-6 mt-0.5 space-y-0.5 border-l border-slate-700/40 pl-3">
            {item.subItems.map(sub => (
              <button
                key={sub.id}
                onClick={() => { onNavigate(sub.id); onClose(); }}
                className={`w-full text-left px-2 py-1.5 rounded text-xs transition-colors ${
                  currentView === sub.id
                    ? "text-blue-400 font-medium"
                    : isDark
                    ? "text-slate-500 hover:text-slate-300"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                {sub.label}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={onClose} />
      )}

      <aside className={`fixed inset-y-0 left-0 z-50 w-60 flex flex-col transition-transform duration-300 lg:translate-x-0 lg:static lg:z-auto ${
        isOpen ? "translate-x-0" : "-translate-x-full"
      } ${isDark ? "bg-slate-900 border-r border-slate-700/50" : "bg-slate-900 border-r border-slate-800"}`}>

        {/* Logo */}
        <div className="flex items-center justify-between px-4 py-4 border-b border-slate-700/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Building size={16} className="text-white" />
            </div>
            <div>
              <div className="text-white font-semibold text-sm leading-none">BuilderOS</div>
              <div className="text-slate-500 text-xs mt-0.5">Enterprise ERP</div>
            </div>
          </div>
          <button onClick={onClose} className="lg:hidden text-slate-400 hover:text-white">
            <X size={18} />
          </button>
        </div>

        {/* Project context — tenant: fixed; platform: switcher */}
        <div className="px-3 py-3 border-b border-slate-700/50 relative">
          {isTenantPortal ? (
            <div className="flex items-center gap-2 px-3 py-2 bg-slate-800 rounded-lg">
              <div className="w-5 h-5 bg-blue-500 rounded-md flex items-center justify-center flex-shrink-0">
                <Layers size={11} className="text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-slate-200 text-xs font-medium truncate">
                  {selectedProject?.name || "Your Project"}
                </div>
                <div className="text-slate-500 text-[10px] truncate">
                  {user?.subdomain ? `${user.subdomain}.builderos.in` : "Project portal"}
                </div>
              </div>
            </div>
          ) : (
          <>
          <button
            type="button"
            onClick={() => setShowProjectMenu(!showProjectMenu)}
            className="w-full flex items-center gap-2 px-3 py-2 bg-slate-800 hover:bg-slate-700/80 rounded-lg transition-colors"
          >
            <div className="w-5 h-5 bg-blue-500 rounded-md flex items-center justify-center flex-shrink-0">
              <Layers size={11} className="text-white" />
            </div>
            <span className="text-slate-200 text-xs flex-1 text-left truncate">{selectedProject?.name || "All Projects"}</span>
            <ChevronDown size={12} className="text-slate-400" />
          </button>
          {showProjectMenu && (
            <div className="absolute left-3 right-3 top-14 bg-slate-800 border border-slate-700 rounded-lg shadow-xl z-10 overflow-hidden">
              {projects.map(p => (
                <button
                  key={p.id}
                  onClick={() => { setSelectedProjectId(p.id); setShowProjectMenu(false); }}
                  className={`w-full text-left px-3 py-2 text-xs transition-colors ${
                    p.id === selectedProject?.id ? "bg-blue-600 text-white" : "text-slate-300 hover:bg-slate-700"
                  }`}
                >
                  {p.name}
                </button>
              ))}
              {hasRole("superadmin") && (
                <div className="border-t border-slate-700">
                  <button
                    type="button"
                    onClick={() => { onNavigate("superadmin"); setShowProjectMenu(false); onClose(); }}
                    className="w-full text-left px-3 py-2 text-xs text-violet-400 hover:bg-slate-700"
                  >
                    + Add New Project
                  </button>
                </div>
              )}
            </div>
          )}
          </>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-3 space-y-0.5 overflow-y-auto scrollbar-thin">
          {hasRole("superadmin") && (
            <>
              <div className="text-slate-600 text-xs font-medium px-3 py-1.5 uppercase tracking-wider">Platform</div>
              <NavItemComponent item={SUPER_ADMIN_ITEM} />
            </>
          )}
          <div className="text-slate-600 text-xs font-medium px-3 py-1.5 uppercase tracking-wider">Main</div>
          {navItems
            .filter((item) => !user || canAccessView(user.role, item.id))
            .map((item) => (
              <NavItemComponent key={item.id} item={item} />
            ))}
          <div className="pt-2 pb-1">
            <div className="text-slate-600 text-xs font-medium px-3 py-1.5 uppercase tracking-wider">Portals</div>
            {PORTAL_ITEMS.filter((item) => !user || canAccessView(user.role, item.id)).map(item => (
              <NavItemComponent key={item.id} item={item} />
            ))}
          </div>
        </nav>

        {/* Bottom */}
        <div className="px-3 py-3 border-t border-slate-700/50 space-y-0.5">
          <button
            onClick={() => { onNavigate("settings"); onClose(); }}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
              currentView === "settings"
                ? "bg-blue-600 text-white"
                : "text-slate-400 hover:text-white hover:bg-slate-700/60"
            }`}
          >
            <Settings size={16} />
            <span>Settings</span>
          </button>
          <div className={`flex items-center gap-3 px-3 py-2 rounded-lg`}>
            <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-medium flex-shrink-0">
              {user?.avatar || "U"}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-slate-300 text-xs font-medium truncate">{user?.name || "User"}</div>
              <div className="text-slate-500 text-xs truncate capitalize">{user?.role || "Guest"}</div>
            </div>
            <button onClick={onLogout} className="text-slate-500 hover:text-red-400 transition-colors">
              <LogOut size={14} />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}

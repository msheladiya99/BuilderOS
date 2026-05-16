import { useState, useEffect, useRef } from "react";
import {
  Search, Bell, Sun, Moon, Menu, ChevronRight,
  Check, AlertTriangle, Info, X, User, Settings, LogOut, HelpCircle
} from "lucide-react";
import { useAuth } from "../../../context/AuthContext";
import { useData } from "../../../context/DataContext";
import type { Notification } from "../../../types";

const BREADCRUMB_MAP: Record<string, string[]> = {
  superadmin: ["Super Admin", "All Projects"],
  dashboard: ["Dashboard"],
  projects: ["Projects", "All Projects"],
  "projects-create": ["Projects", "Create Project"],
  units: ["Unit Registry", "Unit List"],
  "units-floorplan": ["Unit Registry", "Floor Plan"],
  customers: ["Customers"],
  accounting: ["Accounting", "Overview"],
  "accounting-pl": ["Accounting", "P&L Statement"],
  "accounting-balance": ["Accounting", "Balance Sheet"],
  "accounting-gst": ["Accounting", "GST Summary"],
  payments: ["Payments"],
  crm: ["Sales CRM"],
  inventory: ["Inventory"],
  labour: ["Labour & Contracts"],
  construction: ["Construction Tracker"],
  documents: ["Documents"],
  maintenance: ["Maintenance"],
  users: ["Users & Roles"],
  owner: ["Owner Portal"],
  vendor: ["Vendor Portal"],
  settings: ["Settings"],
  profile: ["My Profile"],
  help: ["Help & Support"],
};

const ROLE_LABELS: Record<string, string> = {
  superadmin: "Super Admin",
  admin: "Admin",
  sales: "Sales",
  accounts: "Accounts",
  site: "Site",
};

const SEARCH_ACTIONS: { label: string; view: string }[] = [
  { label: "View Dashboard", view: "dashboard" },
  { label: "Create New Project", view: "projects" },
  { label: "Add Customer", view: "customers" },
  { label: "Generate Payment Report", view: "payments" },
  { label: "View Pending Dues", view: "payments" },
];

type TopBarProps = {
  currentView: string;
  isDark: boolean;
  onToggleDark: () => void;
  onMenuToggle: () => void;
  onNavigate: (view: string) => void;
  onLogout: () => void;
};

function notifUiType(type: string): "success" | "warning" | "info" {
  if (type === "payment" || type === "success") return "success";
  if (type === "inventory" || type === "warning" || type === "crm") return "warning";
  return "info";
}

export function TopBar({
  currentView,
  isDark,
  onToggleDark,
  onMenuToggle,
  onNavigate,
  onLogout,
}: TopBarProps) {
  const { user } = useAuth();
  const { notifications: apiNotifications, markNotificationRead } = useData();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [localNotifications, setLocalNotifications] = useState<Notification[]>([]);
  const headerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setLocalNotifications(apiNotifications);
  }, [apiNotifications]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setShowSearch(true);
        setShowUserMenu(false);
        setShowNotifications(false);
      }
      if (e.key === "Escape") {
        setShowSearch(false);
        setShowUserMenu(false);
        setShowNotifications(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (headerRef.current && !headerRef.current.contains(e.target as Node)) {
        setShowUserMenu(false);
        setShowNotifications(false);
      }
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  const unread = localNotifications.filter((n) => !n.read).length;
  const breadcrumbs = BREADCRUMB_MAP[currentView] || ["Dashboard"];
  const displayName = user?.name ?? "User";
  const displayEmail = user?.email ?? "";
  const displayAvatar = user?.avatar ?? displayName.slice(0, 2).toUpperCase();
  const displayRole = user ? (ROLE_LABELS[user.role] ?? user.role) : "";

  const markAllRead = async () => {
    const unreadItems = localNotifications.filter((n) => !n.read);
    setLocalNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    await Promise.all(unreadItems.map((n) => markNotificationRead(n.id).catch(() => undefined)));
  };

  const handleNotifClick = async (n: Notification) => {
    if (!n.read) {
      setLocalNotifications((prev) => prev.map((x) => (x.id === n.id ? { ...x, read: true } : x)));
      await markNotificationRead(n.id).catch(() => undefined);
    }
  };

  const closeMenus = () => {
    setShowUserMenu(false);
    setShowNotifications(false);
  };

  const goTo = (view: string) => {
    closeMenus();
    setShowSearch(false);
    onNavigate(view);
  };

  const handleUserAction = (action: "profile" | "settings" | "help" | "logout") => {
    closeMenus();
    if (action === "logout") onLogout();
    else onNavigate(action);
  };

  const filteredSearch = SEARCH_ACTIONS.filter((a) =>
    a.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const NotifIcon = ({ type }: { type: "success" | "warning" | "info" }) => {
    if (type === "success") return <Check size={12} className="text-emerald-600" />;
    if (type === "warning") return <AlertTriangle size={12} className="text-orange-500" />;
    return <Info size={12} className="text-blue-500" />;
  };

  return (
    <header
      ref={headerRef}
      className={`h-14 border-b flex items-center gap-4 px-4 sticky top-0 z-30 ${
        isDark ? "bg-slate-900 border-slate-700/50" : "bg-white border-slate-200"
      }`}
    >
      <button
        type="button"
        onClick={onMenuToggle}
        className="lg:hidden text-slate-500 hover:text-slate-700 dark:hover:text-white"
      >
        <Menu size={20} />
      </button>

      <div className="flex items-center gap-1.5 flex-1 min-w-0">
        {breadcrumbs.map((crumb, i) => (
          <div key={i} className="flex items-center gap-1.5">
            {i > 0 && <ChevronRight size={14} className="text-slate-400" />}
            <span
              className={`text-sm ${
                i === breadcrumbs.length - 1
                  ? isDark
                    ? "text-white font-medium"
                    : "text-slate-800 font-medium"
                  : "text-slate-500"
              }`}
            >
              {crumb}
            </span>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => {
            setShowSearch(true);
            setShowUserMenu(false);
            setShowNotifications(false);
          }}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors ${
            isDark
              ? "bg-slate-800 text-slate-400 hover:text-white border border-slate-700"
              : "bg-slate-100 text-slate-500 hover:text-slate-700 border border-transparent"
          }`}
        >
          <Search size={14} />
          <span className="hidden sm:inline text-xs">Search...</span>
          <kbd className="hidden sm:inline text-xs bg-slate-700/50 text-slate-500 px-1.5 py-0.5 rounded">⌘K</kbd>
        </button>

        <button
          type="button"
          onClick={onToggleDark}
          className={`p-2 rounded-lg transition-colors ${
            isDark ? "text-slate-400 hover:text-white hover:bg-slate-800" : "text-slate-500 hover:text-slate-700 hover:bg-slate-100"
          }`}
        >
          {isDark ? <Sun size={16} /> : <Moon size={16} />}
        </button>

        <div className="relative">
          <button
            type="button"
            onClick={() => {
              setShowNotifications(!showNotifications);
              setShowUserMenu(false);
            }}
            className={`relative p-2 rounded-lg transition-colors ${
              isDark ? "text-slate-400 hover:text-white hover:bg-slate-800" : "text-slate-500 hover:text-slate-700 hover:bg-slate-100"
            }`}
          >
            <Bell size={16} />
            {unread > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center leading-none">
                {unread > 9 ? "9+" : unread}
              </span>
            )}
          </button>

          {showNotifications && (
            <div
              className={`absolute right-0 top-10 w-80 rounded-xl shadow-2xl border z-50 overflow-hidden ${
                isDark ? "bg-slate-900 border-slate-700" : "bg-white border-slate-200"
              }`}
            >
              <div className={`flex items-center justify-between px-4 py-3 border-b ${isDark ? "border-slate-700" : "border-slate-100"}`}>
                <div>
                  <div className={`text-sm font-semibold ${isDark ? "text-white" : "text-slate-800"}`}>Notifications</div>
                  <div className="text-xs text-slate-500">{unread} unread</div>
                </div>
                <div className="flex items-center gap-2">
                  {unread > 0 && (
                    <button type="button" onClick={markAllRead} className="text-xs text-blue-500 hover:text-blue-600">
                      Mark all read
                    </button>
                  )}
                  <button type="button" onClick={() => setShowNotifications(false)} className="text-slate-400 hover:text-slate-600">
                    <X size={14} />
                  </button>
                </div>
              </div>
              <div className="max-h-80 overflow-y-auto">
                {localNotifications.length === 0 ? (
                  <p className="text-xs text-slate-500 px-4 py-6 text-center">No notifications</p>
                ) : (
                  localNotifications.map((n) => {
                    const uiType = notifUiType(n.type);
                    return (
                      <button
                        key={n.id}
                        type="button"
                        onClick={() => handleNotifClick(n)}
                        className={`w-full flex gap-3 px-4 py-3 border-b transition-colors text-left ${
                          isDark
                            ? `border-slate-800 ${!n.read ? "bg-blue-950/30" : "hover:bg-slate-800/50"}`
                            : `border-slate-50 ${!n.read ? "bg-blue-50/60" : "hover:bg-slate-50"}`
                        }`}
                      >
                        <div
                          className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                            uiType === "success" ? "bg-emerald-100" : uiType === "warning" ? "bg-orange-100" : "bg-blue-100"
                          }`}
                        >
                          <NotifIcon type={uiType} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className={`text-xs font-medium ${isDark ? "text-white" : "text-slate-800"}`}>{n.title}</div>
                          <div className="text-xs text-slate-500 mt-0.5 truncate">{n.message}</div>
                          <div className="text-xs text-slate-400 mt-1">{n.time}</div>
                        </div>
                        {!n.read && <div className="w-2 h-2 bg-blue-500 rounded-full mt-1.5 flex-shrink-0" />}
                      </button>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>

        <div className="relative">
          <button
            type="button"
            onClick={() => {
              setShowUserMenu(!showUserMenu);
              setShowNotifications(false);
            }}
            className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-medium">
              {displayAvatar}
            </div>
            <div className="hidden sm:block text-left">
              <div className={`text-xs font-medium leading-none ${isDark ? "text-white" : "text-slate-800"}`}>{displayName}</div>
              <div className="text-xs text-slate-500 mt-0.5">{displayRole}</div>
            </div>
          </button>

          {showUserMenu && (
            <div
              className={`absolute right-0 top-10 w-52 rounded-xl shadow-2xl border z-[100] overflow-hidden ${
                isDark ? "bg-slate-900 border-slate-700" : "bg-white border-slate-200"
              }`}
              onClick={(e) => e.stopPropagation()}
            >
              <div className={`px-4 py-3 border-b ${isDark ? "border-slate-700" : "border-slate-100"}`}>
                <div className={`text-sm font-medium ${isDark ? "text-white" : "text-slate-800"}`}>{displayName}</div>
                <div className="text-xs text-slate-500 truncate">{displayEmail}</div>
              </div>
              {[
                { icon: User, label: "My Profile", action: "profile" as const },
                { icon: Settings, label: "Settings", action: "settings" as const },
                { icon: HelpCircle, label: "Help & Support", action: "help" as const },
              ].map(({ icon: Icon, label, action }) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => handleUserAction(action)}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${
                    isDark ? "text-slate-300 hover:bg-slate-800" : "text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  <Icon size={14} />
                  {label}
                </button>
              ))}
              <div className={`border-t ${isDark ? "border-slate-700" : "border-slate-100"}`}>
                <button
                  type="button"
                  onClick={() => handleUserAction("logout")}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                >
                  <LogOut size={14} />
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {showSearch && (
        <div
          className="fixed inset-0 bg-black/60 z-50 flex items-start justify-center pt-24"
          onClick={() => setShowSearch(false)}
          role="presentation"
        >
          <div
            className={`w-full max-w-xl rounded-2xl shadow-2xl border overflow-hidden ${
              isDark ? "bg-slate-900 border-slate-700" : "bg-white border-slate-200"
            }`}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-label="Search"
          >
            <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-200 dark:border-slate-700">
              <Search size={18} className="text-slate-400" />
              <input
                autoFocus
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search projects, units, customers..."
                className={`flex-1 text-sm bg-transparent outline-none ${isDark ? "text-white placeholder-slate-500" : "text-slate-800 placeholder-slate-400"}`}
              />
              <kbd className="text-xs text-slate-400 border border-slate-300 dark:border-slate-700 px-1.5 py-0.5 rounded">ESC</kbd>
            </div>
            <div className="p-3">
              <div className="text-xs text-slate-500 px-2 py-1.5">Quick Actions</div>
              {(filteredSearch.length ? filteredSearch : SEARCH_ACTIONS).map((action) => (
                <button
                  key={action.label}
                  type="button"
                  onClick={() => goTo(action.view)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                    isDark ? "text-slate-300 hover:bg-slate-800" : "text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  {action.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

import { useState } from "react";
import {
  Search, Bell, Sun, Moon, Menu, ChevronRight,
  Check, AlertTriangle, Info, X, User, Settings, LogOut, HelpCircle
} from "lucide-react";

type Notification = {
  id: number;
  type: "success" | "warning" | "info";
  title: string;
  desc: string;
  time: string;
  read: boolean;
};

const NOTIFICATIONS: Notification[] = [
  { id: 1, type: "success", title: "Payment Received", desc: "₹8.5L received from Rahul Sharma - Unit 304", time: "2m ago", read: false },
  { id: 2, type: "warning", title: "EMI Overdue", desc: "3 customers have overdue EMI payments", time: "1h ago", read: false },
  { id: 3, type: "info", title: "Construction Update", desc: "Block B Slab casting completed - Floor 7", time: "3h ago", read: false },
  { id: 4, type: "warning", title: "Low Stock Alert", desc: "Steel TMT bars below minimum threshold", time: "5h ago", read: true },
  { id: 5, type: "success", title: "New Booking", desc: "Unit 502 booked by Priya Patel", time: "1d ago", read: true },
];

const BREADCRUMB_MAP: Record<string, string[]> = {
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
};

type TopBarProps = {
  currentView: string;
  isDark: boolean;
  onToggleDark: () => void;
  onMenuToggle: () => void;
};

export function TopBar({ currentView, isDark, onToggleDark, onMenuToggle }: TopBarProps) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [notifications, setNotifications] = useState(NOTIFICATIONS);

  const unread = notifications.filter(n => !n.read).length;
  const breadcrumbs = BREADCRUMB_MAP[currentView] || ["Dashboard"];

  const markAllRead = () => setNotifications(prev => prev.map(n => ({ ...n, read: true })));

  const NotifIcon = ({ type }: { type: Notification["type"] }) => {
    if (type === "success") return <Check size={12} className="text-emerald-600" />;
    if (type === "warning") return <AlertTriangle size={12} className="text-orange-500" />;
    return <Info size={12} className="text-blue-500" />;
  };

  return (
    <header className={`h-14 border-b flex items-center gap-4 px-4 sticky top-0 z-30 ${
      isDark ? "bg-slate-900 border-slate-700/50" : "bg-white border-slate-200"
    }`}>
      {/* Mobile menu */}
      <button onClick={onMenuToggle} className="lg:hidden text-slate-500 hover:text-slate-700 dark:hover:text-white">
        <Menu size={20} />
      </button>

      {/* Breadcrumbs */}
      <div className="flex items-center gap-1.5 flex-1 min-w-0">
        {breadcrumbs.map((crumb, i) => (
          <div key={i} className="flex items-center gap-1.5">
            {i > 0 && <ChevronRight size={14} className="text-slate-400" />}
            <span className={`text-sm ${
              i === breadcrumbs.length - 1
                ? isDark ? "text-white font-medium" : "text-slate-800 font-medium"
                : "text-slate-500"
            }`}>
              {crumb}
            </span>
          </div>
        ))}
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-2">
        {/* Search */}
        <button
          onClick={() => setShowSearch(true)}
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

        {/* Dark mode */}
        <button
          onClick={onToggleDark}
          className={`p-2 rounded-lg transition-colors ${
            isDark ? "text-slate-400 hover:text-white hover:bg-slate-800" : "text-slate-500 hover:text-slate-700 hover:bg-slate-100"
          }`}
        >
          {isDark ? <Sun size={16} /> : <Moon size={16} />}
        </button>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => { setShowNotifications(!showNotifications); setShowUserMenu(false); }}
            className={`relative p-2 rounded-lg transition-colors ${
              isDark ? "text-slate-400 hover:text-white hover:bg-slate-800" : "text-slate-500 hover:text-slate-700 hover:bg-slate-100"
            }`}
          >
            <Bell size={16} />
            {unread > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center leading-none">
                {unread}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className={`absolute right-0 top-10 w-80 rounded-xl shadow-2xl border z-50 overflow-hidden ${
              isDark ? "bg-slate-900 border-slate-700" : "bg-white border-slate-200"
            }`}>
              <div className={`flex items-center justify-between px-4 py-3 border-b ${isDark ? "border-slate-700" : "border-slate-100"}`}>
                <div>
                  <div className={`text-sm font-semibold ${isDark ? "text-white" : "text-slate-800"}`}>Notifications</div>
                  <div className="text-xs text-slate-500">{unread} unread</div>
                </div>
                <div className="flex items-center gap-2">
                  {unread > 0 && (
                    <button onClick={markAllRead} className="text-xs text-blue-500 hover:text-blue-600">Mark all read</button>
                  )}
                  <button onClick={() => setShowNotifications(false)} className="text-slate-400 hover:text-slate-600">
                    <X size={14} />
                  </button>
                </div>
              </div>
              <div className="max-h-80 overflow-y-auto">
                {notifications.map(n => (
                  <div key={n.id} className={`flex gap-3 px-4 py-3 border-b transition-colors cursor-pointer ${
                    isDark
                      ? `border-slate-800 ${!n.read ? "bg-blue-950/30" : "hover:bg-slate-800/50"}`
                      : `border-slate-50 ${!n.read ? "bg-blue-50/60" : "hover:bg-slate-50"}`
                  }`}>
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                      n.type === "success" ? "bg-emerald-100" : n.type === "warning" ? "bg-orange-100" : "bg-blue-100"
                    }`}>
                      <NotifIcon type={n.type} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className={`text-xs font-medium ${isDark ? "text-white" : "text-slate-800"}`}>{n.title}</div>
                      <div className="text-xs text-slate-500 mt-0.5 truncate">{n.desc}</div>
                      <div className="text-xs text-slate-400 mt-1">{n.time}</div>
                    </div>
                    {!n.read && <div className="w-2 h-2 bg-blue-500 rounded-full mt-1.5 flex-shrink-0" />}
                  </div>
                ))}
              </div>
              <div className={`px-4 py-2 ${isDark ? "border-t border-slate-700" : "border-t border-slate-100"}`}>
                <button className="text-xs text-blue-500 hover:text-blue-600 w-full text-center">View all notifications</button>
              </div>
            </div>
          )}
        </div>

        {/* User */}
        <div className="relative">
          <button
            onClick={() => { setShowUserMenu(!showUserMenu); setShowNotifications(false); }}
            className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-medium">
              AK
            </div>
            <div className="hidden sm:block text-left">
              <div className={`text-xs font-medium leading-none ${isDark ? "text-white" : "text-slate-800"}`}>Arjun Kumar</div>
              <div className="text-xs text-slate-500 mt-0.5">Admin</div>
            </div>
          </button>

          {showUserMenu && (
            <div className={`absolute right-0 top-10 w-52 rounded-xl shadow-2xl border z-50 overflow-hidden ${
              isDark ? "bg-slate-900 border-slate-700" : "bg-white border-slate-200"
            }`}>
              <div className={`px-4 py-3 border-b ${isDark ? "border-slate-700" : "border-slate-100"}`}>
                <div className={`text-sm font-medium ${isDark ? "text-white" : "text-slate-800"}`}>Arjun Kumar</div>
                <div className="text-xs text-slate-500">arjun@builderos.in</div>
              </div>
              {[
                { icon: User, label: "My Profile" },
                { icon: Settings, label: "Settings" },
                { icon: HelpCircle, label: "Help & Support" },
              ].map(({ icon: Icon, label }) => (
                <button key={label} className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${
                  isDark ? "text-slate-300 hover:bg-slate-800" : "text-slate-700 hover:bg-slate-50"
                }`}>
                  <Icon size={14} />
                  {label}
                </button>
              ))}
              <div className={`border-t ${isDark ? "border-slate-700" : "border-slate-100"}`}>
                <button className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors">
                  <LogOut size={14} />
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Search overlay */}
      {showSearch && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-start justify-center pt-24" onClick={() => setShowSearch(false)}>
          <div className={`w-full max-w-xl rounded-2xl shadow-2xl border overflow-hidden ${
            isDark ? "bg-slate-900 border-slate-700" : "bg-white border-slate-200"
          }`} onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-200 dark:border-slate-700">
              <Search size={18} className="text-slate-400" />
              <input
                autoFocus
                placeholder="Search projects, units, customers..."
                className={`flex-1 text-sm bg-transparent outline-none ${isDark ? "text-white placeholder-slate-500" : "text-slate-800 placeholder-slate-400"}`}
              />
              <kbd className="text-xs text-slate-400 border border-slate-300 dark:border-slate-700 px-1.5 py-0.5 rounded">ESC</kbd>
            </div>
            <div className="p-3">
              <div className="text-xs text-slate-500 px-2 py-1.5">Quick Actions</div>
              {["View Dashboard", "Create New Project", "Add Customer", "Generate Payment Report", "View Pending Dues"].map(action => (
                <button key={action} className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                  isDark ? "text-slate-300 hover:bg-slate-800" : "text-slate-700 hover:bg-slate-100"
                }`}>
                  {action}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

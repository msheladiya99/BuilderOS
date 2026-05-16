import { useState, useEffect } from "react";
import { Outlet, useNavigate, useLocation } from "react-router";
import { Sidebar } from "../components/layout/Sidebar";
import { TopBar } from "../components/layout/TopBar";
import { useTheme } from "../../context/ThemeContext";
import { useData } from "../../context/DataContext";
import { useAuth, canAccessView } from "../../context/AuthContext";
import { isMainPortal } from "../../lib/tenant";
import { Loader2, CloudOff, RefreshCw, CheckCircle2 } from "lucide-react";
import type { ViewId } from "../../types";

function pathToView(path: string): ViewId {
  const segment = path.replace(/^\//, "").split("/")[0] || "dashboard";
  return (segment || "dashboard") as ViewId;
}

export function AppLayout() {
  const { isDark, toggleDark } = useTheme();
  const { user, logout } = useAuth();
  const { loading, error, refresh, isOffline, syncing, pendingChanges, syncMessage } = useData();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const currentView = pathToView(location.pathname);

  useEffect(() => {
    if (!user) return;
    if (
      isMainPortal() &&
      user.role === "superadmin" &&
      currentView !== "superadmin" &&
      currentView !== "settings" &&
      currentView !== "users" &&
      currentView !== "profile" &&
      currentView !== "help"
    ) {
      if (currentView === "dashboard") navigate("/superadmin", { replace: true });
    }
    if (!canAccessView(user.role, currentView)) {
      navigate(user.role === "superadmin" ? "/superadmin" : "/dashboard", { replace: true });
    }
  }, [user, currentView, navigate]);

  const handleNavigate = (view: string) => {
    navigate(view === "dashboard" ? "/dashboard" : `/${view}`);
    setSidebarOpen(false);
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className={`flex h-screen overflow-hidden ${isDark ? "bg-slate-950" : "bg-slate-50"}`}>
      <Sidebar
        currentView={currentView}
        onNavigate={handleNavigate}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        isDark={isDark}
        onLogout={handleLogout}
      />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <TopBar
          currentView={currentView}
          isDark={isDark}
          onToggleDark={toggleDark}
          onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
          onNavigate={handleNavigate}
          onLogout={handleLogout}
        />

        {isOffline && (
          <div className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white text-xs">
            <CloudOff size={14} />
            <span>
              Offline mode — using saved data
              {pendingChanges > 0 ? ` · ${pendingChanges} pending sync` : ""}
            </span>
          </div>
        )}

        {syncing && (
          <div className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-xs">
            <RefreshCw size={14} className="animate-spin" />
            <span>Syncing with server…</span>
          </div>
        )}

        {!isOffline && syncMessage && !syncing && (
          <div className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white text-xs">
            <CheckCircle2 size={14} />
            <span>{syncMessage}</span>
          </div>
        )}

        {error && (
          <div className="flex items-center justify-between gap-2 px-4 py-2 bg-red-500 text-white text-xs">
            <span>{error}</span>
            <button onClick={() => refresh()} className="underline font-medium">
              Retry
            </button>
          </div>
        )}

        <main className={`flex-1 overflow-y-auto relative ${isDark ? "bg-slate-950" : "bg-slate-50"}`}>
          {loading && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/60 dark:bg-slate-950/60">
              <Loader2 className="animate-spin text-blue-600" size={32} />
            </div>
          )}
          <Outlet />
        </main>
      </div>
    </div>
  );
}

import { useState, useEffect } from "react";
import { Outlet, useNavigate, useLocation } from "react-router";
import { Sidebar } from "../components/layout/Sidebar";
import { TopBar } from "../components/layout/TopBar";
import { useTheme } from "../../context/ThemeContext";
import { useData } from "../../context/DataContext";
import { useAuth, canAccessView } from "../../context/AuthContext";
import { isMainPortal } from "../../lib/tenant";
import { WifiOff, Loader2 } from "lucide-react";
import type { ViewId } from "../../types";

function pathToView(path: string): ViewId {
  const segment = path.replace(/^\//, "").split("/")[0] || "dashboard";
  return (segment || "dashboard") as ViewId;
}

export function AppLayout() {
  const { isDark, toggleDark } = useTheme();
  const { user, logout } = useAuth();
  const { loading, error, refresh } = useData();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  const currentView = pathToView(location.pathname);

  useEffect(() => {
    if (!user) return;
    if (isMainPortal() && user.role === "superadmin" && currentView !== "superadmin" && currentView !== "settings" && currentView !== "users") {
      if (currentView === "dashboard") navigate("/superadmin", { replace: true });
    }
    if (!canAccessView(user.role, currentView)) {
      navigate(user.role === "superadmin" ? "/superadmin" : "/dashboard", { replace: true });
    }
  }, [user, currentView, navigate]);

  useEffect(() => {
    const on = () => setIsOnline(true);
    const off = () => setIsOnline(false);
    window.addEventListener("online", on);
    window.addEventListener("offline", off);
    return () => {
      window.removeEventListener("online", on);
      window.removeEventListener("offline", off);
    };
  }, []);

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
        />

        {!isOnline && (
          <div className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white text-xs">
            <WifiOff size={14} />
            <span>You are offline. Some features may not be available.</span>
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

import { Navigate } from "react-router";
import { useAuth } from "../context/AuthContext";
import { isMainPortal } from "../lib/tenant";
import { Loader2 } from "lucide-react";

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <Loader2 className="animate-spin text-blue-600" size={40} />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const onMain = isMainPortal();
  if (onMain && user?.role !== "superadmin") {
    return <Navigate to="/login" replace />;
  }
  if (!onMain && user?.role === "superadmin") {
    return <Navigate to="/superadmin" replace />;
  }

  return <>{children}</>;
}

import { useState, useEffect } from "react";
import { Sidebar } from "./components/layout/Sidebar";
import { TopBar } from "./components/layout/TopBar";
import { LoginPage } from "./components/auth/LoginPage";
import { Dashboard } from "./components/dashboard/Dashboard";
import { ProjectsModule } from "./components/projects/ProjectsModule";
import { UnitsModule } from "./components/units/UnitsModule";
import { CustomersModule } from "./components/customers/CustomersModule";
import { AccountingModule } from "./components/accounting/AccountingModule";
import { PaymentsModule } from "./components/payments/PaymentsModule";
import { CRMModule } from "./components/crm/CRMModule";
import { InventoryModule } from "./components/inventory/InventoryModule";
import { LabourModule } from "./components/labour/LabourModule";
import { DocumentsModule } from "./components/documents/DocumentsModule";
import { UsersModule } from "./components/users/UsersModule";
import { ConstructionModule } from "./components/construction/ConstructionModule";
import { MaintenanceModule } from "./components/maintenance/MaintenanceModule";
import { OwnerPortal } from "./components/owner/OwnerPortal";
import { VendorPortal } from "./components/vendor/VendorPortal";
import { Settings, Wifi, WifiOff } from "lucide-react";

type View = "dashboard" | "projects" | "units" | "units-floorplan" | "customers" |
  "accounting" | "accounting-pl" | "accounting-balance" | "accounting-gst" |
  "payments" | "crm" | "inventory" | "labour" | "construction" |
  "documents" | "maintenance" | "users" | "owner" | "vendor" | "settings";

function SettingsPage({ isDark }: { isDark: boolean }) {
  const text = isDark ? "text-white" : "text-slate-800";
  const muted = "text-slate-500";
  const border = isDark ? "border-slate-700" : "border-slate-200";
  const card = `bg-white dark:bg-slate-800 border ${border} rounded-2xl`;

  return (
    <div className="p-5 space-y-5">
      <div>
        <h1 className={text}>Settings</h1>
        <p className={`text-sm ${muted}`}>Manage your account and preferences</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[
          {
            title: "Company Details", items: [
              { label: "Company Name", value: "Kapoor Developers Pvt. Ltd." },
              { label: "GSTIN", value: "27AABCK8901A1ZX" },
              { label: "Address", value: "Andheri West, Mumbai 400058" },
              { label: "Website", value: "www.kapoordevelopers.com" },
            ]
          },
          {
            title: "Notification Preferences", items: [
              { label: "Payment Alerts", value: "Email + SMS" },
              { label: "EMI Reminders", value: "WhatsApp + SMS" },
              { label: "Construction Updates", value: "Email" },
              { label: "Low Stock Alerts", value: "Email + Push" },
            ]
          },
        ].map(section => (
          <div key={section.title} className={`${card} p-5`}>
            <h3 className={`font-semibold mb-4 ${text}`}>{section.title}</h3>
            <div className="space-y-3">
              {section.items.map(item => (
                <div key={item.label} className={`flex justify-between py-2 border-b ${isDark ? "border-slate-700/50" : "border-slate-100"} last:border-0`}>
                  <span className={`text-xs ${muted}`}>{item.label}</span>
                  <span className={`text-xs font-medium ${text}`}>{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className={`${card} p-5`}>
        <h3 className={`font-semibold mb-4 ${text}`}>Integrations</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {[
            { name: "WhatsApp Business", status: "Connected", color: "emerald" },
            { name: "Tally ERP", status: "Connected", color: "emerald" },
            { name: "Google Drive", status: "Not Connected", color: "slate" },
            { name: "SMS Gateway", status: "Connected", color: "emerald" },
            { name: "Email Service", status: "Connected", color: "emerald" },
            { name: "Payment Gateway", status: "Connected", color: "emerald" },
          ].map(i => (
            <div key={i.name} className={`flex items-center justify-between p-3 rounded-xl border ${border}`}>
              <span className={`text-xs font-medium ${text}`}>{i.name}</span>
              <span className={`text-xs px-2 py-0.5 rounded-full ${i.color === "emerald" ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>{i.status}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentView, setCurrentView] = useState<View>("dashboard");
  const [isDark, setIsDark] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDark]);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const moduleProps = { isDark };

  const renderModule = () => {
    switch (currentView) {
      case "dashboard": return <Dashboard {...moduleProps} />;
      case "projects": return <ProjectsModule {...moduleProps} />;
      case "units":
      case "units-floorplan": return <UnitsModule {...moduleProps} />;
      case "customers": return <CustomersModule {...moduleProps} />;
      case "accounting":
      case "accounting-pl":
      case "accounting-balance":
      case "accounting-gst": return <AccountingModule {...moduleProps} />;
      case "payments": return <PaymentsModule {...moduleProps} />;
      case "crm": return <CRMModule {...moduleProps} />;
      case "inventory": return <InventoryModule {...moduleProps} />;
      case "labour": return <LabourModule {...moduleProps} />;
      case "construction": return <ConstructionModule {...moduleProps} />;
      case "documents": return <DocumentsModule {...moduleProps} />;
      case "maintenance": return <MaintenanceModule {...moduleProps} />;
      case "users": return <UsersModule {...moduleProps} />;
      case "owner": return <OwnerPortal {...moduleProps} />;
      case "vendor": return <VendorPortal {...moduleProps} />;
      case "settings": return <SettingsPage isDark={isDark} />;
      default: return <Dashboard {...moduleProps} />;
    }
  };

  if (!isLoggedIn) {
    return <LoginPage onLogin={() => setIsLoggedIn(true)} isDark={isDark} />;
  }

  return (
    <div className={`flex h-screen overflow-hidden ${isDark ? "bg-slate-950" : "bg-slate-50"}`}>
      {/* Sidebar */}
      <Sidebar
        currentView={currentView}
        onNavigate={(view) => setCurrentView(view as View)}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        isDark={isDark}
      />

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar */}
        <TopBar
          currentView={currentView}
          isDark={isDark}
          onToggleDark={() => setIsDark(!isDark)}
          onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
        />

        {/* Offline banner */}
        {!isOnline && (
          <div className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white text-xs">
            <WifiOff size={14} />
            <span>You are offline. Some features may not be available.</span>
          </div>
        )}

        {/* Page content */}
        <main className={`flex-1 overflow-y-auto ${isDark ? "bg-slate-950" : "bg-slate-50"}`}>
          {renderModule()}
        </main>
      </div>
    </div>
  );
}

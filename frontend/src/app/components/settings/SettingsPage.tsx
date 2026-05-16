import { Settings } from "lucide-react";
import { useData } from "../../../context/DataContext";

type SettingsPageProps = { isDark: boolean };

export function SettingsPage({ isDark }: SettingsPageProps) {
  const { settings } = useData();
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
            title: "Company Details",
            items: [
              { label: "Company Name", value: settings?.companyName ?? "—" },
              { label: "GSTIN", value: settings?.gstin ?? "—" },
              { label: "Address", value: settings?.address ?? "—" },
              { label: "Website", value: settings?.website ?? "—" },
            ],
          },
          {
            title: "Notification Preferences",
            items: [
              { label: "Payment Alerts", value: "Email + SMS" },
              { label: "EMI Reminders", value: "WhatsApp + SMS" },
              { label: "Construction Updates", value: "Email" },
              { label: "Low Stock Alerts", value: "Email + Push" },
            ],
          },
        ].map((section) => (
          <div key={section.title} className={`${card} p-5`}>
            <h3 className={`font-semibold mb-4 ${text}`}>{section.title}</h3>
            <div className="space-y-3">
              {section.items.map((item) => (
                <div
                  key={item.label}
                  className={`flex justify-between py-2 border-b ${isDark ? "border-slate-700/50" : "border-slate-100"} last:border-0`}
                >
                  <span className={`text-xs ${muted}`}>{item.label}</span>
                  <span className={`text-xs font-medium ${text}`}>{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className={`${card} p-5`}>
        <h3 className={`font-semibold mb-4 flex items-center gap-2 ${text}`}>
          <Settings size={18} /> Integrations
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {[
            { name: "WhatsApp Business", status: "Connected", color: "emerald" },
            { name: "Tally ERP", status: "Connected", color: "emerald" },
            { name: "Google Drive", status: "Not Connected", color: "slate" },
            { name: "SMS Gateway", status: "Connected", color: "emerald" },
            { name: "Email Service", status: "Connected", color: "emerald" },
            { name: "Payment Gateway", status: "Connected", color: "emerald" },
          ].map((i) => (
            <div key={i.name} className={`flex items-center justify-between p-3 rounded-xl border ${border}`}>
              <span className={`text-xs font-medium ${text}`}>{i.name}</span>
              <span
                className={`text-xs px-2 py-0.5 rounded-full ${
                  i.color === "emerald" ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"
                }`}
              >
                {i.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

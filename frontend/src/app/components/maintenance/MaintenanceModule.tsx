import { useState } from "react";
import { useData } from "../../../context/DataContext";
import { Plus, Wrench, AlertCircle, CheckCircle2, Clock } from "lucide-react";

type MaintenanceModuleProps = { isDark: boolean };

export function MaintenanceModule({ isDark }: MaintenanceModuleProps) {
  const { tickets, maintenanceBills, persist, saving } = useData();
  const [activeTab, setActiveTab] = useState("tickets");
  const [showAdd, setShowAdd] = useState(false);
  const [ticketForm, setTicketForm] = useState({ unit: "", owner: "", issue: "", category: "General", priority: "Medium", assigned: "Unassigned" });
  const text = isDark ? "text-white" : "text-slate-800";
  const muted = "text-slate-500";
  const border = isDark ? "border-slate-700" : "border-slate-200";
  const card = `bg-white dark:bg-slate-800 border ${border} rounded-2xl`;

  const statusColor = (s: string) => {
    if (s === "Resolved" || s === "Paid") return "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400";
    if (s === "In Progress") return "bg-blue-100 text-blue-700";
    if (s === "Open") return "bg-orange-100 text-orange-700";
    if (s === "Overdue") return "bg-red-100 text-red-700";
    if (s === "Unpaid") return "bg-yellow-100 text-yellow-700";
    return "bg-slate-100 text-slate-600";
  };

  const priorityColor = (p: string) => {
    if (p === "Urgent") return "bg-red-100 text-red-700";
    if (p === "High") return "bg-orange-100 text-orange-700";
    if (p === "Medium") return "bg-yellow-100 text-yellow-700";
    return "bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400";
  };

  const open = tickets.filter(t => t.status === "Open").length;
  const inProgress = tickets.filter(t => t.status === "In Progress").length;

  const handleAddTicket = async () => {
    if (!ticketForm.issue.trim()) return;
    const ticketNo = `TK-${1040 + tickets.length}`;
    await persist("tickets", {
      ticketNo,
      unit: ticketForm.unit,
      owner: ticketForm.owner,
      issue: ticketForm.issue,
      category: ticketForm.category,
      priority: ticketForm.priority,
      status: "Open",
      reported: "Today",
      assigned: ticketForm.assigned,
    }, undefined, `New ticket: ${ticketForm.issue}`);
    setShowAdd(false);
    setTicketForm({ unit: "", owner: "", issue: "", category: "General", priority: "Medium", assigned: "Unassigned" });
  };

  const updateTicketStatus = async (id: number, status: string) => {
    await persist("tickets", { status }, id, `Ticket status → ${status}`);
  };

  return (
    <div className="p-5 space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className={text}>Maintenance</h1>
          <p className={`text-sm ${muted}`}>{tickets.length} service requests · {open} open</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium">
          <Plus size={15} /> New Ticket
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "Open Tickets", value: open, icon: AlertCircle, color: "orange" },
          { label: "In Progress", value: inProgress, icon: Clock, color: "blue" },
          { label: "Resolved (May)", value: 18, icon: CheckCircle2, color: "emerald" },
          { label: "Maintenance Dues", value: "₹14.5K", icon: Wrench, color: "purple" },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className={`${card} p-4`}>
            <div className="flex items-center justify-between">
              <div>
                <div className={`text-xs ${muted} uppercase tracking-wide`}>{label}</div>
                <div className={`text-2xl font-bold mt-1 ${text}`}>{value}</div>
              </div>
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                color === "emerald" ? "bg-emerald-100 text-emerald-600" :
                color === "blue" ? "bg-blue-100 text-blue-600" :
                color === "orange" ? "bg-orange-100 text-orange-600" : "bg-purple-100 text-purple-600"
              }`}>
                <Icon size={15} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100 dark:bg-slate-800 rounded-xl p-0.5 w-fit">
        {["tickets", "billing", "society"].map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)} className={`px-4 py-1.5 rounded-lg text-xs font-medium capitalize transition-all ${activeTab === tab ? "bg-white dark:bg-slate-700 shadow-sm text-slate-800 dark:text-white" : "text-slate-500"}`}>
            {tab}
          </button>
        ))}
      </div>

      {activeTab === "tickets" && (
        <div className="space-y-3">
          {tickets.map(t => (
            <div key={t.id} className={`${card} p-4`}>
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-xs font-mono font-semibold ${muted}`}>{t.ticketNo}</span>
                    <span className={`text-xs px-1.5 py-0.5 rounded ${priorityColor(t.priority)}`}>{t.priority}</span>
                    <span className={`text-xs px-1.5 py-0.5 rounded ${statusColor(t.status)}`}>{t.status}</span>
                  </div>
                  <div className={`text-sm font-medium ${text}`}>{t.issue}</div>
                  <div className="flex items-center gap-3 mt-1 flex-wrap">
                    <span className={`text-xs ${muted}`}>{t.unit}</span>
                    <span className={muted}>·</span>
                    <span className={`text-xs ${muted}`}>{t.owner}</span>
                    <span className={muted}>·</span>
                    <span className={`text-xs px-1.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700 ${muted}`}>{t.category}</span>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className={`text-xs ${muted}`}>Assigned: <span className={text}>{t.assigned}</span></div>
                  <div className={`text-xs ${muted} mt-0.5`}>{t.reported}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === "billing" && (
        <div className={`${card} overflow-hidden`}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className={`border-b ${border} ${isDark ? "bg-slate-900/50" : "bg-slate-50"}`}>
                  {["Bill No", "Owner", "Unit", "Month", "Amount", "Due Date", "Status"].map(h => (
                    <th key={h} className={`px-4 py-3 text-left text-xs font-semibold ${muted} uppercase tracking-wide whitespace-nowrap`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className={`divide-y ${isDark ? "divide-slate-700/50" : "divide-slate-100"}`}>
                {maintenanceBills.map(bill => (
                  <tr key={bill.id} className={`hover:${isDark ? "bg-slate-700/30" : "bg-slate-50"}`}>
                    <td className={`px-4 py-3 text-xs font-mono ${text}`}>{bill.billNo}</td>
                    <td className={`px-4 py-3 text-xs font-medium ${text}`}>{bill.owner}</td>
                    <td className={`px-4 py-3 text-xs ${muted}`}>{bill.unit}</td>
                    <td className={`px-4 py-3 text-xs ${muted}`}>{bill.month}</td>
                    <td className={`px-4 py-3 text-xs font-semibold ${text}`}>{bill.amount}</td>
                    <td className={`px-4 py-3 text-xs ${muted}`}>{bill.due}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColor(bill.status)}`}>{bill.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === "society" && (
        <div className={`${card} p-5`}>
          <h3 className={`font-semibold mb-4 ${text}`}>Society Management</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { label: "Registered Owners", value: "264", icon: "👥" },
              { label: "Society Fund Balance", value: "₹8.4L", icon: "💰" },
              { label: "Monthly Collection", value: "₹9.24L", icon: "📅" },
              { label: "Pending Dues", value: "₹14.5K", icon: "⚠️" },
            ].map(s => (
              <div key={s.label} className={`p-4 rounded-xl ${isDark ? "bg-slate-700/40" : "bg-slate-50"} flex items-center gap-3`}>
                <span className="text-2xl">{s.icon}</span>
                <div>
                  <div className={`text-lg font-bold ${text}`}>{s.value}</div>
                  <div className={`text-xs ${muted}`}>{s.label}</div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-5">
            <h4 className={`text-sm font-medium mb-3 ${text}`}>Amenities Status</h4>
            <div className="space-y-2">
              {[
                { name: "Swimming Pool", status: "Operational" },
                { name: "Gymnasium", status: "Under Maintenance" },
                { name: "Clubhouse", status: "Operational" },
                { name: "Children's Play Area", status: "Operational" },
                { name: "CCTV Surveillance", status: "Operational" },
              ].map(a => (
                <div key={a.name} className={`flex items-center justify-between p-3 rounded-xl border ${border}`}>
                  <span className={`text-sm ${text}`}>{a.name}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${a.status === "Operational" ? "bg-emerald-100 text-emerald-700" : "bg-orange-100 text-orange-700"}`}>{a.status}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

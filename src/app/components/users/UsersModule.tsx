import { useState } from "react";
import { Plus, Shield, Edit, Trash2, CheckCircle2, X } from "lucide-react";

const USERS = [
  { id: 1, name: "Arjun Kumar", email: "arjun@builderos.in", role: "Admin", status: "Active", lastLogin: "Just now", joined: "Jan 2023" },
  { id: 2, name: "Priya Sales", email: "priya@builderos.in", role: "Sales Manager", status: "Active", lastLogin: "2h ago", joined: "Mar 2023" },
  { id: 3, name: "Ravi Kumar", email: "ravi@builderos.in", role: "Sales Executive", status: "Active", lastLogin: "Yesterday", joined: "Apr 2023" },
  { id: 4, name: "Sachin Jain", email: "sachin@builderos.in", role: "Sales Executive", status: "Active", lastLogin: "1d ago", joined: "Jun 2023" },
  { id: 5, name: "Kavitha Finance", email: "kavitha@builderos.in", role: "Accounts Manager", status: "Active", lastLogin: "3h ago", joined: "Feb 2023" },
  { id: 6, name: "Ranjit Site", email: "ranjit@builderos.in", role: "Site Manager", status: "Active", lastLogin: "5h ago", joined: "Mar 2023" },
  { id: 7, name: "Meera HR", email: "meera@builderos.in", role: "HR Manager", status: "Inactive", lastLogin: "7d ago", joined: "Jul 2023" },
];

const ROLES = [
  { name: "Admin", users: 1, color: "bg-red-100 text-red-700" },
  { name: "Sales Manager", users: 1, color: "bg-blue-100 text-blue-700" },
  { name: "Sales Executive", users: 2, color: "bg-blue-50 text-blue-600" },
  { name: "Accounts Manager", users: 1, color: "bg-purple-100 text-purple-700" },
  { name: "Site Manager", users: 1, color: "bg-orange-100 text-orange-700" },
  { name: "HR Manager", users: 1, color: "bg-emerald-100 text-emerald-700" },
];

const PERMISSIONS = [
  { module: "Dashboard", admin: true, sales: true, accounts: false, site: true },
  { module: "Projects", admin: true, sales: true, accounts: false, site: true },
  { module: "Unit Registry", admin: true, sales: true, accounts: false, site: true },
  { module: "Customers", admin: true, sales: true, accounts: false, site: false },
  { module: "CRM", admin: true, sales: true, accounts: false, site: false },
  { module: "Accounting", admin: true, sales: false, accounts: true, site: false },
  { module: "Payments", admin: true, sales: false, accounts: true, site: false },
  { module: "Inventory", admin: true, sales: false, accounts: true, site: true },
  { module: "Labour", admin: true, sales: false, accounts: true, site: true },
  { module: "Documents", admin: true, sales: true, accounts: true, site: true },
  { module: "Users & Roles", admin: true, sales: false, accounts: false, site: false },
];

const AUDIT_LOGS = [
  { user: "Arjun Kumar", action: "Modified payment entry RCP-8042", module: "Payments", time: "2m ago", type: "edit" },
  { user: "Kavitha Finance", action: "Created voucher V-2401", module: "Accounting", time: "1h ago", type: "create" },
  { user: "Priya Sales", action: "Updated lead status — Rajan Mehta", module: "CRM", time: "2h ago", type: "edit" },
  { user: "Ranjit Site", action: "Logged attendance for Block C team", module: "Labour", time: "4h ago", type: "create" },
  { user: "Arjun Kumar", action: "Added new user Sachin Jain", module: "Users", time: "Yesterday", type: "create" },
  { user: "Kavitha Finance", action: "Exported GST report April 2026", module: "Accounting", time: "Yesterday", type: "export" },
];

type UsersModuleProps = { isDark: boolean };

export function UsersModule({ isDark }: UsersModuleProps) {
  const [activeTab, setActiveTab] = useState("users");
  const [showInvite, setShowInvite] = useState(false);

  const text = isDark ? "text-white" : "text-slate-800";
  const muted = "text-slate-500";
  const border = isDark ? "border-slate-700" : "border-slate-200";
  const card = `bg-white dark:bg-slate-800 border ${border} rounded-2xl`;

  const roleColor: Record<string, string> = {
    Admin: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
    "Sales Manager": "bg-blue-100 text-blue-700",
    "Sales Executive": "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400",
    "Accounts Manager": "bg-purple-100 text-purple-700",
    "Site Manager": "bg-orange-100 text-orange-700",
    "HR Manager": "bg-emerald-100 text-emerald-700",
  };

  const auditTypeColor: Record<string, string> = {
    create: "bg-emerald-100 text-emerald-700",
    edit: "bg-blue-100 text-blue-700",
    export: "bg-purple-100 text-purple-700",
    delete: "bg-red-100 text-red-700",
  };

  return (
    <div className="p-5 space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className={text}>Users & Roles</h1>
          <p className={`text-sm ${muted}`}>{USERS.length} users · {ROLES.length} roles</p>
        </div>
        <button onClick={() => setShowInvite(true)} className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium">
          <Plus size={15} /> Invite User
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100 dark:bg-slate-800 rounded-xl p-0.5 w-fit">
        {["users", "roles", "permissions", "audit-log"].map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)} className={`px-4 py-1.5 rounded-lg text-xs font-medium capitalize transition-all whitespace-nowrap ${activeTab === tab ? "bg-white dark:bg-slate-700 shadow-sm text-slate-800 dark:text-white" : "text-slate-500"}`}>
            {tab.replace("-", " ")}
          </button>
        ))}
      </div>

      {activeTab === "users" && (
        <div className={`${card} overflow-hidden`}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className={`border-b ${border} ${isDark ? "bg-slate-900/50" : "bg-slate-50"}`}>
                  {["User", "Role", "Status", "Last Login", "Joined", "Actions"].map(h => (
                    <th key={h} className={`px-5 py-3 text-left text-xs font-semibold ${muted} uppercase tracking-wide whitespace-nowrap`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className={`divide-y ${isDark ? "divide-slate-700/50" : "divide-slate-100"}`}>
                {USERS.map(user => (
                  <tr key={user.id} className={`hover:${isDark ? "bg-slate-700/30" : "bg-slate-50"}`}>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold">
                          {user.name.split(" ").map(n => n[0]).join("")}
                        </div>
                        <div>
                          <div className={`text-xs font-semibold ${text}`}>{user.name}</div>
                          <div className={`text-xs ${muted}`}>{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${roleColor[user.role] || "bg-slate-100 text-slate-600"}`}>{user.role}</span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${user.status === "Active" ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>{user.status}</span>
                    </td>
                    <td className={`px-5 py-3.5 text-xs ${muted}`}>{user.lastLogin}</td>
                    <td className={`px-5 py-3.5 text-xs ${muted}`}>{user.joined}</td>
                    <td className="px-5 py-3.5">
                      <div className="flex gap-2">
                        <button className={`${muted} hover:text-blue-500`}><Edit size={14} /></button>
                        <button className={`${muted} hover:text-red-500`}><Trash2 size={14} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === "roles" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {ROLES.map(role => (
            <div key={role.name} className={`${card} p-5`}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                    <Shield size={16} className="text-blue-600" />
                  </div>
                  <div>
                    <div className={`text-sm font-semibold ${text}`}>{role.name}</div>
                    <div className={`text-xs ${muted}`}>{role.users} user{role.users !== 1 ? "s" : ""}</div>
                  </div>
                </div>
                <button className={`text-xs px-2 py-1 rounded-lg border ${isDark ? "border-slate-700 text-slate-300" : "border-slate-200 text-slate-600"}`}>
                  Edit
                </button>
              </div>
              <div className={`text-xs ${muted} leading-relaxed`}>
                {role.name === "Admin" && "Full access to all modules and settings"}
                {role.name === "Sales Manager" && "CRM, unit booking, customer management"}
                {role.name === "Sales Executive" && "Lead management, site visits, booking"}
                {role.name === "Accounts Manager" && "Accounting, payments, financial reports"}
                {role.name === "Site Manager" && "Construction, labour, inventory access"}
                {role.name === "HR Manager" && "Labour management, payroll, contractors"}
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === "permissions" && (
        <div className={`${card} overflow-hidden`}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className={`border-b ${border} ${isDark ? "bg-slate-900/50" : "bg-slate-50"}`}>
                  <th className={`px-5 py-3 text-left text-xs font-semibold ${muted} uppercase tracking-wide`}>Module</th>
                  {["Admin", "Sales", "Accounts", "Site"].map(r => (
                    <th key={r} className={`px-5 py-3 text-center text-xs font-semibold ${muted} uppercase tracking-wide`}>{r}</th>
                  ))}
                </tr>
              </thead>
              <tbody className={`divide-y ${isDark ? "divide-slate-700/50" : "divide-slate-100"}`}>
                {PERMISSIONS.map(p => (
                  <tr key={p.module} className={`hover:${isDark ? "bg-slate-700/30" : "bg-slate-50"}`}>
                    <td className={`px-5 py-3 text-xs font-medium ${text}`}>{p.module}</td>
                    {["admin", "sales", "accounts", "site"].map(role => (
                      <td key={role} className="px-5 py-3 text-center">
                        {(p as Record<string, boolean | string>)[role] ? (
                          <CheckCircle2 size={14} className="text-emerald-500 mx-auto" />
                        ) : (
                          <X size={14} className="text-slate-300 dark:text-slate-600 mx-auto" />
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === "audit-log" && (
        <div className={`${card} overflow-hidden`}>
          <div className={`px-5 py-4 border-b ${border}`}>
            <h3 className={`font-semibold ${text}`}>Activity Audit Log</h3>
            <p className={`text-xs ${muted} mt-0.5`}>All user actions are logged for compliance</p>
          </div>
          <div className={`divide-y ${isDark ? "divide-slate-700/50" : "divide-slate-100"}`}>
            {AUDIT_LOGS.map((log, i) => (
              <div key={i} className={`flex items-center gap-4 px-5 py-3.5 hover:${isDark ? "bg-slate-700/30" : "bg-slate-50"}`}>
                <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                  {log.user.split(" ").map(n => n[0]).join("")}
                </div>
                <div className="flex-1 min-w-0">
                  <div className={`text-xs font-medium ${text}`}>
                    <span className="font-semibold">{log.user}</span> {log.action}
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className={`text-xs px-1.5 py-0.5 rounded ${auditTypeColor[log.type]}`}>{log.module}</span>
                    <span className={`text-xs ${muted}`}>{log.time}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {showInvite && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className={`w-full max-w-md rounded-2xl border shadow-2xl ${isDark ? "bg-slate-900 border-slate-700" : "bg-white border-slate-200"}`}>
            <div className={`flex items-center justify-between px-5 py-4 border-b ${border}`}>
              <h3 className={`font-semibold ${text}`}>Invite User</h3>
              <button onClick={() => setShowInvite(false)}><X size={18} className={muted} /></button>
            </div>
            <div className="p-5 space-y-4">
              {[
                { label: "Full Name", placeholder: "John Doe" },
                { label: "Email Address", placeholder: "john@builderos.in" },
                { label: "Mobile Number", placeholder: "+91 98765 43210" },
              ].map(f => (
                <div key={f.label}>
                  <label className={`block text-xs font-medium mb-1.5 ${isDark ? "text-slate-300" : "text-slate-700"}`}>{f.label}</label>
                  <input placeholder={f.placeholder} className={`w-full px-3 py-2.5 rounded-xl border text-sm outline-none focus:border-blue-500 ${isDark ? "bg-slate-800 border-slate-700 text-white placeholder-slate-500" : "bg-slate-50 border-slate-200 text-slate-800"}`} />
                </div>
              ))}
              <div>
                <label className={`block text-xs font-medium mb-1.5 ${isDark ? "text-slate-300" : "text-slate-700"}`}>Assign Role</label>
                <select className={`w-full px-3 py-2.5 rounded-xl border text-sm outline-none ${isDark ? "bg-slate-800 border-slate-700 text-white" : "bg-slate-50 border-slate-200 text-slate-800"}`}>
                  {ROLES.map(r => <option key={r.name}>{r.name}</option>)}
                </select>
              </div>
            </div>
            <div className={`flex justify-end gap-3 px-5 py-4 border-t ${border}`}>
              <button onClick={() => setShowInvite(false)} className={`px-4 py-2 rounded-xl border text-sm ${isDark ? "border-slate-700 text-slate-300" : "border-slate-200 text-slate-700"}`}>Cancel</button>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-medium">Send Invite</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

import { useState } from "react";
import { useData } from "../../../context/DataContext";
import { Users, Plus, CheckCircle2, X, ClipboardList, HardHat } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const ATTENDANCE_DATA = [
  { date: "Mon", present: 142, absent: 18, contractors: 4 },
  { date: "Tue", present: 138, absent: 22, contractors: 4 },
  { date: "Wed", present: 155, absent: 5, contractors: 5 },
  { date: "Thu", present: 148, absent: 12, contractors: 5 },
  { date: "Fri", present: 144, absent: 16, contractors: 4 },
  { date: "Sat", present: 120, absent: 40, contractors: 3 },
];

type LabourProps = { isDark: boolean };

export function LabourModule({ isDark }: LabourProps) {
  const { contractors, workOrders, persist } = useData();
  const [activeTab, setActiveTab] = useState("attendance");
  const text = isDark ? "text-white" : "text-slate-800";
  const muted = "text-slate-500";
  const border = isDark ? "border-slate-700" : "border-slate-200";
  const card = `bg-white dark:bg-slate-800 border ${border} rounded-2xl`;

  return (
    <div className="p-5 space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className={text}>Labour & Contractors</h1>
          <p className={`text-sm ${muted}`}>159 workers on-site · 4 contractors</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium">
          <Plus size={15} /> Add Contractor
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "Present Today", value: "144", icon: CheckCircle2, color: "emerald" },
          { label: "Absent", value: "16", icon: X, color: "red" },
          { label: "Contractors", value: "4", icon: HardHat, color: "blue" },
          { label: "Monthly Payroll", value: "₹28.4L", icon: Users, color: "purple" },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className={`${card} p-4 flex items-center gap-3`}>
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
              color === "emerald" ? "bg-emerald-100 text-emerald-600" :
              color === "red" ? "bg-red-100 text-red-600" :
              color === "blue" ? "bg-blue-100 text-blue-600" : "bg-purple-100 text-purple-600"
            }`}>
              <Icon size={16} />
            </div>
            <div>
              <div className={`text-xl font-bold ${text}`}>{value}</div>
              <div className={`text-xs ${muted}`}>{label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100 dark:bg-slate-800 rounded-xl p-0.5 w-fit">
        {["attendance", "contractors", "work-orders", "payroll"].map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)} className={`px-4 py-1.5 rounded-lg text-xs font-medium capitalize transition-all whitespace-nowrap ${activeTab === tab ? "bg-white dark:bg-slate-700 shadow-sm text-slate-800 dark:text-white" : "text-slate-500"}`}>
            {tab.replace("-", " ")}
          </button>
        ))}
      </div>

      {activeTab === "attendance" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className={`${card} p-5`}>
            <h3 className={`font-semibold mb-4 ${text}`}>Weekly Attendance</h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={ATTENDANCE_DATA} barSize={16}>
                <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "#1e293b" : "#f1f5f9"} />
                <XAxis dataKey="date" tick={{ fill: isDark ? "#475569" : "#94a3b8", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: isDark ? "#475569" : "#94a3b8", fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ backgroundColor: isDark ? "#1e293b" : "white", borderRadius: "12px" }} />
                <Bar dataKey="present" name="Present" fill="#10B981" radius={[3, 3, 0, 0]} />
                <Bar dataKey="absent" name="Absent" fill="#EF4444" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className={`${card} p-5`}>
            <h3 className={`font-semibold mb-4 ${text}`}>Today's Attendance Log</h3>
            <div className="space-y-2">
              {[
                { name: "Block A - Civil Works", present: 42, total: 48, time: "08:15 AM" },
                { name: "Block B - Electrical", present: 22, total: 24, time: "08:30 AM" },
                { name: "Block C - Steel Work", present: 30, total: 32, time: "08:00 AM" },
                { name: "Plumbing Team", present: 16, total: 18, time: "08:45 AM" },
                { name: "Finishing Team", present: 34, total: 38, time: "09:00 AM" },
              ].map(t => (
                <div key={t.name} className={`p-3 rounded-xl ${isDark ? "bg-slate-700/40" : "bg-slate-50"} flex items-center justify-between`}>
                  <div>
                    <div className={`text-xs font-medium ${text}`}>{t.name}</div>
                    <div className={`text-xs ${muted}`}>{t.time}</div>
                  </div>
                  <div className="text-right">
                    <div className={`text-sm font-bold ${t.present === t.total ? "text-emerald-600" : "text-orange-500"}`}>{t.present}/{t.total}</div>
                    <div className={`text-xs ${muted}`}>present</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === "contractors" && (
        <div className={`${card} overflow-hidden`}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className={`border-b ${border} ${isDark ? "bg-slate-900/50" : "bg-slate-50"}`}>
                  {["Contractor", "Type", "Workers", "Daily Rate", "Status", "Total Billed"].map(h => (
                    <th key={h} className={`px-4 py-3 text-left text-xs font-semibold ${muted} uppercase tracking-wide whitespace-nowrap`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className={`divide-y ${isDark ? "divide-slate-700/50" : "divide-slate-100"}`}>
                {contractors.map(c => (
                  <tr key={c.id} className={`hover:${isDark ? "bg-slate-700/30" : "bg-slate-50"}`}>
                    <td className="px-4 py-3">
                      <div className={`text-xs font-semibold ${text}`}>{c.name}</div>
                      <div className={`text-xs ${muted}`}>{c.contact}</div>
                    </td>
                    <td className={`px-4 py-3 text-xs ${muted}`}>{c.type}</td>
                    <td className={`px-4 py-3 text-xs font-semibold ${text}`}>{c.workers}</td>
                    <td className={`px-4 py-3 text-xs ${text}`}>{c.rate}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${c.status === "Active" ? "bg-emerald-100 text-emerald-700" : "bg-orange-100 text-orange-700"}`}>{c.status}</span>
                    </td>
                    <td className={`px-4 py-3 text-xs font-bold text-emerald-600`}>{c.totalBilled}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === "work-orders" && (
        <div className={`${card} overflow-hidden`}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className={`border-b ${border} ${isDark ? "bg-slate-900/50" : "bg-slate-50"}`}>
                  {["WO No", "Contractor", "Work Description", "Start", "End", "Value", "Status"].map(h => (
                    <th key={h} className={`px-4 py-3 text-left text-xs font-semibold ${muted} uppercase tracking-wide whitespace-nowrap`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className={`divide-y ${isDark ? "divide-slate-700/50" : "divide-slate-100"}`}>
                {workOrders.map(w => (
                  <tr key={w.id} className={`hover:${isDark ? "bg-slate-700/30" : "bg-slate-50"}`}>
                    <td className={`px-4 py-3 text-xs font-mono font-semibold ${text}`}>{w.woNo}</td>
                    <td className={`px-4 py-3 text-xs ${text}`}>{w.contractor}</td>
                    <td className={`px-4 py-3 text-xs ${muted} max-w-52`}>{w.work}</td>
                    <td className={`px-4 py-3 text-xs ${muted}`}>{w.start}</td>
                    <td className={`px-4 py-3 text-xs ${muted}`}>{w.end}</td>
                    <td className={`px-4 py-3 text-xs font-semibold ${text}`}>{w.value}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${w.status === "Completed" ? "bg-emerald-100 text-emerald-700" : "bg-blue-100 text-blue-700"}`}>{w.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === "payroll" && (
        <div className={`${card} p-5`}>
          <h3 className={`font-semibold mb-4 ${text}`}>Payroll Summary - May 2026</h3>
          <div className="space-y-3">
            {contractors.map(c => (
              <div key={c.id} className={`flex items-center gap-4 p-4 rounded-xl border ${border} flex-wrap`}>
                <div className="flex-1 min-w-0">
                  <div className={`text-sm font-medium ${text}`}>{c.name}</div>
                  <div className={`text-xs ${muted}`}>{c.type} · {c.workers} workers</div>
                </div>
                <div className="text-center">
                  <div className={`text-xs ${muted}`}>Working Days</div>
                  <div className={`text-sm font-bold ${text}`}>22</div>
                </div>
                <div className="text-center">
                  <div className={`text-xs ${muted}`}>Rate</div>
                  <div className={`text-sm font-bold ${text}`}>{c.rate}</div>
                </div>
                <div className="text-center">
                  <div className={`text-xs ${muted}`}>Amount</div>
                  <div className="text-sm font-bold text-emerald-600">
                    ₹{(c.workers * 320 * 22 / 100000).toFixed(1)}L
                  </div>
                </div>
                <button className="text-xs px-3 py-1.5 bg-blue-600 text-white rounded-lg">Pay</button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

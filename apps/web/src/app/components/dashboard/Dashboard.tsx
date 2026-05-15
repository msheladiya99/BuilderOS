import { useState } from "react";
import { useData } from "../../../context/DataContext";
import {
  TrendingUp, TrendingDown, IndianRupee, Building2, Users, AlertCircle,
  ArrowUpRight, ArrowDownRight, Calendar, MoreHorizontal, CheckCircle2
} from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from "recharts";

type DashboardProps = { isDark: boolean };

function StatCard({ title, value, change, positive, icon: Icon, sub, color = "blue" }: {
  title: string; value: string; change: string; positive: boolean; icon: React.ElementType; sub?: string; color?: string;
}) {
  const colors: Record<string, string> = {
    blue: "bg-blue-50 text-blue-600 dark:bg-blue-950/40",
    emerald: "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40",
    orange: "bg-orange-50 text-orange-600 dark:bg-orange-950/40",
    red: "bg-red-50 text-red-600 dark:bg-red-950/40",
  };
  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-slate-500 dark:text-slate-400 text-xs font-medium uppercase tracking-wide">{title}</div>
          <div className="text-slate-900 dark:text-white mt-1.5 text-2xl font-bold">{value}</div>
          {sub && <div className="text-slate-400 text-xs mt-0.5">{sub}</div>}
        </div>
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${colors[color]}`}>
          <Icon size={18} />
        </div>
      </div>
      <div className="flex items-center gap-1.5 mt-4">
        {positive ? (
          <ArrowUpRight size={14} className="text-emerald-500" />
        ) : (
          <ArrowDownRight size={14} className="text-red-500" />
        )}
        <span className={`text-xs font-medium ${positive ? "text-emerald-600" : "text-red-500"}`}>{change}</span>
        <span className="text-xs text-slate-400">vs last month</span>
      </div>
    </div>
  );
}

export function Dashboard({ isDark }: DashboardProps) {
  const { dashboard } = useData();
  const [revenueTab, setRevenueTab] = useState<"3m" | "6m" | "1y">("6m");

  const MONTHLY_DATA = dashboard?.monthlyData ?? [];
  const PROJECT_DATA = dashboard?.projectData ?? [];
  const UNIT_STATUS = dashboard?.unitStatus ?? [];
  const RECENT_PAYMENTS = dashboard?.recentPayments ?? [];
  const ACTIVITIES = dashboard?.activities ?? [];
  const CONSTRUCTION_PROGRESS = dashboard?.constructionProgress ?? [];
  const stats = dashboard?.stats;

  const axisColor = isDark ? "#475569" : "#CBD5E1";
  const gridColor = isDark ? "#1e293b" : "#f1f5f9";
  const tooltipStyle = isDark
    ? { backgroundColor: "#1e293b", border: "1px solid #334155", borderRadius: "12px", color: "#f8fafc" }
    : { backgroundColor: "white", border: "1px solid #e2e8f0", borderRadius: "12px" };

  return (
    <div className="p-5 space-y-5 max-w-[1600px]">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Revenue" value={stats?.revenue ?? "—"} change={stats?.revenueChange ?? "—"} positive sub="FY 2025-26" icon={IndianRupee} color="blue" />
        <StatCard title="Units Sold" value={String(stats?.unitsSold ?? 0)} change={`${stats?.unitsTotal ?? 0} total`} positive sub="Across all projects" icon={Building2} color="emerald" />
        <StatCard title="Pending Dues" value={stats?.pendingAmount ?? "—"} change={`${stats?.pendingDues ?? 0} accounts`} positive={false} sub="Overdue & upcoming" icon={AlertCircle} color="orange" />
        <StatCard title="Active Leads" value={String(stats?.activeLeads ?? 0)} change="CRM pipeline" positive sub="Open opportunities" icon={Users} color="blue" />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Revenue Chart */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-slate-800 dark:text-white font-semibold">Revenue & Expenses</h3>
              <p className="text-slate-500 text-xs mt-0.5">Monthly comparison in Crores</p>
            </div>
            <div className="flex gap-1 bg-slate-100 dark:bg-slate-700 rounded-lg p-0.5">
              {(["3m", "6m", "1y"] as const).map(t => (
                <button key={t} onClick={() => setRevenueTab(t)} className={`px-3 py-1 rounded-md text-xs transition-all ${
                  revenueTab === t ? "bg-white dark:bg-slate-600 text-slate-800 dark:text-white shadow-sm" : "text-slate-500"
                }`}>{t}</button>
              ))}
            </div>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={MONTHLY_DATA}>
              <defs>
                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563EB" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="expGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#F59E0B" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke={gridColor} strokeDasharray="3 3" />
              <XAxis dataKey="month" tick={{ fill: axisColor, fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: axisColor, fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend iconType="circle" iconSize={8} />
              <Area type="monotone" dataKey="revenue" name="Revenue (Cr)" stroke="#2563EB" fill="url(#revGrad)" strokeWidth={2} dot={false} />
              <Area type="monotone" dataKey="expenses" name="Expenses (Cr)" stroke="#F59E0B" fill="url(#expGrad)" strokeWidth={2} dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Unit Status Pie */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5">
          <h3 className="text-slate-800 dark:text-white font-semibold mb-1">Unit Status</h3>
          <p className="text-slate-500 text-xs mb-4">540 total units</p>
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie data={UNIT_STATUS} cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={3} dataKey="value">
                {UNIT_STATUS.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip contentStyle={tooltipStyle} />
            </PieChart>
          </ResponsiveContainer>
          <div className="grid grid-cols-2 gap-2 mt-2">
            {UNIT_STATUS.map(s => (
              <div key={s.name} className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: s.color }} />
                <div>
                  <div className="text-xs text-slate-500">{s.name}</div>
                  <div className="text-sm font-semibold text-slate-800 dark:text-white">{s.value}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Second row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Project comparison */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5">
          <h3 className="text-slate-800 dark:text-white font-semibold mb-4">Project-wise Unit Status</h3>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={PROJECT_DATA} barSize={14}>
              <CartesianGrid stroke={gridColor} strokeDasharray="3 3" />
              <XAxis dataKey="name" tick={{ fill: axisColor, fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: axisColor, fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend iconType="circle" iconSize={8} />
              <Bar dataKey="sold" name="Sold" fill="#2563EB" radius={[3, 3, 0, 0]} />
              <Bar dataKey="booked" name="Booked" fill="#F59E0B" radius={[3, 3, 0, 0]} />
              <Bar dataKey="available" name="Available" fill="#10B981" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Activity feed */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-slate-800 dark:text-white font-semibold">Recent Activity</h3>
            <button className="text-blue-500 text-xs hover:text-blue-600">View all</button>
          </div>
          <div className="space-y-3">
            {ACTIVITIES.map(a => (
              <div key={a.id} className="flex gap-3">
                <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
                  a.color === "emerald" ? "bg-emerald-500" : a.color === "blue" ? "bg-blue-500" :
                  a.color === "red" ? "bg-red-500" : "bg-orange-500"
                }`} />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">{a.text}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{a.time} ago</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Third row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Recent payments */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-slate-800 dark:text-white font-semibold">Recent Payments</h3>
            <button className="text-blue-500 text-xs hover:text-blue-600">View all →</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-700">
                  {["Customer", "Unit", "Amount", "Type", "Date", "Status"].map(h => (
                    <th key={h} className="text-left text-xs text-slate-500 font-medium pb-3 pr-4">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-slate-700/50">
                {RECENT_PAYMENTS.map(p => (
                  <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                    <td className="py-3 pr-4 text-slate-800 dark:text-slate-200 text-xs font-medium">{p.customer}</td>
                    <td className="py-3 pr-4 text-slate-500 text-xs">{p.unit}</td>
                    <td className="py-3 pr-4 text-slate-800 dark:text-slate-200 text-xs font-semibold">{p.amount}</td>
                    <td className="py-3 pr-4">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        p.type === "Booking" ? "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300" :
                        p.type === "Full" ? "bg-purple-100 text-purple-700" : "bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300"
                      }`}>{p.type}</span>
                    </td>
                    <td className="py-3 pr-4 text-slate-500 text-xs">{p.date}</td>
                    <td className="py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        p.status === "success" ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" :
                        p.status === "pending" ? "bg-yellow-100 text-yellow-700" : "bg-red-100 text-red-700"
                      }`}>
                        {p.status === "success" ? "Received" : p.status === "pending" ? "Pending" : "Overdue"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Construction Progress */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-slate-800 dark:text-white font-semibold">Construction Progress</h3>
            <Calendar size={16} className="text-slate-400" />
          </div>
          <div className="space-y-4">
            {CONSTRUCTION_PROGRESS.map(p => (
              <div key={p.name}>
                <div className="flex items-center justify-between mb-1">
                  <div>
                    <span className="text-xs font-medium text-slate-700 dark:text-slate-300">{p.name}</span>
                    <span className={`ml-2 text-xs px-1.5 py-0.5 rounded ${
                      p.progress >= 90 ? "bg-emerald-100 text-emerald-700" :
                      p.progress >= 50 ? "bg-blue-100 text-blue-700" : "bg-orange-100 text-orange-700"
                    }`}>{p.stage}</span>
                  </div>
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{p.progress}%</span>
                </div>
                <div className="h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      p.progress >= 90 ? "bg-emerald-500" : p.progress >= 50 ? "bg-blue-500" : "bg-orange-400"
                    }`}
                    style={{ width: `${p.progress}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-700">
            <div className="flex items-center gap-2 mb-2">
              <Calendar size={14} className="text-blue-500" />
              <span className="text-xs font-medium text-slate-700 dark:text-slate-300">Upcoming Milestones</span>
            </div>
            {[
              { label: "Prestige Towers — OC Certificate", date: "Jun 2026" },
              { label: "Skyline Heights — Block C Slab", date: "Jul 2026" },
            ].map(m => (
              <div key={m.label} className="flex items-center gap-2 py-1">
                <CheckCircle2 size={12} className="text-slate-300" />
                <span className="text-xs text-slate-500 flex-1">{m.label}</span>
                <span className="text-xs text-blue-500">{m.date}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

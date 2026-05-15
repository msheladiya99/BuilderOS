import { useState } from "react";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell
} from "recharts";
import { TrendingUp, TrendingDown, IndianRupee, FileText, Plus, Download, Filter } from "lucide-react";

const MONTHLY_PL = [
  { month: "Nov", income: 4200, expenses: 2800, profit: 1400 },
  { month: "Dec", income: 5800, expenses: 3200, profit: 2600 },
  { month: "Jan", income: 4900, expenses: 2900, profit: 2000 },
  { month: "Feb", income: 6800, expenses: 3600, profit: 3200 },
  { month: "Mar", income: 8200, expenses: 4100, profit: 4100 },
  { month: "Apr", income: 7400, expenses: 3800, profit: 3600 },
  { month: "May", income: 9600, expenses: 4400, profit: 5200 },
];

const EXPENSE_BREAKDOWN = [
  { name: "Construction", value: 48, color: "#2563EB" },
  { name: "Labour", value: 22, color: "#7C3AED" },
  { name: "Materials", value: 18, color: "#F59E0B" },
  { name: "Admin", value: 8, color: "#10B981" },
  { name: "Marketing", value: 4, color: "#EF4444" },
];

const RECENT_VOUCHERS = [
  { id: "V-2401", date: "15 May", type: "Receipt", party: "Rahul Sharma", desc: "EMI Payment - Unit 304", amount: "₹8,50,000", dr: "Bank A/c", cr: "Customer A/c", status: "Posted" },
  { id: "V-2400", date: "14 May", type: "Payment", party: "Ranjit Contractors", desc: "Labour charges - May Week 2", amount: "₹3,20,000", dr: "Labour A/c", cr: "Bank A/c", status: "Posted" },
  { id: "V-2399", date: "13 May", type: "Journal", party: "—", desc: "Depreciation entry - May 2026", amount: "₹45,000", dr: "Depreciation", cr: "Asset A/c", status: "Posted" },
  { id: "V-2398", date: "13 May", type: "Payment", party: "JSW Steel Ltd", desc: "Material purchase - TMT bars", amount: "₹12,40,000", dr: "Inventory", cr: "Bank A/c", status: "Posted" },
  { id: "V-2397", date: "12 May", type: "Receipt", party: "Priya Patel", desc: "Booking amount - Unit 502", amount: "₹12,00,000", dr: "Bank A/c", cr: "Customer A/c", status: "Posted" },
  { id: "V-2396", date: "11 May", type: "Contra", party: "—", desc: "Cash to bank transfer", amount: "₹5,00,000", dr: "Bank A/c", cr: "Cash A/c", status: "Posted" },
];

const PL_DATA = [
  { label: "Revenue from Unit Sales", amount: "₹12,48,00,000", type: "income" },
  { label: "Other Income", amount: "₹24,00,000", type: "income" },
  { label: "Gross Revenue", amount: "₹12,72,00,000", type: "subtotal" },
  { label: "Cost of Construction", amount: "₹(7,82,00,000)", type: "expense" },
  { label: "Labour Charges", amount: "₹(1,44,00,000)", type: "expense" },
  { label: "Administrative Expenses", amount: "₹(52,00,000)", type: "expense" },
  { label: "Marketing & Sales", amount: "₹(26,00,000)", type: "expense" },
  { label: "Depreciation", amount: "₹(8,00,000)", type: "expense" },
  { label: "Total Expenses", amount: "₹(10,12,00,000)", type: "subtotal" },
  { label: "EBITDA", amount: "₹2,60,00,000", type: "profit" },
  { label: "Interest Expense", amount: "₹(18,00,000)", type: "expense" },
  { label: "Tax Provision", amount: "₹(60,00,000)", type: "expense" },
  { label: "Net Profit", amount: "₹1,82,00,000", type: "profit" },
];

const GST_DATA = [
  { period: "Apr 2026", taxable: "₹4,20,00,000", igst: "₹0", cgst: "₹37,80,000", sgst: "₹37,80,000", total: "₹75,60,000", status: "Filed" },
  { period: "Mar 2026", taxable: "₹3,85,00,000", igst: "₹12,60,000", cgst: "₹28,95,000", sgst: "₹28,95,000", total: "₹70,50,000", status: "Filed" },
  { period: "Feb 2026", taxable: "₹3,20,00,000", igst: "₹0", cgst: "₹28,80,000", sgst: "₹28,80,000", total: "₹57,60,000", status: "Filed" },
  { period: "Jan 2026", taxable: "₹2,90,00,000", igst: "₹9,60,000", cgst: "₹21,75,000", sgst: "₹21,75,000", total: "₹53,10,000", status: "Filed" },
  { period: "May 2026", taxable: "₹4,80,00,000", igst: "₹0", cgst: "₹43,20,000", sgst: "₹43,20,000", total: "₹86,40,000", status: "Pending" },
];

type AccountingProps = { isDark: boolean };

export function AccountingModule({ isDark }: AccountingProps) {
  const [activeTab, setActiveTab] = useState("overview");

  const text = isDark ? "text-white" : "text-slate-800";
  const muted = "text-slate-500";
  const border = isDark ? "border-slate-700" : "border-slate-200";
  const card = `bg-white dark:bg-slate-800 border ${border} rounded-2xl`;
  const axisColor = isDark ? "#475569" : "#CBD5E1";
  const gridColor = isDark ? "#1e293b" : "#f1f5f9";
  const tooltipStyle = { backgroundColor: isDark ? "#1e293b" : "white", border: `1px solid ${isDark ? "#334155" : "#e2e8f0"}`, borderRadius: "12px" };

  const voucherTypeColor = (t: string) => {
    if (t === "Receipt") return "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400";
    if (t === "Payment") return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
    if (t === "Journal") return "bg-blue-100 text-blue-700";
    return "bg-purple-100 text-purple-700";
  };

  return (
    <div className="p-5 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className={text}>Accounting</h1>
          <p className={`text-sm ${muted}`}>Financial year 2025-26</p>
        </div>
        <div className="flex gap-2">
          <button className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-sm ${isDark ? "border-slate-700 text-slate-300" : "border-slate-200 text-slate-600"}`}>
            <Download size={14} /> Export
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium">
            <Plus size={15} /> New Voucher
          </button>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "Total Income", value: "₹127.2 Cr", change: "+18.4%", positive: true, icon: TrendingUp },
          { label: "Total Expenses", value: "₹101.2 Cr", change: "+12.1%", positive: false, icon: TrendingDown },
          { label: "Net Profit", value: "₹18.2 Cr", change: "+32.5%", positive: true, icon: IndianRupee },
          { label: "GST Payable", value: "₹86.4 L", change: "May 2026", positive: true, icon: FileText },
        ].map(s => (
          <div key={s.label} className={`${card} p-4`}>
            <div className="flex items-center justify-between mb-2">
              <div className={`text-xs ${muted} uppercase tracking-wide`}>{s.label}</div>
              <s.icon size={14} className={s.positive ? "text-emerald-500" : "text-red-400"} />
            </div>
            <div className={`text-xl font-bold ${text}`}>{s.value}</div>
            <div className={`text-xs mt-1 ${s.positive ? "text-emerald-600" : "text-red-500"}`}>{s.change}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100 dark:bg-slate-800 rounded-xl p-0.5 w-fit overflow-x-auto">
        {["overview", "vouchers", "p&l", "gst"].map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)} className={`px-4 py-1.5 rounded-lg text-xs font-medium uppercase tracking-wide transition-all whitespace-nowrap ${activeTab === tab ? "bg-white dark:bg-slate-700 shadow-sm text-slate-800 dark:text-white" : "text-slate-500"}`}>{tab}</button>
        ))}
      </div>

      {activeTab === "overview" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className={`lg:col-span-2 ${card} p-5`}>
            <h3 className={`font-semibold mb-4 ${text}`}>Income vs Expenses (₹ Lakhs)</h3>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={MONTHLY_PL}>
                <defs>
                  <linearGradient id="incGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="expGrad2" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#EF4444" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#EF4444" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke={gridColor} strokeDasharray="3 3" />
                <XAxis dataKey="month" tick={{ fill: axisColor, fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: axisColor, fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={tooltipStyle} />
                <Area type="monotone" dataKey="income" name="Income" stroke="#10B981" fill="url(#incGrad)" strokeWidth={2} dot={false} />
                <Area type="monotone" dataKey="expenses" name="Expenses" stroke="#EF4444" fill="url(#expGrad2)" strokeWidth={2} dot={false} />
                <Area type="monotone" dataKey="profit" name="Profit" stroke="#2563EB" fill="none" strokeWidth={2} strokeDasharray="5 5" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className={`${card} p-5`}>
            <h3 className={`font-semibold mb-4 ${text}`}>Expense Breakdown</h3>
            <ResponsiveContainer width="100%" height={160}>
              <PieChart>
                <Pie data={EXPENSE_BREAKDOWN} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={3} dataKey="value">
                  {EXPENSE_BREAKDOWN.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} formatter={(v) => `${v}%`} />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-3 space-y-2">
              {EXPENSE_BREAKDOWN.map(e => (
                <div key={e.name} className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ backgroundColor: e.color }} />
                  <span className={`text-xs flex-1 ${muted}`}>{e.name}</span>
                  <span className={`text-xs font-semibold ${text}`}>{e.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === "vouchers" && (
        <div className={`${card} overflow-hidden`}>
          <div className={`flex items-center justify-between px-5 py-4 border-b ${border}`}>
            <h3 className={`font-semibold ${text}`}>Voucher Ledger</h3>
            <div className="flex gap-2">
              <button className={`flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg border ${isDark ? "border-slate-700 text-slate-300" : "border-slate-200 text-slate-600"}`}>
                <Filter size={13} /> Filter
              </button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className={`border-b ${border} ${isDark ? "bg-slate-900/50" : "bg-slate-50"}`}>
                  {["Voucher No", "Date", "Type", "Party", "Description", "Amount", "Status"].map(h => (
                    <th key={h} className={`px-4 py-3 text-left text-xs font-semibold ${muted} uppercase tracking-wide whitespace-nowrap`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className={`divide-y ${isDark ? "divide-slate-700/50" : "divide-slate-100"}`}>
                {RECENT_VOUCHERS.map(v => (
                  <tr key={v.id} className={`hover:${isDark ? "bg-slate-700/30" : "bg-slate-50"} transition-colors`}>
                    <td className={`px-4 py-3 text-xs font-mono font-semibold ${text}`}>{v.id}</td>
                    <td className={`px-4 py-3 text-xs ${muted}`}>{v.date}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${voucherTypeColor(v.type)}`}>{v.type}</span>
                    </td>
                    <td className={`px-4 py-3 text-xs ${text}`}>{v.party}</td>
                    <td className={`px-4 py-3 text-xs ${muted} max-w-48 truncate`}>{v.desc}</td>
                    <td className={`px-4 py-3 text-xs font-semibold ${text}`}>{v.amount}</td>
                    <td className="px-4 py-3">
                      <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">{v.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === "p&l" && (
        <div className={`${card} overflow-hidden`}>
          <div className={`px-5 py-4 border-b ${border}`}>
            <h3 className={`font-semibold ${text}`}>Profit & Loss Statement</h3>
            <p className={`text-xs ${muted} mt-0.5`}>April 2025 — March 2026</p>
          </div>
          <div className="p-5">
            {PL_DATA.map((row, i) => (
              <div key={i} className={`flex items-center justify-between py-2.5 ${
                row.type === "subtotal" ? `border-t border-b ${border} my-1` : `border-b ${isDark ? "border-slate-700/30" : "border-slate-100"}`
              }`}>
                <span className={`text-sm ${
                  row.type === "profit" ? "font-bold text-emerald-600" :
                  row.type === "subtotal" ? `font-semibold ${text}` :
                  row.type === "income" ? `font-medium ${text}` : muted
                }`}>{row.label}</span>
                <span className={`text-sm font-semibold ${
                  row.type === "profit" ? "text-emerald-600" :
                  row.type === "expense" ? "text-red-500" : text
                }`}>{row.amount}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === "gst" && (
        <div className={`${card} overflow-hidden`}>
          <div className={`px-5 py-4 border-b ${border} flex items-center justify-between`}>
            <h3 className={`font-semibold ${text}`}>GST Summary</h3>
            <button className="text-xs text-blue-500 hover:text-blue-600">File GSTR-1</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className={`border-b ${border} ${isDark ? "bg-slate-900/50" : "bg-slate-50"}`}>
                  {["Period", "Taxable Value", "IGST", "CGST", "SGST", "Total Tax", "Status"].map(h => (
                    <th key={h} className={`px-4 py-3 text-left text-xs font-semibold ${muted} uppercase tracking-wide whitespace-nowrap`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className={`divide-y ${isDark ? "divide-slate-700/50" : "divide-slate-100"}`}>
                {GST_DATA.map(g => (
                  <tr key={g.period} className={`hover:${isDark ? "bg-slate-700/30" : "bg-slate-50"}`}>
                    <td className={`px-4 py-3 text-sm font-medium ${text}`}>{g.period}</td>
                    <td className={`px-4 py-3 text-xs ${text}`}>{g.taxable}</td>
                    <td className={`px-4 py-3 text-xs ${muted}`}>{g.igst}</td>
                    <td className={`px-4 py-3 text-xs ${text}`}>{g.cgst}</td>
                    <td className={`px-4 py-3 text-xs ${text}`}>{g.sgst}</td>
                    <td className={`px-4 py-3 text-xs font-semibold ${text}`}>{g.total}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${g.status === "Filed" ? "bg-emerald-100 text-emerald-700" : "bg-orange-100 text-orange-700"}`}>{g.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

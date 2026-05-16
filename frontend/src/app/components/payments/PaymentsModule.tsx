import { useState } from "react";
import { useData } from "../../../context/DataContext";
import { Plus, Search, Download, Bell, CheckCircle2, AlertCircle, Clock, X, IndianRupee } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";

const COLLECTION_DATA = [
  { month: "Nov", collected: 42, target: 50 },
  { month: "Dec", collected: 58, target: 60 },
  { month: "Jan", collected: 51, target: 55 },
  { month: "Feb", collected: 68, target: 65 },
  { month: "Mar", collected: 82, target: 75 },
  { month: "Apr", collected: 74, target: 80 },
  { month: "May", collected: 65, target: 85 },
];

type PaymentsProps = { isDark: boolean };

export function PaymentsModule({ isDark }: PaymentsProps) {
  const { payments, pendingDues, persist, saving, customers } = useData();
  const RECENT_PAYMENTS = payments;
  const PENDING_DUES = pendingDues;
  const [activeTab, setActiveTab] = useState("collection");
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [payForm, setPayForm] = useState({ customer: "", unit: "", amount: "", mode: "NEFT", type: "EMI" });

  const handleSavePayment = async () => {
    if (!payForm.customer || !payForm.amount) return;
    const receipt = `RCP-${8000 + payments.length}`;
    await persist("payments", {
      receipt,
      customer: payForm.customer,
      unit: payForm.unit,
      amount: payForm.amount.startsWith("₹") ? payForm.amount : `₹${payForm.amount}`,
      date: "Today",
      mode: payForm.mode,
      type: payForm.type,
      status: "success",
    }, undefined, `Payment ${receipt} from ${payForm.customer}`);
    setShowPaymentForm(false);
    setPayForm({ customer: "", unit: "", amount: "", mode: "NEFT", type: "EMI" });
  };
  const [search, setSearch] = useState("");

  const text = isDark ? "text-white" : "text-slate-800";
  const muted = "text-slate-500";
  const border = isDark ? "border-slate-700" : "border-slate-200";
  const card = `bg-white dark:bg-slate-800 border ${border} rounded-2xl`;
  const tooltipStyle = { backgroundColor: isDark ? "#1e293b" : "white", border: `1px solid ${isDark ? "#334155" : "#e2e8f0"}`, borderRadius: "12px" };
  const axisColor = isDark ? "#475569" : "#CBD5E1";

  const filtered = PENDING_DUES.filter(d =>
    d.customer.toLowerCase().includes(search.toLowerCase()) || d.unit.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-5 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className={text}>Payment Collection</h1>
          <p className={`text-sm ${muted}`}>₹343.2L collected this month · 68 pending customers</p>
        </div>
        <div className="flex gap-2">
          <button className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-sm ${isDark ? "border-slate-700 text-slate-300" : "border-slate-200 text-slate-600"}`}>
            <Bell size={14} /> Send Reminders
          </button>
          <button onClick={() => setShowPaymentForm(true)} className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium">
            <Plus size={15} /> Record Payment
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "Collected (May)", value: "₹65.4 Cr", icon: CheckCircle2, color: "emerald" },
          { label: "Pending Dues", value: "₹24.8 Cr", icon: Clock, color: "orange" },
          { label: "Overdue > 30 days", value: "₹8.2 Cr", icon: AlertCircle, color: "red" },
          { label: "This Month Target", value: "₹85 Cr", icon: IndianRupee, color: "blue" },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className={`${card} p-4`}>
            <div className="flex items-center justify-between mb-2">
              <span className={`text-xs ${muted} uppercase tracking-wide`}>{label}</span>
              <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                color === "emerald" ? "bg-emerald-100 text-emerald-600" :
                color === "orange" ? "bg-orange-100 text-orange-600" :
                color === "red" ? "bg-red-100 text-red-600" : "bg-blue-100 text-blue-600"
              }`}>
                <Icon size={14} />
              </div>
            </div>
            <div className={`text-xl font-bold ${text}`}>{value}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100 dark:bg-slate-800 rounded-xl p-0.5 w-fit">
        {[
          { id: "collection", label: "Collections" },
          { id: "pending", label: "Pending Dues" },
          { id: "emi", label: "EMI Tracker" },
          { id: "analytics", label: "Analytics" },
        ].map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-all ${activeTab === tab.id ? "bg-white dark:bg-slate-700 shadow-sm text-slate-800 dark:text-white" : "text-slate-500"}`}>
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "collection" && (
        <div className={`${card} overflow-hidden`}>
          <div className={`flex items-center justify-between px-5 py-4 border-b ${border}`}>
            <h3 className={`font-semibold ${text}`}>Payment Receipts</h3>
            <button className={`flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg border ${isDark ? "border-slate-700 text-slate-300" : "border-slate-200 text-slate-600"}`}>
              <Download size={13} /> Export
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className={`border-b ${border} ${isDark ? "bg-slate-900/50" : "bg-slate-50"}`}>
                  {["Receipt No", "Customer", "Unit", "Amount", "Mode", "Type", "Date"].map(h => (
                    <th key={h} className={`px-4 py-3 text-left text-xs font-semibold ${muted} uppercase tracking-wide whitespace-nowrap`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className={`divide-y ${isDark ? "divide-slate-700/50" : "divide-slate-100"}`}>
                {RECENT_PAYMENTS.map(p => (
                  <tr key={p.id} className={`hover:${isDark ? "bg-slate-700/30" : "bg-slate-50"}`}>
                    <td className={`px-4 py-3 text-xs font-mono ${text}`}>{p.receipt}</td>
                    <td className={`px-4 py-3 text-xs font-medium ${text}`}>{p.customer}</td>
                    <td className={`px-4 py-3 text-xs ${muted}`}>{p.unit}</td>
                    <td className={`px-4 py-3 text-xs font-bold text-emerald-600`}>{p.amount}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${isDark ? "bg-slate-700 text-slate-300" : "bg-slate-100 text-slate-600"}`}>{p.mode}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${p.type === "Full" ? "bg-emerald-100 text-emerald-700" : p.type === "Booking" ? "bg-blue-100 text-blue-700" : "bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300"}`}>{p.type}</span>
                    </td>
                    <td className={`px-4 py-3 text-xs ${muted}`}>{p.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === "pending" && (
        <div className="space-y-3">
          <div className={`flex items-center gap-2 px-3 py-2 rounded-xl border ${isDark ? "bg-slate-800 border-slate-700" : "bg-white border-slate-200"} w-72`}>
            <Search size={14} className={muted} />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search customer..." className={`flex-1 text-sm bg-transparent outline-none ${isDark ? "text-white" : "text-slate-800"}`} />
          </div>
          <div className={`${card} overflow-hidden`}>
            <table className="w-full text-sm">
              <thead>
                <tr className={`border-b ${border} ${isDark ? "bg-slate-900/50" : "bg-slate-50"}`}>
                  {["Customer", "Unit", "Due Amount", "Due Date", "Overdue", "Paid So Far", "Action"].map(h => (
                    <th key={h} className={`px-4 py-3 text-left text-xs font-semibold ${muted} uppercase tracking-wide whitespace-nowrap`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className={`divide-y ${isDark ? "divide-slate-700/50" : "divide-slate-100"}`}>
                {filtered.map(d => (
                  <tr key={d.id} className={`hover:${isDark ? "bg-slate-700/30" : "bg-slate-50"}`}>
                    <td className="px-4 py-3">
                      <div className={`text-xs font-semibold ${text}`}>{d.customer}</div>
                      <div className={`text-xs ${muted}`}>{d.mobile}</div>
                    </td>
                    <td className={`px-4 py-3 text-xs ${muted}`}>{d.unit}</td>
                    <td className={`px-4 py-3 text-xs font-bold ${d.overdue > 0 ? "text-red-500" : "text-orange-500"}`}>{d.due}</td>
                    <td className={`px-4 py-3 text-xs ${muted}`}>{d.dueDate}</td>
                    <td className="px-4 py-3">
                      {d.overdue > 0 ? (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-700 font-medium">{d.overdue}d overdue</span>
                      ) : (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">Upcoming</span>
                      )}
                    </td>
                    <td className={`px-4 py-3 text-xs font-medium ${text}`}>{d.totalPaid}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1.5">
                        <button className="text-xs px-2 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Collect</button>
                        <button className={`text-xs px-2 py-1 rounded-lg border ${isDark ? "border-slate-600 text-slate-300" : "border-slate-200 text-slate-600"}`}>
                          <Bell size={11} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === "analytics" && (
        <div className={`${card} p-5`}>
          <h3 className={`font-semibold mb-4 ${text}`}>Collection vs Target (₹ Lakhs)</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={COLLECTION_DATA} barSize={20}>
              <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "#1e293b" : "#f1f5f9"} />
              <XAxis dataKey="month" tick={{ fill: axisColor, fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: axisColor, fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="collected" name="Collected" fill="#10B981" radius={[4, 4, 0, 0]} />
              <Bar dataKey="target" name="Target" fill="#2563EB" radius={[4, 4, 0, 0]} opacity={0.3} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {activeTab === "emi" && (
        <div className={`${card} overflow-hidden`}>
          <div className={`px-5 py-4 border-b ${border}`}>
            <h3 className={`font-semibold ${text}`}>EMI Schedule Tracker</h3>
            <p className={`text-xs ${muted} mt-0.5`}>Showing customers with upcoming/overdue EMIs</p>
          </div>
          <div className="p-5 space-y-3">
            {PENDING_DUES.map(d => (
              <div key={d.id} className={`p-4 rounded-xl border ${border} flex items-center gap-4 flex-wrap`}>
                <div className="flex-1 min-w-0">
                  <div className={`text-sm font-medium ${text}`}>{d.customer}</div>
                  <div className={`text-xs ${muted} mt-0.5`}>{d.unit}</div>
                </div>
                <div className="text-center">
                  <div className={`text-xs ${muted}`}>Due Amount</div>
                  <div className={`text-sm font-bold ${d.overdue > 0 ? "text-red-500" : text}`}>{d.due}</div>
                </div>
                <div className="text-center">
                  <div className={`text-xs ${muted}`}>Due Date</div>
                  <div className={`text-xs ${text}`}>{d.dueDate}</div>
                </div>
                <div>
                  {d.overdue > 0 ? (
                    <span className="text-xs px-2 py-1 bg-red-100 text-red-700 rounded-full">{d.overdue}d late</span>
                  ) : (
                    <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full">On schedule</span>
                  )}
                </div>
                <button className="px-3 py-1.5 bg-blue-600 text-white text-xs rounded-lg hover:bg-blue-700">Collect</button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Payment entry modal */}
      {showPaymentForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className={`w-full max-w-lg rounded-2xl border shadow-2xl ${isDark ? "bg-slate-900 border-slate-700" : "bg-white border-slate-200"}`}>
            <div className={`flex items-center justify-between px-5 py-4 border-b ${border}`}>
              <h3 className={`font-semibold ${text}`}>Record Payment</h3>
              <button onClick={() => setShowPaymentForm(false)} className={`${muted} hover:text-red-500`}><X size={18} /></button>
            </div>
            <div className="p-5 space-y-4">
              {[
                { key: "customer", label: "Customer Name", placeholder: "Customer name" },
                { key: "unit", label: "Unit", placeholder: "Unit number" },
                { key: "amount", label: "Payment Amount (₹)", placeholder: "0.00" },
                { key: "mode", label: "Payment Mode", placeholder: "NEFT / RTGS / UPI" },
                { key: "type", label: "Payment Type", placeholder: "EMI / Booking / Full" },
              ].map(f => (
                <div key={f.key}>
                  <label className={`block text-xs font-medium mb-1.5 ${isDark ? "text-slate-300" : "text-slate-700"}`}>{f.label}</label>
                  {f.key === "customer" ? (
                    <select
                      value={payForm.customer}
                      onChange={(e) => {
                        const selectedCustomer = customers.find(c => c.name === e.target.value);
                        setPayForm({
                          ...payForm,
                          customer: e.target.value,
                          unit: selectedCustomer ? selectedCustomer.unit : payForm.unit
                        });
                      }}
                      className={`w-full px-3 py-2.5 rounded-xl border text-sm outline-none focus:border-blue-500 ${isDark ? "bg-slate-800 border-slate-700 text-white" : "bg-slate-50 border-slate-200 text-slate-800"}`}
                    >
                      <option value="" disabled>Select a customer</option>
                      {customers.map((c) => (
                        <option key={c.id} value={c.name}>
                          {c.name} {c.unit ? `(${c.unit})` : ''}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      placeholder={f.placeholder}
                      value={payForm[f.key as keyof typeof payForm]}
                      onChange={(e) => setPayForm({ ...payForm, [f.key]: e.target.value })}
                      className={`w-full px-3 py-2.5 rounded-xl border text-sm outline-none focus:border-blue-500 ${isDark ? "bg-slate-800 border-slate-700 text-white placeholder-slate-500" : "bg-slate-50 border-slate-200 text-slate-800"}`}
                    />
                  )}
                </div>
              ))}
            </div>
            <div className={`flex justify-end gap-3 px-5 py-4 border-t ${border}`}>
              <button onClick={() => setShowPaymentForm(false)} className={`px-4 py-2 rounded-xl border text-sm ${isDark ? "border-slate-700 text-slate-300" : "border-slate-200 text-slate-700"}`}>Cancel</button>
              <button onClick={handleSavePayment} disabled={saving} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white rounded-xl text-sm font-medium">
                {saving ? "Saving..." : "Save & Generate Receipt"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

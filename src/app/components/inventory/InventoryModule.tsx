import { useState } from "react";
import { Search, Plus, AlertTriangle, Package, Truck, ShoppingCart, BarChart3 } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const MATERIALS = [
  { id: 1, name: "Steel TMT Bars (Fe500)", unit: "MT", stock: 45, minStock: 50, ordered: 100, cost: "₹68,000/MT", category: "Steel", vendor: "JSW Steel", status: "Low Stock" },
  { id: 2, name: "Cement (OPC 53 Grade)", unit: "Bags", stock: 2400, minStock: 1000, ordered: 0, cost: "₹380/bag", category: "Cement", vendor: "UltraTech", status: "In Stock" },
  { id: 3, name: "River Sand (M-Sand)", unit: "CFT", stock: 8200, minStock: 5000, ordered: 0, cost: "₹45/CFT", category: "Aggregate", vendor: "Local Supplier", status: "In Stock" },
  { id: 4, name: "Crushed Aggregate 20mm", unit: "CFT", stock: 3200, minStock: 3000, ordered: 5000, cost: "₹38/CFT", category: "Aggregate", vendor: "Stone Works", status: "In Stock" },
  { id: 5, name: "Red Bricks (Class A)", unit: "Nos", stock: 45000, minStock: 20000, ordered: 0, cost: "₹8/brick", category: "Masonry", vendor: "Brick Factory", status: "In Stock" },
  { id: 6, name: "UPVC Pipes 4 inch", unit: "Mtrs", stock: 120, minStock: 200, ordered: 300, cost: "₹180/mtr", category: "Plumbing", vendor: "Astral Pipes", status: "Low Stock" },
  { id: 7, name: "Ceramic Floor Tiles 60x60", unit: "Sqft", stock: 8500, minStock: 2000, ordered: 0, cost: "₹45/sqft", category: "Tiles", vendor: "Asian Granito", status: "In Stock" },
  { id: 8, name: "Electrical Wire 4sqmm", unit: "Mtrs", stock: 1200, minStock: 2000, ordered: 3000, cost: "₹85/mtr", category: "Electrical", vendor: "Polycab", status: "Low Stock" },
];

const PURCHASE_ORDERS = [
  { id: "PO-4521", vendor: "JSW Steel Ltd", items: "TMT Bars 100MT", value: "₹68,00,000", date: "12 May", delivery: "20 May", status: "Confirmed" },
  { id: "PO-4520", vendor: "Astral Pipes", items: "UPVC Pipes 300 Mtrs", value: "₹54,000", date: "11 May", delivery: "18 May", status: "In Transit" },
  { id: "PO-4519", vendor: "Polycab Wires", items: "Electrical Wire 3000 Mtrs", value: "₹2,55,000", date: "10 May", delivery: "16 May", status: "Delivered" },
  { id: "PO-4518", vendor: "UltraTech Cement", items: "Cement 2000 Bags", value: "₹7,60,000", date: "08 May", delivery: "14 May", status: "Delivered" },
];

const USAGE_DATA = [
  { material: "Steel", usage: 38, cost: 258 },
  { material: "Cement", usage: 52, cost: 76 },
  { material: "Sand", usage: 48, cost: 22 },
  { material: "Aggregate", usage: 44, cost: 18 },
  { material: "Tiles", usage: 28, cost: 45 },
];

type InventoryModuleProps = { isDark: boolean };

export function InventoryModule({ isDark }: InventoryModuleProps) {
  const [activeTab, setActiveTab] = useState("materials");
  const [search, setSearch] = useState("");

  const text = isDark ? "text-white" : "text-slate-800";
  const muted = "text-slate-500";
  const border = isDark ? "border-slate-700" : "border-slate-200";
  const card = `bg-white dark:bg-slate-800 border ${border} rounded-2xl`;

  const filtered = MATERIALS.filter(m =>
    m.name.toLowerCase().includes(search.toLowerCase()) || m.category.toLowerCase().includes(search.toLowerCase())
  );
  const lowStock = MATERIALS.filter(m => m.status === "Low Stock");

  return (
    <div className="p-5 space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className={text}>Inventory & Procurement</h1>
          <p className={`text-sm ${muted}`}>{MATERIALS.length} materials · {lowStock.length} low stock alerts</p>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium">
            <Plus size={15} /> Create PO
          </button>
        </div>
      </div>

      {/* Low stock alert */}
      {lowStock.length > 0 && (
        <div className="flex items-center gap-3 p-3 bg-orange-50 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-800 rounded-xl">
          <AlertTriangle size={16} className="text-orange-500 flex-shrink-0" />
          <div className="flex-1">
            <span className="text-sm font-medium text-orange-800 dark:text-orange-300">{lowStock.length} materials below minimum stock: </span>
            <span className="text-sm text-orange-700 dark:text-orange-400">{lowStock.map(m => m.name).join(", ")}</span>
          </div>
          <button className="text-xs text-orange-600 hover:text-orange-700 font-medium whitespace-nowrap">Order Now</button>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "Total Items", value: MATERIALS.length, icon: Package, color: "blue" },
          { label: "Low Stock", value: lowStock.length, icon: AlertTriangle, color: "orange" },
          { label: "Open POs", value: 3, icon: ShoppingCart, color: "purple" },
          { label: "This Month Spend", value: "₹78.4L", icon: BarChart3, color: "emerald" },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className={`${card} p-4`}>
            <div className="flex items-center justify-between">
              <div>
                <div className={`text-xs ${muted} uppercase tracking-wide`}>{label}</div>
                <div className={`text-2xl font-bold mt-1 ${text}`}>{value}</div>
              </div>
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                color === "blue" ? "bg-blue-100 text-blue-600" :
                color === "orange" ? "bg-orange-100 text-orange-600" :
                color === "purple" ? "bg-purple-100 text-purple-600" : "bg-emerald-100 text-emerald-600"
              }`}>
                <Icon size={15} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100 dark:bg-slate-800 rounded-xl p-0.5 w-fit">
        {["materials", "purchase-orders", "vendors", "analytics"].map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)} className={`px-4 py-1.5 rounded-lg text-xs font-medium capitalize transition-all whitespace-nowrap ${activeTab === tab ? "bg-white dark:bg-slate-700 shadow-sm text-slate-800 dark:text-white" : "text-slate-500"}`}>
            {tab.replace("-", " ")}
          </button>
        ))}
      </div>

      {activeTab === "materials" && (
        <>
          <div className={`flex items-center gap-2 px-3 py-2 rounded-xl border ${isDark ? "bg-slate-800 border-slate-700" : "bg-white border-slate-200"} w-72`}>
            <Search size={14} className={muted} />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search materials..." className={`flex-1 text-sm bg-transparent outline-none ${isDark ? "text-white" : "text-slate-800"}`} />
          </div>
          <div className={`${card} overflow-hidden`}>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className={`border-b ${border} ${isDark ? "bg-slate-900/50" : "bg-slate-50"}`}>
                    {["Material", "Category", "Stock", "Min Stock", "Unit", "Cost", "Vendor", "Status"].map(h => (
                      <th key={h} className={`px-4 py-3 text-left text-xs font-semibold ${muted} uppercase tracking-wide whitespace-nowrap`}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className={`divide-y ${isDark ? "divide-slate-700/50" : "divide-slate-100"}`}>
                  {filtered.map(m => (
                    <tr key={m.id} className={`hover:${isDark ? "bg-slate-700/30" : "bg-slate-50"}`}>
                      <td className={`px-4 py-3 text-xs font-medium ${text} max-w-48`}>
                        <div className="truncate">{m.name}</div>
                      </td>
                      <td className={`px-4 py-3 text-xs ${muted}`}>{m.category}</td>
                      <td className={`px-4 py-3 text-xs font-semibold ${m.status === "Low Stock" ? "text-orange-500" : text}`}>{m.stock.toLocaleString()}</td>
                      <td className={`px-4 py-3 text-xs ${muted}`}>{m.minStock.toLocaleString()}</td>
                      <td className={`px-4 py-3 text-xs ${muted}`}>{m.unit}</td>
                      <td className={`px-4 py-3 text-xs ${text}`}>{m.cost}</td>
                      <td className={`px-4 py-3 text-xs ${muted} whitespace-nowrap`}>{m.vendor}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${m.status === "Low Stock" ? "bg-orange-100 text-orange-700" : "bg-emerald-100 text-emerald-700"}`}>
                          {m.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {activeTab === "purchase-orders" && (
        <div className={`${card} overflow-hidden`}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className={`border-b ${border} ${isDark ? "bg-slate-900/50" : "bg-slate-50"}`}>
                  {["PO Number", "Vendor", "Items", "Value", "Order Date", "Delivery", "Status"].map(h => (
                    <th key={h} className={`px-4 py-3 text-left text-xs font-semibold ${muted} uppercase tracking-wide whitespace-nowrap`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className={`divide-y ${isDark ? "divide-slate-700/50" : "divide-slate-100"}`}>
                {PURCHASE_ORDERS.map(po => (
                  <tr key={po.id} className={`hover:${isDark ? "bg-slate-700/30" : "bg-slate-50"}`}>
                    <td className={`px-4 py-3 text-xs font-mono font-semibold ${text}`}>{po.id}</td>
                    <td className={`px-4 py-3 text-xs font-medium ${text}`}>{po.vendor}</td>
                    <td className={`px-4 py-3 text-xs ${muted}`}>{po.items}</td>
                    <td className={`px-4 py-3 text-xs font-semibold ${text}`}>{po.value}</td>
                    <td className={`px-4 py-3 text-xs ${muted}`}>{po.date}</td>
                    <td className={`px-4 py-3 text-xs ${muted}`}>{po.delivery}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        po.status === "Delivered" ? "bg-emerald-100 text-emerald-700" :
                        po.status === "In Transit" ? "bg-blue-100 text-blue-700" : "bg-orange-100 text-orange-700"
                      }`}>{po.status}</span>
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
          <h3 className={`font-semibold mb-4 ${text}`}>Material Usage & Cost (May 2026, ₹ Lakhs)</h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={USAGE_DATA} barSize={24}>
              <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "#1e293b" : "#f1f5f9"} />
              <XAxis dataKey="material" tick={{ fill: isDark ? "#475569" : "#94a3b8", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: isDark ? "#475569" : "#94a3b8", fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ backgroundColor: isDark ? "#1e293b" : "white", borderRadius: "12px" }} />
              <Bar dataKey="usage" name="Usage Units" fill="#2563EB" radius={[4, 4, 0, 0]} />
              <Bar dataKey="cost" name="Cost (L)" fill="#10B981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {activeTab === "vendors" && (
        <div className={`${card} p-5`}>
          <h3 className={`font-semibold mb-4 ${text}`}>Vendor List</h3>
          <div className="space-y-3">
            {[
              { name: "JSW Steel Ltd", category: "Steel", contact: "+91 22 4286 1000", rating: 4.8, orders: 24, spend: "₹2.4Cr" },
              { name: "UltraTech Cement", category: "Cement", contact: "+91 79 6676 5000", rating: 4.6, orders: 48, spend: "₹86L" },
              { name: "Astral Pipes", category: "Plumbing", contact: "+91 79 6660 7000", rating: 4.5, orders: 12, spend: "₹14L" },
              { name: "Polycab Wires", category: "Electrical", contact: "+91 22 6614 1000", rating: 4.7, orders: 18, spend: "₹28L" },
            ].map(v => (
              <div key={v.name} className={`flex items-center gap-4 p-4 rounded-xl border ${border} flex-wrap`}>
                <div className="w-10 h-10 rounded-xl bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 font-bold text-sm flex-shrink-0">
                  {v.name[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className={`text-sm font-medium ${text}`}>{v.name}</div>
                  <div className={`text-xs ${muted}`}>{v.category} · {v.contact}</div>
                </div>
                <div className="flex gap-4 text-center">
                  <div>
                    <div className="text-xs text-yellow-500">★ {v.rating}</div>
                    <div className={`text-xs ${muted}`}>Rating</div>
                  </div>
                  <div>
                    <div className={`text-xs font-medium ${text}`}>{v.orders}</div>
                    <div className={`text-xs ${muted}`}>Orders</div>
                  </div>
                  <div>
                    <div className={`text-xs font-medium text-emerald-600`}>{v.spend}</div>
                    <div className={`text-xs ${muted}`}>Total Spend</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

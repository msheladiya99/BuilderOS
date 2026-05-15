import { useState } from "react";
import { Search, Filter, Download, ChevronUp, ChevronDown, Eye, X, IndianRupee, Home, User, FileText } from "lucide-react";

const UNITS = [
  { id: 1, unit: "101", floor: 1, tower: "A", type: "1BHK", area: 620, status: "Sold", owner: "Rahul Sharma", contact: "+91 98765 43210", price: "₹38.4L", paid: "₹38.4L", balance: "—", booking: "Mar 2023", possession: "Dec 2025", facing: "East" },
  { id: 2, unit: "102", floor: 1, tower: "A", type: "2BHK", area: 980, status: "Sold", owner: "Priya Patel", contact: "+91 87654 32109", price: "₹62.5L", paid: "₹55L", balance: "₹7.5L", booking: "Apr 2023", possession: "Dec 2025", facing: "West" },
  { id: 3, unit: "103", floor: 1, tower: "A", type: "2BHK", area: 1020, status: "Available", owner: "—", contact: "—", price: "₹65L", paid: "—", balance: "—", booking: "—", possession: "Dec 2025", facing: "North" },
  { id: 4, unit: "201", floor: 2, tower: "A", type: "3BHK", area: 1450, status: "Booked", owner: "Amit Desai", contact: "+91 76543 21098", price: "₹92L", paid: "₹10L", balance: "₹82L", booking: "Feb 2024", possession: "Dec 2025", facing: "South" },
  { id: 5, unit: "202", floor: 2, tower: "A", type: "2BHK", area: 960, status: "Available", owner: "—", contact: "—", price: "₹61.5L", paid: "—", balance: "—", booking: "—", possession: "Dec 2025", facing: "East" },
  { id: 6, unit: "203", floor: 2, tower: "A", type: "1BHK", area: 600, status: "Sold", owner: "Sunita Joshi", contact: "+91 65432 10987", price: "₹37.2L", paid: "₹37.2L", balance: "—", booking: "Jan 2024", possession: "Dec 2025", facing: "West" },
  { id: 7, unit: "301", floor: 3, tower: "B", type: "4BHK", area: 2100, status: "Sold", owner: "Vikram Singh", contact: "+91 54321 09876", price: "₹1.45Cr", paid: "₹1.2Cr", balance: "₹25L", booking: "Mar 2023", possession: "Dec 2025", facing: "Sea View" },
  { id: 8, unit: "302", floor: 3, tower: "B", type: "3BHK", area: 1480, status: "Reserved", owner: "Kavya Nair", contact: "+91 43210 98765", price: "₹95L", paid: "₹5L", balance: "₹90L", booking: "May 2024", possession: "Dec 2025", facing: "North" },
  { id: 9, unit: "401", floor: 4, tower: "B", type: "2BHK", area: 1000, status: "Available", owner: "—", contact: "—", price: "₹64L", paid: "—", balance: "—", booking: "—", possession: "Dec 2025", facing: "East" },
  { id: 10, unit: "402", floor: 4, tower: "B", type: "3BHK", area: 1500, status: "Sold", owner: "Meena Krishnan", contact: "+91 32109 87654", price: "₹98L", paid: "₹98L", balance: "—", booking: "Nov 2022", possession: "Dec 2025", facing: "Garden" },
];

const STATUS_COLORS: Record<string, string> = {
  Sold: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
  Booked: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300",
  Available: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  Reserved: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300",
};

const FLOOR_PLAN_UNITS = [
  { unit: "101", status: "Sold", type: "1BHK" },
  { unit: "102", status: "Sold", type: "2BHK" },
  { unit: "103", status: "Available", type: "2BHK" },
  { unit: "104", status: "Booked", type: "3BHK" },
  { unit: "201", status: "Booked", type: "3BHK" },
  { unit: "202", status: "Available", type: "2BHK" },
  { unit: "203", status: "Sold", type: "1BHK" },
  { unit: "204", status: "Reserved", type: "4BHK" },
  { unit: "301", status: "Sold", type: "4BHK" },
  { unit: "302", status: "Reserved", type: "3BHK" },
  { unit: "303", status: "Available", type: "2BHK" },
  { unit: "304", status: "Sold", type: "1BHK" },
];

type UnitsModuleProps = { isDark: boolean };

export function UnitsModule({ isDark }: UnitsModuleProps) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [typeFilter, setTypeFilter] = useState("All");
  const [selectedUnit, setSelectedUnit] = useState<typeof UNITS[0] | null>(null);
  const [viewMode, setViewMode] = useState<"table" | "floorplan">("table");
  const [sortCol, setSortCol] = useState<string>("unit");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [activeTab, setActiveTab] = useState("details");

  const text = isDark ? "text-white" : "text-slate-800";
  const muted = "text-slate-500";
  const border = isDark ? "border-slate-700" : "border-slate-200";
  const card = `bg-white dark:bg-slate-800 border ${border}`;

  const filtered = UNITS.filter(u => {
    const matchSearch = u.unit.includes(search) || u.owner.toLowerCase().includes(search.toLowerCase()) || u.type.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "All" || u.status === statusFilter;
    const matchType = typeFilter === "All" || u.type === typeFilter;
    return matchSearch && matchStatus && matchType;
  });

  const sort = (col: string) => {
    if (sortCol === col) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortCol(col); setSortDir("asc"); }
  };

  const SortIcon = ({ col }: { col: string }) => (
    <span className="ml-1 inline-flex flex-col opacity-50">
      <ChevronUp size={10} className={sortCol === col && sortDir === "asc" ? "opacity-100 text-blue-500" : ""} />
      <ChevronDown size={10} className={sortCol === col && sortDir === "desc" ? "opacity-100 text-blue-500" : ""} />
    </span>
  );

  const stats = {
    total: UNITS.length,
    sold: UNITS.filter(u => u.status === "Sold").length,
    booked: UNITS.filter(u => u.status === "Booked").length,
    available: UNITS.filter(u => u.status === "Available").length,
  };

  return (
    <div className="p-5 space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className={text}>Unit Registry</h1>
          <p className={`text-sm ${muted}`}>Skyline Heights · {UNITS.length} units</p>
        </div>
        <div className="flex gap-2">
          <button className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-sm ${isDark ? "border-slate-700 text-slate-300 hover:bg-slate-800" : "border-slate-200 text-slate-600 hover:bg-slate-50"}`}>
            <Download size={14} /> Export
          </button>
        </div>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: "Total", value: stats.total, color: "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300" },
          { label: "Sold", value: stats.sold, color: "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300" },
          { label: "Booked", value: stats.booked, color: "bg-yellow-100 text-yellow-700" },
          { label: "Available", value: stats.available, color: "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400" },
        ].map(s => (
          <div key={s.label} className={`${card} rounded-xl p-3 text-center`}>
            <div className={`text-xl font-bold ${s.color.split(" ").slice(-2).join(" ")}`}>{s.value}</div>
            <div className={`text-xs ${muted} mt-0.5`}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* View toggle + filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex gap-1 bg-slate-100 dark:bg-slate-800 rounded-lg p-0.5">
          <button onClick={() => setViewMode("table")} className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${viewMode === "table" ? "bg-white dark:bg-slate-700 shadow-sm text-slate-800 dark:text-white" : "text-slate-500"}`}>Table View</button>
          <button onClick={() => setViewMode("floorplan")} className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${viewMode === "floorplan" ? "bg-white dark:bg-slate-700 shadow-sm text-slate-800 dark:text-white" : "text-slate-500"}`}>Floor Plan</button>
        </div>
        <div className={`flex items-center gap-2 px-3 py-2 rounded-xl border flex-1 min-w-48 ${isDark ? "bg-slate-800 border-slate-700" : "bg-white border-slate-200"}`}>
          <Search size={14} className={muted} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search unit, owner..." className={`flex-1 text-sm bg-transparent outline-none ${isDark ? "text-white placeholder-slate-500" : "text-slate-800"}`} />
        </div>
        {["All", "Sold", "Booked", "Available", "Reserved"].map(s => (
          <button key={s} onClick={() => setStatusFilter(s)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${statusFilter === s ? "bg-blue-600 text-white" : isDark ? "bg-slate-800 text-slate-400 border border-slate-700 hover:bg-slate-700" : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"}`}>{s}</button>
        ))}
      </div>

      {viewMode === "table" && (
        <div className={`${card} rounded-2xl overflow-hidden`}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className={`border-b ${border} ${isDark ? "bg-slate-900/50" : "bg-slate-50"}`}>
                  {[
                    { key: "unit", label: "Unit" },
                    { key: "floor", label: "Floor" },
                    { key: "tower", label: "Tower" },
                    { key: "type", label: "Type" },
                    { key: "area", label: "Area (sqft)" },
                    { key: "status", label: "Status" },
                    { key: "owner", label: "Owner" },
                    { key: "price", label: "Price" },
                    { key: "balance", label: "Balance" },
                    { key: "actions", label: "" },
                  ].map(col => (
                    <th key={col.key} onClick={() => col.key !== "actions" && sort(col.key)}
                      className={`text-left px-4 py-3 text-xs font-semibold ${muted} uppercase tracking-wide whitespace-nowrap ${col.key !== "actions" ? "cursor-pointer hover:text-slate-700" : ""}`}>
                      {col.label}
                      {col.key !== "actions" && col.key !== "status" && <SortIcon col={col.key} />}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className={`divide-y ${isDark ? "divide-slate-700/50" : "divide-slate-100"}`}>
                {filtered.map(unit => (
                  <tr key={unit.id} className={`hover:${isDark ? "bg-slate-700/30" : "bg-slate-50"} transition-colors`}>
                    <td className="px-4 py-3">
                      <span className={`font-semibold ${text}`}>{unit.unit}</span>
                    </td>
                    <td className={`px-4 py-3 text-xs ${muted}`}>{unit.floor}</td>
                    <td className={`px-4 py-3 text-xs ${muted}`}>{unit.tower}</td>
                    <td className={`px-4 py-3 text-xs font-medium ${text}`}>{unit.type}</td>
                    <td className={`px-4 py-3 text-xs ${muted}`}>{unit.area.toLocaleString()}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[unit.status]}`}>{unit.status}</span>
                    </td>
                    <td className={`px-4 py-3 text-xs ${unit.owner !== "—" ? text : muted}`}>{unit.owner}</td>
                    <td className={`px-4 py-3 text-xs font-semibold ${text}`}>{unit.price}</td>
                    <td className={`px-4 py-3 text-xs ${unit.balance !== "—" && unit.balance !== "" ? "text-orange-500 font-medium" : muted}`}>{unit.balance || "—"}</td>
                    <td className="px-4 py-3">
                      <button onClick={() => setSelectedUnit(unit)} className="text-blue-500 hover:text-blue-600">
                        <Eye size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {viewMode === "floorplan" && (
        <div className={`${card} rounded-2xl p-5`}>
          <h3 className={`font-semibold mb-4 ${text}`}>Interactive Floor Plan — Skyline Heights</h3>
          <div className="flex gap-4 mb-4 flex-wrap">
            {Object.entries(STATUS_COLORS).map(([status, cls]) => (
              <div key={status} className="flex items-center gap-1.5">
                <div className={`w-3 h-3 rounded-sm ${cls.split(" ").slice(0, 2).join(" ")}`} />
                <span className={`text-xs ${muted}`}>{status}</span>
              </div>
            ))}
          </div>
          {["Floor 3", "Floor 2", "Floor 1"].map((floor, fi) => (
            <div key={floor} className="mb-4">
              <div className={`text-xs font-medium ${muted} mb-2`}>{floor}</div>
              <div className="flex gap-2 flex-wrap">
                {FLOOR_PLAN_UNITS.slice(fi * 4, fi * 4 + 4).map(u => (
                  <div
                    key={u.unit}
                    className={`w-24 h-20 rounded-xl border-2 flex flex-col items-center justify-center cursor-pointer transition-transform hover:scale-105 ${
                      u.status === "Sold" ? "bg-blue-100 border-blue-400 dark:bg-blue-900/40 dark:border-blue-500" :
                      u.status === "Booked" ? "bg-yellow-100 border-yellow-400" :
                      u.status === "Reserved" ? "bg-purple-100 border-purple-400" :
                      "bg-emerald-100 border-emerald-400 dark:bg-emerald-900/30 dark:border-emerald-500"
                    }`}
                  >
                    <span className="text-sm font-bold text-slate-700">{u.unit}</span>
                    <span className="text-xs text-slate-500 mt-0.5">{u.type}</span>
                    <span className={`text-xs mt-1 font-medium ${
                      u.status === "Sold" ? "text-blue-700" :
                      u.status === "Booked" ? "text-yellow-700" :
                      u.status === "Reserved" ? "text-purple-700" : "text-emerald-700"
                    }`}>{u.status}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Unit detail modal */}
      {selectedUnit && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-end">
          <div className={`h-full w-full max-w-lg ${isDark ? "bg-slate-900" : "bg-white"} overflow-y-auto`}>
            <div className={`flex items-center justify-between px-5 py-4 border-b ${isDark ? "border-slate-700" : "border-slate-200"} sticky top-0 ${isDark ? "bg-slate-900" : "bg-white"} z-10`}>
              <div>
                <h3 className={`font-semibold ${text}`}>Unit {selectedUnit.unit}</h3>
                <p className={`text-xs ${muted}`}>Tower {selectedUnit.tower} · Floor {selectedUnit.floor}</p>
              </div>
              <button onClick={() => setSelectedUnit(null)} className={`${muted} hover:text-red-500`}><X size={18} /></button>
            </div>

            <div className={`flex border-b ${isDark ? "border-slate-700" : "border-slate-200"}`}>
              {["details", "payments", "documents", "loan"].map(tab => (
                <button key={tab} onClick={() => setActiveTab(tab)} className={`px-4 py-2.5 text-xs font-medium capitalize transition-colors border-b-2 ${activeTab === tab ? "border-blue-600 text-blue-600" : `border-transparent ${muted}`}`}>
                  {tab}
                </button>
              ))}
            </div>

            <div className="p-5 space-y-4">
              {activeTab === "details" && (
                <>
                  <div className="flex items-center justify-between">
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${STATUS_COLORS[selectedUnit.status]}`}>{selectedUnit.status}</span>
                    <span className={`font-bold text-lg ${text}`}>{selectedUnit.price}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { icon: Home, label: "Type", value: selectedUnit.type },
                      { icon: Home, label: "Area", value: `${selectedUnit.area} sqft` },
                      { icon: Home, label: "Facing", value: selectedUnit.facing },
                      { icon: Home, label: "Floor", value: `Floor ${selectedUnit.floor}` },
                    ].map(i => (
                      <div key={i.label} className={`p-3 rounded-xl ${isDark ? "bg-slate-800" : "bg-slate-50"}`}>
                        <div className={`text-xs ${muted}`}>{i.label}</div>
                        <div className={`text-sm font-medium ${text} mt-0.5`}>{i.value}</div>
                      </div>
                    ))}
                  </div>
                  {selectedUnit.owner !== "—" && (
                    <div className={`p-4 rounded-xl border ${isDark ? "bg-slate-800 border-slate-700" : "bg-slate-50 border-slate-200"}`}>
                      <h4 className={`text-sm font-medium mb-3 ${text}`}>Owner Details</h4>
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-bold">
                          {selectedUnit.owner.split(" ").map(n => n[0]).join("")}
                        </div>
                        <div>
                          <div className={`text-sm font-medium ${text}`}>{selectedUnit.owner}</div>
                          <div className={`text-xs ${muted}`}>{selectedUnit.contact}</div>
                        </div>
                      </div>
                      {[
                        { label: "Booking Date", value: selectedUnit.booking },
                        { label: "Possession Date", value: selectedUnit.possession },
                        { label: "Total Price", value: selectedUnit.price },
                        { label: "Amount Paid", value: selectedUnit.paid },
                        { label: "Balance Due", value: selectedUnit.balance || "Fully Paid" },
                      ].map(d => (
                        <div key={d.label} className={`flex justify-between py-1.5 border-b ${isDark ? "border-slate-700/50" : "border-slate-200"} last:border-0`}>
                          <span className={`text-xs ${muted}`}>{d.label}</span>
                          <span className={`text-xs font-medium ${d.label === "Balance Due" && selectedUnit.balance ? "text-orange-500" : text}`}>{d.value}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
              {activeTab !== "details" && (
                <div className="text-center py-16">
                  <FileText size={32} className="mx-auto text-slate-300 mb-3" />
                  <p className={`text-sm ${text}`}>No {activeTab} data</p>
                  <p className={`text-xs ${muted} mt-1`}>This section is empty</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

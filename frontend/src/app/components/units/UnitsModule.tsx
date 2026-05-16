import { useState, useMemo } from "react";
import { useData } from "../../../context/DataContext";
import type { Unit } from "../../../types";
import { 
  Search, Filter, Download, Upload, ChevronUp, ChevronDown, Eye, X, 
  IndianRupee, Home, User, FileText, Grid, List, LayoutPanelLeft,
  CheckCircle, Edit2, Layers, MapPin, Car, Tag, Clock
} from "lucide-react";

const STATUS_COLORS: Record<string, string> = {
  Sold: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
  Booked: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300",
  Available: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  Reserved: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300",
};

const STATUS_BORDER_COLORS: Record<string, string> = {
  Sold: "border-blue-400 dark:border-blue-500",
  Booked: "border-yellow-400 dark:border-yellow-500",
  Available: "border-emerald-400 dark:border-emerald-500",
  Reserved: "border-purple-400 dark:border-purple-500",
};

type UnitsModuleProps = { isDark: boolean };

export function UnitsModule({ isDark }: UnitsModuleProps) {
  const { units, selectedProjectId } = useData();
  const projectUnits = selectedProjectId
    ? units.filter((u) => u.projectId === selectedProjectId)
    : units;
    
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [towerFilter, setTowerFilter] = useState("All");
  const [floorFilter, setFloorFilter] = useState("All");
  const [selectedUnit, setSelectedUnit] = useState<Unit | null>(null);
  const [viewMode, setViewMode] = useState<"table" | "heatmap" | "cards">("table");
  const [sortCol, setSortCol] = useState<string>("unit");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  const text = isDark ? "text-white" : "text-slate-800";
  const muted = isDark ? "text-slate-400" : "text-slate-500";
  const border = isDark ? "border-slate-700" : "border-slate-200";
  const card = `bg-white dark:bg-slate-800 border ${border}`;
  const interactiveBg = isDark ? "hover:bg-slate-700" : "hover:bg-slate-50";

  // Derive unique towers and floors
  const towers = useMemo(() => Array.from(new Set(projectUnits.map(u => u.tower))).sort(), [projectUnits]);
  const floors = useMemo(() => Array.from(new Set(projectUnits.map(u => u.floor))).sort((a,b) => a-b), [projectUnits]);

  const filtered = projectUnits.filter(u => {
    const matchSearch = u.unit.includes(search) || u.owner.toLowerCase().includes(search.toLowerCase()) || u.type.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "All" || u.status === statusFilter;
    const matchTower = towerFilter === "All" || u.tower === towerFilter;
    const matchFloor = floorFilter === "All" || u.floor.toString() === floorFilter;
    return matchSearch && matchStatus && matchTower && matchFloor;
  });

  const sort = (col: string) => {
    if (sortCol === col) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortCol(col); setSortDir("asc"); }
  };

  const sortedAndFiltered = [...filtered].sort((a, b) => {
    const valA = a[sortCol as keyof Unit] || "";
    const valB = b[sortCol as keyof Unit] || "";
    if (valA < valB) return sortDir === "asc" ? -1 : 1;
    if (valA > valB) return sortDir === "asc" ? 1 : -1;
    return 0;
  });

  return (
    <div className="p-5 flex flex-col h-[calc(100vh-4rem)] overflow-hidden">
      {/* Top Header & Actions */}
      <div className="flex items-center justify-between flex-wrap gap-3 mb-5">
        <div>
          <h1 className={`text-xl font-bold ${text}`}>Unit Management</h1>
          <p className={`text-sm ${muted}`}>{filtered.length} units found across {towers.length} towers</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <div className={`flex items-center gap-2 px-3 py-2 rounded-xl border flex-1 min-w-48 ${isDark ? "bg-slate-800 border-slate-700" : "bg-white border-slate-200"}`}>
            <Search size={14} className={muted} />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search unit, owner..." className={`flex-1 text-sm bg-transparent outline-none ${isDark ? "text-white placeholder-slate-500" : "text-slate-800"}`} />
          </div>
          <button className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-sm font-medium ${isDark ? "border-slate-700 text-slate-300 hover:bg-slate-800" : "border-slate-200 text-slate-600 hover:bg-slate-50"}`}>
            <Filter size={14} /> Advanced
          </button>
          <button className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-sm font-medium ${isDark ? "border-slate-700 text-slate-300 hover:bg-slate-800" : "border-slate-200 text-slate-600 hover:bg-slate-50"}`}>
            <Upload size={14} /> Import
          </button>
          <button className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-sm font-medium ${isDark ? "border-slate-700 text-slate-300 hover:bg-slate-800" : "border-slate-200 text-slate-600 hover:bg-slate-50"}`}>
            <Download size={14} /> Export
          </button>
          <div className="flex gap-1 bg-slate-100 dark:bg-slate-800 rounded-xl p-1 ml-2">
            <button onClick={() => setViewMode("table")} className={`p-1.5 rounded-lg transition-colors ${viewMode === "table" ? "bg-white dark:bg-slate-700 shadow-sm text-blue-600 dark:text-blue-400" : muted}`}><List size={16} /></button>
            <button onClick={() => setViewMode("heatmap")} className={`p-1.5 rounded-lg transition-colors ${viewMode === "heatmap" ? "bg-white dark:bg-slate-700 shadow-sm text-blue-600 dark:text-blue-400" : muted}`}><Grid size={16} /></button>
            <button onClick={() => setViewMode("cards")} className={`p-1.5 rounded-lg transition-colors ${viewMode === "cards" ? "bg-white dark:bg-slate-700 shadow-sm text-blue-600 dark:text-blue-400" : muted}`}><LayoutPanelLeft size={16} /></button>
          </div>
        </div>
      </div>

      <div className="flex flex-1 gap-5 overflow-hidden">
        {/* Left Sidebar Filters */}
        <div className={`w-64 flex-shrink-0 flex flex-col gap-4 overflow-y-auto ${isDark ? "border-slate-700" : "border-slate-200"} pr-2 scrollbar-hide`}>
          {/* Status Breakdown */}
          <div className={`${card} rounded-2xl p-4`}>
            <h3 className={`text-xs font-bold uppercase tracking-wider mb-3 ${muted}`}>Status</h3>
            <div className="space-y-2">
              {["All", "Available", "Booked", "Sold", "Reserved"].map(s => {
                const count = s === "All" ? projectUnits.length : projectUnits.filter(u => u.status === s).length;
                return (
                  <button key={s} onClick={() => setStatusFilter(s)} className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-sm transition-colors ${statusFilter === s ? "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 font-semibold" : `text-slate-600 dark:text-slate-300 ${interactiveBg}`}`}>
                    <div className="flex items-center gap-2">
                      {s !== "All" && <div className={`w-2.5 h-2.5 rounded-full ${STATUS_COLORS[s]?.split(" ")[0]}`} />}
                      {s}
                    </div>
                    <span className="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md text-xs">{count}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tower Selection */}
          <div className={`${card} rounded-2xl p-4`}>
            <h3 className={`text-xs font-bold uppercase tracking-wider mb-3 ${muted}`}>Tower / Wing</h3>
            <div className="space-y-1">
              <button onClick={() => setTowerFilter("All")} className={`w-full text-left px-3 py-2 rounded-xl text-sm ${towerFilter === "All" ? "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 font-semibold" : `text-slate-600 dark:text-slate-300 ${interactiveBg}`}`}>All Towers</button>
              {towers.map(t => (
                <button key={t} onClick={() => setTowerFilter(t)} className={`w-full text-left px-3 py-2 rounded-xl text-sm ${towerFilter === t ? "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 font-semibold" : `text-slate-600 dark:text-slate-300 ${interactiveBg}`}`}>{t}</button>
              ))}
            </div>
          </div>

          {/* Floor Selection */}
          <div className={`${card} rounded-2xl p-4 mb-4`}>
            <h3 className={`text-xs font-bold uppercase tracking-wider mb-3 ${muted}`}>Floor</h3>
            <select value={floorFilter} onChange={e => setFloorFilter(e.target.value)} className={`w-full px-3 py-2.5 rounded-xl border text-sm outline-none ${isDark ? "bg-slate-800 border-slate-700 text-white" : "bg-slate-50 border-slate-200 text-slate-800"}`}>
              <option value="All">All Floors</option>
              {floors.map(f => <option key={f} value={f.toString()}>Floor {f}</option>)}
            </select>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-hidden flex flex-col bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
          
          {/* Table View */}
          {viewMode === "table" && (
            <div className="flex-1 overflow-auto">
              <table className="w-full text-sm text-left">
                <thead className={`sticky top-0 z-10 backdrop-blur-md bg-white/90 dark:bg-slate-900/90 border-b ${border}`}>
                  <tr>
                    {[
                      { key: "unit", label: "Unit No" },
                      { key: "type", label: "Type" },
                      { key: "area", label: "Area (sqft)" },
                      { key: "facing", label: "Facing" },
                      { key: "parking", label: "Parking" },
                      { key: "status", label: "Status" },
                      { key: "price", label: "Base Price" },
                      { key: "floorRise", label: "Fl. Rise" },
                      { key: "charges", label: "Charges" },
                      { key: "actions", label: "" },
                    ].map(col => (
                      <th key={col.key} onClick={() => col.key !== "actions" && sort(col.key)} className={`px-4 py-3.5 text-xs font-semibold ${muted} uppercase tracking-wide whitespace-nowrap ${col.key !== "actions" ? "cursor-pointer hover:text-slate-700 dark:hover:text-slate-300" : ""}`}>
                        <div className="flex items-center gap-1">
                          {col.label}
                          {col.key !== "actions" && (
                            <span className="flex flex-col opacity-50">
                              <ChevronUp size={10} className={sortCol === col.key && sortDir === "asc" ? "opacity-100 text-blue-500" : ""} />
                              <ChevronDown size={10} className={sortCol === col.key && sortDir === "desc" ? "opacity-100 text-blue-500" : ""} />
                            </span>
                          )}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className={`divide-y ${isDark ? "divide-slate-700/50" : "divide-slate-100"}`}>
                  {sortedAndFiltered.map(unit => (
                    <tr key={unit.id} onClick={() => setSelectedUnit(unit)} className={`cursor-pointer ${isDark ? "hover:bg-slate-700/50" : "hover:bg-slate-50"} transition-colors`}>
                      <td className={`px-4 py-3 font-semibold ${text}`}>{unit.tower}-{unit.unit}</td>
                      <td className={`px-4 py-3 text-xs ${muted}`}>{unit.type}</td>
                      <td className={`px-4 py-3 text-xs ${muted}`}>{unit.area.toLocaleString()}</td>
                      <td className={`px-4 py-3 text-xs ${muted}`}>{unit.facing || "East"}</td>
                      <td className={`px-4 py-3 text-xs ${muted}`}>{unit.parking || "1 Cov"}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-1 rounded-md font-medium ${STATUS_COLORS[unit.status]}`}>{unit.status}</span>
                      </td>
                      <td className={`px-4 py-3 font-medium ${text}`}>{unit.price}</td>
                      <td className={`px-4 py-3 text-xs ${muted}`}>{unit.floorRise || "₹1.2L"}</td>
                      <td className={`px-4 py-3 text-xs ${muted}`}>{unit.charges || "₹4L"}</td>
                      <td className="px-4 py-3 text-right">
                        <button className={`p-1.5 rounded-lg ${isDark ? "hover:bg-slate-600" : "hover:bg-slate-200"} text-slate-400 hover:text-blue-500 transition-colors`}>
                          <Edit2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Heatmap View */}
          {viewMode === "heatmap" && (
            <div className="flex-1 overflow-auto p-6">
              {towers.filter(t => towerFilter === "All" || t === towerFilter).map(tower => {
                const towerUnits = sortedAndFiltered.filter(u => u.tower === tower);
                const towerFloors = Array.from(new Set(towerUnits.map(u => u.floor))).sort((a,b) => b-a);
                return (
                  <div key={tower} className="mb-10 last:mb-0">
                    <h2 className={`text-lg font-bold mb-4 ${text}`}>Tower {tower}</h2>
                    <div className="space-y-3">
                      {towerFloors.map(floor => (
                        <div key={floor} className="flex gap-4 items-center">
                          <div className={`w-12 text-right text-xs font-bold uppercase tracking-wider ${muted}`}>FL {floor}</div>
                          <div className="flex gap-2 flex-wrap">
                            {towerUnits.filter(u => u.floor === floor).map(u => (
                              <button
                                key={u.id}
                                onClick={() => setSelectedUnit(u)}
                                className={`w-14 h-14 rounded-xl border-2 flex flex-col items-center justify-center transition-all hover:scale-105 hover:shadow-lg ${
                                  u.status === "Sold" ? "bg-blue-50 border-blue-400 dark:bg-blue-900/30 dark:border-blue-500 text-blue-700 dark:text-blue-300" :
                                  u.status === "Booked" ? "bg-yellow-50 border-yellow-400 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300" :
                                  u.status === "Reserved" ? "bg-purple-50 border-purple-400 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300" :
                                  "bg-emerald-50 border-emerald-400 dark:bg-emerald-900/20 dark:border-emerald-500 text-emerald-700 dark:text-emerald-400"
                                }`}
                              >
                                <span className="text-xs font-bold">{u.unit}</span>
                              </button>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Cards View */}
          {viewMode === "cards" && (
            <div className="flex-1 overflow-auto p-5">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {sortedAndFiltered.map(unit => (
                  <div key={unit.id} onClick={() => setSelectedUnit(unit)} className={`border ${border} rounded-2xl p-4 cursor-pointer transition-all hover:shadow-lg hover:-translate-y-1 ${isDark ? "bg-slate-800/50 hover:bg-slate-700/50" : "bg-white hover:bg-slate-50"}`}>
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <div className={`text-lg font-bold ${text}`}>{unit.tower}-{unit.unit}</div>
                        <div className={`text-xs ${muted}`}>Floor {unit.floor} • {unit.type}</div>
                      </div>
                      <span className={`text-[10px] px-2 py-1 rounded-md font-bold uppercase tracking-wider ${STATUS_COLORS[unit.status]}`}>{unit.status}</span>
                    </div>
                    <div className="flex items-center gap-4 mb-4">
                      <div>
                        <div className={`text-xs ${muted}`}>Area</div>
                        <div className={`text-sm font-medium ${text}`}>{unit.area} sqft</div>
                      </div>
                      <div>
                        <div className={`text-xs ${muted}`}>Facing</div>
                        <div className={`text-sm font-medium ${text}`}>{unit.facing || "East"}</div>
                      </div>
                    </div>
                    <div className={`pt-3 border-t ${border} flex justify-between items-center`}>
                      <div className={`text-lg font-bold text-emerald-600 dark:text-emerald-400`}>{unit.price}</div>
                      <button className={`p-1.5 rounded-lg ${isDark ? "bg-slate-700 text-slate-300" : "bg-slate-100 text-slate-600"}`}><Eye size={14}/></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Right Drawer: Unit Details */}
      {selectedUnit && (
        <>
          <div className="fixed inset-0 bg-black/40 z-40 backdrop-blur-sm" onClick={() => setSelectedUnit(null)} />
          <div className={`fixed top-0 right-0 h-full w-[500px] z-50 shadow-2xl flex flex-col transition-transform transform translate-x-0 ${isDark ? "bg-slate-900 border-l border-slate-700" : "bg-white"}`}>
            
            {/* Drawer Header */}
            <div className={`px-6 py-5 border-b ${border} flex justify-between items-center bg-white dark:bg-slate-900 z-10`}>
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center border-2 ${STATUS_BORDER_COLORS[selectedUnit.status]} ${STATUS_COLORS[selectedUnit.status].split(' ')[0]}`}>
                  <span className={`font-bold ${STATUS_COLORS[selectedUnit.status].split(' ')[1]}`}>{selectedUnit.unit}</span>
                </div>
                <div>
                  <h2 className={`text-xl font-bold ${text}`}>Tower {selectedUnit.tower}</h2>
                  <p className={`text-sm ${muted}`}>Floor {selectedUnit.floor} • {selectedUnit.type}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button className={`p-2 rounded-xl border ${isDark ? "border-slate-700 hover:bg-slate-800" : "border-slate-200 hover:bg-slate-100"}`}><Edit2 size={16} className={muted}/></button>
                <button onClick={() => setSelectedUnit(null)} className={`p-2 rounded-xl border ${isDark ? "border-slate-700 hover:bg-slate-800 hover:text-red-500" : "border-slate-200 hover:bg-slate-100 hover:text-red-500"}`}><X size={16} className={muted}/></button>
              </div>
            </div>

            {/* Drawer Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-8">
              
              {/* Badges */}
              <div className="flex gap-2 flex-wrap">
                <span className={`px-3 py-1 text-xs font-bold rounded-lg uppercase tracking-wider ${STATUS_COLORS[selectedUnit.status]}`}>Status: {selectedUnit.status}</span>
                <span className={`px-3 py-1 text-xs font-bold rounded-lg uppercase tracking-wider bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border ${border}`}>Premium View</span>
                <span className={`px-3 py-1 text-xs font-bold rounded-lg uppercase tracking-wider bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border ${border}`}>Corner Plot</span>
              </div>

              {/* Core Specs Grid */}
              <div>
                <h3 className={`text-sm font-bold uppercase tracking-wider mb-4 ${text}`}>Unit Specifications</h3>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { icon: Layers, label: "Super Built-up", value: `${selectedUnit.area} sqft` },
                    { icon: Layers, label: "Carpet Area", value: `${Math.round(selectedUnit.area * 0.7)} sqft` },
                    { icon: MapPin, label: "Facing", value: selectedUnit.facing || "East - Garden View" },
                    { icon: Car, label: "Parking", value: selectedUnit.parking || "1 Covered (Basement 2)" },
                  ].map(spec => (
                    <div key={spec.label} className={`p-4 rounded-2xl border ${border} flex gap-3 items-center`}>
                      <div className={`p-2 rounded-xl ${isDark ? "bg-slate-800 text-blue-400" : "bg-blue-50 text-blue-600"}`}>
                        <spec.icon size={18} />
                      </div>
                      <div>
                        <div className={`text-xs ${muted}`}>{spec.label}</div>
                        <div className={`text-sm font-semibold ${text}`}>{spec.value}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Pricing Configurator Panel */}
              <div className={`p-5 rounded-2xl border ${border} ${isDark ? "bg-slate-800/50" : "bg-slate-50"}`}>
                <h3 className={`text-sm font-bold uppercase tracking-wider mb-4 ${text}`}>Pricing Configuration</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center pb-3 border-b border-dashed border-slate-300 dark:border-slate-700">
                    <span className={`text-sm ${muted}`}>Base Price ({selectedUnit.area} x ₹12,500)</span>
                    <span className={`text-sm font-medium ${text}`}>{selectedUnit.price}</span>
                  </div>
                  <div className="flex justify-between items-center pb-3 border-b border-dashed border-slate-300 dark:border-slate-700">
                    <span className={`text-sm ${muted}`}>Floor Rise Charge</span>
                    <span className={`text-sm font-medium ${text}`}>{selectedUnit.floorRise || "₹1,50,000"}</span>
                  </div>
                  <div className="flex justify-between items-center pb-3 border-b border-dashed border-slate-300 dark:border-slate-700">
                    <span className={`text-sm ${muted}`}>Amenities & Parking</span>
                    <span className={`text-sm font-medium ${text}`}>{selectedUnit.charges || "₹4,00,000"}</span>
                  </div>
                  <div className="flex justify-between items-center pt-2">
                    <span className={`text-sm font-bold ${text}`}>Total Agreement Value</span>
                    <span className="text-xl font-bold text-emerald-600 dark:text-emerald-400">₹{(parseInt(selectedUnit.price.replace(/\D/g, '')) + 550000).toLocaleString('en-IN')}</span>
                  </div>
                </div>
                <button className="w-full mt-5 py-2.5 rounded-xl border border-blue-600 text-blue-600 font-semibold text-sm hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors">Generate Cost Sheet</button>
              </div>

              {/* Floor Plan Preview */}
              <div>
                <h3 className={`text-sm font-bold uppercase tracking-wider mb-4 ${text}`}>Floor Plan Preview</h3>
                <div className={`w-full aspect-video rounded-2xl border ${border} flex flex-col items-center justify-center bg-slate-100 dark:bg-slate-800/50 overflow-hidden relative group`}>
                  <LayoutTemplateIcon className="w-20 h-20 text-slate-300 dark:text-slate-600 mb-2" />
                  <span className={`text-sm font-medium ${muted}`}>{selectedUnit.type} Standard Layout</span>
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                    <button className="px-5 py-2 bg-white text-slate-900 font-semibold rounded-xl text-sm">View Full Screen</button>
                  </div>
                </div>
              </div>

            </div>
            
            {/* Drawer Footer Actions */}
            <div className={`p-5 border-t ${border} bg-slate-50 dark:bg-slate-900 flex gap-3`}>
              {selectedUnit.status === "Available" ? (
                <>
                  <button className={`flex-1 py-3 rounded-xl border ${isDark ? "border-slate-700 text-slate-300 hover:bg-slate-800" : "border-slate-300 text-slate-700 hover:bg-slate-100"} font-semibold text-sm`}>Block Unit</button>
                  <button className="flex-1 py-3 rounded-xl bg-blue-600 text-white font-semibold text-sm hover:bg-blue-700 shadow-lg shadow-blue-500/30">Initiate Booking</button>
                </>
              ) : (
                <button className={`flex-1 py-3 rounded-xl border ${isDark ? "border-slate-700 text-slate-300 hover:bg-slate-800" : "border-slate-300 text-slate-700 hover:bg-slate-100"} font-semibold text-sm`}>View Customer Profile</button>
              )}
            </div>

          </div>
        </>
      )}
    </div>
  );
}

// Custom icon since lucide doesn't have LayoutTemplate readily in all versions, using a fallback composed icon
function LayoutTemplateIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect width="18" height="18" x="3" y="3" rx="2" />
      <path d="M3 9h18" />
      <path d="M9 21V9" />
    </svg>
  );
}

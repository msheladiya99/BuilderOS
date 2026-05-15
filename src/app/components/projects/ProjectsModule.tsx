import { useState } from "react";
import {
  Plus, Search, Filter, Grid, List, MapPin, Calendar, Building2,
  MoreHorizontal, TrendingUp, Home, Users, ChevronRight, X, Upload
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const PROJECTS = [
  {
    id: 1, name: "Skyline Heights", type: "Residential", location: "Andheri West, Mumbai",
    rera: "P51800032145", totalUnits: 128, sold: 84, booked: 12, available: 32,
    area: "2.4 Acres", launched: "Mar 2023", completion: "Dec 2025", status: "Active",
    progress: 78, revenue: "₹89.4 Cr", image: "SH",
    stages: ["Foundation", "Structure", "Finishing", "Handover"],
    currentStage: 2,
  },
  {
    id: 2, name: "Green Valley", type: "Residential", location: "Wakad, Pune",
    rera: "P52100048762", totalUnits: 136, sold: 56, booked: 22, available: 58,
    area: "3.1 Acres", launched: "Jun 2023", completion: "Jun 2026", status: "Active",
    progress: 45, revenue: "₹42.8 Cr", image: "GV",
    stages: ["Foundation", "Structure", "Finishing", "Handover"],
    currentStage: 1,
  },
  {
    id: 3, name: "Marina Cove", type: "Luxury Residential", location: "Bandra, Mumbai",
    rera: "P51800041983", totalUnits: 128, sold: 22, booked: 18, available: 88,
    area: "1.8 Acres", launched: "Jan 2024", completion: "Mar 2027", status: "Active",
    progress: 22, revenue: "₹34.2 Cr", image: "MC",
    stages: ["Foundation", "Structure", "Finishing", "Handover"],
    currentStage: 0,
  },
  {
    id: 4, name: "Prestige Towers", type: "Commercial + Residential", location: "Whitefield, Bangalore",
    rera: "PRM/KA/RERA/1251/308/PR/040524/005786", totalUnits: 148, sold: 102, booked: 8, available: 38,
    area: "4.2 Acres", launched: "Nov 2022", completion: "Sep 2025", status: "Near Completion",
    progress: 95, revenue: "₹128.6 Cr", image: "PT",
    stages: ["Foundation", "Structure", "Finishing", "Handover"],
    currentStage: 3,
  },
];

type ProjectsModuleProps = { isDark: boolean };

export function ProjectsModule({ isDark }: ProjectsModuleProps) {
  const [view, setView] = useState<"grid" | "list">("grid");
  const [selectedProject, setSelectedProject] = useState<typeof PROJECTS[0] | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("overview");

  const filtered = PROJECTS.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.location.toLowerCase().includes(search.toLowerCase())
  );

  const card = `bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700`;
  const text = isDark ? "text-white" : "text-slate-800";
  const muted = "text-slate-500";

  const getStatusColor = (status: string) => {
    if (status === "Active") return "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400";
    if (status === "Near Completion") return "bg-blue-100 text-blue-700";
    return "bg-slate-100 text-slate-600";
  };

  if (selectedProject) {
    const p = selectedProject;
    const chartData = [
      { name: "Sold", value: p.sold, fill: "#2563EB" },
      { name: "Booked", value: p.booked, fill: "#F59E0B" },
      { name: "Available", value: p.available, fill: "#10B981" },
    ];

    return (
      <div className="p-5 space-y-5">
        {/* Header */}
        <div className="flex items-center gap-2 text-sm">
          <button onClick={() => setSelectedProject(null)} className={`${muted} hover:text-blue-500`}>Projects</button>
          <ChevronRight size={14} className={muted} />
          <span className={text}>{p.name}</span>
        </div>

        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div className="flex items-center gap-3">
              <h1 className={text}>{p.name}</h1>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getStatusColor(p.status)}`}>{p.status}</span>
            </div>
            <div className="flex items-center gap-2 mt-1">
              <MapPin size={13} className={muted} />
              <span className={`text-sm ${muted}`}>{p.location}</span>
              <span className={muted}>·</span>
              <span className={`text-sm ${muted}`}>{p.type}</span>
            </div>
          </div>
          <div className="flex gap-2">
            <button className={`px-4 py-2 rounded-xl border text-sm font-medium ${isDark ? "border-slate-700 text-slate-300 hover:bg-slate-700" : "border-slate-200 text-slate-700 hover:bg-slate-50"}`}>
              Edit Project
            </button>
            <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium">
              View RERA
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Total Units", value: p.totalUnits, sub: "All types" },
            { label: "Sold", value: p.sold, sub: `${Math.round(p.sold / p.totalUnits * 100)}% sold out`, color: "text-blue-600" },
            { label: "Revenue", value: p.revenue, sub: "Collected" },
            { label: "Completion", value: `${p.progress}%`, sub: p.stages[p.currentStage] },
          ].map(s => (
            <div key={s.label} className={`${card} rounded-2xl p-4`}>
              <div className={`text-xs ${muted} uppercase tracking-wide mb-1`}>{s.label}</div>
              <div className={`text-xl font-bold ${s.color || text}`}>{s.value}</div>
              <div className={`text-xs ${muted} mt-0.5`}>{s.sub}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className={`${card} rounded-2xl overflow-hidden`}>
          <div className={`flex border-b ${isDark ? "border-slate-700" : "border-slate-200"} overflow-x-auto`}>
            {["overview", "units", "timeline", "documents", "analytics"].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-5 py-3 text-sm font-medium capitalize whitespace-nowrap transition-colors border-b-2 ${
                  activeTab === tab
                    ? "border-blue-600 text-blue-600"
                    : `border-transparent ${muted} hover:text-slate-700`
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="p-5">
            {activeTab === "overview" && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <h4 className={`font-medium mb-4 ${text}`}>Project Information</h4>
                  <div className="space-y-3">
                    {[
                      { label: "RERA Number", value: p.rera },
                      { label: "Total Area", value: p.area },
                      { label: "Launch Date", value: p.launched },
                      { label: "Completion Date", value: p.completion },
                      { label: "Project Type", value: p.type },
                    ].map(i => (
                      <div key={i.label} className="flex items-start justify-between py-2 border-b border-slate-100 dark:border-slate-700/50">
                        <span className={`text-sm ${muted}`}>{i.label}</span>
                        <span className={`text-sm font-medium ${text}`}>{i.value}</span>
                      </div>
                    ))}
                  </div>

                  <h4 className={`font-medium mt-6 mb-3 ${text}`}>Construction Stages</h4>
                  <div className="flex gap-2">
                    {p.stages.map((stage, i) => (
                      <div key={stage} className="flex-1 text-center">
                        <div className={`w-8 h-8 rounded-full mx-auto flex items-center justify-center text-xs font-bold mb-1 ${
                          i < p.currentStage ? "bg-emerald-500 text-white" :
                          i === p.currentStage ? "bg-blue-600 text-white" :
                          isDark ? "bg-slate-700 text-slate-400" : "bg-slate-200 text-slate-500"
                        }`}>{i + 1}</div>
                        <div className={`text-xs ${i === p.currentStage ? "text-blue-600 font-medium" : muted}`}>{stage}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className={`font-medium mb-4 ${text}`}>Unit Distribution</h4>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={chartData} barSize={40}>
                      <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "#1e293b" : "#f1f5f9"} />
                      <XAxis dataKey="name" tick={{ fontSize: 12, fill: isDark ? "#475569" : "#94a3b8" }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 12, fill: isDark ? "#475569" : "#94a3b8" }} axisLine={false} tickLine={false} />
                      <Tooltip />
                      <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                        {chartData.map((entry, i) => (
                          <rect key={i} fill={entry.fill} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                  <div className="mt-4 p-4 bg-slate-50 dark:bg-slate-700/40 rounded-xl">
                    <div className="flex items-center justify-between mb-2">
                      <span className={`text-sm font-medium ${text}`}>Overall Progress</span>
                      <span className="text-sm font-bold text-blue-600">{p.progress}%</span>
                    </div>
                    <div className="h-2.5 bg-slate-200 dark:bg-slate-700 rounded-full">
                      <div className="h-full bg-blue-600 rounded-full" style={{ width: `${p.progress}%` }} />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab !== "overview" && (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-slate-100 dark:bg-slate-700 rounded-2xl flex items-center justify-center mx-auto mb-3">
                  <Building2 size={28} className="text-slate-400" />
                </div>
                <p className={`font-medium ${text}`}>No {activeTab} data yet</p>
                <p className={`text-sm ${muted} mt-1`}>Content for {activeTab} tab will appear here</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-5 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className={text}>Projects</h1>
          <p className={`text-sm ${muted}`}>{PROJECTS.length} active projects · 540 total units</p>
        </div>
        <button onClick={() => setShowCreate(true)} className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium transition-colors">
          <Plus size={15} /> New Project
        </button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className={`flex items-center gap-2 px-3 py-2 rounded-xl border flex-1 min-w-48 ${isDark ? "bg-slate-800 border-slate-700" : "bg-white border-slate-200"}`}>
          <Search size={15} className={muted} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search projects..."
            className={`flex-1 text-sm bg-transparent outline-none ${isDark ? "text-white placeholder-slate-500" : "text-slate-800 placeholder-slate-400"}`}
          />
        </div>
        <button className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-sm ${isDark ? "border-slate-700 text-slate-300 hover:bg-slate-800" : "border-slate-200 text-slate-600 hover:bg-slate-50"}`}>
          <Filter size={14} /> Filter
        </button>
        <div className="flex gap-1 bg-slate-100 dark:bg-slate-800 rounded-lg p-0.5">
          <button onClick={() => setView("grid")} className={`p-1.5 rounded-md transition-colors ${view === "grid" ? "bg-white dark:bg-slate-700 shadow-sm" : "text-slate-400"}`}>
            <Grid size={14} />
          </button>
          <button onClick={() => setView("list")} className={`p-1.5 rounded-md transition-colors ${view === "list" ? "bg-white dark:bg-slate-700 shadow-sm" : "text-slate-400"}`}>
            <List size={14} />
          </button>
        </div>
      </div>

      {/* Project cards */}
      <div className={view === "grid" ? "grid grid-cols-1 md:grid-cols-2 gap-4" : "space-y-3"}>
        {filtered.map(project => (
          <div
            key={project.id}
            onClick={() => setSelectedProject(project)}
            className={`${card} rounded-2xl p-5 cursor-pointer hover:shadow-lg hover:border-blue-300 dark:hover:border-blue-600 transition-all duration-200 ${
              view === "list" ? "flex items-center gap-5" : ""
            }`}
          >
            <div className={`w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0 ${view === "grid" ? "mb-4" : ""}`}>
              {project.image}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className={`font-semibold ${text}`}>{project.name}</h3>
                  <div className="flex items-center gap-1 mt-0.5">
                    <MapPin size={11} className={muted} />
                    <span className={`text-xs ${muted}`}>{project.location}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${getStatusColor(project.status)}`}>{project.status}</span>
                  <button className={`${muted} hover:text-slate-700`} onClick={e => e.stopPropagation()}>
                    <MoreHorizontal size={16} />
                  </button>
                </div>
              </div>

              {view === "grid" && (
                <>
                  <div className="grid grid-cols-3 gap-3 mt-4">
                    <div>
                      <div className={`text-xs ${muted}`}>Total Units</div>
                      <div className={`text-sm font-bold ${text}`}>{project.totalUnits}</div>
                    </div>
                    <div>
                      <div className={`text-xs ${muted}`}>Sold</div>
                      <div className="text-sm font-bold text-blue-600">{project.sold}</div>
                    </div>
                    <div>
                      <div className={`text-xs ${muted}`}>Revenue</div>
                      <div className={`text-sm font-bold ${text}`}>{project.revenue}</div>
                    </div>
                  </div>
                  <div className="mt-4">
                    <div className="flex items-center justify-between mb-1">
                      <span className={`text-xs ${muted}`}>Construction</span>
                      <span className="text-xs font-medium text-blue-600">{project.progress}%</span>
                    </div>
                    <div className="h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full">
                      <div className={`h-full rounded-full ${project.progress >= 90 ? "bg-emerald-500" : "bg-blue-600"}`}
                        style={{ width: `${project.progress}%` }} />
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100 dark:border-slate-700">
                    <div className="flex items-center gap-1">
                      <Calendar size={12} className={muted} />
                      <span className={`text-xs ${muted}`}>Due {project.completion}</span>
                    </div>
                    <span className={`text-xs ${muted}`}>RERA: {project.rera.slice(0, 14)}...</span>
                  </div>
                </>
              )}
              {view === "list" && (
                <div className="flex items-center gap-6 mt-2">
                  <span className={`text-xs ${muted}`}>{project.totalUnits} units · {project.sold} sold</span>
                  <span className={`text-xs font-medium ${text}`}>{project.revenue}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700`}>{project.progress}% done</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Create Project Modal */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className={`w-full max-w-2xl rounded-2xl border shadow-2xl ${isDark ? "bg-slate-900 border-slate-700" : "bg-white border-slate-200"}`}>
            <div className={`flex items-center justify-between px-6 py-4 border-b ${isDark ? "border-slate-700" : "border-slate-200"}`}>
              <h3 className={`font-semibold ${text}`}>Create New Project</h3>
              <button onClick={() => setShowCreate(false)} className={`${muted} hover:text-red-500`}><X size={18} /></button>
            </div>
            <div className="p-6 grid grid-cols-2 gap-4">
              {[
                { label: "Project Name", placeholder: "e.g. Skyline Heights" },
                { label: "Project Type", placeholder: "Residential / Commercial" },
                { label: "Location", placeholder: "City, State" },
                { label: "RERA Number", placeholder: "P51800XXXXXX" },
                { label: "Total Area (Acres)", placeholder: "2.4" },
                { label: "Total Units", placeholder: "128" },
                { label: "Launch Date", placeholder: "Mar 2025", type: "date" },
                { label: "Completion Date", placeholder: "Dec 2027", type: "date" },
              ].map(f => (
                <div key={f.label} className={f.label === "Project Name" ? "col-span-2" : ""}>
                  <label className={`block text-xs font-medium mb-1.5 ${isDark ? "text-slate-300" : "text-slate-700"}`}>{f.label}</label>
                  <input
                    type={f.type || "text"}
                    placeholder={f.placeholder}
                    className={`w-full px-3 py-2 rounded-lg border text-sm outline-none focus:border-blue-500 ${isDark ? "bg-slate-800 border-slate-700 text-white placeholder-slate-500" : "bg-slate-50 border-slate-200 text-slate-800"}`}
                  />
                </div>
              ))}
              <div className="col-span-2">
                <label className={`block text-xs font-medium mb-1.5 ${isDark ? "text-slate-300" : "text-slate-700"}`}>Project Images</label>
                <div className={`border-2 border-dashed rounded-xl p-6 text-center ${isDark ? "border-slate-700" : "border-slate-300"}`}>
                  <Upload size={24} className="mx-auto text-slate-400 mb-2" />
                  <p className={`text-sm ${muted}`}>Drag & drop or click to upload</p>
                </div>
              </div>
            </div>
            <div className={`flex justify-end gap-3 px-6 py-4 border-t ${isDark ? "border-slate-700" : "border-slate-200"}`}>
              <button onClick={() => setShowCreate(false)} className={`px-4 py-2 rounded-xl border text-sm ${isDark ? "border-slate-700 text-slate-300" : "border-slate-200 text-slate-700"}`}>Cancel</button>
              <button onClick={() => setShowCreate(false)} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium">Create Project</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

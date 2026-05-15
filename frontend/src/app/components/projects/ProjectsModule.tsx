import { useState, useMemo, useEffect } from "react";
import { useLocation } from "react-router";
import { useData } from "../../../context/DataContext";
import { useAuth } from "../../../context/AuthContext";
import type { Project } from "../../../types";
import {
  Search, Filter, Grid, List, MapPin, Calendar, Building2,
  MoreHorizontal, ChevronRight, X, FileText, CheckCircle2, ExternalLink
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Legend,
} from "recharts";

type ProjectsModuleProps = { isDark: boolean };

const STATUS_COLORS: Record<string, string> = {
  Sold: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
  Booked: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300",
  Available: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  Reserved: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300",
};

export function ProjectsModule({ isDark }: ProjectsModuleProps) {
  const location = useLocation();
  const { user } = useAuth();
  const { projects, units, documentFiles, persist, saving } = useData();
  const isTenantUser = Boolean(user?.projectId);
  const [view, setView] = useState<"grid" | "list">("grid");
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [showEdit, setShowEdit] = useState(false);
  const [showRera, setShowRera] = useState(false);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("overview");
  const [editForm, setEditForm] = useState<Partial<Project>>({});
  useEffect(() => {
    const id = (location.state as { projectId?: number } | null)?.projectId;
    if (id) setSelectedId(id);
    else if (isTenantUser && projects.length === 1) setSelectedId(projects[0].id);
    else if (isTenantUser && user?.projectId) {
      const mine = projects.find((pr) => pr.id === user.projectId);
      if (mine) setSelectedId(mine.id);
    }
  }, [location.state, isTenantUser, projects, user?.projectId]);

  const filtered = projects.filter(p =>
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

  const p = useMemo(
    () => (selectedId ? projects.find((pr) => pr.id === selectedId) ?? null : null),
    [selectedId, projects]
  );

  const openEdit = () => { if (p) { setEditForm({ ...p }); setShowEdit(true); } };
  const handleSaveEdit = async () => {
    if (!p || !editForm.name) return;
    const updated = await persist<Project>("projects", editForm, p.id, `Project updated: ${editForm.name}`);
    setSelectedId(updated.id);
    setShowEdit(false);
  };
  const advanceStage = async (stageIndex: number) => {
    if (!p) return;
    const progress = Math.min(100, Math.round(((stageIndex + 1) / p.stages.length) * 100));
    await persist("projects", { currentStage: stageIndex, progress }, p.id, `Stage â†’ ${p.stages[stageIndex]}`);
  };

  if (p) {
    const projectUnits = units.filter((u) => u.projectId === p.id);
    const projectDocs = documentFiles.filter(
      (f) => f.name.toLowerCase().includes(p.name.split(" ")[0].toLowerCase()) || f.category === "RERA"
    );
    const chartData = [
      { name: "Sold", value: p.sold, fill: "#2563EB" },
      { name: "Booked", value: p.booked, fill: "#F59E0B" },
      { name: "Available", value: p.available, fill: "#10B981" },
    ];
    const monthlySales = [
      { month: "Jan", sales: 4 }, { month: "Feb", sales: 6 }, { month: "Mar", sales: 8 },
      { month: "Apr", sales: 12 }, { month: "May", sales: 14 }, { month: "Jun", sales: 10 },
    ];
    const tooltipStyle = isDark
      ? { backgroundColor: "#1e293b", border: "1px solid #334155", borderRadius: 12, color: "#f8fafc" }
      : { backgroundColor: "#fff", border: "1px solid #e2e8f0", borderRadius: 12 };

    return (
      <div className="p-5 space-y-5">
        {/* Header */}
        <div className="flex items-center gap-2 text-sm">
          <button type="button" onClick={() => { if (!isTenantUser) setSelectedId(null); setActiveTab("overview"); }} className={`${muted} hover:text-blue-500`}>{isTenantUser ? "Overview" : "Projects"}</button>
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
            <button onClick={openEdit} className={`px-4 py-2 rounded-xl border text-sm font-medium ${isDark ? "border-slate-700 text-slate-300 hover:bg-slate-700" : "border-slate-200 text-slate-700 hover:bg-slate-50"}`}>
              Edit Project
            </button>
            <button onClick={() => setShowRera(true)} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium">
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
                      <button key={stage} type="button" onClick={() => advanceStage(i)} className="flex-1 text-center">
                        <div className={`w-8 h-8 rounded-full mx-auto flex items-center justify-center text-xs font-bold mb-1 ${
                          i < p.currentStage ? "bg-emerald-500 text-white" :
                          i === p.currentStage ? "bg-blue-600 text-white" :
                          isDark ? "bg-slate-700 text-slate-400" : "bg-slate-200 text-slate-500"
                        }`}>{i < p.currentStage ? <CheckCircle2 size={14} /> : i + 1}</div>
                        <div className={`text-xs ${i === p.currentStage ? "text-blue-600 font-medium" : muted}`}>{stage}</div>
                      </button>
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
                          <Cell key={i} fill={entry.fill} />
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

            {activeTab === "units" && (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className={`border-b ${isDark ? "border-slate-700" : "border-slate-200"}`}>
                      {["Unit", "Type", "Floor", "Status", "Owner", "Price"].map((h) => (
                        <th key={h} className={`text-left py-2 px-3 text-xs font-medium ${muted}`}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {projectUnits.length === 0 ? (
                      <tr><td colSpan={6} className={`py-8 text-center ${muted}`}>No units for this project</td></tr>
                    ) : projectUnits.map((u) => (
                      <tr key={u.id} className={`border-b ${isDark ? "border-slate-700/50" : "border-slate-100"}`}>
                        <td className={`py-2.5 px-3 font-medium ${text}`}>{u.unit}</td>
                        <td className={`py-2.5 px-3 ${muted}`}>{u.type}</td>
                        <td className={`py-2.5 px-3 ${muted}`}>{u.floor}</td>
                        <td className="py-2.5 px-3"><span className={`text-xs px-2 py-0.5 rounded-full ${STATUS_COLORS[u.status] || ""}`}>{u.status}</span></td>
                        <td className={`py-2.5 px-3 ${muted}`}>{u.owner}</td>
                        <td className={`py-2.5 px-3 font-medium ${text}`}>{u.price}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === "timeline" && (
              <div className="space-y-4">
                {p.stages.map((stage, i) => (
                  <div key={stage} className="flex gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${i <= p.currentStage ? "bg-blue-600 text-white" : isDark ? "bg-slate-700 text-slate-400" : "bg-slate-200"}`}>
                      {i < p.currentStage ? <CheckCircle2 size={16} /> : i + 1}
                    </div>
                    <div className="flex-1">
                      <div className={`font-medium ${text}`}>{stage}</div>
                      <p className={`text-sm ${muted}`}>{i < p.currentStage ? "Completed" : i === p.currentStage ? "In progress" : "Upcoming"}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === "documents" && (
              <div className="space-y-2">
                {projectDocs.length === 0 ? <p className={`text-center py-8 ${muted}`}>No documents</p> : projectDocs.map((f) => (
                  <div key={f.id} className={`flex items-center justify-between p-3 rounded-xl border ${isDark ? "border-slate-700" : "border-slate-200"}`}>
                    <div className="flex items-center gap-3">
                      <FileText size={18} className="text-blue-500" />
                      <div><div className={`text-sm font-medium ${text}`}>{f.name}</div><div className={`text-xs ${muted}`}>{f.size} · {f.date}</div></div>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700 ${muted}`}>{f.category}</span>
                  </div>
                ))}
              </div>
            )}

            {activeTab === "analytics" && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <h4 className={`font-medium mb-3 ${text}`}>Monthly Bookings</h4>
                  <ResponsiveContainer width="100%" height={180}>
                    <LineChart data={monthlySales}>
                      <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "#1e293b" : "#f1f5f9"} />
                      <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 11 }} />
                      <Tooltip contentStyle={tooltipStyle} />
                      <Line type="monotone" dataKey="sales" stroke="#2563EB" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                <div>
                  <h4 className={`font-medium mb-3 ${text}`}>Unit Mix</h4>
                  <ResponsiveContainer width="100%" height={180}>
                    <PieChart>
                      <Pie data={chartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} label>
                        {chartData.map((e, i) => <Cell key={i} fill={e.fill} />)}
                      </Pie>
                      <Tooltip contentStyle={tooltipStyle} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
          </div>
        </div>

        {showEdit && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className={`w-full max-w-lg rounded-2xl border p-6 space-y-4 ${card}`}>
              <div className="flex justify-between"><h3 className={`font-semibold ${text}`}>Edit Project</h3><button onClick={() => setShowEdit(false)}><X size={18} /></button></div>
              {[{ k: "name", l: "Name" }, { k: "location", l: "Location" }, { k: "rera", l: "RERA" }, { k: "area", l: "Area" }, { k: "revenue", l: "Revenue" }, { k: "progress", l: "Progress %", type: "number" }].map(({ k, l, type }) => (
                <div key={k}><label className={`text-xs ${muted}`}>{l}</label>
                  <input type={type || "text"} value={String(editForm[k as keyof Project] ?? "")} onChange={(e) => setEditForm({ ...editForm, [k]: type === "number" ? Number(e.target.value) : e.target.value })} className={`w-full mt-1 px-3 py-2 rounded-lg border text-sm ${isDark ? "bg-slate-800 border-slate-700 text-white" : "bg-slate-50"}`} />
                </div>
              ))}
              <div className="flex justify-end gap-2">
                <button onClick={() => setShowEdit(false)} className="px-4 py-2 border rounded-xl text-sm">Cancel</button>
                <button onClick={handleSaveEdit} disabled={saving} className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm">{saving ? "Saving..." : "Save"}</button>
              </div>
            </div>
          </div>
        )}

        {showRera && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className={`w-full max-w-md rounded-2xl border p-6 ${card}`}>
              <div className="flex justify-between mb-4">
                <h3 className={`font-semibold ${text}`}>RERA â€” {p.name}</h3>
                <button type="button" onClick={() => setShowRera(false)}><X size={18} /></button>
              </div>
              <p className={`text-sm font-mono ${text}`}>{p.rera}</p>
              <p className={`text-sm ${muted} mt-2`}>{p.location}</p>
              <a href="https://maharera.mahaonline.gov.in" target="_blank" rel="noreferrer" className="mt-4 inline-flex items-center gap-2 text-sm text-blue-600"><ExternalLink size={14} /> MahaRERA portal</a>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="p-5 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className={text}>Projects</h1>
          <p className={`text-sm ${muted}`}>{projects.length} active projects · {projects.reduce((s, p) => s + p.totalUnits, 0)} total units</p>
        </div>
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
            onClick={() => { setSelectedId(project.id); setActiveTab("overview"); }}
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
    </div>
  );
}

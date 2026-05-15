import { useState, useMemo } from "react";
import { useNavigate } from "react-router";
import { useData } from "../../../context/DataContext";
import type { Project } from "../../../types";
import { todayLabel } from "../../../lib/helpers";
import { slugifyProjectName, projectLoginUrl } from "../../../lib/tenant";
import {
  Plus, Search, Building2, Users, Grid3x3, MapPin,
  X, Upload, Pencil, Trash2, ExternalLink, Shield,
} from "lucide-react";

type SuperAdminPanelProps = { isDark: boolean };

export function SuperAdminPanel({ isDark }: SuperAdminPanelProps) {
  const navigate = useNavigate();
  const { projects, units, erpUsers, customers, persist, remove, saving } = useData();
  const [search, setSearch] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [editForm, setEditForm] = useState<Partial<Project>>({});
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [form, setForm] = useState({
    name: "", subdomain: "", type: "Residential", location: "", rera: "", area: "2.4 Acres",
    totalUnits: 128, launched: todayLabel(), completion: "Dec 2027",
  });

  const card = `bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700`;
  const text = isDark ? "text-white" : "text-slate-800";
  const muted = "text-slate-500";

  const filtered = useMemo(
    () => projects.filter(
      (p) =>
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.location.toLowerCase().includes(search.toLowerCase())
    ),
    [projects, search]
  );

  const stats = [
    { label: "Total Projects", value: projects.length, icon: Building2, color: "bg-blue-600" },
    { label: "Total Units", value: projects.reduce((s, p) => s + p.totalUnits, 0), icon: Grid3x3, color: "bg-emerald-600" },
    { label: "ERP Users", value: erpUsers.length, icon: Users, color: "bg-violet-600" },
    { label: "Customers", value: customers.length, icon: Users, color: "bg-amber-600" },
  ];

  const getStatusColor = (status: string) => {
    if (status === "Active") return "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400";
    if (status === "Near Completion") return "bg-blue-100 text-blue-700";
    return "bg-slate-100 text-slate-600";
  };

  const handleCreate = async () => {
    if (!form.name.trim()) return;
    const initials = form.name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
    const subdomain = form.subdomain.trim() || slugifyProjectName(form.name);
    await persist<Project>("projects", {
      name: form.name,
      subdomain,
      type: form.type,
      location: form.location,
      rera: form.rera || "PENDING",
      totalUnits: Number(form.totalUnits) || 100,
      sold: 0,
      booked: 0,
      available: Number(form.totalUnits) || 100,
      area: form.area,
      launched: form.launched,
      completion: form.completion,
      status: "Active",
      progress: 0,
      revenue: "₹0",
      image: initials,
      stages: ["Foundation", "Structure", "Finishing", "Handover"],
      currentStage: 0,
    }, undefined, `New project created: ${form.name}`);
    setShowCreate(false);
    setForm({
      name: "", subdomain: "", type: "Residential", location: "", rera: "", area: "2.4 Acres",
      totalUnits: 128, launched: todayLabel(), completion: "Dec 2027",
    });
  };

  const openEdit = (p: Project) => {
    setEditForm({ ...p });
    setShowEdit(true);
  };

  const handleSaveEdit = async () => {
    if (!editForm.id || !editForm.name) return;
    await persist<Project>("projects", editForm, editForm.id, `Project updated: ${editForm.name}`);
    setShowEdit(false);
  };

  const handleDelete = async () => {
    if (deleteId == null) return;
    const p = projects.find((pr) => pr.id === deleteId);
    await remove("projects", deleteId, p ? `Project deleted: ${p.name}` : undefined);
    setDeleteId(null);
  };

  const ProjectFormFields = ({
    values,
    onChange,
  }: {
    values: typeof form;
    onChange: (next: typeof form) => void;
  }) => (
    <div className="grid grid-cols-2 gap-4">
      {[
        { key: "name", label: "Project Name", span: 2, field: "name" as const },
        { key: "subdomain", label: "Subdomain (login URL)", span: 2, field: "subdomain" as const },
        { key: "type", label: "Project Type", field: "type" as const },
        { key: "location", label: "Location", field: "location" as const },
        { key: "rera", label: "RERA Number", field: "rera" as const },
        { key: "area", label: "Total Area", field: "area" as const },
        { key: "units", label: "Total Units", field: "totalUnits" as const, num: true },
        { key: "launched", label: "Launch Date", field: "launched" as const },
        { key: "completion", label: "Completion Date", field: "completion" as const },
      ].map(({ key, label, span, field, num }) => (
        <div key={key} className={span === 2 ? "col-span-2" : ""}>
          <label className={`block text-xs font-medium mb-1.5 ${isDark ? "text-slate-300" : "text-slate-700"}`}>{label}</label>
          <input
            type={num ? "number" : "text"}
            value={num ? String(values[field]) : values[field]}
            onChange={(e) =>
              onChange({
                ...values,
                [field]: num ? Number(e.target.value) || 0 : e.target.value,
              })
            }
            className={`w-full px-3 py-2 rounded-lg border text-sm outline-none focus:border-blue-500 ${isDark ? "bg-slate-800 border-slate-700 text-white" : "bg-slate-50 border-slate-200"}`}
          />
        </div>
      ))}
    </div>
  );

  return (
    <div className="p-5 space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-600 to-blue-600 flex items-center justify-center">
            <Shield size={22} className="text-white" />
          </div>
          <div>
            <h1 className={text}>Super Admin Panel</h1>
            <p className={`text-sm ${muted}`}>Manage all projects, tenants, and platform settings</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-sm font-medium"
        >
          <Plus size={15} /> New Project
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className={`${card} rounded-2xl p-4 flex items-center gap-4`}>
              <div className={`w-10 h-10 rounded-xl ${s.color} flex items-center justify-center`}>
                <Icon size={18} className="text-white" />
              </div>
              <div>
                <div className={`text-2xl font-bold ${text}`}>{s.value}</div>
                <div className={`text-xs ${muted}`}>{s.label}</div>
              </div>
            </div>
          );
        })}
      </div>

      <div className={`${card} rounded-2xl overflow-hidden`}>
        <div className={`px-5 py-4 border-b flex items-center justify-between gap-3 flex-wrap ${isDark ? "border-slate-700" : "border-slate-200"}`}>
          <div>
            <h2 className={`font-semibold ${text}`}>All Projects</h2>
            <p className={`text-xs ${muted} mt-0.5`}>{filtered.length} projects · {units.length} units registered</p>
          </div>
          <div className={`flex items-center gap-2 px-3 py-2 rounded-xl border min-w-56 ${isDark ? "bg-slate-800 border-slate-700" : "bg-slate-50 border-slate-200"}`}>
            <Search size={15} className={muted} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search projects..."
              className={`flex-1 text-sm bg-transparent outline-none ${isDark ? "text-white" : "text-slate-800"}`}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className={`border-b ${isDark ? "border-slate-700 bg-slate-800/50" : "border-slate-200 bg-slate-50"}`}>
                {["Project", "Subdomain", "Location", "Type", "Units", "Progress", "Status", "Actions"].map((h) => (
                  <th key={h} className={`text-left py-3 px-4 text-xs font-medium ${muted}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className={`py-12 text-center ${muted}`}>No projects found</td>
                </tr>
              ) : (
                filtered.map((p) => (
                  <tr key={p.id} className={`border-b ${isDark ? "border-slate-700/50 hover:bg-slate-800/40" : "border-slate-100 hover:bg-slate-50"}`}>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center text-white text-xs font-bold">{p.image}</div>
                        <div>
                          <div className={`font-medium ${text}`}>{p.name}</div>
                          <div className={`text-xs ${muted}`}>{p.revenue}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <a
                        href={projectLoginUrl(p.subdomain || slugifyProjectName(p.name))}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs font-mono text-violet-600 hover:underline"
                      >
                        {p.subdomain || slugifyProjectName(p.name)}
                      </a>
                    </td>
                    <td className={`py-3 px-4 ${muted}`}>
                      <div className="flex items-center gap-1"><MapPin size={12} />{p.location}</div>
                    </td>
                    <td className={`py-3 px-4 ${muted}`}>{p.type}</td>
                    <td className={`py-3 px-4 ${text}`}>{p.sold}/{p.totalUnits}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2 min-w-24">
                        <div className="flex-1 h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full">
                          <div className="h-full bg-blue-600 rounded-full" style={{ width: `${p.progress}%` }} />
                        </div>
                        <span className="text-xs text-blue-600">{p.progress}%</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${getStatusColor(p.status)}`}>{p.status}</span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          title="Open project"
                          onClick={() => navigate("/projects", { state: { projectId: p.id } })}
                          className={`p-1.5 rounded-lg ${isDark ? "hover:bg-slate-700 text-slate-400" : "hover:bg-slate-100 text-slate-500"}`}
                        >
                          <ExternalLink size={15} />
                        </button>
                        <button
                          type="button"
                          title="Edit"
                          onClick={() => openEdit(p)}
                          className={`p-1.5 rounded-lg ${isDark ? "hover:bg-slate-700 text-slate-400" : "hover:bg-slate-100 text-slate-500"}`}
                        >
                          <Pencil size={15} />
                        </button>
                        <button
                          type="button"
                          title="Delete"
                          onClick={() => setDeleteId(p.id)}
                          className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showCreate && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className={`w-full max-w-2xl rounded-2xl border shadow-2xl ${isDark ? "bg-slate-900 border-slate-700" : "bg-white border-slate-200"}`}>
            <div className={`flex items-center justify-between px-6 py-4 border-b ${isDark ? "border-slate-700" : "border-slate-200"}`}>
              <h3 className={`font-semibold ${text}`}>Create New Project</h3>
              <button type="button" onClick={() => setShowCreate(false)} className={muted}><X size={18} /></button>
            </div>
            <div className="p-6">
              <ProjectFormFields values={form} onChange={setForm} />
              <div className={`mt-4 border-2 border-dashed rounded-xl p-6 text-center ${isDark ? "border-slate-700" : "border-slate-300"}`}>
                <Upload size={24} className="mx-auto text-slate-400 mb-2" />
                <p className={`text-sm ${muted}`}>Project images (optional)</p>
              </div>
            </div>
            <div className={`flex justify-end gap-3 px-6 py-4 border-t ${isDark ? "border-slate-700" : "border-slate-200"}`}>
              <button type="button" onClick={() => setShowCreate(false)} className={`px-4 py-2 rounded-xl border text-sm ${isDark ? "border-slate-700" : "border-slate-200"}`}>Cancel</button>
              <button type="button" onClick={handleCreate} disabled={saving} className="px-4 py-2 bg-violet-600 hover:bg-violet-700 disabled:opacity-60 text-white rounded-xl text-sm font-medium">
                {saving ? "Creating..." : "Create Project"}
              </button>
            </div>
          </div>
        </div>
      )}

      {showEdit && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className={`w-full max-w-lg rounded-2xl border p-6 space-y-4 ${card}`}>
            <div className="flex justify-between">
              <h3 className={`font-semibold ${text}`}>Edit Project</h3>
              <button type="button" onClick={() => setShowEdit(false)}><X size={18} /></button>
            </div>
            {[{ k: "name", l: "Name" }, { k: "subdomain", l: "Subdomain" }, { k: "location", l: "Location" }, { k: "rera", l: "RERA" }, { k: "type", l: "Type" }, { k: "area", l: "Area" }, { k: "revenue", l: "Revenue" }, { k: "progress", l: "Progress %", type: "number" }, { k: "status", l: "Status" }].map(({ k, l, type }) => (
              <div key={k}>
                <label className={`text-xs ${muted}`}>{l}</label>
                <input
                  type={type || "text"}
                  value={String(editForm[k as keyof Project] ?? "")}
                  onChange={(e) => setEditForm({ ...editForm, [k]: type === "number" ? Number(e.target.value) : e.target.value })}
                  className={`w-full mt-1 px-3 py-2 rounded-lg border text-sm ${isDark ? "bg-slate-800 border-slate-700 text-white" : "bg-slate-50"}`}
                />
              </div>
            ))}
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setShowEdit(false)} className="px-4 py-2 border rounded-xl text-sm">Cancel</button>
              <button type="button" onClick={handleSaveEdit} disabled={saving} className="px-4 py-2 bg-violet-600 text-white rounded-xl text-sm">{saving ? "Saving..." : "Save"}</button>
            </div>
          </div>
        </div>
      )}

      {deleteId != null && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className={`w-full max-w-sm rounded-2xl border p-6 ${card}`}>
            <h3 className={`font-semibold ${text}`}>Delete project?</h3>
            <p className={`text-sm ${muted} mt-2`}>This removes the project from the platform. Related units may become orphaned.</p>
            <div className="flex justify-end gap-2 mt-6">
              <button type="button" onClick={() => setDeleteId(null)} className="px-4 py-2 border rounded-xl text-sm">Cancel</button>
              <button type="button" onClick={handleDelete} disabled={saving} className="px-4 py-2 bg-red-600 text-white rounded-xl text-sm">{saving ? "Deleting..." : "Delete"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

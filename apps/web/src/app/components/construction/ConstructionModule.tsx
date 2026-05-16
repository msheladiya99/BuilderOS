import { useMemo, useRef, useState } from "react";
import { useData } from "../../../context/DataContext";
import { useAuth } from "../../../context/AuthContext";
import type { ConstructionPhoto, ConstructionStage } from "../../../types";
import {
  Camera,
  CheckCircle2,
  Clock,
  AlertCircle,
  Plus,
  Upload,
  X,
  Pencil,
  IndianRupee,
  Loader2,
  Trash2,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

type ConstructionModuleProps = { isDark: boolean };

const emptyLogForm = {
  date: new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }),
  activity: "",
  workers: "",
  materials: "",
  weather: "Clear",
  supervisor: "",
};

const emptyStageForm = {
  name: "",
  status: "In Progress" as ConstructionStage["status"],
  progress: "0",
  targetDate: "",
  plannedCost: "",
  actualCost: "",
  plannedLakhs: "",
  actualLakhs: "",
};

export function ConstructionModule({ isDark }: ConstructionModuleProps) {
  const {
    projects,
    selectedProjectId,
    constructionStages,
    constructionLogs,
    constructionPhotos,
    persist,
    remove,
    saving,
    loading,
  } = useData();
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [activeTab, setActiveTab] = useState("stages");
  const [uploadingPhotos, setUploadingPhotos] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [showLogModal, setShowLogModal] = useState(false);
  const [showStageModal, setShowStageModal] = useState(false);
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [editingStage, setEditingStage] = useState<ConstructionStage | null>(null);
  const [logForm, setLogForm] = useState(emptyLogForm);
  const [stageForm, setStageForm] = useState(emptyStageForm);
  const [photoForm, setPhotoForm] = useState({ title: "", stage: "Structure", uploadedBy: "Site Team" });

  const text = isDark ? "text-white" : "text-slate-800";
  const muted = "text-slate-500";
  const border = isDark ? "border-slate-700" : "border-slate-200";
  const card = `bg-white dark:bg-slate-800 border ${border} rounded-2xl`;

  const project = projects.find((p) => p.id === selectedProjectId) || projects[0];
  const projectId = project?.id ?? 1;

  const stages = useMemo(
    () => constructionStages.filter((s) => s.projectId === projectId),
    [constructionStages, projectId]
  );
  const logs = useMemo(
    () => constructionLogs.filter((l) => l.projectId === projectId),
    [constructionLogs, projectId]
  );
  const photos = useMemo(
    () => constructionPhotos.filter((p) => p.projectId === projectId),
    [constructionPhotos, projectId]
  );

  const overallProgress = project?.progress ?? Math.round(
    stages.length ? stages.reduce((a, s) => a + s.progress, 0) / stages.length : 0
  );

  const completedCount = stages.filter((s) => s.status === "Completed").length;
  const delayedCount = stages.filter((s) => s.status === "Delayed").length;
  const onScheduleCount = stages.filter(
    (s) => s.status === "In Progress" || s.status === "Completed"
  ).length;

  const budgetUsedCr = useMemo(() => {
    const total = stages.reduce((sum, s) => sum + (s.actualLakhs || 0), 0);
    return `₹${(total / 10).toFixed(1)}Cr`;
  }, [stages]);

  const costChart = useMemo(
    () =>
      stages.map((s) => ({
        stage: s.name.length > 14 ? s.name.slice(0, 12) + "…" : s.name,
        planned: s.plannedLakhs,
        actual: s.actualLakhs,
      })),
    [stages]
  );

  const statusColor = (status: string) =>
    status === "Completed"
      ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
      : status === "Delayed"
        ? "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400"
        : status === "In Progress"
          ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
          : "bg-slate-100 text-slate-600";

  const openEditStage = (stage: ConstructionStage) => {
    setEditingStage(stage);
    setStageForm({
      name: stage.name,
      status: stage.status,
      progress: String(stage.progress),
      targetDate: stage.targetDate,
      plannedCost: stage.plannedCost,
      actualCost: stage.actualCost,
      plannedLakhs: String(stage.plannedLakhs),
      actualLakhs: String(stage.actualLakhs),
    });
    setShowStageModal(true);
  };

  const openNewStage = () => {
    setEditingStage(null);
    setStageForm(emptyStageForm);
    setShowStageModal(true);
  };

  const handleSaveStage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!project) return;
    const progress = Math.min(100, Math.max(0, Number(stageForm.progress) || 0));
    const body = {
      projectId,
      name: stageForm.name,
      status: stageForm.status,
      progress,
      targetDate: stageForm.targetDate,
      plannedCost: stageForm.plannedCost || "₹0",
      actualCost: stageForm.actualCost || "₹0",
      plannedLakhs: Number(stageForm.plannedLakhs) || 0,
      actualLakhs: Number(stageForm.actualLakhs) || 0,
    };
    if (editingStage) {
      await persist("constructionStages", body, editingStage.id, `Updated stage: ${body.name}`);
    } else {
      await persist("constructionStages", body, undefined, `Added stage: ${body.name}`);
    }
    setShowStageModal(false);
    setEditingStage(null);
  };

  const handleSaveLog = async (e: React.FormEvent) => {
    e.preventDefault();
    await persist(
      "constructionLogs",
      {
        projectId,
        date: logForm.date,
        activity: logForm.activity,
        workers: Number(logForm.workers) || 0,
        materials: logForm.materials,
        weather: logForm.weather,
        supervisor: logForm.supervisor,
      },
      undefined,
      `Site log: ${logForm.activity.slice(0, 40)}`
    );
    setShowLogModal(false);
    setLogForm(emptyLogForm);
  };

  const handleSavePhoto = async (e: React.FormEvent) => {
    e.preventDefault();
    const date = new Date().toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
    await persist(
      "constructionPhotos",
      {
        projectId,
        title: photoForm.title,
        date,
        stage: photoForm.stage,
        uploadedBy: photoForm.uploadedBy,
        imageUrl: "",
      },
      undefined,
      `Photo uploaded: ${photoForm.title}`
    );
    setShowPhotoModal(false);
    setPhotoForm({ title: "", stage: "Structure", uploadedBy: "Site Team" });
  };

  const uploadPhotos = async (files: FileList | File[]) => {
    const list = Array.from(files).filter((f) =>
      ["image/jpeg", "image/jpg", "image/png", "image/webp"].includes(f.type)
    );
    if (!list.length) {
      alert("Please select JPG or PNG images (max 10MB each).");
      return;
    }
    setUploadingPhotos(true);
    const uploader = user?.name || "Site Team";
    const date = new Date().toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
    try {
      for (const file of list) {
        if (file.size > 10 * 1024 * 1024) {
          alert(`${file.name} is larger than 10MB and was skipped.`);
          continue;
        }
        const imageUrl = await compressImageFile(file);
        const title = file.name.replace(/\.[^.]+$/, "").replace(/[-_]/g, " ");
        const stage = guessStageFromTitle(title);
        await persist(
          "constructionPhotos",
          { projectId, title, date, stage, uploadedBy: uploader, imageUrl },
          undefined,
          `Photo uploaded: ${title}`
        );
      }
    } finally {
      setUploadingPhotos(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleQuickProgress = async (stage: ConstructionStage, progress: number) => {
    const status: ConstructionStage["status"] =
      progress >= 100 ? "Completed" : progress > 0 ? "In Progress" : "Not Started";
    await persist(
      "constructionStages",
      { progress, status },
      stage.id,
      `${stage.name} → ${progress}%`
    );
  };

  if (loading && !stages.length) {
    return (
      <div className="p-8 flex items-center justify-center gap-2 text-slate-500">
        <Loader2 className="animate-spin" size={20} /> Loading construction data…
      </div>
    );
  }

  return (
    <div className="p-5 space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className={`text-xl font-bold ${text}`}>Construction Tracker</h1>
          <p className={`text-sm ${muted}`}>
            {project?.name ?? "Project"} · {overallProgress}% overall progress
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button
            type="button"
            onClick={openNewStage}
            disabled={saving}
            className="flex items-center gap-2 px-3 py-2 border rounded-xl text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50"
          >
            <Plus size={15} /> Add Stage
          </button>
          <button
            type="button"
            onClick={() => setShowLogModal(true)}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium disabled:opacity-50"
          >
            <Plus size={15} /> Log Progress
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          {
            label: "Stages Complete",
            value: `${completedCount}/${stages.length || 0}`,
            icon: CheckCircle2,
            color: "emerald",
          },
          { label: "On Schedule", value: String(onScheduleCount), icon: Clock, color: "blue" },
          { label: "Delayed", value: String(delayedCount), icon: AlertCircle, color: "orange" },
          { label: "Budget Used", value: budgetUsedCr, icon: IndianRupee, color: "purple" },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className={`${card} p-4`}>
            <div className="flex items-center justify-between">
              <div>
                <div className={`text-xs ${muted} uppercase tracking-wide`}>{label}</div>
                <div className={`text-2xl font-bold mt-1 ${text}`}>{value}</div>
              </div>
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                  color === "emerald"
                    ? "bg-emerald-100 text-emerald-600"
                    : color === "blue"
                      ? "bg-blue-100 text-blue-600"
                      : color === "orange"
                        ? "bg-orange-100 text-orange-600"
                        : "bg-purple-100 text-purple-600"
                }`}
              >
                <Icon size={15} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex gap-1 bg-slate-100 dark:bg-slate-800 rounded-xl p-0.5 w-fit flex-wrap">
        {["stages", "daily-logs", "photos", "cost-tracking"].map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-1.5 rounded-lg text-xs font-medium capitalize transition-all whitespace-nowrap ${
              activeTab === tab
                ? "bg-white dark:bg-slate-700 shadow-sm text-slate-800 dark:text-white"
                : "text-slate-500"
            }`}
          >
            {tab.replace("-", " ")}
          </button>
        ))}
      </div>

      {activeTab === "stages" && (
        <div className="space-y-3">
          {stages.length === 0 ? (
            <div className={`${card} p-8 text-center ${muted}`}>
              No stages yet. Click &quot;Add Stage&quot; to create your construction plan.
            </div>
          ) : (
            stages.map((stage) => (
              <div key={stage.id} className={`${card} p-5`}>
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2 flex-wrap">
                      <h3 className={`font-semibold text-sm ${text}`}>{stage.name}</h3>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${statusColor(stage.status)}`}>
                        {stage.status}
                      </span>
                      <button
                        type="button"
                        onClick={() => openEditStage(stage)}
                        className={`p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 ${muted}`}
                        title="Edit stage"
                      >
                        <Pencil size={14} />
                      </button>
                    </div>
                    <div className={`text-xs ${muted} mb-3`}>
                      {project?.name} · Target: {stage.targetDate}
                    </div>
                    <div className="flex items-center gap-3">
                      <input
                        type="range"
                        min={0}
                        max={100}
                        value={stage.progress}
                        disabled={saving}
                        onChange={(e) => handleQuickProgress(stage, Number(e.target.value))}
                        className="flex-1 h-2 accent-blue-600"
                      />
                      <span
                        className={`text-sm font-bold w-12 text-right ${
                          stage.status === "Completed" ? "text-emerald-600" : "text-blue-600"
                        }`}
                      >
                        {stage.progress}%
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-4 text-right flex-shrink-0">
                    <div>
                      <div className={`text-xs ${muted}`}>Planned</div>
                      <div className={`text-sm font-medium ${text}`}>{stage.plannedCost}</div>
                    </div>
                    <div>
                      <div className={`text-xs ${muted}`}>Actual</div>
                      <div
                        className={`text-sm font-medium ${
                          stage.actualLakhs > stage.plannedLakhs ? "text-orange-500" : "text-emerald-600"
                        }`}
                      >
                        {stage.actualCost}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === "daily-logs" && (
        <div className={`${card} overflow-hidden`}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className={`border-b ${border} ${isDark ? "bg-slate-900/50" : "bg-slate-50"}`}>
                  {["Date", "Activity", "Workers", "Materials Used", "Weather", "Supervisor"].map(
                    (h) => (
                      <th
                        key={h}
                        className={`px-4 py-3 text-left text-xs font-semibold ${muted} uppercase tracking-wide whitespace-nowrap`}
                      >
                        {h}
                      </th>
                    )
                  )}
                </tr>
              </thead>
              <tbody className={`divide-y ${isDark ? "divide-slate-700/50" : "divide-slate-100"}`}>
                {logs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className={`px-4 py-8 text-center ${muted}`}>
                      No daily logs. Use &quot;Log Progress&quot; to add one.
                    </td>
                  </tr>
                ) : (
                  logs.map((log) => (
                    <tr
                      key={log.id}
                      className={isDark ? "hover:bg-slate-700/30" : "hover:bg-slate-50"}
                    >
                      <td className={`px-4 py-3 text-xs font-medium ${text}`}>{log.date}</td>
                      <td className={`px-4 py-3 text-xs ${text} max-w-52`}>{log.activity}</td>
                      <td className={`px-4 py-3 text-xs font-semibold ${text}`}>{log.workers}</td>
                      <td className={`px-4 py-3 text-xs ${muted} max-w-48`}>{log.materials}</td>
                      <td className={`px-4 py-3 text-xs ${muted}`}>{log.weather}</td>
                      <td className={`px-4 py-3 text-xs ${text}`}>{log.supervisor}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === "photos" && (
        <div className="space-y-4">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            className="hidden"
            onChange={(e) => e.target.files && uploadPhotos(e.target.files)}
          />
          <div
            className={`border-2 border-dashed rounded-2xl p-8 text-center transition-colors ${
              dragOver ? "border-blue-500 bg-blue-50/50 dark:bg-blue-900/20" : isDark ? "border-slate-700" : "border-slate-300"
            }`}
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragOver(false);
              if (e.dataTransfer.files.length) uploadPhotos(e.dataTransfer.files);
            }}
          >
            <Upload size={28} className="mx-auto text-slate-400 mb-2" />
            <p className={`text-sm font-medium ${text}`}>Upload Site Photos</p>
            <p className={`text-xs ${muted} mt-1 mb-3`}>JPG, PNG up to 10MB each — drag & drop or choose files</p>
            <div className="flex gap-2 justify-center flex-wrap">
              <button
                type="button"
                disabled={uploadingPhotos || saving}
                onClick={(e) => {
                  e.stopPropagation();
                  fileInputRef.current?.click();
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm hover:bg-blue-700 disabled:opacity-50 inline-flex items-center gap-2"
              >
                {uploadingPhotos ? <Loader2 size={14} className="animate-spin" /> : null}
                Choose Files
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowPhotoModal(true);
                }}
                className="px-4 py-2 border rounded-xl text-sm hover:bg-slate-50 dark:hover:bg-slate-700"
              >
                Add details manually
              </button>
            </div>
          </div>
          {photos.length === 0 ? (
            <p className={`text-center text-sm ${muted} py-4`}>No photos yet. Upload site progress images above.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {photos.map((photo) => (
                <PhotoCard
                  key={photo.id}
                  photo={photo}
                  card={card}
                  text={text}
                  muted={muted}
                  onDelete={() => remove("constructionPhotos", photo.id, `Removed photo: ${photo.title}`)}
                  disabled={saving}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === "cost-tracking" && (
        <div className={`${card} p-5`}>
          <h3 className={`font-semibold mb-4 ${text}`}>Budget vs Actual Cost (₹ Lakhs)</h3>
          {costChart.length === 0 ? (
            <p className={muted}>Add construction stages to see cost comparison.</p>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={costChart} barSize={20}>
                <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "#1e293b" : "#f1f5f9"} />
                <XAxis
                  dataKey="stage"
                  tick={{ fill: isDark ? "#475569" : "#94a3b8", fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: isDark ? "#475569" : "#94a3b8", fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip contentStyle={{ backgroundColor: isDark ? "#1e293b" : "white", borderRadius: "12px" }} />
                <Legend />
                <Bar dataKey="planned" name="Planned (L)" fill="#2563EB" radius={[4, 4, 0, 0]} opacity={0.6} />
                <Bar dataKey="actual" name="Actual (L)" fill="#10B981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      )}

      {showLogModal && (
        <Modal title="Log Daily Progress" onClose={() => setShowLogModal(false)} card={card} text={text} muted={muted}>
          <form onSubmit={handleSaveLog} className="space-y-3">
            {[
              { key: "date", label: "Date", type: "text" },
              { key: "activity", label: "Activity *", type: "text" },
              { key: "workers", label: "Workers on site", type: "number" },
              { key: "materials", label: "Materials used", type: "text" },
              { key: "weather", label: "Weather", type: "text" },
              { key: "supervisor", label: "Supervisor", type: "text" },
            ].map((f) => (
              <label key={f.key} className="block">
                <span className={`text-xs font-medium ${muted}`}>{f.label}</span>
                <input
                  type={f.type}
                  required={f.key === "activity"}
                  value={logForm[f.key as keyof typeof logForm]}
                  onChange={(e) => setLogForm({ ...logForm, [f.key]: e.target.value })}
                  className={`mt-1 w-full px-3 py-2 rounded-xl border text-sm ${border}`}
                />
              </label>
            ))}
            <SubmitRow saving={saving} onCancel={() => setShowLogModal(false)} />
          </form>
        </Modal>
      )}

      {showStageModal && (
        <Modal
          title={editingStage ? "Edit Stage" : "Add Construction Stage"}
          onClose={() => setShowStageModal(false)}
          card={card}
          text={text}
          muted={muted}
        >
          <form onSubmit={handleSaveStage} className="space-y-3">
            <label className="block">
              <span className={`text-xs font-medium ${muted}`}>Stage name *</span>
              <input
                required
                value={stageForm.name}
                onChange={(e) => setStageForm({ ...stageForm, name: e.target.value })}
                className={`mt-1 w-full px-3 py-2 rounded-xl border text-sm ${border}`}
              />
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label className="block">
                <span className={`text-xs font-medium ${muted}`}>Status</span>
                <select
                  value={stageForm.status}
                  onChange={(e) =>
                    setStageForm({
                      ...stageForm,
                      status: e.target.value as ConstructionStage["status"],
                    })
                  }
                  className={`mt-1 w-full px-3 py-2 rounded-xl border text-sm ${border}`}
                >
                  {["Not Started", "In Progress", "Completed", "Delayed"].map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className={`text-xs font-medium ${muted}`}>Progress %</span>
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={stageForm.progress}
                  onChange={(e) => setStageForm({ ...stageForm, progress: e.target.value })}
                  className={`mt-1 w-full px-3 py-2 rounded-xl border text-sm ${border}`}
                />
              </label>
            </div>
            <label className="block">
              <span className={`text-xs font-medium ${muted}`}>Target date</span>
              <input
                value={stageForm.targetDate}
                onChange={(e) => setStageForm({ ...stageForm, targetDate: e.target.value })}
                placeholder="e.g. Dec 2025"
                className={`mt-1 w-full px-3 py-2 rounded-xl border text-sm ${border}`}
              />
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label className="block">
                <span className={`text-xs font-medium ${muted}`}>Planned cost</span>
                <input
                  value={stageForm.plannedCost}
                  onChange={(e) => setStageForm({ ...stageForm, plannedCost: e.target.value })}
                  placeholder="₹18.0Cr"
                  className={`mt-1 w-full px-3 py-2 rounded-xl border text-sm ${border}`}
                />
              </label>
              <label className="block">
                <span className={`text-xs font-medium ${muted}`}>Actual cost</span>
                <input
                  value={stageForm.actualCost}
                  onChange={(e) => setStageForm({ ...stageForm, actualCost: e.target.value })}
                  placeholder="₹14.2Cr"
                  className={`mt-1 w-full px-3 py-2 rounded-xl border text-sm ${border}`}
                />
              </label>
            </div>
            <SubmitRow saving={saving} onCancel={() => setShowStageModal(false)} />
          </form>
        </Modal>
      )}

      {showPhotoModal && (
        <Modal title="Add Site Photo" onClose={() => setShowPhotoModal(false)} card={card} text={text} muted={muted}>
          <form onSubmit={handleSavePhoto} className="space-y-3">
            <label className="block">
              <span className={`text-xs font-medium ${muted}`}>Title *</span>
              <input
                required
                value={photoForm.title}
                onChange={(e) => setPhotoForm({ ...photoForm, title: e.target.value })}
                className={`mt-1 w-full px-3 py-2 rounded-xl border text-sm ${border}`}
              />
            </label>
            <label className="block">
              <span className={`text-xs font-medium ${muted}`}>Stage</span>
              <select
                value={photoForm.stage}
                onChange={(e) => setPhotoForm({ ...photoForm, stage: e.target.value })}
                className={`mt-1 w-full px-3 py-2 rounded-xl border text-sm ${border}`}
              >
                {["Foundation", "Structure", "Finishing", "MEP", "Other"].map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className={`text-xs font-medium ${muted}`}>Uploaded by</span>
              <input
                value={photoForm.uploadedBy}
                onChange={(e) => setPhotoForm({ ...photoForm, uploadedBy: e.target.value })}
                className={`mt-1 w-full px-3 py-2 rounded-xl border text-sm ${border}`}
              />
            </label>
            <SubmitRow saving={saving} onCancel={() => setShowPhotoModal(false)} />
          </form>
        </Modal>
      )}
    </div>
  );
}

function Modal({
  title,
  onClose,
  card,
  text,
  muted,
  children,
}: {
  title: string;
  onClose: () => void;
  card: string;
  text: string;
  muted: string;
  children: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className={`${card} w-full max-w-md max-h-[90vh] overflow-y-auto p-5`}>
        <div className="flex items-center justify-between mb-4">
          <h2 className={`font-bold ${text}`}>{title}</h2>
          <button type="button" onClick={onClose} className={muted}>
            <X size={20} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

function SubmitRow({ saving, onCancel }: { saving: boolean; onCancel: () => void }) {
  return (
    <div className="flex gap-2 pt-2">
      <button
        type="button"
        onClick={onCancel}
        className="flex-1 py-2.5 rounded-xl border text-sm font-medium"
      >
        Cancel
      </button>
      <button
        type="submit"
        disabled={saving}
        className="flex-1 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-medium disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {saving ? <Loader2 size={16} className="animate-spin" /> : null}
        Save
      </button>
    </div>
  );
}

function PhotoCard({
  photo,
  card,
  text,
  muted,
  onDelete,
  disabled,
}: {
  photo: ConstructionPhoto;
  card: string;
  text: string;
  muted: string;
  onDelete: () => void;
  disabled: boolean;
}) {
  return (
    <div className={`${card} overflow-hidden`}>
      <div className="aspect-video bg-slate-200 dark:bg-slate-700 relative">
        {photo.imageUrl ? (
          <img src={photo.imageUrl} alt={photo.title} className="w-full h-full object-cover" />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <Camera size={32} className="text-slate-400" />
          </div>
        )}
        <button
          type="button"
          disabled={disabled}
          onClick={onDelete}
          className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/50 text-white hover:bg-red-600 disabled:opacity-50"
          title="Remove photo"
        >
          <Trash2 size={14} />
        </button>
      </div>
      <div className="p-3">
        <div className={`text-sm font-medium ${text}`}>{photo.title}</div>
        <div className={`text-xs ${muted} mt-0.5`}>{photo.date}</div>
        <div className="flex gap-2 mt-1.5 flex-wrap">
          <span className="text-xs px-1.5 py-0.5 bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 rounded">
            {photo.stage}
          </span>
          <span className={`text-xs ${muted}`}>by {photo.uploadedBy}</span>
        </div>
      </div>
    </div>
  );
}

function guessStageFromTitle(title: string): string {
  const t = title.toLowerCase();
  if (/foundation|excavat|footing/.test(t)) return "Foundation";
  if (/structure|column|beam|slab|floor/.test(t)) return "Structure";
  if (/brick|mason|wall/.test(t)) return "Masonry";
  if (/plumb|pipe|water|sewer/.test(t)) return "Plumbing";
  if (/electr|wiring|panel/.test(t)) return "Electrical";
  if (/finish|paint|tile|plaster/.test(t)) return "Finishing";
  if (/landscap|garden|paving/.test(t)) return "Landscaping";
  return "Structure";
}

function compressImageFile(file: File, maxWidth = 1280, quality = 0.82): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      const scale = Math.min(1, maxWidth / img.width);
      const w = Math.round(img.width * scale);
      const h = Math.round(img.height * scale);
      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Canvas not supported"));
        return;
      }
      ctx.drawImage(img, 0, 0, w, h);
      resolve(canvas.toDataURL("image/jpeg", quality));
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Failed to load image"));
    };
    img.src = url;
  });
}

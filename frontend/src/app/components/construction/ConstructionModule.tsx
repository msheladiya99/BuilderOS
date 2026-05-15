import { useState } from "react";
import { useData } from "../../../context/DataContext";
import { Camera, CheckCircle2, Clock, AlertCircle, Plus, Upload } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";

const STAGES = [
  { id: 1, name: "Foundation", project: "Skyline Heights", status: "Completed", progress: 100, date: "Mar 2023", cost: "₹4.2Cr", planned: "₹4.0Cr" },
  { id: 2, name: "Structure - Block A", project: "Skyline Heights", status: "Completed", progress: 100, date: "Dec 2023", cost: "₹18.6Cr", planned: "₹18.0Cr" },
  { id: 3, name: "Structure - Block B", project: "Skyline Heights", status: "In Progress", progress: 82, date: "Aug 2024", cost: "₹14.2Cr", planned: "₹18.0Cr" },
  { id: 4, name: "Structure - Block C", project: "Skyline Heights", status: "In Progress", progress: 45, date: "Dec 2024", cost: "₹6.8Cr", planned: "₹18.0Cr" },
  { id: 5, name: "Finishing - Block A", project: "Skyline Heights", status: "In Progress", progress: 68, date: "Dec 2025", cost: "₹8.4Cr", planned: "₹12.0Cr" },
  { id: 6, name: "MEP Works", project: "Skyline Heights", status: "In Progress", progress: 55, date: "Sep 2025", cost: "₹5.2Cr", planned: "₹8.0Cr" },
];

const PROGRESS_PHOTOS = [
  { id: 1, title: "Block C - Floor 8 Slab", date: "15 May 2026", stage: "Structure", uploaded: "Ranjit Site" },
  { id: 2, title: "Block B - Finishing Work", date: "14 May 2026", stage: "Finishing", uploaded: "Site Team" },
  { id: 3, title: "MEP Conduit Laying", date: "13 May 2026", stage: "MEP", uploaded: "Ranjit Site" },
  { id: 4, title: "Foundation - Green Valley", date: "12 May 2026", stage: "Foundation", uploaded: "Site Team" },
];

const DAILY_LOGS = [
  { date: "15 May", activity: "RCC Column casting - Block C Floor 8", workers: 42, materials: "Steel: 2.4MT, Cement: 180 bags", weather: "Clear", supervisor: "Ranjit" },
  { date: "14 May", activity: "Plastering work - Block A Floor 8-9", workers: 38, materials: "Sand: 800 CFT, Cement: 240 bags", weather: "Cloudy", supervisor: "Ramesh" },
  { date: "13 May", activity: "Beam bottom shuttering - Block C Floor 9", workers: 45, materials: "Steel: 1.8MT, Plywood: 200 pcs", weather: "Clear", supervisor: "Ranjit" },
  { date: "12 May", activity: "Waterproofing - Block A Terrace", workers: 22, materials: "Waterproofing compound: 800L", weather: "Clear", supervisor: "Ramesh" },
];

const COST_CHART = [
  { stage: "Foundation", planned: 40, actual: 42 },
  { stage: "Structure A", planned: 180, actual: 186 },
  { stage: "Structure B", planned: 180, actual: 142 },
  { stage: "Structure C", planned: 180, actual: 68 },
  { stage: "Finishing", planned: 120, actual: 84 },
  { stage: "MEP", planned: 80, actual: 52 },
];

type ConstructionModuleProps = { isDark: boolean };

export function ConstructionModule({ isDark }: ConstructionModuleProps) {
  const { projects } = useData();
  const [activeTab, setActiveTab] = useState("stages");
  const text = isDark ? "text-white" : "text-slate-800";
  const muted = "text-slate-500";
  const border = isDark ? "border-slate-700" : "border-slate-200";
  const card = `bg-white dark:bg-slate-800 border ${border} rounded-2xl`;

  const statusColor = (status: string) =>
    status === "Completed" ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" :
    status === "In Progress" ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" : "bg-slate-100 text-slate-600";

  return (
    <div className="p-5 space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className={text}>Construction Tracker</h1>
          <p className={`text-sm ${muted}`}>Skyline Heights · 78% overall progress</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium">
          <Plus size={15} /> Log Progress
        </button>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "Stages Complete", value: "2/6", icon: CheckCircle2, color: "emerald" },
          { label: "On Schedule", value: "4", icon: Clock, color: "blue" },
          { label: "Delayed", value: "2", icon: AlertCircle, color: "orange" },
          { label: "Budget Used", value: "₹57.4Cr", icon: AlertCircle, color: "purple" },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className={`${card} p-4`}>
            <div className="flex items-center justify-between">
              <div>
                <div className={`text-xs ${muted} uppercase tracking-wide`}>{label}</div>
                <div className={`text-2xl font-bold mt-1 ${text}`}>{value}</div>
              </div>
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                color === "emerald" ? "bg-emerald-100 text-emerald-600" :
                color === "blue" ? "bg-blue-100 text-blue-600" :
                color === "orange" ? "bg-orange-100 text-orange-600" : "bg-purple-100 text-purple-600"
              }`}>
                <Icon size={15} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100 dark:bg-slate-800 rounded-xl p-0.5 w-fit">
        {["stages", "daily-logs", "photos", "cost-tracking"].map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)} className={`px-4 py-1.5 rounded-lg text-xs font-medium capitalize transition-all whitespace-nowrap ${activeTab === tab ? "bg-white dark:bg-slate-700 shadow-sm text-slate-800 dark:text-white" : "text-slate-500"}`}>
            {tab.replace("-", " ")}
          </button>
        ))}
      </div>

      {activeTab === "stages" && (
        <div className="space-y-3">
          {STAGES.map(stage => (
            <div key={stage.id} className={`${card} p-5`}>
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className={`font-semibold text-sm ${text}`}>{stage.name}</h3>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${statusColor(stage.status)}`}>{stage.status}</span>
                  </div>
                  <div className="flex items-center gap-1 mb-3">
                    <span className={`text-xs ${muted}`}>{stage.project}</span>
                    <span className={muted}>·</span>
                    <span className={`text-xs ${muted}`}>Target: {stage.date}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-2.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${stage.status === "Completed" ? "bg-emerald-500" : "bg-blue-600"}`}
                        style={{ width: `${stage.progress}%` }}
                      />
                    </div>
                    <span className={`text-sm font-bold ${stage.status === "Completed" ? "text-emerald-600" : "text-blue-600"}`}>{stage.progress}%</span>
                  </div>
                </div>
                <div className="flex gap-4 text-right flex-shrink-0">
                  <div>
                    <div className={`text-xs ${muted}`}>Planned</div>
                    <div className={`text-sm font-medium ${text}`}>{stage.planned}</div>
                  </div>
                  <div>
                    <div className={`text-xs ${muted}`}>Actual</div>
                    <div className={`text-sm font-medium ${parseInt(stage.cost) > parseInt(stage.planned) ? "text-orange-500" : "text-emerald-600"}`}>{stage.cost}</div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === "daily-logs" && (
        <div className={`${card} overflow-hidden`}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className={`border-b ${border} ${isDark ? "bg-slate-900/50" : "bg-slate-50"}`}>
                  {["Date", "Activity", "Workers", "Materials Used", "Weather", "Supervisor"].map(h => (
                    <th key={h} className={`px-4 py-3 text-left text-xs font-semibold ${muted} uppercase tracking-wide whitespace-nowrap`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className={`divide-y ${isDark ? "divide-slate-700/50" : "divide-slate-100"}`}>
                {DAILY_LOGS.map(log => (
                  <tr key={log.date} className={`hover:${isDark ? "bg-slate-700/30" : "bg-slate-50"}`}>
                    <td className={`px-4 py-3 text-xs font-medium ${text}`}>{log.date}</td>
                    <td className={`px-4 py-3 text-xs ${text} max-w-52`}>{log.activity}</td>
                    <td className={`px-4 py-3 text-xs font-semibold ${text}`}>{log.workers}</td>
                    <td className={`px-4 py-3 text-xs ${muted} max-w-48`}>{log.materials}</td>
                    <td className={`px-4 py-3 text-xs ${muted}`}>{log.weather}</td>
                    <td className={`px-4 py-3 text-xs ${text}`}>{log.supervisor}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === "photos" && (
        <div className="space-y-4">
          <div className={`border-2 border-dashed rounded-2xl p-8 text-center ${isDark ? "border-slate-700" : "border-slate-300"}`}>
            <Upload size={28} className="mx-auto text-slate-400 mb-2" />
            <p className={`text-sm font-medium ${text}`}>Upload Site Photos</p>
            <p className={`text-xs ${muted} mt-1 mb-3`}>JPG, PNG up to 10MB each</p>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm hover:bg-blue-700">Choose Files</button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {PROGRESS_PHOTOS.map(photo => (
              <div key={photo.id} className={`${card} p-4 flex gap-3`}>
                <div className="w-16 h-16 rounded-xl bg-slate-200 dark:bg-slate-700 flex items-center justify-center flex-shrink-0">
                  <Camera size={24} className="text-slate-400" />
                </div>
                <div>
                  <div className={`text-sm font-medium ${text}`}>{photo.title}</div>
                  <div className={`text-xs ${muted} mt-0.5`}>{photo.date}</div>
                  <div className="flex gap-2 mt-1.5">
                    <span className="text-xs px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded">{photo.stage}</span>
                    <span className={`text-xs ${muted}`}>by {photo.uploaded}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === "cost-tracking" && (
        <div className={`${card} p-5`}>
          <h3 className={`font-semibold mb-4 ${text}`}>Budget vs Actual Cost (₹ Lakhs)</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={COST_CHART} barSize={20}>
              <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "#1e293b" : "#f1f5f9"} />
              <XAxis dataKey="stage" tick={{ fill: isDark ? "#475569" : "#94a3b8", fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: isDark ? "#475569" : "#94a3b8", fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ backgroundColor: isDark ? "#1e293b" : "white", borderRadius: "12px" }} />
              <Bar dataKey="planned" name="Planned (L)" fill="#2563EB" radius={[4, 4, 0, 0]} opacity={0.6} />
              <Bar dataKey="actual" name="Actual (L)" fill="#10B981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}

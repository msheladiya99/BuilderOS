import { useState } from "react";
import { Plus, Phone, Mail, Calendar, MoreHorizontal, Search, TrendingUp, Users, Target, Award, X } from "lucide-react";
import { FunnelChart, Funnel, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";

const PIPELINE_STAGES = ["New Lead", "Contacted", "Site Visit", "Proposal", "Booking"] as const;
type Stage = typeof PIPELINE_STAGES[number];

const STAGE_COLORS: Record<Stage, string> = {
  "New Lead": "bg-slate-500",
  "Contacted": "bg-blue-500",
  "Site Visit": "bg-purple-500",
  "Proposal": "bg-orange-500",
  "Booking": "bg-emerald-500",
};

const LEADS: Array<{
  id: number; name: string; phone: string; email: string; stage: Stage;
  interest: string; budget: string; source: string; agent: string; date: string; priority: "High" | "Medium" | "Low";
}> = [
  { id: 1, name: "Rajan Mehta", phone: "+91 98765 11234", email: "rajan@gmail.com", stage: "New Lead", interest: "3BHK - Skyline Hts", budget: "₹90L-1.2Cr", source: "Website", agent: "Priya Sales", date: "Today", priority: "High" },
  { id: 2, name: "Ananya Sharma", phone: "+91 87654 22345", email: "ananya@gmail.com", stage: "Contacted", interest: "2BHK - Green Valley", budget: "₹55-70L", source: "Referral", agent: "Ravi Kumar", date: "Yesterday", priority: "High" },
  { id: 3, name: "Dev Patel", phone: "+91 76543 33456", email: "dev@gmail.com", stage: "Site Visit", interest: "2BHK - Marina Cove", budget: "₹80-1Cr", source: "Facebook", agent: "Priya Sales", date: "12 May", priority: "Medium" },
  { id: 4, name: "Neha Gupta", phone: "+91 65432 44567", email: "neha@gmail.com", stage: "Proposal", interest: "4BHK - Prestige Twr", budget: "₹1.5Cr+", source: "Walk-in", agent: "Sachin Jain", date: "11 May", priority: "High" },
  { id: 5, name: "Rohit Verma", phone: "+91 54321 55678", email: "rohit@gmail.com", stage: "Booking", interest: "1BHK - Skyline Hts", budget: "₹40-50L", source: "Portal", agent: "Ravi Kumar", date: "10 May", priority: "Low" },
  { id: 6, name: "Kavitha Nair", phone: "+91 43210 66789", email: "kavitha@gmail.com", stage: "New Lead", interest: "3BHK - Green Valley", budget: "₹85L-1Cr", source: "Google Ads", agent: "Sachin Jain", date: "Today", priority: "Medium" },
  { id: 7, name: "Arun Khanna", phone: "+91 32109 77890", email: "arun@gmail.com", stage: "Contacted", interest: "2BHK - Marina Cove", budget: "₹70-90L", source: "Instagram", agent: "Priya Sales", date: "13 May", priority: "Medium" },
  { id: 8, name: "Pooja Rao", phone: "+91 21098 88901", email: "pooja@gmail.com", stage: "Site Visit", interest: "4BHK - Prestige Twr", budget: "₹1.8Cr+", source: "Referral", agent: "Sachin Jain", date: "12 May", priority: "High" },
];

const AGENT_DATA = [
  { name: "Priya Sales", leads: 45, bookings: 12, revenue: "₹8.2Cr", conversion: "26.7%" },
  { name: "Ravi Kumar", leads: 38, bookings: 9, revenue: "₹5.8Cr", conversion: "23.7%" },
  { name: "Sachin Jain", leads: 52, bookings: 14, revenue: "₹11.4Cr", conversion: "26.9%" },
  { name: "Meera Shah", leads: 29, bookings: 6, revenue: "₹3.9Cr", conversion: "20.7%" },
];

const FUNNEL_DATA = [
  { value: 342, name: "New Leads", fill: "#64748b" },
  { value: 218, name: "Contacted", fill: "#3b82f6" },
  { value: 124, name: "Site Visits", fill: "#8b5cf6" },
  { value: 68, name: "Proposals", fill: "#f59e0b" },
  { value: 35, name: "Bookings", fill: "#10b981" },
];

type CRMModuleProps = { isDark: boolean };

export function CRMModule({ isDark }: CRMModuleProps) {
  const [activeTab, setActiveTab] = useState<"kanban" | "list" | "analytics" | "agents">("kanban");
  const [leads, setLeads] = useState(LEADS);
  const [selectedLead, setSelectedLead] = useState<typeof LEADS[0] | null>(null);
  const [search, setSearch] = useState("");

  const text = isDark ? "text-white" : "text-slate-800";
  const muted = "text-slate-500";
  const card = `bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700`;

  const getLeadsForStage = (stage: Stage) =>
    leads.filter(l => l.stage === stage && (
      !search || l.name.toLowerCase().includes(search.toLowerCase()) ||
      l.interest.toLowerCase().includes(search.toLowerCase())
    ));

  const moveLead = (id: number, direction: "forward" | "back") => {
    setLeads(prev => prev.map(l => {
      if (l.id !== id) return l;
      const idx = PIPELINE_STAGES.indexOf(l.stage);
      const newIdx = direction === "forward" ? Math.min(idx + 1, 4) : Math.max(idx - 1, 0);
      return { ...l, stage: PIPELINE_STAGES[newIdx] };
    }));
  };

  const priorityColor = (p: string) => p === "High" ? "text-red-500 bg-red-50 dark:bg-red-950/30" : p === "Medium" ? "text-orange-500 bg-orange-50" : "text-slate-500 bg-slate-100 dark:bg-slate-700";

  return (
    <div className="p-5 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className={text}>Sales CRM</h1>
          <p className={`text-sm ${muted}`}>{leads.length} active leads · ₹25.3Cr pipeline value</p>
        </div>
        <div className="flex gap-2">
          <button className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-sm ${isDark ? "border-slate-700 text-slate-300" : "border-slate-200 text-slate-600"}`}>
            <Calendar size={14} /> Schedule
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium">
            <Plus size={15} /> Add Lead
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "Total Leads", value: "342", icon: Users, color: "blue" },
          { label: "Site Visits", value: "124", icon: Calendar, color: "purple" },
          { label: "Conversions", value: "35", icon: Target, color: "emerald" },
          { label: "Conversion Rate", value: "10.2%", icon: TrendingUp, color: "orange" },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className={`${card} rounded-2xl p-4`}>
            <div className="flex items-center justify-between">
              <div>
                <div className={`text-xs ${muted} uppercase tracking-wide`}>{label}</div>
                <div className={`text-2xl font-bold mt-1 ${text}`}>{value}</div>
              </div>
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                color === "blue" ? "bg-blue-100 text-blue-600" :
                color === "purple" ? "bg-purple-100 text-purple-600" :
                color === "emerald" ? "bg-emerald-100 text-emerald-600" : "bg-orange-100 text-orange-600"
              }`}>
                <Icon size={16} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100 dark:bg-slate-800 rounded-xl p-0.5 w-fit">
        {(["kanban", "list", "analytics", "agents"] as const).map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)} className={`px-4 py-1.5 rounded-lg text-xs font-medium capitalize transition-all ${activeTab === tab ? "bg-white dark:bg-slate-700 shadow-sm text-slate-800 dark:text-white" : "text-slate-500 hover:text-slate-700"}`}>{tab}</button>
        ))}
      </div>

      {/* Kanban Board */}
      {activeTab === "kanban" && (
        <>
          <div className={`flex items-center gap-2 px-3 py-2 rounded-xl border w-64 ${isDark ? "bg-slate-800 border-slate-700" : "bg-white border-slate-200"}`}>
            <Search size={14} className={muted} />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search leads..." className={`flex-1 text-sm bg-transparent outline-none ${isDark ? "text-white" : "text-slate-800"}`} />
          </div>
          <div className="flex gap-3 overflow-x-auto pb-3">
            {PIPELINE_STAGES.map(stage => {
              const stageLeads = getLeadsForStage(stage);
              return (
                <div key={stage} className="flex-shrink-0 w-64">
                  <div className="flex items-center gap-2 mb-3">
                    <div className={`w-2.5 h-2.5 rounded-full ${STAGE_COLORS[stage]}`} />
                    <span className={`text-xs font-semibold ${text}`}>{stage}</span>
                    <span className={`text-xs px-1.5 py-0.5 rounded-full ${isDark ? "bg-slate-700 text-slate-400" : "bg-slate-200 text-slate-600"}`}>{stageLeads.length}</span>
                  </div>
                  <div className="space-y-2 min-h-24">
                    {stageLeads.map(lead => (
                      <div
                        key={lead.id}
                        onClick={() => setSelectedLead(lead)}
                        className={`${card} rounded-xl p-3 cursor-pointer hover:shadow-md hover:border-blue-300 dark:hover:border-blue-600 transition-all`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                              {lead.name.split(" ").map(n => n[0]).join("")}
                            </div>
                            <div>
                              <div className={`text-xs font-semibold ${text}`}>{lead.name}</div>
                              <div className={`text-xs ${muted}`}>{lead.source}</div>
                            </div>
                          </div>
                          <span className={`text-xs px-1.5 py-0.5 rounded-full ${priorityColor(lead.priority)}`}>{lead.priority}</span>
                        </div>
                        <div className={`mt-2.5 text-xs ${muted} truncate`}>{lead.interest}</div>
                        <div className={`text-xs font-medium mt-1 ${text}`}>{lead.budget}</div>
                        <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-700">
                          <span className={`text-xs ${muted}`}>{lead.agent}</span>
                          <div className="flex gap-1">
                            {PIPELINE_STAGES.indexOf(stage) > 0 && (
                              <button onClick={e => { e.stopPropagation(); moveLead(lead.id, "back"); }}
                                className="text-xs px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-500 hover:bg-slate-300">←</button>
                            )}
                            {PIPELINE_STAGES.indexOf(stage) < 4 && (
                              <button onClick={e => { e.stopPropagation(); moveLead(lead.id, "forward"); }}
                                className="text-xs px-1.5 py-0.5 rounded bg-blue-100 text-blue-600 hover:bg-blue-200">→</button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* Analytics tab */}
      {activeTab === "analytics" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className={`${card} rounded-2xl p-5`}>
            <h3 className={`font-semibold mb-4 ${text}`}>Sales Funnel</h3>
            <ResponsiveContainer width="100%" height={240}>
              <FunnelChart>
                <Tooltip contentStyle={{ backgroundColor: isDark ? "#1e293b" : "white", border: "1px solid #e2e8f0", borderRadius: "12px" }} />
                <Funnel dataKey="value" data={FUNNEL_DATA} isAnimationActive>
                  {FUNNEL_DATA.map((entry, i) => (
                    <rect key={i} fill={entry.fill} />
                  ))}
                </Funnel>
              </FunnelChart>
            </ResponsiveContainer>
            <div className="mt-2 space-y-2">
              {FUNNEL_DATA.map(d => (
                <div key={d.name} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: d.fill }} />
                  <span className={`text-xs flex-1 ${muted}`}>{d.name}</span>
                  <span className={`text-xs font-semibold ${text}`}>{d.value}</span>
                </div>
              ))}
            </div>
          </div>

          <div className={`${card} rounded-2xl p-5`}>
            <h3 className={`font-semibold mb-4 ${text}`}>Leads by Source</h3>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={[
                { source: "Website", leads: 89 },
                { source: "Referral", leads: 72 },
                { source: "Google", leads: 64 },
                { source: "Facebook", leads: 54 },
                { source: "Walk-in", leads: 38 },
                { source: "Portal", leads: 25 },
              ]} barSize={20}>
                <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "#1e293b" : "#f1f5f9"} />
                <XAxis dataKey="source" tick={{ fill: isDark ? "#475569" : "#94a3b8", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: isDark ? "#475569" : "#94a3b8", fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ backgroundColor: isDark ? "#1e293b" : "white", borderRadius: "12px" }} />
                <Bar dataKey="leads" fill="#2563EB" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Agents tab */}
      {activeTab === "agents" && (
        <div className={`${card} rounded-2xl overflow-hidden`}>
          <div className={`px-5 py-4 border-b ${isDark ? "border-slate-700" : "border-slate-200"} flex items-center justify-between`}>
            <h3 className={`font-semibold ${text}`}>Agent Leaderboard</h3>
            <div className="flex items-center gap-1.5">
              <Award size={16} className="text-yellow-500" />
              <span className={`text-xs ${muted}`}>May 2026</span>
            </div>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className={`border-b ${isDark ? "border-slate-700 bg-slate-900/50" : "border-slate-100 bg-slate-50"}`}>
                {["Rank", "Agent", "Total Leads", "Bookings", "Revenue", "Conversion"].map(h => (
                  <th key={h} className={`px-5 py-3 text-left text-xs font-semibold ${muted} uppercase tracking-wide`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className={`divide-y ${isDark ? "divide-slate-700/50" : "divide-slate-100"}`}>
              {AGENT_DATA.sort((a, b) => b.bookings - a.bookings).map((agent, i) => (
                <tr key={agent.name} className={`hover:${isDark ? "bg-slate-700/30" : "bg-slate-50"}`}>
                  <td className="px-5 py-3.5">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                      i === 0 ? "bg-yellow-400 text-yellow-900" :
                      i === 1 ? "bg-slate-400 text-white" :
                      i === 2 ? "bg-orange-400 text-white" : "bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400"
                    }`}>{i + 1}</div>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold">
                        {agent.name.split(" ").map(n => n[0]).join("")}
                      </div>
                      <span className={`text-sm font-medium ${text}`}>{agent.name}</span>
                    </div>
                  </td>
                  <td className={`px-5 py-3.5 text-sm ${muted}`}>{agent.leads}</td>
                  <td className={`px-5 py-3.5 text-sm font-semibold ${text}`}>{agent.bookings}</td>
                  <td className={`px-5 py-3.5 text-sm font-semibold text-emerald-600`}>{agent.revenue}</td>
                  <td className="px-5 py-3.5">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${parseFloat(agent.conversion) >= 25 ? "bg-emerald-100 text-emerald-700" : "bg-blue-100 text-blue-700"}`}>
                      {agent.conversion}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Lead detail panel */}
      {selectedLead && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-end">
          <div className={`h-full w-full max-w-md ${isDark ? "bg-slate-900" : "bg-white"} overflow-y-auto`}>
            <div className={`sticky top-0 px-5 py-4 border-b ${isDark ? "border-slate-700 bg-slate-900" : "border-slate-200 bg-white"} flex items-center justify-between z-10`}>
              <div>
                <h3 className={`font-semibold ${text}`}>{selectedLead.name}</h3>
                <p className={`text-xs ${muted}`}>{selectedLead.source} · {selectedLead.date}</p>
              </div>
              <button onClick={() => setSelectedLead(null)} className={`${muted} hover:text-red-500`}><X size={18} /></button>
            </div>
            <div className="p-5 space-y-4">
              <div className="flex items-center justify-between">
                <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${STAGE_COLORS[selectedLead.stage]} text-white`}>{selectedLead.stage}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full ${priorityColor(selectedLead.priority)}`}>{selectedLead.priority} Priority</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "Phone", value: selectedLead.phone, icon: Phone },
                  { label: "Email", value: selectedLead.email, icon: Mail },
                  { label: "Interest", value: selectedLead.interest, icon: TrendingUp },
                  { label: "Budget", value: selectedLead.budget, icon: TrendingUp },
                  { label: "Agent", value: selectedLead.agent, icon: Users },
                  { label: "Date", value: selectedLead.date, icon: Calendar },
                ].map(d => (
                  <div key={d.label} className={`p-3 rounded-xl ${isDark ? "bg-slate-800" : "bg-slate-50"}`}>
                    <div className={`text-xs ${muted}`}>{d.label}</div>
                    <div className={`text-xs font-medium ${text} mt-0.5 truncate`}>{d.value}</div>
                  </div>
                ))}
              </div>
              <div className={`p-4 rounded-xl ${isDark ? "bg-slate-800" : "bg-slate-50"}`}>
                <h4 className={`text-sm font-medium mb-3 ${text}`}>Follow-up Actions</h4>
                <div className="space-y-2">
                  {[
                    { action: "Call scheduled", time: "Tomorrow 11 AM" },
                    { action: "Site visit", time: "18 May 3 PM" },
                    { action: "Send brochure", time: "Completed" },
                  ].map(f => (
                    <div key={f.action} className="flex items-center justify-between">
                      <span className={`text-xs ${text}`}>{f.action}</span>
                      <span className={`text-xs ${f.time === "Completed" ? "text-emerald-500" : "text-blue-500"}`}>{f.time}</span>
                    </div>
                  ))}
                </div>
              </div>
              <button className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium transition-colors">
                Convert to Booking
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

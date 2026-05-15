import { useState } from "react";
import { Home, IndianRupee, Bell, FileText, Wrench, Camera, CheckCircle2, Clock, AlertCircle } from "lucide-react";

type OwnerPortalProps = { isDark: boolean };

export function OwnerPortal({ isDark }: OwnerPortalProps) {
  const [activeTab, setActiveTab] = useState("dashboard");
  const text = isDark ? "text-white" : "text-slate-800";
  const muted = "text-slate-500";
  const border = isDark ? "border-slate-700" : "border-slate-200";
  const card = `bg-white dark:bg-slate-800 border ${border} rounded-2xl`;

  return (
    <div className="p-5 space-y-5">
      {/* Owner banner */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-2xl p-5 text-white">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center text-white font-bold text-lg">RS</div>
          <div>
            <div className="text-white font-bold">Rahul Sharma</div>
            <div className="text-blue-200 text-sm mt-0.5">Unit 304, Skyline Heights · Block A</div>
            <div className="text-blue-200 text-xs mt-0.5">Possession: Dec 2025 · Booking: Mar 2023</div>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4 mt-5 pt-4 border-t border-white/20">
          {[
            { label: "Total Value", value: "₹62.5L" },
            { label: "Amount Paid", value: "₹38.4L" },
            { label: "Balance", value: "₹24.1L" },
          ].map(s => (
            <div key={s.label} className="text-center">
              <div className="text-white font-bold">{s.value}</div>
              <div className="text-blue-200 text-xs mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100 dark:bg-slate-800 rounded-xl p-0.5 overflow-x-auto">
        {["dashboard", "payments", "construction", "documents", "complaints"].map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)} className={`px-4 py-1.5 rounded-lg text-xs font-medium capitalize transition-all whitespace-nowrap ${activeTab === tab ? "bg-white dark:bg-slate-700 shadow-sm text-slate-800 dark:text-white" : "text-slate-500"}`}>
            {tab}
          </button>
        ))}
      </div>

      {activeTab === "dashboard" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className={`${card} p-5`}>
            <h3 className={`font-semibold mb-4 ${text}`}>My Property</h3>
            {[
              { label: "Project", value: "Skyline Heights" },
              { label: "Unit", value: "304, Block A" },
              { label: "Type", value: "2BHK · 980 sqft" },
              { label: "Floor", value: "3rd Floor · East Facing" },
              { label: "RERA No.", value: "P51800032145" },
              { label: "Possession Date", value: "December 2025" },
            ].map(d => (
              <div key={d.label} className={`flex justify-between py-2 border-b ${isDark ? "border-slate-700/50" : "border-slate-100"} last:border-0`}>
                <span className={`text-xs ${muted}`}>{d.label}</span>
                <span className={`text-xs font-medium ${text}`}>{d.value}</span>
              </div>
            ))}
          </div>

          <div className="space-y-3">
            <div className={`${card} p-4`}>
              <h4 className={`text-sm font-semibold mb-3 ${text}`}>Payment Summary</h4>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className={`text-xs ${muted}`}>Payment Progress</span>
                    <span className="text-xs font-bold text-blue-600">61.4%</span>
                  </div>
                  <div className="h-2 bg-slate-100 dark:bg-slate-700 rounded-full">
                    <div className="h-full bg-blue-600 rounded-full" style={{ width: "61.4%" }} />
                  </div>
                </div>
                <div className="flex justify-between">
                  <span className={`text-xs ${muted}`}>Next EMI Due</span>
                  <span className="text-xs font-semibold text-orange-500">₹4,50,000 · 15 Jun</span>
                </div>
                <div className="flex justify-between">
                  <span className={`text-xs ${muted}`}>EMI Amount</span>
                  <span className={`text-xs font-semibold ${text}`}>₹4,50,000/month</span>
                </div>
              </div>
            </div>

            <div className={`${card} p-4`}>
              <h4 className={`text-sm font-semibold mb-3 ${text}`}>Construction Update</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-xs ${muted}`}>Overall Progress</span>
                  <span className="text-xs font-bold text-blue-600">78%</span>
                </div>
                <div className="h-2 bg-slate-100 dark:bg-slate-700 rounded-full mb-3">
                  <div className="h-full bg-blue-600 rounded-full" style={{ width: "78%" }} />
                </div>
                {["Foundation ✓", "Structure ✓", "Finishing (In Progress)", "Handover (Upcoming)"].map((s, i) => (
                  <div key={s} className="flex items-center gap-2">
                    <div className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 ${i < 2 ? "bg-emerald-500" : i === 2 ? "bg-blue-500" : isDark ? "bg-slate-700" : "bg-slate-200"}`}>
                      {i < 2 && <CheckCircle2 size={10} className="text-white" />}
                      {i === 2 && <Clock size={10} className="text-white" />}
                    </div>
                    <span className={`text-xs ${i === 2 ? "text-blue-600 font-medium" : i > 2 ? muted : text}`}>{s}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "payments" && (
        <div className={`${card} p-5`}>
          <h3 className={`font-semibold mb-4 ${text}`}>Payment History</h3>
          <div className="space-y-3">
            {[
              { date: "15 May 2026", desc: "EMI Payment", amount: "₹4,50,000", receipt: "RCP-8042", status: "Received" },
              { date: "15 Apr 2026", desc: "EMI Payment", amount: "₹4,50,000", receipt: "RCP-7985", status: "Received" },
              { date: "15 Mar 2026", desc: "EMI Payment", amount: "₹4,50,000", receipt: "RCP-7920", status: "Received" },
              { date: "20 Jan 2024", desc: "Part Payment", amount: "₹10,00,000", receipt: "RCP-6142", status: "Received" },
              { date: "12 Mar 2023", desc: "Booking Advance", amount: "₹5,00,000", receipt: "RCP-5210", status: "Received" },
            ].map((p, i) => (
              <div key={i} className={`flex items-center gap-4 p-3.5 rounded-xl border ${border} flex-wrap`}>
                <div className="flex-1">
                  <div className={`text-sm font-medium ${text}`}>{p.desc}</div>
                  <div className={`text-xs ${muted} mt-0.5`}>{p.date} · {p.receipt}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold text-emerald-600">{p.amount}</div>
                  <div className="text-xs px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-full mt-0.5 inline-block">{p.status}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === "complaints" && (
        <div className={`${card} p-5`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className={`font-semibold ${text}`}>Raise a Complaint</h3>
          </div>
          <div className="space-y-4">
            <div>
              <label className={`block text-xs font-medium mb-1.5 ${isDark ? "text-slate-300" : "text-slate-700"}`}>Category</label>
              <select className={`w-full px-3 py-2.5 rounded-xl border text-sm outline-none ${isDark ? "bg-slate-800 border-slate-700 text-white" : "bg-slate-50 border-slate-200 text-slate-800"}`}>
                {["Plumbing", "Electrical", "HVAC", "Civil", "Amenity", "Other"].map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className={`block text-xs font-medium mb-1.5 ${isDark ? "text-slate-300" : "text-slate-700"}`}>Description</label>
              <textarea rows={4} className={`w-full px-3 py-2.5 rounded-xl border text-sm outline-none resize-none ${isDark ? "bg-slate-800 border-slate-700 text-white placeholder-slate-500" : "bg-slate-50 border-slate-200 text-slate-800"}`} placeholder="Describe your issue in detail..." />
            </div>
            <button className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium">Submit Complaint</button>
          </div>
        </div>
      )}

      {(activeTab === "construction" || activeTab === "documents") && (
        <div className={`${card} p-10 text-center`}>
          <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center mx-auto mb-3">
            {activeTab === "construction" ? <Camera size={28} className="text-blue-600" /> : <FileText size={28} className="text-blue-600" />}
          </div>
          <p className={`font-medium ${text}`}>{activeTab === "construction" ? "Construction Updates" : "Documents"}</p>
          <p className={`text-sm ${muted} mt-1`}>Latest updates will appear here</p>
        </div>
      )}
    </div>
  );
}

import { useState } from "react";
import { Folder, File, Upload, Search, Download, Share2, Eye, Trash2, AlertCircle, ChevronRight } from "lucide-react";

const FOLDERS = [
  { id: 1, name: "Legal Documents", count: 24, size: "148 MB", updated: "14 May" },
  { id: 2, name: "RERA Documents", count: 12, size: "62 MB", updated: "10 May" },
  { id: 3, name: "Customer Agreements", count: 264, size: "820 MB", updated: "15 May" },
  { id: 4, name: "Construction Plans", count: 48, size: "2.4 GB", updated: "08 May" },
  { id: 5, name: "Financial Records", count: 186, size: "340 MB", updated: "15 May" },
  { id: 6, name: "Vendor Contracts", count: 38, size: "88 MB", updated: "12 May" },
  { id: 7, name: "KYC Documents", count: 528, size: "1.2 GB", updated: "15 May" },
  { id: 8, name: "Insurance Policies", count: 18, size: "28 MB", updated: "01 May" },
];

const FILES = [
  { id: 1, name: "RERA Certificate - Skyline Heights.pdf", type: "pdf", size: "2.4 MB", date: "10 May", expiry: "Mar 2028", category: "RERA" },
  { id: 2, name: "Sale Agreement - Rahul Sharma.pdf", type: "pdf", size: "1.8 MB", date: "15 Mar", expiry: "—", category: "Agreement" },
  { id: 3, name: "Building Plan - Block A.dwg", type: "dwg", size: "48 MB", date: "08 May", expiry: "—", category: "Plans" },
  { id: 4, name: "Environmental Clearance.pdf", type: "pdf", size: "3.2 MB", date: "2 Jan", expiry: "Dec 2026", category: "Legal" },
  { id: 5, name: "Bank Guarantee - HDFC.pdf", type: "pdf", size: "0.8 MB", date: "15 Apr", expiry: "Mar 2026", category: "Finance" },
  { id: 6, name: "Soil Report - Skyline.pdf", type: "pdf", size: "12 MB", date: "Mar 2023", expiry: "—", category: "Plans" },
];

const EXPIRING = [
  { name: "Bank Guarantee - HDFC.pdf", expiry: "Mar 2026", daysLeft: 10 },
  { name: "Environmental Clearance", expiry: "Dec 2026", daysLeft: 215 },
  { name: "Contractor Insurance - Ranjit", expiry: "Jun 2026", daysLeft: 45 },
];

const FILE_TYPE_COLORS: Record<string, string> = {
  pdf: "bg-red-100 text-red-700",
  dwg: "bg-blue-100 text-blue-700",
  xlsx: "bg-emerald-100 text-emerald-700",
  docx: "bg-blue-100 text-blue-700",
  jpg: "bg-purple-100 text-purple-700",
};

type DocumentsModuleProps = { isDark: boolean };

export function DocumentsModule({ isDark }: DocumentsModuleProps) {
  const [activeFolder, setActiveFolder] = useState<typeof FOLDERS[0] | null>(null);
  const [search, setSearch] = useState("");
  const [showUpload, setShowUpload] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const text = isDark ? "text-white" : "text-slate-800";
  const muted = "text-slate-500";
  const border = isDark ? "border-slate-700" : "border-slate-200";
  const card = `bg-white dark:bg-slate-800 border ${border} rounded-2xl`;

  return (
    <div className="p-5 space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className={text}>Document Vault</h1>
          <p className={`text-sm ${muted}`}>1,118 files · 5.1 GB used</p>
        </div>
        <button onClick={() => setShowUpload(true)} className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium">
          <Upload size={15} /> Upload
        </button>
      </div>

      {/* Expiry alerts */}
      {EXPIRING.some(e => e.daysLeft <= 30) && (
        <div className={`p-4 rounded-xl border ${isDark ? "bg-orange-950/20 border-orange-800" : "bg-orange-50 border-orange-200"}`}>
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle size={14} className="text-orange-500" />
            <span className="text-sm font-medium text-orange-700 dark:text-orange-300">Documents expiring soon</span>
          </div>
          {EXPIRING.filter(e => e.daysLeft <= 30).map(e => (
            <div key={e.name} className="flex items-center justify-between py-1">
              <span className="text-xs text-orange-700 dark:text-orange-400">{e.name}</span>
              <span className="text-xs font-medium text-red-600">{e.daysLeft} days left</span>
            </div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Folder tree */}
        <div className={`${card} p-4`}>
          <div className="flex items-center justify-between mb-3">
            <h3 className={`text-sm font-semibold ${text}`}>Folders</h3>
          </div>
          <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border mb-3 ${isDark ? "border-slate-700 bg-slate-900/50" : "border-slate-200 bg-slate-50"}`}>
            <Search size={13} className={muted} />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search..." className={`flex-1 text-xs bg-transparent outline-none ${isDark ? "text-white" : "text-slate-800"}`} />
          </div>
          <div className="space-y-1">
            {FOLDERS.filter(f => f.name.toLowerCase().includes(search.toLowerCase())).map(folder => (
              <button
                key={folder.id}
                onClick={() => setActiveFolder(folder)}
                className={`w-full flex items-center gap-3 p-2.5 rounded-lg text-left transition-colors ${
                  activeFolder?.id === folder.id
                    ? "bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800"
                    : `hover:${isDark ? "bg-slate-700/40" : "bg-slate-50"}`
                }`}
              >
                <Folder size={16} className={activeFolder?.id === folder.id ? "text-blue-500" : "text-yellow-500"} />
                <div className="flex-1 min-w-0">
                  <div className={`text-xs font-medium truncate ${text}`}>{folder.name}</div>
                  <div className={`text-xs ${muted}`}>{folder.count} files · {folder.size}</div>
                </div>
                <ChevronRight size={12} className={muted} />
              </button>
            ))}
          </div>
        </div>

        {/* File grid */}
        <div className="lg:col-span-2 space-y-3">
          {activeFolder ? (
            <div className={`${card} p-4`}>
              <div className="flex items-center gap-2 mb-4">
                <Folder size={16} className="text-yellow-500" />
                <h3 className={`text-sm font-semibold ${text}`}>{activeFolder.name}</h3>
                <span className={`text-xs ${muted}`}>· {activeFolder.count} files</span>
              </div>
              <div className="space-y-2">
                {FILES.slice(0, 4).map(file => (
                  <div key={file.id} className={`flex items-center gap-3 p-3 rounded-xl border ${border} hover:border-blue-300 dark:hover:border-blue-700 transition-colors group`}>
                    <div className="w-9 h-9 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center flex-shrink-0">
                      <File size={16} className="text-red-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className={`text-xs font-medium ${text} truncate`}>{file.name}</div>
                      <div className={`text-xs ${muted} mt-0.5`}>{file.size} · {file.date}</div>
                    </div>
                    {file.expiry !== "—" && (
                      <span className="text-xs px-1.5 py-0.5 rounded bg-orange-100 text-orange-700 whitespace-nowrap flex-shrink-0">
                        Exp: {file.expiry}
                      </span>
                    )}
                    <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className={`p-1.5 rounded-lg ${isDark ? "hover:bg-slate-700" : "hover:bg-slate-100"} ${muted}`}><Eye size={12} /></button>
                      <button className={`p-1.5 rounded-lg ${isDark ? "hover:bg-slate-700" : "hover:bg-slate-100"} ${muted}`}><Download size={12} /></button>
                      <button className={`p-1.5 rounded-lg ${isDark ? "hover:bg-slate-700" : "hover:bg-slate-100"} ${muted}`}><Share2 size={12} /></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <>
              <div className={`${card} p-4`}>
                <h3 className={`text-sm font-semibold mb-3 ${text}`}>Recent Files</h3>
                <div className="space-y-2">
                  {FILES.map(file => (
                    <div key={file.id} className={`flex items-center gap-3 p-3 rounded-xl border ${border} hover:border-blue-300 dark:hover:border-blue-700 transition-colors group cursor-pointer`}>
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${FILE_TYPE_COLORS[file.type] || "bg-slate-100 text-slate-600"}`}>
                        <File size={14} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className={`text-xs font-medium ${text} truncate`}>{file.name}</div>
                        <div className={`text-xs ${muted}`}>{file.size} · {file.category} · {file.date}</div>
                      </div>
                      {file.expiry !== "—" && (
                        <span className="text-xs px-1.5 py-0.5 rounded bg-orange-100 text-orange-700 flex-shrink-0">
                          {file.expiry}
                        </span>
                      )}
                      <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className={`p-1.5 rounded-lg ${isDark ? "hover:bg-slate-700" : "hover:bg-slate-100"} ${muted}`}><Eye size={12} /></button>
                        <button className={`p-1.5 rounded-lg ${isDark ? "hover:bg-slate-700" : "hover:bg-slate-100"} ${muted}`}><Download size={12} /></button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className={`${card} p-4`}>
                <h3 className={`text-sm font-semibold mb-3 ${text}`}>Expiry Tracker</h3>
                <div className="space-y-2">
                  {EXPIRING.map(e => (
                    <div key={e.name} className={`flex items-center justify-between p-3 rounded-xl ${isDark ? "bg-slate-700/40" : "bg-slate-50"}`}>
                      <div className="flex items-center gap-2.5">
                        <AlertCircle size={14} className={e.daysLeft <= 30 ? "text-red-500" : "text-orange-400"} />
                        <div>
                          <div className={`text-xs font-medium ${text}`}>{e.name}</div>
                          <div className={`text-xs ${muted}`}>Expires {e.expiry}</div>
                        </div>
                      </div>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${e.daysLeft <= 30 ? "bg-red-100 text-red-700" : "bg-orange-100 text-orange-700"}`}>
                        {e.daysLeft}d
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Upload modal */}
      {showUpload && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className={`w-full max-w-md rounded-2xl border shadow-2xl ${isDark ? "bg-slate-900 border-slate-700" : "bg-white border-slate-200"}`}>
            <div className={`flex items-center justify-between px-5 py-4 border-b ${border}`}>
              <h3 className={`font-semibold ${text}`}>Upload Documents</h3>
              <button onClick={() => setShowUpload(false)}><span className={muted}>✕</span></button>
            </div>
            <div className="p-5 space-y-4">
              <div
                onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={e => { e.preventDefault(); setDragOver(false); }}
                className={`border-2 border-dashed rounded-xl p-10 text-center transition-colors ${
                  dragOver
                    ? "border-blue-500 bg-blue-50 dark:bg-blue-950/20"
                    : isDark ? "border-slate-600" : "border-slate-300"
                }`}
              >
                <Upload size={32} className="mx-auto text-slate-400 mb-3" />
                <p className={`text-sm font-medium ${text}`}>Drop files here or click to upload</p>
                <p className={`text-xs ${muted} mt-1`}>PDF, DWG, XLSX, DOCX up to 100MB</p>
                <button className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700">
                  Browse Files
                </button>
              </div>
              <div>
                <label className={`block text-xs font-medium mb-1.5 ${isDark ? "text-slate-300" : "text-slate-700"}`}>Folder</label>
                <select className={`w-full px-3 py-2 rounded-xl border text-sm outline-none ${isDark ? "bg-slate-800 border-slate-700 text-white" : "bg-slate-50 border-slate-200 text-slate-800"}`}>
                  {FOLDERS.map(f => <option key={f.id}>{f.name}</option>)}
                </select>
              </div>
            </div>
            <div className={`flex justify-end gap-3 px-5 py-4 border-t ${border}`}>
              <button onClick={() => setShowUpload(false)} className={`px-4 py-2 rounded-xl border text-sm ${isDark ? "border-slate-700 text-slate-300" : "border-slate-200 text-slate-700"}`}>Cancel</button>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm">Upload</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

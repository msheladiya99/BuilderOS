import { useState } from "react";
import { useData } from "../../../context/DataContext";
import { todayLabel } from "../../../lib/helpers";
import { Folder, File, Upload, Search, Download, Share2, Eye, Trash2, AlertCircle, ChevronRight } from "lucide-react";

// EXPIRING is now computed dynamically

const FILE_TYPE_COLORS: Record<string, string> = {
  pdf: "bg-red-100 text-red-700",
  dwg: "bg-blue-100 text-blue-700",
  xlsx: "bg-emerald-100 text-emerald-700",
  docx: "bg-blue-100 text-blue-700",
  jpg: "bg-purple-100 text-purple-700",
};

type DocumentsModuleProps = { isDark: boolean };

export function DocumentsModule({ isDark }: DocumentsModuleProps) {
  const { documentFolders, documentFiles, persist, saving } = useData();
  const FOLDERS = documentFolders;
  const FILES = documentFiles;
  const [activeFolder, setActiveFolder] = useState<typeof FOLDERS[0] | null>(null);
  const [search, setSearch] = useState("");
  const [showUpload, setShowUpload] = useState(false);
  const [showAddFolder, setShowAddFolder] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [folderName, setFolderName] = useState("");
  const [uploadForm, setUploadForm] = useState({ folderId: 1, name: "" });

  const EXPIRING = FILES.filter(f => f.expiry && f.expiry !== "—").map(f => {
    const expDate = new Date(f.expiry);
    let daysLeft = 30;
    if (!isNaN(expDate.getTime())) {
      const diff = expDate.getTime() - new Date().getTime();
      daysLeft = Math.max(1, Math.ceil(diff / (1000 * 3600 * 24)));
    }
    return { name: f.name, expiry: f.expiry, daysLeft };
  }).sort((a, b) => a.daysLeft - b.daysLeft);

  const handleAddFolder = async () => {
    if (!folderName.trim()) return;
    await persist("documentFolders", {
      name: folderName,
      count: 0,
      size: "0 KB",
      updated: new Date().toLocaleDateString("en-GB")
    }, undefined, `Created folder ${folderName}`);
    setShowAddFolder(false);
    setFolderName("");
  };

  const handleUpload = async () => {
    if (!uploadForm.name) return;
    const type = uploadForm.name.split('.').pop()?.toLowerCase() || 'pdf';
    await persist("documentFiles", {
      folderId: Number(uploadForm.folderId),
      name: uploadForm.name,
      type: type,
      size: "1.2 MB",
      date: new Date().toLocaleDateString("en-GB"),
      expiry: "—",
      category: "General"
    }, undefined, `Uploaded document ${uploadForm.name}`);
    setShowUpload(false);
    setUploadForm({ folderId: FOLDERS[0]?.id || 1, name: "" });
  };

  const text = isDark ? "text-white" : "text-slate-800";
  const muted = "text-slate-500";
  const border = isDark ? "border-slate-700" : "border-slate-200";
  const card = `bg-white dark:bg-slate-800 border ${border} rounded-2xl`;

  return (
    <div className="p-5 space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className={text}>Document Vault</h1>
          <p className={`text-sm ${muted}`}>{FILES.length} files · {FOLDERS.length} folders</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowAddFolder(true)} className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border ${isDark ? "border-slate-700 text-slate-300 hover:bg-slate-800" : "border-slate-200 text-slate-600 hover:bg-slate-50"}`}>
            <Folder size={15} /> Add Folder
          </button>
          <button onClick={() => setShowUpload(true)} className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium">
            <Upload size={15} /> Upload
          </button>
        </div>
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
                  <div className={`text-xs ${muted}`}>{FILES.filter(f => f.folderId === folder.id).length} files</div>
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
                <span className={`text-xs ${muted}`}>· {FILES.filter(f => f.folderId === activeFolder.id).length} files</span>
              </div>
              <div className="space-y-2">
                {FILES.filter(f => f.folderId === activeFolder.id).map(file => (
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
                onDrop={e => { 
                  e.preventDefault(); 
                  setDragOver(false); 
                  if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                    setUploadForm({ ...uploadForm, name: e.dataTransfer.files[0].name });
                  }
                }}
                className={`relative border-2 border-dashed rounded-xl p-10 text-center transition-colors ${
                  dragOver
                    ? "border-blue-500 bg-blue-50 dark:bg-blue-950/20"
                    : isDark ? "border-slate-600" : "border-slate-300"
                }`}
              >
                <input 
                  type="file" 
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
                  onChange={e => {
                    if (e.target.files && e.target.files.length > 0) {
                      setUploadForm({ ...uploadForm, name: e.target.files[0].name });
                    }
                  }}
                />
                <Upload size={32} className="mx-auto text-slate-400 mb-3" />
                <p className={`text-sm font-medium ${text}`}>Drop files here or click to upload</p>
                <p className={`text-xs ${muted} mt-1`}>PDF, DWG, XLSX, DOCX up to 100MB</p>
                <button className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 pointer-events-none">
                  Browse Files
                </button>
              </div>
              <div>
                <label className={`block text-xs font-medium mb-1.5 ${isDark ? "text-slate-300" : "text-slate-700"}`}>Document Name</label>
                <input 
                  type="text"
                  value={uploadForm.name}
                  onChange={e => setUploadForm({ ...uploadForm, name: e.target.value })}
                  placeholder="e.g. Site Plan.pdf"
                  className={`w-full px-3 py-2.5 rounded-xl border text-sm outline-none mb-4 ${isDark ? "bg-slate-800 border-slate-700 text-white" : "bg-slate-50 border-slate-200 text-slate-800"}`}
                />
                <label className={`block text-xs font-medium mb-1.5 ${isDark ? "text-slate-300" : "text-slate-700"}`}>Folder</label>
                <select 
                  value={uploadForm.folderId}
                  onChange={e => setUploadForm({ ...uploadForm, folderId: Number(e.target.value) })}
                  className={`w-full px-3 py-2.5 rounded-xl border text-sm outline-none ${isDark ? "bg-slate-800 border-slate-700 text-white" : "bg-slate-50 border-slate-200 text-slate-800"}`}
                >
                  {FOLDERS.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                </select>
              </div>
            </div>
            <div className={`flex justify-end gap-3 px-5 py-4 border-t ${border}`}>
              <button onClick={() => setShowUpload(false)} className={`px-4 py-2 rounded-xl border text-sm ${isDark ? "border-slate-700 text-slate-300" : "border-slate-200 text-slate-700"}`}>Cancel</button>
              <button onClick={handleUpload} disabled={saving} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white rounded-xl text-sm font-medium">
                {saving ? "Uploading..." : "Upload"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Folder modal */}
      {showAddFolder && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className={`w-full max-w-sm rounded-2xl border shadow-2xl ${isDark ? "bg-slate-900 border-slate-700" : "bg-white border-slate-200"}`}>
            <div className={`flex items-center justify-between px-5 py-4 border-b ${border}`}>
              <h3 className={`font-semibold ${text}`}>Create Folder</h3>
              <button onClick={() => setShowAddFolder(false)}><span className={muted}>✕</span></button>
            </div>
            <div className="p-5">
              <label className={`block text-xs font-medium mb-1.5 ${isDark ? "text-slate-300" : "text-slate-700"}`}>Folder Name</label>
              <input 
                type="text"
                value={folderName}
                onChange={e => setFolderName(e.target.value)}
                placeholder="e.g. Legal Documents"
                autoFocus
                className={`w-full px-3 py-2.5 rounded-xl border text-sm outline-none ${isDark ? "bg-slate-800 border-slate-700 text-white" : "bg-slate-50 border-slate-200 text-slate-800"}`}
              />
            </div>
            <div className={`flex justify-end gap-3 px-5 py-4 border-t ${border}`}>
              <button onClick={() => setShowAddFolder(false)} className={`px-4 py-2 rounded-xl border text-sm ${isDark ? "border-slate-700 text-slate-300" : "border-slate-200 text-slate-700"}`}>Cancel</button>
              <button onClick={handleAddFolder} disabled={saving} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white rounded-xl text-sm font-medium">
                {saving ? "Saving..." : "Create"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

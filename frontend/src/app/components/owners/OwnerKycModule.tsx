import { useCallback, useEffect, useState } from "react";
import { apiV1, type OwnerRow } from "../../../lib/api-v1";
import {
  Search, Plus, X, Clock, AlertCircle, CheckCircle2,
  Phone, Mail, FileText, User,
} from "lucide-react";

type OwnerKycModuleProps = { isDark: boolean };

const KYC_BADGE: Record<string, { label: string; cls: string; icon: React.ElementType }> = {
  pending: { label: "Pending", cls: "bg-slate-100 text-slate-600", icon: Clock },
  submitted: { label: "Submitted", cls: "bg-amber-100 text-amber-700", icon: FileText },
  verified: { label: "Verified", cls: "bg-emerald-100 text-emerald-700", icon: CheckCircle2 },
  rejected: { label: "Rejected", cls: "bg-red-100 text-red-700", icon: AlertCircle },
};

const emptyForm = {
  name: "",
  mobile: "",
  email: "",
  aadhaarNo: "",
  panNo: "",
  address: "",
  city: "",
  state: "",
  pincode: "",
};

export function OwnerKycModule({ isDark }: OwnerKycModuleProps) {
  const [owners, setOwners] = useState<OwnerRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [kycFilter, setKycFilter] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [selected, setSelected] = useState<OwnerRow | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const text = isDark ? "text-white" : "text-slate-800";
  const muted = "text-slate-500";
  const border = isDark ? "border-slate-700" : "border-slate-200";
  const card = `bg-white dark:bg-slate-800 border ${border}`;

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params: Record<string, string> = {};
      if (search) params.search = search;
      if (kycFilter) params.kycStatus = kycFilter;
      const res = await apiV1.owners.list(params);
      setOwners(res.data);
    } catch (e) {
      setError((e as Error).message);
      setOwners([]);
    } finally {
      setLoading(false);
    }
  }, [search, kycFilter]);

  useEffect(() => {
    const t = setTimeout(load, 300);
    return () => clearTimeout(t);
  }, [load]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await apiV1.owners.create(form);
      setShowForm(false);
      setForm(emptyForm);
      await load();
    } catch (err) {
      alert((err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const handleKycUpdate = async (id: string, kycStatus: string) => {
    try {
      await apiV1.owners.updateKyc(id, kycStatus);
      if (selected?.id === id) {
        const updated = await apiV1.owners.get(id);
        setSelected(updated);
      }
      await load();
    } catch (err) {
      alert((err as Error).message);
    }
  };

  const openDetail = async (owner: OwnerRow) => {
    try {
      const full = await apiV1.owners.get(owner.id);
      setSelected(full);
    } catch {
      setSelected(owner);
    }
  };

  return (
    <div className="p-4 md:p-5 space-y-4 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className={`text-xl font-bold ${text}`}>Owner KYC</h1>
          <p className={`text-sm ${muted}`}>Register owners and verify identity documents</p>
        </div>
        <button
          type="button"
          onClick={() => setShowForm(true)}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700"
        >
          <Plus size={16} /> New Owner
        </button>
      </div>

      {error && (
        <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-sm">
          {error.includes("Tenant") || error.includes("401")
            ? "Sign in on a project subdomain (e.g. skyline-heights) to use Owner KYC with PostgreSQL API."
            : error}
        </div>
      )}

      <div className={`${card} rounded-2xl p-3 flex flex-col sm:flex-row gap-2`}>
        <div className="relative flex-1">
          <Search size={16} className={`absolute left-3 top-1/2 -translate-y-1/2 ${muted}`} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name, mobile, email…"
            className={`w-full pl-9 pr-3 py-2 rounded-xl border text-sm ${border} ${isDark ? "bg-slate-900" : "bg-slate-50"}`}
          />
        </div>
        <select
          value={kycFilter}
          onChange={(e) => setKycFilter(e.target.value)}
          className={`px-3 py-2 rounded-xl border text-sm ${border} ${isDark ? "bg-slate-900" : ""}`}
        >
          <option value="">All KYC status</option>
          <option value="pending">Pending</option>
          <option value="submitted">Submitted</option>
          <option value="verified">Verified</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      {loading ? (
        <div className={`${card} rounded-2xl p-8 text-center ${muted}`}>Loading owners…</div>
      ) : owners.length === 0 ? (
        <div className={`${card} rounded-2xl p-8 text-center`}>
          <User size={40} className={`mx-auto mb-2 ${muted}`} />
          <p className={muted}>No owners found. Add your first owner to start KYC.</p>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {owners.map((o) => {
            const badge = KYC_BADGE[o.kyc_status] ?? KYC_BADGE.pending;
            const Icon = badge.icon;
            return (
              <button
                key={o.id}
                type="button"
                onClick={() => openDetail(o)}
                className={`${card} rounded-2xl p-4 text-left hover:border-blue-300 transition-colors`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold text-sm">
                      {o.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                    </div>
                    <div>
                      <div className={`font-semibold ${text}`}>{o.name}</div>
                      <div className={`text-xs ${muted} flex items-center gap-1 mt-0.5`}>
                        <Phone size={11} /> {o.mobile}
                      </div>
                    </div>
                  </div>
                  <span className={`flex items-center gap-1 text-xs px-2 py-0.5 rounded-full ${badge.cls}`}>
                    <Icon size={12} /> {badge.label}
                  </span>
                </div>
                <div className={`mt-3 text-xs ${muted} flex flex-wrap gap-3`}>
                  {o.unit_no && <span>Unit {o.unit_no}</span>}
                  {o.project_name && <span>{o.project_name}</span>}
                  {o.email && (
                    <span className="flex items-center gap-1">
                      <Mail size={11} /> {o.email}
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 p-0 sm:p-4">
          <div className={`${card} w-full sm:max-w-lg rounded-t-2xl sm:rounded-2xl p-5 max-h-[90vh] overflow-y-auto`}>
            <div className="flex items-center justify-between mb-4">
              <h2 className={`font-bold ${text}`}>Register Owner</h2>
              <button type="button" onClick={() => setShowForm(false)} className={muted}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleCreate} className="space-y-3">
              {[
                { key: "name", label: "Full name *", type: "text" },
                { key: "mobile", label: "Mobile (10 digits) *", type: "tel" },
                { key: "email", label: "Email", type: "email" },
                { key: "aadhaarNo", label: "Aadhaar (12 digits)", type: "text" },
                { key: "panNo", label: "PAN", type: "text" },
                { key: "address", label: "Address", type: "text" },
                { key: "city", label: "City", type: "text" },
                { key: "state", label: "State", type: "text" },
                { key: "pincode", label: "Pincode", type: "text" },
              ].map((f) => (
                <label key={f.key} className="block">
                  <span className={`text-xs font-medium ${muted}`}>{f.label}</span>
                  <input
                    type={f.type}
                    required={f.key === "name" || f.key === "mobile"}
                    value={form[f.key as keyof typeof form]}
                    onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                    className={`mt-1 w-full px-3 py-2 rounded-xl border text-sm ${border}`}
                  />
                </label>
              ))}
              <button
                type="submit"
                disabled={saving}
                className="w-full py-2.5 bg-blue-600 text-white rounded-xl font-medium disabled:opacity-60"
              >
                {saving ? "Saving…" : "Create Owner"}
              </button>
            </form>
          </div>
        </div>
      )}

      {selected && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/50">
          <div className={`${card} w-full max-w-md h-full overflow-y-auto p-5`}>
            <div className="flex items-center justify-between mb-4">
              <h2 className={`font-bold ${text}`}>{selected.name}</h2>
              <button type="button" onClick={() => setSelected(null)} className={muted}>
                <X size={20} />
              </button>
            </div>

            <div className="space-y-3 text-sm">
              <DetailRow label="Mobile" value={selected.mobile} />
              <DetailRow label="Email" value={selected.email || "—"} />
              <DetailRow label="Aadhaar" value={selected.aadhaar_no || "—"} />
              <DetailRow label="PAN" value={selected.pan_no || "—"} />
              <DetailRow label="Unit" value={selected.unit_no || "—"} />
              <DetailRow label="KYC" value={selected.kyc_status} />
            </div>

            <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-700">
              <p className={`text-xs font-medium ${muted} mb-2`}>Update KYC status</p>
              <div className="flex flex-wrap gap-2">
                {(["submitted", "verified", "rejected"] as const).map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => handleKycUpdate(selected.id, s)}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium bg-blue-50 text-blue-700 hover:bg-blue-100"
                  >
                    Mark {s}
                  </button>
                ))}
              </div>
            </div>

            {selected.documents && selected.documents.length > 0 && (
              <div className="mt-4">
                <p className={`text-xs font-medium ${muted} mb-2`}>Documents</p>
                {selected.documents.map((d) => (
                  <div
                    key={d.id}
                    className={`flex items-center gap-2 p-2 rounded-lg border ${border} mb-2 text-xs`}
                  >
                    <FileText size={14} className="text-blue-500" />
                    <span className="capitalize">{d.doc_type}</span>
                    {d.verified && <CheckCircle2 size={12} className="text-emerald-500 ml-auto" />}
                  </div>
                ))}
              </div>
            )}

            <div className="mt-4">
              <p className={`text-xs ${muted} mb-2`}>Add document (demo URL)</p>
              <button
                type="button"
                onClick={async () => {
                  const url = prompt("Document URL (S3 in production):");
                  if (!url) return;
                  await apiV1.owners.addDocument(selected.id, {
                    docType: "aadhaar",
                    fileUrl: url,
                  });
                  openDetail(selected);
                }}
                className="text-sm text-blue-600 hover:underline"
              >
                + Upload document reference
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-2">
      <span className="text-slate-500">{label}</span>
      <span className="font-medium text-right capitalize">{value}</span>
    </div>
  );
}

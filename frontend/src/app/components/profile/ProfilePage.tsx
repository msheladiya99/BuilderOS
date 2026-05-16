import { useState, useEffect } from "react";
import { User, Mail, Shield, Loader2, Check } from "lucide-react";
import { useAuth } from "../../../context/AuthContext";

type ProfilePageProps = { isDark: boolean };

const ROLE_LABELS: Record<string, string> = {
  superadmin: "Super Admin",
  admin: "Administrator",
  sales: "Sales",
  accounts: "Accounts",
  site: "Site Manager",
};

export function ProfilePage({ isDark }: ProfilePageProps) {
  const { user, updateProfile } = useAuth();
  const [name, setName] = useState(user?.name ?? "");
  const [avatar, setAvatar] = useState(user?.avatar ?? "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const text = isDark ? "text-white" : "text-slate-800";
  const muted = "text-slate-500";
  const border = isDark ? "border-slate-700" : "border-slate-200";
  const card = `bg-white dark:bg-slate-800 border ${border} rounded-2xl`;

  useEffect(() => {
    if (user) {
      setName(user.name);
      setAvatar(user.avatar);
    }
  }, [user]);

  if (!user) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSaved(false);
    try {
      await updateProfile({
        name: name.trim(),
        avatar: avatar.trim().slice(0, 3).toUpperCase() || user.avatar,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save profile");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-5 space-y-5 max-w-2xl">
      <div>
        <h1 className={`text-xl font-bold ${text}`}>My Profile</h1>
        <p className={`text-sm ${muted}`}>Manage your account details</p>
      </div>

      <form onSubmit={handleSubmit} className={`${card} p-6 space-y-5`}>
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-blue-600 flex items-center justify-center text-white text-xl font-semibold">
            {avatar || user.avatar}
          </div>
          <div>
            <div className={`font-semibold ${text}`}>{name || user.name}</div>
            <div className={`text-sm ${muted}`}>{user.email}</div>
          </div>
        </div>

        <label className="block">
          <span className={`text-xs font-medium ${muted}`}>Display name</span>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className={`mt-1 w-full px-3 py-2 rounded-xl border text-sm ${border} ${isDark ? "bg-slate-900" : "bg-white"}`}
          />
        </label>

        <label className="block">
          <span className={`text-xs font-medium ${muted}`}>Avatar initials (2–3 letters)</span>
          <input
            value={avatar}
            onChange={(e) => setAvatar(e.target.value.toUpperCase().slice(0, 3))}
            maxLength={3}
            className={`mt-1 w-full px-3 py-2 rounded-xl border text-sm ${border} ${isDark ? "bg-slate-900" : "bg-white"}`}
          />
        </label>

        <div className={`flex items-center gap-3 p-3 rounded-xl border ${border}`}>
          <Mail size={16} className={muted} />
          <div>
            <div className={`text-xs ${muted}`}>Email</div>
            <div className={`text-sm ${text}`}>{user.email}</div>
          </div>
        </div>

        <div className={`flex items-center gap-3 p-3 rounded-xl border ${border}`}>
          <Shield size={16} className={muted} />
          <div>
            <div className={`text-xs ${muted}`}>Role</div>
            <div className={`text-sm ${text}`}>{ROLE_LABELS[user.role] ?? user.role}</div>
          </div>
        </div>

        {error && <p className="text-sm text-red-500">{error}</p>}

        <button
          type="submit"
          disabled={saving}
          className="w-full py-2.5 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {saving ? <Loader2 size={16} className="animate-spin" /> : saved ? <Check size={16} /> : <User size={16} />}
          {saving ? "Saving…" : saved ? "Saved" : "Save changes"}
        </button>
      </form>
    </div>
  );
}

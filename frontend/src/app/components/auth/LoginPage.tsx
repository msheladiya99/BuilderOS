import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { Building, Eye, EyeOff, ArrowRight, Shield, ChevronLeft, Loader, MapPin } from "lucide-react";
import { useAuth } from "../../../context/AuthContext";
import { api, getStoredUser } from "../../../lib/api";
import { useTheme } from "../../../context/ThemeContext";
import { getTenantSlug, isMainPortal } from "../../../lib/tenant";
import type { TenantResolveResponse } from "../../../lib/tenant-types";

type AuthScreen = "role" | "login" | "otp" | "forgot";

function LoginShell({
  isDark,
  children,
  subtitle,
}: {
  isDark: boolean;
  children: React.ReactNode;
  subtitle?: string;
}) {
  const bg = isDark ? "bg-slate-950" : "bg-gradient-to-br from-slate-50 to-blue-50/40";
  const card = isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200";

  return (
    <div className={`min-h-screen flex ${bg}`}>
      <div className="hidden lg:flex flex-col justify-between w-[420px] bg-slate-900 p-10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center">
            <Building size={20} className="text-white" />
          </div>
          <div>
            <div className="text-white font-bold text-lg">BuilderOS</div>
            <div className="text-slate-500 text-xs">{subtitle || "Enterprise ERP Platform"}</div>
          </div>
        </div>
        <div>
          <div className="text-blue-400 text-xs font-semibold uppercase tracking-widest mb-3">Trusted by builders</div>
          <h2 className="text-white text-3xl leading-tight">
            Manage your real estate empire, <span className="text-blue-400">end to end.</span>
          </h2>
        </div>
        <p className="text-slate-500 text-sm">© BuilderOS Platform</p>
      </div>
      <div className="flex-1 flex items-center justify-center p-6">
        <div className={`w-full max-w-md rounded-2xl border shadow-xl p-8 ${card}`}>{children}</div>
      </div>
    </div>
  );
}

function MainSuperAdminLogin() {
  const navigate = useNavigate();
  const { login, verifyOtp, forgotPassword, isAuthenticated } = useAuth();
  const { isDark } = useTheme();
  const [screen, setScreen] = useState<AuthScreen>("login");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [email, setEmail] = useState("superadmin@builderos.in");
  const [password, setPassword] = useState("password");

  useEffect(() => {
    if (isAuthenticated) {
      navigate(getStoredUser()?.role === "superadmin" ? "/superadmin" : "/dashboard", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleLogin = async () => {
    setLoading(true);
    setError("");
    try {
      await login(email, password, null);
      setScreen("otp");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const handleOTP = async () => {
    setLoading(true);
    setError("");
    try {
      await verifyOtp(email, otp.join(""), null);
      navigate("/superadmin");
    } catch (e) {
      setError(e instanceof Error ? e.message : "OTP verification failed");
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (val: string, idx: number) => {
    if (!/^\d?$/.test(val)) return;
    const next = [...otp];
    next[idx] = val;
    setOtp(next);
    if (val && idx < 5) document.getElementById(`otp-${idx + 1}`)?.focus();
  };

  const text = isDark ? "text-white" : "text-slate-800";

  return (
    <LoginShell isDark={isDark} subtitle="Platform Control Center">
      {error && (
        <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm">
          {error}
        </div>
      )}

      {screen === "login" && (
        <div className="space-y-5">
          <div className="flex items-center gap-3 lg:hidden">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 to-blue-600 flex items-center justify-center">
              <Shield size={20} className="text-white" />
            </div>
            <div>
              <h1 className={text}>Platform Login</h1>
              <p className="text-slate-500 text-sm">Super Admin only</p>
            </div>
          </div>
          <div className="hidden lg:block">
            <h1 className={text}>Platform Login</h1>
            <p className="text-slate-500 text-sm mt-1">Sign in as Super Admin to manage all projects</p>
          </div>
          <div className={`p-3 rounded-xl border text-xs ${isDark ? "bg-violet-950/30 border-violet-800 text-violet-300" : "bg-violet-50 border-violet-200 text-violet-800"}`}>
            Project teams sign in on their project subdomain (e.g. <strong>skyline-heights.localhost</strong>)
          </div>
          <div className="space-y-4">
            <div>
              <label className={`block text-sm mb-1.5 ${isDark ? "text-slate-300" : "text-slate-700"}`}>Email</label>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`w-full px-4 py-3 rounded-xl border text-sm outline-none focus:border-violet-500 ${isDark ? "bg-slate-800 border-slate-700 text-white" : "bg-slate-50 border-slate-200"}`}
                placeholder="superadmin@builderos.in"
              />
            </div>
            <div>
              <label className={`block text-sm mb-1.5 ${isDark ? "text-slate-300" : "text-slate-700"}`}>Password</label>
              <div className="relative">
                <input
                  type={showPass ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`w-full px-4 py-3 pr-12 rounded-xl border text-sm outline-none focus:border-violet-500 ${isDark ? "bg-slate-800 border-slate-700 text-white" : "bg-slate-50 border-slate-200"}`}
                />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={handleLogin}
            disabled={loading}
            className="w-full bg-violet-600 hover:bg-violet-700 disabled:opacity-70 text-white py-3 rounded-xl font-medium flex items-center justify-center gap-2"
          >
            {loading ? <Loader size={16} className="animate-spin" /> : null}
            {loading ? "Signing in..." : "Sign In as Super Admin"}
          </button>
          <button type="button" onClick={() => setScreen("forgot")} className="text-sm text-violet-500 hover:text-violet-600 w-full text-center">
            Forgot password?
          </button>
        </div>
      )}

      {screen === "otp" && (
        <div className="space-y-5">
          <div className="w-14 h-14 bg-violet-100 dark:bg-violet-900/30 rounded-2xl flex items-center justify-center">
            <Shield size={26} className="text-violet-600" />
          </div>
          <div>
            <h1 className={text}>Verify your identity</h1>
            <p className="text-slate-500 text-sm mt-1">OTP sent to {email}</p>
            <p className="text-xs text-violet-500 mt-2">Demo OTP: 123456</p>
          </div>
          <div className="flex gap-2 justify-between">
            {otp.map((digit, i) => (
              <input
                key={i}
                id={`otp-${i}`}
                maxLength={1}
                value={digit}
                onChange={(e) => handleOtpChange(e.target.value, i)}
                className={`w-12 h-12 text-center text-lg font-bold rounded-xl border outline-none focus:border-violet-500 ${isDark ? "bg-slate-800 border-slate-700 text-white" : "bg-slate-50 border-slate-200"}`}
              />
            ))}
          </div>
          <button type="button" onClick={handleOTP} disabled={loading || otp.some((d) => !d)} className="w-full bg-violet-600 hover:bg-violet-700 disabled:opacity-60 text-white py-3 rounded-xl font-medium">
            {loading ? "Verifying..." : "Verify & Sign In"}
          </button>
          <button type="button" onClick={() => setScreen("login")} className="w-full text-center text-sm text-slate-500">← Back</button>
        </div>
      )}

      {screen === "forgot" && (
        <div className="space-y-5">
          <button type="button" onClick={() => setScreen("login")} className="flex items-center gap-1 text-slate-500 text-sm"><ChevronLeft size={14} /> Back</button>
          <h1 className={text}>Reset password</h1>
          <input value={email} onChange={(e) => setEmail(e.target.value)} className={`w-full px-4 py-3 rounded-xl border text-sm ${isDark ? "bg-slate-800 border-slate-700 text-white" : "bg-slate-50"}`} />
          <button type="button" onClick={async () => { await forgotPassword(email); setScreen("login"); }} className="w-full bg-violet-600 text-white py-3 rounded-xl font-medium">Send Reset Link</button>
        </div>
      )}
    </LoginShell>
  );
}

function TenantProjectLogin({ subdomain }: { subdomain: string }) {
  const navigate = useNavigate();
  const { login, verifyOtp, isAuthenticated } = useAuth();
  const { isDark } = useTheme();
  const [tenant, setTenant] = useState<TenantResolveResponse | null>(null);
  const [tenantError, setTenantError] = useState("");
  const [loadingTenant, setLoadingTenant] = useState(true);
  const [screen, setScreen] = useState<AuthScreen>("role");
  const [selectedRole, setSelectedRole] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("password");

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const data = await api.resolveTenant(subdomain);
        if (cancelled) return;
        setTenant(data);
        if (data.roles.length) {
          setSelectedRole(data.roles[0].id);
          setEmail(data.roles[0].email);
        }
      } catch (e) {
        if (!cancelled) {
          setTenantError(
            e instanceof Error ? e.message : "This project portal does not exist or is inactive."
          );
        }
      } finally {
        if (!cancelled) setLoadingTenant(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [subdomain]);

  useEffect(() => {
    if (isAuthenticated) navigate("/dashboard", { replace: true });
  }, [isAuthenticated, navigate]);

  const handleLogin = async () => {
    setLoading(true);
    setError("");
    try {
      await login(email, password, subdomain);
      setScreen("otp");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const handleOTP = async () => {
    setLoading(true);
    setError("");
    try {
      await verifyOtp(email, otp.join(""), subdomain);
      navigate("/dashboard");
    } catch (e) {
      setError(e instanceof Error ? e.message : "OTP verification failed");
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (val: string, idx: number) => {
    if (!/^\d?$/.test(val)) return;
    const next = [...otp];
    next[idx] = val;
    setOtp(next);
    if (val && idx < 5) document.getElementById(`totp-${idx + 1}`)?.focus();
  };

  const text = isDark ? "text-white" : "text-slate-800";
  const project = tenant?.project;
  const roles = tenant?.roles || [];

  if (loadingTenant) {
    return (
      <LoginShell isDark={isDark}>
        <div className="flex justify-center py-12"><Loader className="animate-spin text-blue-600" size={32} /></div>
      </LoginShell>
    );
  }

  if (tenantError || !project) {
    return (
      <LoginShell isDark={isDark}>
        <div className="text-center space-y-4">
          <h1 className={text}>Portal not found</h1>
          <p className="text-slate-500 text-sm">{tenantError || `No project for subdomain "${subdomain}"`}</p>
          <p className="text-xs text-slate-400">Check the URL or contact your platform administrator.</p>
        </div>
      </LoginShell>
    );
  }

  return (
    <LoginShell isDark={isDark} subtitle={project.name}>
      {error && (
        <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-900/30 border border-red-200 text-red-600 text-sm">{error}</div>
      )}

      <div className="flex items-center gap-3 mb-4">
        <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold">{project.image}</div>
        <div>
          <h1 className={`text-lg font-semibold ${text}`}>{project.name}</h1>
          <div className="flex items-center gap-1 text-xs text-slate-500">
            <MapPin size={11} /> {project.location}
          </div>
          <p className="text-xs text-blue-500 mt-0.5">{subdomain}.builderos.in</p>
        </div>
      </div>

      {screen === "role" && (
        <div className="space-y-5">
          <div>
            <h2 className={`font-medium ${text}`}>Sign in as</h2>
            <p className="text-slate-500 text-sm">Select your role for {project.name}</p>
          </div>
          {roles.length === 0 ? (
            <p className="text-sm text-slate-500 text-center py-6">No users configured for this project yet.</p>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {roles.map((role) => (
                <button
                  key={role.id}
                  type="button"
                  onClick={() => { setSelectedRole(role.id); setEmail(role.email); }}
                  className={`p-4 rounded-xl border text-left transition-all ${
                    selectedRole === role.id
                      ? "border-blue-500 bg-blue-50 dark:bg-blue-950/30"
                      : isDark ? "border-slate-700 hover:border-slate-600" : "border-slate-200"
                  }`}
                >
                  <div className={`text-sm font-semibold ${text}`}>{role.label}</div>
                  <div className="text-xs text-slate-500 mt-0.5">{role.desc}</div>
                </button>
              ))}
            </div>
          )}
          <button
            type="button"
            disabled={!roles.length}
            onClick={() => setScreen("login")}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white py-3 rounded-xl font-medium flex items-center justify-center gap-2"
          >
            Continue as {roles.find((r) => r.id === selectedRole)?.label || "User"}
            <ArrowRight size={16} />
          </button>
        </div>
      )}

      {screen === "login" && (
        <div className="space-y-5">
          <button type="button" onClick={() => setScreen("role")} className="flex items-center gap-1 text-slate-500 text-sm"><ChevronLeft size={14} /> Back</button>
          <div>
            <h2 className={text}>Welcome back</h2>
            <p className="text-slate-500 text-sm">Sign in to {project.name}</p>
          </div>
          <input value={email} onChange={(e) => setEmail(e.target.value)} className={`w-full px-4 py-3 rounded-xl border text-sm ${isDark ? "bg-slate-800 border-slate-700 text-white" : "bg-slate-50"}`} placeholder="Email" />
          <div className="relative">
            <input type={showPass ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} className={`w-full px-4 py-3 pr-12 rounded-xl border text-sm ${isDark ? "bg-slate-800 border-slate-700 text-white" : "bg-slate-50"}`} />
            <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
              {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          <button type="button" onClick={handleLogin} disabled={loading} className="w-full bg-blue-600 text-white py-3 rounded-xl font-medium flex justify-center gap-2">
            {loading ? <Loader size={16} className="animate-spin" /> : null}
            Sign In
          </button>
        </div>
      )}

      {screen === "otp" && (
        <div className="space-y-5">
          <h2 className={text}>Verify OTP</h2>
          <p className="text-xs text-blue-500">Demo: 123456</p>
          <div className="flex gap-2">
            {otp.map((digit, i) => (
              <input key={i} id={`totp-${i}`} maxLength={1} value={digit} onChange={(e) => handleOtpChange(e.target.value, i)} className={`w-12 h-12 text-center rounded-xl border ${isDark ? "bg-slate-800 border-slate-700 text-white" : ""}`} />
            ))}
          </div>
          <button type="button" onClick={handleOTP} disabled={loading || otp.some((d) => !d)} className="w-full bg-blue-600 text-white py-3 rounded-xl font-medium">Verify & Sign In</button>
          <button type="button" onClick={() => setScreen("login")} className="text-sm text-slate-500 w-full text-center">← Back</button>
        </div>
      )}
    </LoginShell>
  );
}

export function LoginPage() {
  const tenantSlug = getTenantSlug();
  if (isMainPortal()) return <MainSuperAdminLogin />;
  return <TenantProjectLogin subdomain={tenantSlug!} />;
}

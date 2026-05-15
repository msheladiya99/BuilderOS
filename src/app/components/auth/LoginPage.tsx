import { useState } from "react";
import { Building, Eye, EyeOff, ArrowRight, Shield, ChevronLeft, Loader } from "lucide-react";

type AuthScreen = "role" | "login" | "otp" | "forgot";

const ROLES = [
  { id: "admin", label: "Administrator", desc: "Full system access", color: "blue" },
  { id: "sales", label: "Sales Manager", desc: "CRM & bookings", color: "emerald" },
  { id: "accounts", label: "Accounts", desc: "Finance & payments", color: "purple" },
  { id: "site", label: "Site Manager", desc: "Construction & labour", color: "orange" },
];

type LoginPageProps = {
  onLogin: () => void;
  isDark: boolean;
};

export function LoginPage({ onLogin, isDark }: LoginPageProps) {
  const [screen, setScreen] = useState<AuthScreen>("role");
  const [selectedRole, setSelectedRole] = useState("admin");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [email, setEmail] = useState("arjun@builderos.in");
  const [password, setPassword] = useState("password");

  const handleLogin = () => {
    setLoading(true);
    setTimeout(() => { setLoading(false); setScreen("otp"); }, 1200);
  };

  const handleOTP = () => {
    setLoading(true);
    setTimeout(() => { setLoading(false); onLogin(); }, 1000);
  };

  const handleOtpChange = (val: string, idx: number) => {
    if (!/^\d?$/.test(val)) return;
    const next = [...otp];
    next[idx] = val;
    setOtp(next);
    if (val && idx < 5) {
      const el = document.getElementById(`otp-${idx + 1}`);
      el?.focus();
    }
  };

  const bg = isDark ? "bg-slate-950" : "bg-gradient-to-br from-slate-50 to-blue-50/40";
  const card = isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200";

  return (
    <div className={`min-h-screen flex ${bg}`}>
      {/* Left panel */}
      <div className="hidden lg:flex flex-col justify-between w-[420px] bg-slate-900 p-10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center">
            <Building size={20} className="text-white" />
          </div>
          <div>
            <div className="text-white font-bold text-lg">BuilderOS</div>
            <div className="text-slate-500 text-xs">Enterprise ERP Platform</div>
          </div>
        </div>

        <div className="space-y-8">
          <div>
            <div className="text-blue-400 text-xs font-semibold uppercase tracking-widest mb-3">Trusted by builders</div>
            <h2 className="text-white text-3xl leading-tight">Manage your real estate empire, <span className="text-blue-400">end to end.</span></h2>
            <p className="text-slate-400 text-sm mt-4 leading-relaxed">
              From land acquisition to handover — projects, units, payments, construction, and customer management all in one platform.
            </p>
          </div>

          <div className="space-y-4">
            {[
              { num: "₹2,400 Cr", label: "Revenue Tracked" },
              { num: "15,000+", label: "Units Managed" },
              { num: "98.2%", label: "Collection Rate" },
            ].map(({ num, label }) => (
              <div key={label} className="flex items-center gap-4">
                <div className="text-white font-bold text-xl">{num}</div>
                <div className="text-slate-500 text-sm">{label}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3 p-4 bg-slate-800 rounded-xl">
          <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-medium">AK</div>
          <div>
            <div className="text-white text-sm">"BuilderOS transformed how we manage 8 projects simultaneously."</div>
            <div className="text-slate-500 text-xs mt-1">Arjun Kapoor, MD — Kapoor Developers</div>
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className={`w-full max-w-md rounded-2xl border shadow-xl p-8 ${card}`}>

          {/* Role Selection */}
          {screen === "role" && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-2 lg:hidden">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <Building size={16} className="text-white" />
                </div>
                <span className={`font-bold ${isDark ? "text-white" : "text-slate-800"}`}>BuilderOS</span>
              </div>
              <div>
                <h1 className={`${isDark ? "text-white" : "text-slate-800"}`}>Sign in as</h1>
                <p className="text-slate-500 text-sm mt-1">Select your role to continue</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {ROLES.map(role => (
                  <button
                    key={role.id}
                    onClick={() => setSelectedRole(role.id)}
                    className={`p-4 rounded-xl border text-left transition-all ${
                      selectedRole === role.id
                        ? "border-blue-500 bg-blue-50 dark:bg-blue-950/30"
                        : isDark ? "border-slate-700 hover:border-slate-600" : "border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <div className={`text-sm font-semibold ${isDark ? "text-white" : "text-slate-800"}`}>{role.label}</div>
                    <div className="text-xs text-slate-500 mt-0.5">{role.desc}</div>
                    {selectedRole === role.id && (
                      <div className="mt-2 w-4 h-4 bg-blue-600 rounded-full flex items-center justify-center">
                        <div className="w-2 h-2 bg-white rounded-full" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
              <button
                onClick={() => setScreen("login")}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-medium flex items-center justify-center gap-2 transition-colors"
              >
                Continue as {ROLES.find(r => r.id === selectedRole)?.label}
                <ArrowRight size={16} />
              </button>
            </div>
          )}

          {/* Login Form */}
          {screen === "login" && (
            <div className="space-y-5">
              <button onClick={() => setScreen("role")} className="flex items-center gap-1 text-slate-500 hover:text-slate-700 text-sm">
                <ChevronLeft size={14} /> Back
              </button>
              <div>
                <h1 className={isDark ? "text-white" : "text-slate-800"}>Welcome back</h1>
                <p className="text-slate-500 text-sm mt-1">Sign in to your BuilderOS account</p>
              </div>
              <div className="space-y-4">
                <div>
                  <label className={`block text-sm mb-1.5 ${isDark ? "text-slate-300" : "text-slate-700"}`}>Email</label>
                  <input
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className={`w-full px-4 py-3 rounded-xl border text-sm outline-none focus:border-blue-500 transition-colors ${
                      isDark ? "bg-slate-800 border-slate-700 text-white placeholder-slate-500" : "bg-slate-50 border-slate-200 text-slate-800 placeholder-slate-400"
                    }`}
                    placeholder="you@company.com"
                  />
                </div>
                <div>
                  <label className={`block text-sm mb-1.5 ${isDark ? "text-slate-300" : "text-slate-700"}`}>Password</label>
                  <div className="relative">
                    <input
                      type={showPass ? "text" : "password"}
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      className={`w-full px-4 py-3 pr-12 rounded-xl border text-sm outline-none focus:border-blue-500 transition-colors ${
                        isDark ? "bg-slate-800 border-slate-700 text-white" : "bg-slate-50 border-slate-200 text-slate-800"
                      }`}
                      placeholder="••••••••"
                    />
                    <button
                      onClick={() => setShowPass(!showPass)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="rounded" defaultChecked />
                  <span className="text-sm text-slate-500">Remember me</span>
                </label>
                <button onClick={() => setScreen("forgot")} className="text-sm text-blue-500 hover:text-blue-600">
                  Forgot password?
                </button>
              </div>
              <button
                onClick={handleLogin}
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-70 text-white py-3 rounded-xl font-medium flex items-center justify-center gap-2 transition-colors"
              >
                {loading ? <Loader size={16} className="animate-spin" /> : null}
                {loading ? "Signing in..." : "Sign In"}
              </button>
              <div className={`flex items-center gap-2 p-3 rounded-lg border ${isDark ? "bg-slate-800 border-slate-700 text-slate-400" : "bg-slate-50 border-slate-200 text-slate-600"}`}>
                <Shield size={14} className="text-blue-500 flex-shrink-0" />
                <span className="text-xs">Protected by 256-bit encryption & 2FA</span>
              </div>
            </div>
          )}

          {/* OTP Screen */}
          {screen === "otp" && (
            <div className="space-y-5">
              <div className="w-14 h-14 bg-blue-100 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center">
                <Shield size={26} className="text-blue-600" />
              </div>
              <div>
                <h1 className={isDark ? "text-white" : "text-slate-800"}>Verify your identity</h1>
                <p className="text-slate-500 text-sm mt-1">We sent a 6-digit OTP to <span className="font-medium text-slate-700 dark:text-slate-300">{email}</span></p>
              </div>
              <div className="flex gap-2 justify-between">
                {otp.map((digit, i) => (
                  <input
                    key={i}
                    id={`otp-${i}`}
                    maxLength={1}
                    value={digit}
                    onChange={e => handleOtpChange(e.target.value, i)}
                    className={`w-12 h-12 text-center text-lg font-bold rounded-xl border outline-none focus:border-blue-500 transition-colors ${
                      isDark ? "bg-slate-800 border-slate-700 text-white" : "bg-slate-50 border-slate-200 text-slate-800"
                    }`}
                  />
                ))}
              </div>
              <button
                onClick={handleOTP}
                disabled={loading || otp.some(d => !d)}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white py-3 rounded-xl font-medium flex items-center justify-center gap-2 transition-colors"
              >
                {loading ? <Loader size={16} className="animate-spin" /> : null}
                {loading ? "Verifying..." : "Verify & Sign In"}
              </button>
              <div className="text-center">
                <span className="text-slate-500 text-sm">Didn't receive code? </span>
                <button className="text-sm text-blue-500 hover:text-blue-600">Resend OTP</button>
              </div>
              <button onClick={() => setScreen("login")} className="w-full text-center text-sm text-slate-500 hover:text-slate-700">
                ← Back to login
              </button>
            </div>
          )}

          {/* Forgot Password */}
          {screen === "forgot" && (
            <div className="space-y-5">
              <button onClick={() => setScreen("login")} className="flex items-center gap-1 text-slate-500 hover:text-slate-700 text-sm">
                <ChevronLeft size={14} /> Back
              </button>
              <div>
                <h1 className={isDark ? "text-white" : "text-slate-800"}>Reset password</h1>
                <p className="text-slate-500 text-sm mt-1">Enter your email and we'll send you a reset link</p>
              </div>
              <div>
                <label className={`block text-sm mb-1.5 ${isDark ? "text-slate-300" : "text-slate-700"}`}>Email address</label>
                <input
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className={`w-full px-4 py-3 rounded-xl border text-sm outline-none focus:border-blue-500 transition-colors ${
                    isDark ? "bg-slate-800 border-slate-700 text-white" : "bg-slate-50 border-slate-200 text-slate-800"
                  }`}
                  placeholder="you@company.com"
                />
              </div>
              <button
                onClick={() => { setLoading(true); setTimeout(() => { setLoading(false); setScreen("login"); }, 1500); }}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-medium flex items-center justify-center gap-2"
              >
                {loading ? <Loader size={16} className="animate-spin" /> : null}
                {loading ? "Sending..." : "Send Reset Link"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

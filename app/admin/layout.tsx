"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Package, ShoppingBag, LogOut, Menu, X,
  BookOpen, Settings, Ticket, CheckCircle, Eye, EyeOff, Zap, Moon, Sun,
} from "lucide-react";

const navLinks = [
  { href: "/admin",               label: "لوحة التحكم",  icon: LayoutDashboard },
  { href: "/admin/products",      label: "المنتجات",     icon: Package },
  { href: "/admin/orders",        label: "الطلبيات",     icon: ShoppingBag },
  { href: "/admin/promo",         label: "أكواد الخصم",  icon: Ticket },
  { href: "/admin/success-page",  label: "صفحة الشكر",   icon: CheckCircle },
  { href: "/admin/integrations",  label: "ربط المنصات",  icon: Zap },
  { href: "/admin/settings",      label: "الإعدادات",    icon: Settings },
];

const navColors: Record<string, string> = {
  "/admin":               "from-violet-500 to-purple-600",
  "/admin/products":      "from-blue-500 to-cyan-500",
  "/admin/orders":        "from-amber-500 to-orange-500",
  "/admin/promo":         "from-pink-500 to-rose-500",
  "/admin/success-page":  "from-emerald-500 to-teal-500",
  "/admin/integrations":  "from-amber-500 to-orange-500",
  "/admin/settings":      "from-slate-500 to-gray-600",
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // استرجاع كلمة السر
  const [showRecovery, setShowRecovery] = useState(false);
  const [recoveryMethod, setRecoveryMethod] = useState<"key" | "telegram">("key");
  const [recoveryKey, setRecoveryKey] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [newPass, setNewPass] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [recoveryLoading, setRecoveryLoading] = useState(false);
  const [recoveryMsg, setRecoveryMsg] = useState<{ ok: boolean; text: string } | null>(null);

  useEffect(() => {
    if (sessionStorage.getItem("admin-auth") === "true") setAuthenticated(true);
    setIsDark(localStorage.getItem("admin-dark") === "true");
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // أغلق الـ sidebar عند تغيير الصفحة
  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  const toggleDark = () => {
    const next = !isDark;
    setIsDark(next);
    localStorage.setItem("admin-dark", String(next));
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (res.ok) {
        sessionStorage.setItem("admin-auth", "true");
        sessionStorage.setItem("admin-password", password);
        setAuthenticated(true);
      } else {
        setError("كلمة المرور خاطئة ❌");
      }
    } catch {
      setError("خطأ في الاتصال، تأكد أن الموقع شغّال");
    } finally {
      setLoginLoading(false);
    }
  };

  const handleSendOTP = async () => {
    setRecoveryLoading(true);
    setRecoveryMsg(null);
    try {
      const res = await fetch("/api/admin/recover", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ method: "telegram_send" }),
      });
      const data = await res.json();
      if (res.ok) { setOtpSent(true); setRecoveryMsg({ ok: true, text: "✅ تم إرسال الكود إلى تلغرام" }); }
      else setRecoveryMsg({ ok: false, text: data.error ?? "فشل الإرسال" });
    } catch { setRecoveryMsg({ ok: false, text: "خطأ في الاتصال" }); }
    finally { setRecoveryLoading(false); }
  };

  const handleRecovery = async (e: React.FormEvent) => {
    e.preventDefault();
    setRecoveryLoading(true);
    setRecoveryMsg(null);
    try {
      const body = recoveryMethod === "key"
        ? { method: "key", recoveryKey, newPassword: newPass }
        : { method: "telegram_verify", code: otpCode, newPassword: newPass };
      const res = await fetch("/api/admin/recover", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (res.ok) {
        setRecoveryMsg({ ok: true, text: "✅ تم تغيير كلمة السر — يمكنك الدخول الآن" });
        setShowRecovery(false);
        setRecoveryKey(""); setOtpCode(""); setNewPass(""); setOtpSent(false);
      } else {
        setRecoveryMsg({ ok: false, text: data.error ?? "حدث خطأ" });
      }
    } catch { setRecoveryMsg({ ok: false, text: "خطأ في الاتصال" }); }
    finally { setRecoveryLoading(false); }
  };

  /* ══════════════════════════════════════
     شاشة تسجيل الدخول
  ══════════════════════════════════════ */
  if (!authenticated) {
    return (
      <div
        className="min-h-screen flex items-center justify-center p-4 overflow-hidden relative"
        style={{ background: "linear-gradient(135deg, #0f0c29 0%, #1a1a4e 40%, #24243e 100%)" }}
      >
        {/* نجوم */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(20)].map((_, i) => (
            <div key={i} className="absolute rounded-full bg-white"
              style={{
                width: Math.random() * 3 + 1 + "px", height: Math.random() * 3 + 1 + "px",
                top: Math.random() * 100 + "%", left: Math.random() * 100 + "%",
                opacity: Math.random() * 0.7 + 0.2,
                animation: `pulse ${Math.random() * 3 + 2}s ease-in-out infinite`,
              }} />
          ))}
        </div>

        {/* أيقونات عائمة */}
        <div className="absolute inset-0 pointer-events-none select-none">
          <span className="absolute text-3xl opacity-20 animate-bounce" style={{ top: "10%", left: "8%", animationDelay: "0s", animationDuration: "3s" }}>🎨</span>
          <span className="absolute text-3xl opacity-20 animate-bounce" style={{ top: "20%", right: "6%", animationDelay: "0.5s", animationDuration: "4s" }}>📚</span>
          <span className="absolute text-4xl opacity-15 animate-bounce" style={{ bottom: "20%", left: "5%", animationDelay: "1s", animationDuration: "3.5s" }}>🧸</span>
          <span className="absolute text-3xl opacity-20 animate-bounce" style={{ bottom: "15%", right: "8%", animationDelay: "1.5s", animationDuration: "4.5s" }}>✏️</span>
          <span className="absolute text-2xl opacity-15 animate-bounce" style={{ top: "50%", left: "3%", animationDelay: "0.8s", animationDuration: "5s" }}>⭐</span>
          <span className="absolute text-2xl opacity-15 animate-bounce" style={{ top: "40%", right: "3%", animationDelay: "2s", animationDuration: "3s" }}>🌟</span>
        </div>

        {/* توهجات */}
        <div className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(124,58,237,0.15) 0%, transparent 70%)" }} />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(59,130,246,0.12) 0%, transparent 70%)" }} />

        {/* البطاقة */}
        <div className="relative w-full max-w-sm z-10"
          style={{
            background: "linear-gradient(145deg, rgba(255,255,255,0.07) 0%, rgba(255,255,255,0.03) 100%)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(255,255,255,0.12)",
            borderRadius: "28px",
            boxShadow: "0 32px 64px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.05), inset 0 1px 0 rgba(255,255,255,0.1)",
          }}>
          <div className="p-8">

            {/* لوغو */}
            <div className="text-center mb-8">
              <div className="relative inline-block mb-4">
                <div className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto"
                  style={{ background: "linear-gradient(135deg, #f59e0b, #f97316)", boxShadow: "0 8px 24px rgba(245,158,11,0.4), 0 4px 8px rgba(0,0,0,0.3)", transform: "rotate(-3deg)" }}>
                  <BookOpen className="w-10 h-10 text-white" style={{ transform: "rotate(3deg)" }} />
                </div>
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-400 rounded-full border-2 border-gray-900 flex items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                </div>
              </div>
              <h1 className="text-3xl font-black mb-1 tracking-tight"
                style={{ background: "linear-gradient(90deg, #f59e0b, #a78bfa, #60a5fa)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", filter: "drop-shadow(0 2px 8px rgba(167,139,250,0.4))" }}>
                kids world <span style={{ background: "linear-gradient(90deg, #34d399, #60a5fa)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>j</span>
              </h1>
              <p className="text-sm font-medium" style={{ color: "rgba(253,186,116,0.9)" }}>👦🏻 عالم الأطفال</p>
            </div>

            {/* فورم الدخول */}
            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <label className="block text-xs font-bold mb-2 tracking-wider uppercase" style={{ color: "rgba(196,181,253,0.8)" }}>
                  كلمة المرور
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    autoFocus
                    className="w-full px-4 py-3.5 pr-12 rounded-2xl text-white placeholder-gray-500 outline-none transition-all text-sm"
                    style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)", boxShadow: "inset 0 2px 8px rgba(0,0,0,0.3)" }}
                    onFocus={(e) => { e.target.style.border = "1px solid rgba(139,92,246,0.6)"; e.target.style.boxShadow = "inset 0 2px 8px rgba(0,0,0,0.3), 0 0 0 3px rgba(139,92,246,0.15)"; }}
                    onBlur={(e) => { e.target.style.border = "1px solid rgba(255,255,255,0.1)"; e.target.style.boxShadow = "inset 0 2px 8px rgba(0,0,0,0.3)"; }}
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors">
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {error && (
                  <div className="flex items-center gap-2 mt-2 px-3 py-2 rounded-xl"
                    style={{ background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.3)" }}>
                    <span className="text-red-400 text-xs">{error}</span>
                  </div>
                )}
              </div>
              <button type="submit" disabled={loginLoading}
                className="w-full py-3.5 rounded-2xl font-black text-white text-sm transition-all duration-200 disabled:opacity-50"
                style={{ background: "linear-gradient(135deg, #7c3aed, #4f46e5)", boxShadow: "0 8px 24px rgba(124,58,237,0.4), inset 0 1px 0 rgba(255,255,255,0.2)" }}>
                {loginLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    جاري التحقق...
                  </span>
                ) : "تسجيل الدخول"}
              </button>
            </form>

            {/* نسيت كلمة السر */}
            <div className="mt-3 text-center">
              <button type="button"
                onClick={() => { setShowRecovery(!showRecovery); setRecoveryMsg(null); }}
                className="text-xs transition-colors"
                style={{ color: showRecovery ? "rgba(167,139,250,0.9)" : "rgba(255,255,255,0.25)" }}>
                {showRecovery ? "← رجوع لتسجيل الدخول" : "نسيت كلمة السر؟"}
              </button>
            </div>

            {/* لوحة الاسترجاع */}
            {showRecovery && (
              <div className="mt-4 space-y-4" style={{ borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: "1rem" }}>
                <div className="flex rounded-2xl overflow-hidden" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
                  {(["key", "telegram"] as const).map((m) => (
                    <button key={m} type="button"
                      onClick={() => { setRecoveryMethod(m); setRecoveryMsg(null); setOtpSent(false); }}
                      className="flex-1 py-2.5 text-xs font-semibold transition-all"
                      style={recoveryMethod === m
                        ? { background: "linear-gradient(135deg,rgba(124,58,237,0.6),rgba(79,70,229,0.6))", color: "#fff" }
                        : { color: "rgba(255,255,255,0.35)" }}>
                      {m === "key" ? "🔑 مفتاح الاسترجاع" : "📱 كود تلغرام"}
                    </button>
                  ))}
                </div>

                {recoveryMsg && (
                  <div className="px-3 py-2.5 rounded-xl text-xs text-center font-medium"
                    style={{ background: recoveryMsg.ok ? "rgba(52,211,153,0.12)" : "rgba(239,68,68,0.12)", border: `1px solid ${recoveryMsg.ok ? "rgba(52,211,153,0.3)" : "rgba(239,68,68,0.3)"}`, color: recoveryMsg.ok ? "#34d399" : "#f87171" }}>
                    {recoveryMsg.text}
                  </div>
                )}

                {recoveryMethod === "key" && (
                  <form onSubmit={handleRecovery} className="space-y-3">
                    <input type="text" value={recoveryKey} onChange={(e) => setRecoveryKey(e.target.value)}
                      placeholder="مفتاح الاسترجاع" dir="ltr" autoComplete="off"
                      className="w-full px-4 py-3 rounded-2xl text-white placeholder-gray-600 outline-none text-sm"
                      style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)" }} />
                    <input type="password" value={newPass} onChange={(e) => setNewPass(e.target.value)}
                      placeholder="كلمة السر الجديدة"
                      className="w-full px-4 py-3 rounded-2xl text-white placeholder-gray-600 outline-none text-sm"
                      style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)" }} />
                    <button type="submit" disabled={recoveryLoading || !recoveryKey || !newPass}
                      className="w-full py-3 rounded-2xl font-bold text-white text-sm disabled:opacity-40"
                      style={{ background: "linear-gradient(135deg,#7c3aed,#4f46e5)" }}>
                      {recoveryLoading ? "جاري التغيير..." : "تغيير كلمة السر"}
                    </button>
                  </form>
                )}

                {recoveryMethod === "telegram" && (
                  <div className="space-y-3">
                    {!otpSent ? (
                      <button type="button" onClick={handleSendOTP} disabled={recoveryLoading}
                        className="w-full py-3 rounded-2xl font-bold text-white text-sm disabled:opacity-40"
                        style={{ background: "linear-gradient(135deg,#0088cc,#005f99)" }}>
                        {recoveryLoading ? "جاري الإرسال..." : "📨 إرسال كود إلى تلغرام"}
                      </button>
                    ) : (
                      <form onSubmit={handleRecovery} className="space-y-3">
                        <p className="text-xs text-center" style={{ color: "rgba(255,255,255,0.4)" }}>
                          تحقق من تلغرام وأدخل الكود المكون من 6 أرقام
                        </p>
                        <input type="text" value={otpCode}
                          onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                          placeholder="_ _ _ _ _ _" dir="ltr" maxLength={6} inputMode="numeric"
                          className="w-full px-4 py-3 rounded-2xl text-white placeholder-gray-600 outline-none text-sm text-center tracking-[0.5em] font-mono"
                          style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)", fontSize: "1.1rem" }} />
                        <input type="password" value={newPass} onChange={(e) => setNewPass(e.target.value)}
                          placeholder="كلمة السر الجديدة"
                          className="w-full px-4 py-3 rounded-2xl text-white placeholder-gray-600 outline-none text-sm"
                          style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)" }} />
                        <button type="submit" disabled={recoveryLoading || otpCode.length < 6 || !newPass}
                          className="w-full py-3 rounded-2xl font-bold text-white text-sm disabled:opacity-40"
                          style={{ background: "linear-gradient(135deg,#7c3aed,#4f46e5)" }}>
                          {recoveryLoading ? "جاري التحقق..." : "تأكيد وتغيير كلمة السر"}
                        </button>
                        <button type="button" onClick={() => { setOtpSent(false); setOtpCode(""); setRecoveryMsg(null); }}
                          className="w-full text-xs" style={{ color: "rgba(255,255,255,0.25)" }}>
                          إعادة إرسال الكود
                        </button>
                      </form>
                    )}
                  </div>
                )}
              </div>
            )}

            <p className="text-center text-xs mt-6" style={{ color: "rgba(255,255,255,0.2)" }}>
              عالم الأطفال © {new Date().getFullYear()}
            </p>
          </div>
        </div>
      </div>
    );
  }

  /* ══════════════════════════════════════
     الواجهة الرئيسية بعد الدخول
  ══════════════════════════════════════ */
  const activeLink = navLinks.find(
    (l) => l.href === pathname || (l.href !== "/admin" && pathname.startsWith(l.href))
  );
  const activeLabel   = activeLink?.label ?? "لوحة التحكم";
  const activeGradient = activeLink
    ? (navColors[activeLink.href] ?? "from-violet-500 to-purple-600")
    : "from-violet-500 to-purple-600";

  const bgMain   = isDark ? "#0d0f18" : "#f1f3f9";
  const bgHeader = isDark ? "rgba(13,15,24,0.97)" : "rgba(255,255,255,0.97)";
  const borderC  = isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.07)";
  const textC    = isDark ? "#f1f5f9" : "#1f2937";

  return (
    <div className="min-h-screen flex" dir="rtl" style={{ background: "#0f1117" }}>

      {/* ══ Sidebar ══ */}
      <aside
        className={`fixed inset-y-0 right-0 w-64 z-40 flex flex-col transition-transform duration-300 ease-in-out ${
          !isMobile || sidebarOpen ? "translate-x-0" : "translate-x-full"
        }`}
        style={{
          background: "linear-gradient(180deg, #13151f 0%, #0d0f18 100%)",
          borderLeft: "1px solid rgba(255,255,255,0.06)",
          boxShadow: sidebarOpen ? "-8px 0 32px rgba(0,0,0,0.5)" : "none",
        }}
      >
        {/* لوغو */}
        <div className="p-5 mb-2">
          <div className="flex items-center gap-3 px-3 py-3 rounded-2xl"
            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
            <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: "linear-gradient(135deg, #f59e0b, #f97316)", boxShadow: "0 4px 12px rgba(245,158,11,0.35)" }}>
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <div className="min-w-0">
              <p className="font-black text-sm leading-none"
                style={{ background: "linear-gradient(90deg, #f59e0b, #a78bfa)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                kids world j
              </p>
              <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.3)" }}>لوحة التحكم</p>
            </div>
            <div className="mr-auto flex-shrink-0">
              <div className="w-2 h-2 rounded-full bg-emerald-400" style={{ boxShadow: "0 0 6px #34d399" }} />
            </div>
          </div>
        </div>

        {/* روابط التنقل */}
        <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
          <p className="text-xs font-bold px-3 mb-3 tracking-widest uppercase" style={{ color: "rgba(255,255,255,0.2)" }}>
            القائمة
          </p>
          {navLinks.map((link) => {
            const isActive = link.href === "/admin"
              ? pathname === "/admin"
              : pathname.startsWith(link.href);
            const gradient = navColors[link.href] ?? "from-violet-500 to-purple-600";
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setSidebarOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-2xl text-sm font-semibold transition-all duration-200"
                style={isActive ? {
                  background: "rgba(255,255,255,0.08)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  boxShadow: "0 4px 16px rgba(0,0,0,0.2)",
                  color: "#fff",
                } : {
                  color: "rgba(255,255,255,0.4)",
                  border: "1px solid transparent",
                }}
              >
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 bg-gradient-to-br ${gradient}`}
                  style={{ opacity: isActive ? 1 : 0.5, boxShadow: isActive ? "0 4px 12px rgba(0,0,0,0.3)" : "none" }}
                >
                  <link.icon className="w-4 h-4 text-white" />
                </div>
                <span>{link.label}</span>
                {isActive && (
                  <div className="mr-auto w-1.5 h-1.5 rounded-full bg-white" style={{ boxShadow: "0 0 6px #fff" }} />
                )}
              </Link>
            );
          })}
        </nav>

        {/* تسجيل الخروج */}
        <div className="p-4">
          <button
            onClick={() => { sessionStorage.clear(); setAuthenticated(false); }}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-2xl text-sm font-semibold transition-all"
            style={{ color: "rgba(255,255,255,0.3)", border: "1px solid transparent" }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(239,68,68,0.1)"; e.currentTarget.style.color = "#f87171"; e.currentTarget.style.border = "1px solid rgba(239,68,68,0.2)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "rgba(255,255,255,0.3)"; e.currentTarget.style.border = "1px solid transparent"; }}
          >
            <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: "rgba(239,68,68,0.15)" }}>
              <LogOut className="w-4 h-4 text-red-400" />
            </div>
            تسجيل الخروج
          </button>
        </div>
      </aside>

      {/* طبقة التعتيم خلف السايدبار على الهاتف */}
      {sidebarOpen && isMobile && (
        <div
          className="fixed inset-0 z-30"
          style={{ background: "rgba(0,0,0,0.65)", backdropFilter: "blur(4px)" }}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ══ المحتوى الرئيسي ══ */}
      <div
        className="flex-1 flex flex-col min-h-screen transition-colors duration-300"
        style={{ background: bgMain, marginRight: isMobile ? 0 : "256px" }}
      >
        {/* ══ الهيدر ══
            المبدأ: الحاوية الأب dir="rtl"
            → flex يسير من اليمين لليسار
            → أول عنصر في الـ DOM يظهر على اليمين تلقائياً
            → زر الهامبرغر أول عنصر = يمين الشاشة دائماً ✓
        */}
        <header
          className="sticky top-0 z-20 flex items-center gap-3 px-4"
          style={{
            background: bgHeader,
            backdropFilter: "blur(16px)",
            borderBottom: `1px solid ${borderC}`,
            boxShadow: isDark ? "0 1px 16px rgba(0,0,0,0.5)" : "0 1px 12px rgba(0,0,0,0.07)",
            height: "60px",
          }}
        >
          {/* زر الهامبرغر — أول عنصر في RTL = يظهر على اليمين */}
          {isMobile && (
            <button
              onClick={() => setSidebarOpen((v) => !v)}
              aria-label="القائمة"
              className="flex-shrink-0 w-11 h-11 flex items-center justify-center rounded-xl transition-all duration-200 active:scale-95"
              style={{
                background: isDark ? "rgba(255,255,255,0.12)" : "#f3f4f6",
                border: `1.5px solid ${isDark ? "rgba(255,255,255,0.18)" : "#e5e7eb"}`,
              }}
            >
              {sidebarOpen
                ? <X    className="w-5 h-5" style={{ color: isDark ? "#e2e8f0" : "#111827" }} />
                : <Menu className="w-5 h-5" style={{ color: isDark ? "#e2e8f0" : "#111827" }} />
              }
            </button>
          )}

          {/* عنوان الصفحة الحالية */}
          <div className="flex-1 min-w-0 flex items-center gap-2">
            {activeLink && (
              <div className={`w-7 h-7 rounded-lg flex-shrink-0 flex items-center justify-center bg-gradient-to-br ${activeGradient}`}>
                <activeLink.icon className="w-3.5 h-3.5 text-white" />
              </div>
            )}
            <h1 className="font-black text-base truncate" style={{ color: textC }}>
              {activeLabel}
            </h1>
          </div>

          {/* أزرار الجانب الآخر (يسار في RTL) */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={toggleDark}
              title={isDark ? "الوضع النهاري" : "الوضع الليلي"}
              className="w-9 h-9 flex items-center justify-center rounded-xl transition-all duration-200"
              style={{
                background: isDark ? "rgba(251,191,36,0.15)" : "rgba(0,0,0,0.04)",
                border: isDark ? "1px solid rgba(251,191,36,0.25)" : "1px solid rgba(0,0,0,0.06)",
              }}
            >
              {isDark
                ? <Sun  className="w-4 h-4 text-yellow-400" />
                : <Moon className="w-4 h-4 text-gray-500" />}
            </button>

            <Link href="/"
              className="hidden lg:flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl transition-all"
              style={{ color: isDark ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.5)", background: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)" }}
              onMouseEnter={(e) => { e.currentTarget.style.background = isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.08)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)"; }}
            >
              عرض الموقع <span style={{ fontSize: "10px" }}>←</span>
            </Link>
          </div>
        </header>

        {/* محتوى الصفحة */}
        <div className="p-4 md:p-6 overflow-x-hidden w-full min-w-0 max-w-full">
          {children}
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  LogOut,
  Menu,
  X,
  BookOpen,
  Settings,
  Ticket,
  CheckCircle,
  Eye,
  EyeOff,
} from "lucide-react";

const navLinks = [
  { href: "/admin", label: "لوحة التحكم", icon: LayoutDashboard },
  { href: "/admin/products", label: "المنتجات", icon: Package },
  { href: "/admin/orders", label: "الطلبات", icon: ShoppingBag },
  { href: "/admin/promo", label: "أكواد الخصم", icon: Ticket },
  { href: "/admin/success-page", label: "صفحة الشكر", icon: CheckCircle },
  { href: "/admin/settings", label: "الإعدادات", icon: Settings },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const stored = sessionStorage.getItem("admin-auth");
    if (stored === "true") setAuthenticated(true);
  }, []);

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

  if (!authenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 overflow-hidden relative"
        style={{ background: "linear-gradient(135deg, #0f0c29 0%, #1a1a4e 40%, #24243e 100%)" }}>

        {/* نجوم خلفية */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(20)].map((_, i) => (
            <div key={i} className="absolute rounded-full bg-white"
              style={{
                width: Math.random() * 3 + 1 + "px",
                height: Math.random() * 3 + 1 + "px",
                top: Math.random() * 100 + "%",
                left: Math.random() * 100 + "%",
                opacity: Math.random() * 0.7 + 0.2,
                animation: `pulse ${Math.random() * 3 + 2}s ease-in-out infinite`,
              }}
            />
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

        {/* توهجات ملونة */}
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

          {/* شريط علوي ملون */}
          <div className="h-1.5 w-full rounded-t-3xl"
            style={{ background: "linear-gradient(90deg, #f59e0b, #8b5cf6, #3b82f6, #10b981)" }} />

          <div className="p-8">
            {/* اللوغو */}
            <div className="text-center mb-8">
              <div className="relative inline-block mb-4">
                <div className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto"
                  style={{
                    background: "linear-gradient(135deg, #f59e0b, #f97316)",
                    boxShadow: "0 8px 24px rgba(245,158,11,0.4), 0 4px 8px rgba(0,0,0,0.3)",
                    transform: "rotate(-3deg)",
                  }}>
                  <BookOpen className="w-10 h-10 text-white" style={{ transform: "rotate(3deg)" }} />
                </div>
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-400 rounded-full border-2 border-gray-900 flex items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                </div>
              </div>
              <h1 className="text-2xl font-black text-white mb-1"
                style={{ textShadow: "0 2px 8px rgba(0,0,0,0.5)" }}>
                لوحة التحكم
              </h1>
              <p className="text-sm font-medium"
                style={{ color: "rgba(253,186,116,0.9)" }}>
                🌟 عالم الأطفال
              </p>
            </div>

            {/* الفورم */}
            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <label className="block text-xs font-bold mb-2 tracking-wider uppercase"
                  style={{ color: "rgba(196,181,253,0.8)" }}>
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
                    style={{
                      background: "rgba(255,255,255,0.07)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      boxShadow: "inset 0 2px 8px rgba(0,0,0,0.3)",
                    }}
                    onFocus={(e) => {
                      e.target.style.border = "1px solid rgba(139,92,246,0.6)";
                      e.target.style.boxShadow = "inset 0 2px 8px rgba(0,0,0,0.3), 0 0 0 3px rgba(139,92,246,0.15)";
                    }}
                    onBlur={(e) => {
                      e.target.style.border = "1px solid rgba(255,255,255,0.1)";
                      e.target.style.boxShadow = "inset 0 2px 8px rgba(0,0,0,0.3)";
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                  >
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

              <button
                type="submit"
                disabled={loginLoading}
                className="w-full py-3.5 rounded-2xl font-black text-white text-sm transition-all duration-200 disabled:opacity-50"
                style={{
                  background: "linear-gradient(135deg, #7c3aed, #4f46e5)",
                  boxShadow: "0 8px 24px rgba(124,58,237,0.4), 0 4px 8px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.2)",
                  transform: loginLoading ? "scale(0.98)" : "scale(1)",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.transform = "scale(1.02) translateY(-1px)"; e.currentTarget.style.boxShadow = "0 12px 32px rgba(124,58,237,0.5), 0 4px 8px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.2)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = "scale(1)"; e.currentTarget.style.boxShadow = "0 8px 24px rgba(124,58,237,0.4), 0 4px 8px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.2)"; }}
                onMouseDown={(e) => { e.currentTarget.style.transform = "scale(0.98) translateY(1px)"; }}
                onMouseUp={(e) => { e.currentTarget.style.transform = "scale(1.02) translateY(-1px)"; }}
              >
                {loginLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                    </svg>
                    جاري التحقق...
                  </span>
                ) : "🚀 دخول"}
              </button>
            </form>

            <p className="text-center text-xs mt-6" style={{ color: "rgba(255,255,255,0.2)" }}>
              عالم الأطفال © {new Date().getFullYear()}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex" dir="rtl">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 right-0 w-64 bg-gray-900 text-white z-40 transform transition-transform duration-300 ${
          sidebarOpen ? "translate-x-0" : "translate-x-full md:translate-x-0"
        }`}
      >
        <div className="p-4 border-b border-gray-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary-300 rounded-xl flex items-center justify-center">
              <BookOpen className="w-4 h-4 text-gray-900" />
            </div>
            <div>
              <p className="font-bold text-sm">عالم الأطفال</p>
              <p className="text-gray-400 text-xs">لوحة التحكم</p>
            </div>
          </div>
        </div>

        <nav className="p-4 space-y-1">
          {navLinks.map((link) => {
            const isActive =
              link.href === "/admin"
                ? pathname === "/admin"
                : pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors text-sm font-medium ${
                  isActive
                    ? "bg-primary-300 text-gray-900"
                    : "text-gray-400 hover:bg-gray-800 hover:text-white"
                }`}
              >
                <link.icon className="w-4 h-4" />
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="absolute bottom-4 left-4 right-4">
          <button
            onClick={() => {
              sessionStorage.clear();
              setAuthenticated(false);
            }}
            className="flex items-center gap-2 text-gray-500 hover:text-red-400 transition-colors text-sm w-full px-3 py-2"
          >
            <LogOut className="w-4 h-4" />
            تسجيل الخروج
          </button>
        </div>
      </aside>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main content */}
      <div className="flex-1 md:mr-64">
        {/* Top bar */}
        <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3 sticky top-0 z-20">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="md:hidden p-1.5 hover:bg-gray-100 rounded-lg"
          >
            {sidebarOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </button>
          <h1 className="font-bold text-gray-800">
            {navLinks.find(
              (l) =>
                l.href === pathname ||
                (l.href !== "/admin" && pathname.startsWith(l.href))
            )?.label ?? "لوحة التحكم"}
          </h1>
          <Link
            href="/"
            className="mr-auto text-sm text-gray-400 hover:text-gray-600"
          >
            عرض الموقع ←
          </Link>
        </header>

        <div className="p-4 md:p-6">{children}</div>
      </div>
    </div>
  );
}

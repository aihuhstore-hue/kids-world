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
} from "lucide-react";

const navLinks = [
  { href: "/admin", label: "لوحة التحكم", icon: LayoutDashboard },
  { href: "/admin/products", label: "المنتجات", icon: Package },
  { href: "/admin/orders", label: "الطلبات", icon: ShoppingBag },
  { href: "/admin/promo", label: "أكواد الخصم", icon: Ticket },
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
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-8 w-full max-w-sm shadow-2xl">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-primary-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <BookOpen className="w-8 h-8 text-primary-500" />
            </div>
            <h1 className="text-2xl font-black">لوحة الأدمن</h1>
            <p className="text-gray-500 text-sm mt-1">عالم الأطفال</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                كلمة المرور
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="أدخل كلمة المرور"
                className="input-field"
                autoFocus
              />
              {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
            </div>
            <button
              type="submit"
              disabled={loginLoading}
              className="w-full btn-primary disabled:opacity-60"
            >
              {loginLoading ? "جاري التحقق..." : "دخول"}
            </button>
          </form>
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

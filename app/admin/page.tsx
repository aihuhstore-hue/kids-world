"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ShoppingBag, Package, TrendingUp, Bell, Plus, Eye, ArrowLeft, Sparkles } from "lucide-react";
import { formatPrice } from "@/lib/utils";

interface Stats {
  totalOrders: number;
  newOrders: number;
  totalProducts: number;
  revenue: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    const password = sessionStorage.getItem("admin-password") ?? "";
    fetch("/api/admin", { headers: { "x-admin-password": password } })
      .then((r) => r.json())
      .then(setStats)
      .catch(console.error);
  }, []);

  const cards = [
    {
      label: "إجمالي الطلبات",
      value: stats?.totalOrders ?? "—",
      icon: ShoppingBag,
      gradient: "from-violet-500 to-purple-600",
      glow: "rgba(124,58,237,0.3)",
      bg: "rgba(124,58,237,0.08)",
    },
    {
      label: "طلبات جديدة",
      value: stats?.newOrders ?? "—",
      icon: Bell,
      gradient: "from-rose-500 to-pink-600",
      glow: "rgba(244,63,94,0.3)",
      bg: "rgba(244,63,94,0.08)",
    },
    {
      label: "المنتجات النشطة",
      value: stats?.totalProducts ?? "—",
      icon: Package,
      gradient: "from-blue-500 to-cyan-500",
      glow: "rgba(59,130,246,0.3)",
      bg: "rgba(59,130,246,0.08)",
    },
    {
      label: "الإيرادات",
      value: stats ? formatPrice(stats.revenue) : "—",
      icon: TrendingUp,
      gradient: "from-emerald-500 to-teal-500",
      glow: "rgba(16,185,129,0.3)",
      bg: "rgba(16,185,129,0.08)",
    },
  ];

  const quickLinks = [
    { label: "إضافة منتج جديد", href: "/admin/products/new", icon: Plus, gradient: "from-blue-500 to-cyan-500" },
    { label: "الطلبات الجديدة", href: "/admin/orders?status=NEW", icon: Bell, gradient: "from-rose-500 to-pink-600" },
    { label: "عرض الموقع", href: "/", icon: Eye, gradient: "from-emerald-500 to-teal-500" },
  ];

  const statuses = [
    { label: "جديد", desc: "ينتظر التأكيد", color: "#818cf8", bg: "rgba(129,140,248,0.12)", border: "rgba(129,140,248,0.25)" },
    { label: "قيد التحضير", desc: "يتم تجهيز الطلب", color: "#fbbf24", bg: "rgba(251,191,36,0.12)", border: "rgba(251,191,36,0.25)" },
    { label: "تم الشحن", desc: "في طريقه للعميل", color: "#a78bfa", bg: "rgba(167,139,250,0.12)", border: "rgba(167,139,250,0.25)" },
    { label: "مُسلَّم", desc: "تم التسليم بنجاح", color: "#34d399", bg: "rgba(52,211,153,0.12)", border: "rgba(52,211,153,0.25)" },
  ];

  return (
    <div className="space-y-6">

      {/* ترحيب */}
      <div className="rounded-3xl p-6 relative overflow-hidden"
        style={{
          background: "linear-gradient(135deg, #1a1a3e 0%, #16213e 50%, #0f3460 100%)",
          boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
        }}>
        <div className="absolute top-0 right-0 w-48 h-48 rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(124,58,237,0.2) 0%, transparent 70%)", transform: "translate(30%, -30%)" }} />
        <div className="absolute bottom-0 left-0 w-32 h-32 rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(59,130,246,0.15) 0%, transparent 70%)", transform: "translate(-20%, 30%)" }} />
        <div className="relative flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, #f59e0b, #f97316)", boxShadow: "0 4px 16px rgba(245,158,11,0.4)" }}>
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-black text-white">مرحباً بك 👋</h2>
            <p className="text-sm" style={{ color: "rgba(255,255,255,0.5)" }}>إليك ملخص متجرك اليوم</p>
          </div>
        </div>
      </div>

      {/* إحصائيات */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card) => (
          <div key={card.label} className="rounded-3xl p-5 transition-all duration-300"
            style={{
              background: "#ffffff",
              border: "1px solid rgba(0,0,0,0.06)",
              boxShadow: "0 2px 12px rgba(0,0,0,0.05)",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = `0 12px 32px ${card.glow}`; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 2px 12px rgba(0,0,0,0.05)"; }}
          >
            <div className={`w-11 h-11 rounded-2xl flex items-center justify-center mb-4 bg-gradient-to-br ${card.gradient}`}
              style={{ boxShadow: `0 4px 14px ${card.glow}` }}>
              <card.icon className="w-5 h-5 text-white" />
            </div>
            <p className="text-2xl font-black text-gray-900">{card.value}</p>
            <p className="text-xs font-medium mt-1" style={{ color: "rgba(0,0,0,0.4)" }}>{card.label}</p>
          </div>
        ))}
      </div>

      {/* روابط سريعة + حالات */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        {/* روابط سريعة */}
        <div className="rounded-3xl p-5 bg-white"
          style={{ border: "1px solid rgba(0,0,0,0.06)", boxShadow: "0 2px 12px rgba(0,0,0,0.05)" }}>
          <h3 className="font-black text-gray-800 mb-4 flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, #f59e0b, #f97316)" }}>
              <Plus className="w-3.5 h-3.5 text-white" />
            </div>
            روابط سريعة
          </h3>
          <div className="space-y-2">
            {quickLinks.map((link) => (
              <Link key={link.href} href={link.href}
                className="flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-200 group"
                style={{ background: "rgba(0,0,0,0.02)", border: "1px solid transparent" }}
                onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(0,0,0,0.04)"; e.currentTarget.style.border = "1px solid rgba(0,0,0,0.06)"; e.currentTarget.style.transform = "translateX(-3px)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(0,0,0,0.02)"; e.currentTarget.style.border = "1px solid transparent"; e.currentTarget.style.transform = "translateX(0)"; }}
              >
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center bg-gradient-to-br ${link.gradient}`}
                  style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.15)" }}>
                  <link.icon className="w-4 h-4 text-white" />
                </div>
                <span className="text-sm font-semibold text-gray-700">{link.label}</span>
                <ArrowLeft className="w-3.5 h-3.5 mr-auto text-gray-300 group-hover:text-gray-500 transition-colors" />
              </Link>
            ))}
          </div>
        </div>

        {/* حالات الطلبات */}
        <div className="rounded-3xl p-5 bg-white"
          style={{ border: "1px solid rgba(0,0,0,0.06)", boxShadow: "0 2px 12px rgba(0,0,0,0.05)" }}>
          <h3 className="font-black text-gray-800 mb-4 flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, #8b5cf6, #6d28d9)" }}>
              <ShoppingBag className="w-3.5 h-3.5 text-white" />
            </div>
            حالات الطلبات
          </h3>
          <div className="space-y-2">
            {statuses.map((s) => (
              <div key={s.label} className="flex items-center justify-between px-4 py-3 rounded-2xl"
                style={{ background: s.bg, border: `1px solid ${s.border}` }}>
                <span className="text-sm text-gray-600">{s.desc}</span>
                <span className="text-xs font-black px-3 py-1 rounded-xl"
                  style={{ background: s.bg, color: s.color, border: `1px solid ${s.border}` }}>
                  {s.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import {
  ShoppingBag, Package, TrendingUp, Bell, Plus, Eye,
  ArrowLeft, Sparkles, Calendar,
  Clock, CheckCircle, XCircle, Truck, AlertCircle,
} from "lucide-react";
import { formatPrice } from "@/lib/utils";
import toast from "react-hot-toast";

function playCashSound() {
  try {
    const ctx = new AudioContext();
    const play = (freq: number, t: number, dur: number, vol: number) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, ctx.currentTime + t);
      gain.gain.setValueAtTime(vol, ctx.currentTime + t);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + t + dur);
      osc.start(ctx.currentTime + t);
      osc.stop(ctx.currentTime + t + dur);
    };
    play(900, 0,    0.12, 0.45);
    play(1200, 0.1, 0.12, 0.35);
    play(1500, 0.2, 0.18, 0.25);
    play(900, 0.35, 0.25, 0.15);
  } catch { /* صوت غير متاح */ }
}

interface RecentOrder {
  id: string;
  orderNumber: string;
  firstName: string;
  lastName: string;
  wilayaName: string;
  deliveryType: string;
  total: number;
  status: string;
  createdAt: string;
  items: { quantity: number; product: { name: string } }[];
}

interface Stats {
  totalOrders: number;
  newOrders: number;
  preparingOrders: number;
  shippedOrders: number;
  deliveredOrders: number;
  cancelledOrders: number;
  totalProducts: number;
  todayOrders: number;
  yesterdayOrders: number;
  weekOrders: number;
  monthOrders: number;
  revenue: number;
  revenueNoDelivery: number;
  weekRevenue: number;
  weekRevenueNoDelivery: number;
  monthRevenue: number;
  monthRevenueNoDelivery: number;
  lastMonthRevenue: number;
  recentOrders?: RecentOrder[];
}


export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const prevNewOrders = useRef<number | null>(null);
  const isFirstLoad = useRef(true);

  useEffect(() => {
    const password = sessionStorage.getItem("admin-password") ?? "";

    const fetchStats = async () => {
      try {
        const res = await fetch("/api/admin", { headers: { "x-admin-password": password } });
        const data: Stats = await res.json();
        setStats(data);

        if (isFirstLoad.current) {
          isFirstLoad.current = false;
          prevNewOrders.current = data.newOrders;
        } else if (prevNewOrders.current !== null && data.newOrders > prevNewOrders.current) {
          const diff = data.newOrders - prevNewOrders.current;
          playCashSound();
          const msg = diff > 1 ? `${diff} طلبيات جديدة!` : "طلبية جديدة وصلت!";
          toast.success(`🛒 ${msg}`, { duration: 5000, position: "top-center" });
          // إشعار مباشر من المتصفح (يعمل دائماً عند فتح الصفحة)
          if (typeof Notification !== "undefined" && Notification.permission === "granted") {
            new Notification(`🛒 ${msg}`, {
              body: data.recentOrders?.[0]
                ? `${data.recentOrders[0].firstName} ${data.recentOrders[0].lastName} — ${data.recentOrders[0].total.toLocaleString("ar-DZ")} دج`
                : "",
              dir: "rtl",
            });
          }
          prevNewOrders.current = data.newOrders;
        } else {
          prevNewOrders.current = data.newOrders;
        }
      } catch { /* تجاهل الخطأ */ }
    };

    fetchStats();
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, []);

  const today = new Date();

  const quickUpdate = async (orderId: string, newStatus: string) => {
    const password = sessionStorage.getItem("admin-password") ?? "";
    setUpdatingId(orderId);
    try {
      await fetch("/api/admin", {
        method: "PATCH",
        headers: { "Content-Type": "application/json", "x-admin-password": password },
        body: JSON.stringify({ orderId, status: newStatus }),
      });
      const res = await fetch("/api/admin", { headers: { "x-admin-password": password } });
      setStats(await res.json());
      toast.success(newStatus === "DELIVERED" ? "✅ تم تسليم الطلبية" : newStatus === "SHIPPED" ? "🚚 تم الشحن" : "✅ تم التأكيد");
    } catch { toast.error("حدث خطأ"); }
    finally { setUpdatingId(null); }
  };

  const growthVsYesterday = stats
    ? stats.yesterdayOrders === 0
      ? stats.todayOrders > 0 ? 100 : 0
      : Math.round(((stats.todayOrders - stats.yesterdayOrders) / stats.yesterdayOrders) * 100)
    : 0;

  const growthVsLastMonth = stats
    ? stats.lastMonthRevenue === 0
      ? stats.monthRevenue > 0 ? 100 : 0
      : Math.round(((stats.monthRevenue - stats.lastMonthRevenue) / stats.lastMonthRevenue) * 100)
    : 0;

  if (!stats) return (
    <div className="space-y-5 animate-pulse">
      <div className="rounded-3xl h-20 bg-gray-200" />
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[1,2,3].map(i => <div key={i} className="rounded-3xl h-36 bg-gray-200" />)}
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[1,2,3,4].map(i => <div key={i} className="rounded-3xl h-28 bg-gray-200" />)}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="rounded-3xl h-56 bg-gray-200" />
        <div className="rounded-3xl h-56 bg-gray-200" />
      </div>
    </div>
  );

  return (
    <div className="space-y-5">

      {/* بانر ترحيب */}
      <div className="rounded-3xl p-5 relative overflow-hidden"
        style={{ background: "linear-gradient(135deg, #1a1a3e 0%, #16213e 60%, #0f3460 100%)", boxShadow: "0 8px 32px rgba(0,0,0,0.15)" }}>
        <div className="absolute top-0 right-0 w-48 h-48 rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(124,58,237,0.25) 0%, transparent 70%)", transform: "translate(30%,-30%)" }} />
        <div className="relative flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl flex items-center justify-center"
            style={{ background: "linear-gradient(135deg,#f59e0b,#f97316)", boxShadow: "0 4px 16px rgba(245,158,11,0.4)" }}>
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-black text-white">مرحباً بك 👋</h2>
            <p className="text-xs" style={{ color: "rgba(255,255,255,0.45)" }}>
              {today.toLocaleDateString("ar-DZ", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
            </p>
          </div>
        </div>
      </div>

      {/* الإيرادات الرئيسية */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {[
          { label: "إيرادات الشهر", withDelivery: stats?.monthRevenue ?? 0, noDelivery: stats?.monthRevenueNoDelivery ?? 0, sub: growthVsLastMonth >= 0 ? `↑ ${growthVsLastMonth}% عن الشهر الماضي` : `↓ ${Math.abs(growthVsLastMonth)}% عن الشهر الماضي`, subColor: growthVsLastMonth >= 0 ? "#34d399" : "#f87171", gradient: "from-emerald-500 to-teal-500", glow: "rgba(16,185,129,0.3)" },
          { label: "إيرادات الأسبوع", withDelivery: stats?.weekRevenue ?? 0, noDelivery: stats?.weekRevenueNoDelivery ?? 0, sub: `من ${stats?.weekOrders ?? 0} طلب`, subColor: "#60a5fa", gradient: "from-blue-500 to-cyan-500", glow: "rgba(59,130,246,0.3)" },
          { label: "الإيرادات الكلية", withDelivery: stats?.revenue ?? 0, noDelivery: stats?.revenueNoDelivery ?? 0, sub: `${stats?.deliveredOrders ?? 0} طلب مُسلَّم`, subColor: "#a78bfa", gradient: "from-violet-500 to-purple-600", glow: "rgba(124,58,237,0.3)" },
        ].map((c) => (
          <div key={c.label} className="rounded-3xl p-5 bg-white transition-all duration-300"
            style={{ border: "1px solid rgba(0,0,0,0.06)", boxShadow: "0 2px 12px rgba(0,0,0,0.05)" }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = `0 12px 32px ${c.glow}`; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 2px 12px rgba(0,0,0,0.05)"; }}>
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center mb-3 bg-gradient-to-br ${c.gradient}`}
              style={{ boxShadow: `0 4px 14px ${c.glow}` }}>
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <p className="text-xl font-black text-gray-900">{formatPrice(c.withDelivery)}</p>
            <p className="text-xs font-bold text-gray-400 mt-0.5">شامل التوصيل</p>
            <div className="mt-1.5 pt-1.5" style={{ borderTop: "1px solid rgba(0,0,0,0.06)" }}>
              <p className="text-sm font-black" style={{ color: c.gradient.includes("emerald") ? "#10b981" : c.gradient.includes("blue") ? "#3b82f6" : "#8b5cf6" }}>{formatPrice(c.noDelivery)}</p>
              <p className="text-xs text-gray-400">بدون توصيل</p>
            </div>
            <p className="text-xs font-medium text-gray-400 mt-1.5">{c.label}</p>
            <p className="text-xs font-bold mt-0.5" style={{ color: c.subColor }}>{c.sub}</p>
          </div>
        ))}
      </div>

      {/* إحصائيات الطلبات */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "اليوم", value: stats?.todayOrders ?? "—", sub: `أمس: ${stats?.yesterdayOrders ?? 0}`, icon: Clock, gradient: "from-amber-500 to-orange-500", glow: "rgba(245,158,11,0.3)", extra: growthVsYesterday !== 0 ? (growthVsYesterday > 0 ? `↑${growthVsYesterday}%` : `↓${Math.abs(growthVsYesterday)}%`) : "—", extraColor: growthVsYesterday >= 0 ? "#34d399" : "#f87171" },
          { label: "هذا الأسبوع", value: stats?.weekOrders ?? "—", sub: "آخر 7 أيام", icon: Calendar, gradient: "from-blue-500 to-cyan-500", glow: "rgba(59,130,246,0.3)", extra: null, extraColor: "" },
          { label: "هذا الشهر", value: stats?.monthOrders ?? "—", sub: "منذ بداية الشهر", icon: TrendingUp, gradient: "from-violet-500 to-purple-600", glow: "rgba(124,58,237,0.3)", extra: null, extraColor: "" },
          { label: "المنتجات", value: stats?.totalProducts ?? "—", sub: "منتج نشط", icon: Package, gradient: "from-rose-500 to-pink-600", glow: "rgba(244,63,94,0.3)", extra: null, extraColor: "" },
        ].map((c) => (
          <div key={c.label} className="rounded-3xl p-4 bg-white transition-all duration-300"
            style={{ border: "1px solid rgba(0,0,0,0.06)", boxShadow: "0 2px 12px rgba(0,0,0,0.05)" }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = `0 8px 24px ${c.glow}`; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 2px 12px rgba(0,0,0,0.05)"; }}>
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 bg-gradient-to-br ${c.gradient}`}
              style={{ boxShadow: `0 3px 10px ${c.glow}` }}>
              <c.icon className="w-4 h-4 text-white" />
            </div>
            <div className="flex items-end gap-2">
              <p className="text-2xl font-black text-gray-900">{c.value}</p>
              {c.extra && <p className="text-xs font-bold mb-1" style={{ color: c.extraColor }}>{c.extra}</p>}
            </div>
            <p className="text-xs font-bold text-gray-500">{c.label}</p>
            <p className="text-xs text-gray-400 mt-0.5">{c.sub}</p>
          </div>
        ))}
      </div>

      {/* حالات + رزنامة */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* حالات الطلبات */}
        <div className="rounded-3xl p-5 bg-white"
          style={{ border: "1px solid rgba(0,0,0,0.06)", boxShadow: "0 2px 12px rgba(0,0,0,0.05)" }}>
          <h3 className="font-black text-gray-800 mb-4 flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg flex items-center justify-center bg-gradient-to-br from-violet-500 to-purple-600">
              <ShoppingBag className="w-3.5 h-3.5 text-white" />
            </div>
            الطلبات حسب الحالة
          </h3>
          <div className="space-y-2">
            {[
              { label: "جديد", value: stats?.newOrders, icon: Bell, color: "#818cf8", bg: "rgba(129,140,248,0.1)", border: "rgba(129,140,248,0.2)", href: "/admin/orders?status=NEW" },
              { label: "قيد التحضير", value: stats?.preparingOrders, icon: AlertCircle, color: "#fbbf24", bg: "rgba(251,191,36,0.1)", border: "rgba(251,191,36,0.2)", href: "/admin/orders?status=PREPARING" },
              { label: "تم الشحن", value: stats?.shippedOrders, icon: Truck, color: "#a78bfa", bg: "rgba(167,139,250,0.1)", border: "rgba(167,139,250,0.2)", href: "/admin/orders?status=SHIPPED" },
              { label: "مُسلَّم", value: stats?.deliveredOrders, icon: CheckCircle, color: "#34d399", bg: "rgba(52,211,153,0.1)", border: "rgba(52,211,153,0.2)", href: "/admin/orders?status=DELIVERED" },
              { label: "ملغى", value: stats?.cancelledOrders, icon: XCircle, color: "#f87171", bg: "rgba(248,113,113,0.1)", border: "rgba(248,113,113,0.2)", href: "/admin/orders?status=CANCELLED" },
            ].map((s) => (
              <Link key={s.label} href={s.href}
                className="flex items-center gap-3 px-3 py-2.5 rounded-2xl transition-all duration-200 group"
                style={{ background: s.bg, border: `1px solid ${s.border}` }}
                onMouseEnter={(e) => { e.currentTarget.style.transform = "translateX(-2px)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = "translateX(0)"; }}>
                <s.icon className="w-4 h-4 flex-shrink-0" style={{ color: s.color }} />
                <span className="text-sm font-semibold text-gray-700 flex-1">{s.label}</span>
                <span className="text-base font-black" style={{ color: s.color }}>{s.value ?? "—"}</span>
                <ArrowLeft className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: s.color }} />
              </Link>
            ))}
          </div>
        </div>

        {/* طلبيات تحتاج إجراء */}
        <div className="rounded-3xl p-5 bg-white"
          style={{ border: "1px solid rgba(0,0,0,0.06)", boxShadow: "0 2px 12px rgba(0,0,0,0.05)" }}>

          <h3 className="font-black text-gray-800 mb-4 flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg flex items-center justify-center bg-gradient-to-br from-rose-500 to-pink-600">
              <Bell className="w-3.5 h-3.5 text-white" />
            </div>
            طلبيات تحتاج إجراء
            {((stats?.newOrders ?? 0) + (stats?.preparingOrders ?? 0) + (stats?.shippedOrders ?? 0)) > 0 && (
              <span className="text-xs px-2 py-0.5 rounded-full font-black text-white"
                style={{ background: "linear-gradient(135deg,#f43f5e,#e11d48)" }}>
                {(stats?.newOrders ?? 0) + (stats?.preparingOrders ?? 0) + (stats?.shippedOrders ?? 0)}
              </span>
            )}
          </h3>

          {/* أعداد الحالات */}
          <div className="grid grid-cols-3 gap-2 mb-4">
            {[
              { label: "جديدة", count: stats?.newOrders ?? 0, bg: "rgba(99,102,241,0.08)", color: "#6366f1", border: "rgba(99,102,241,0.2)", href: "/admin/orders?status=NEW" },
              { label: "تحضير", count: stats?.preparingOrders ?? 0, bg: "rgba(245,158,11,0.08)", color: "#f59e0b", border: "rgba(245,158,11,0.2)", href: "/admin/orders?status=PREPARING" },
              { label: "شُحنت", count: stats?.shippedOrders ?? 0, bg: "rgba(139,92,246,0.08)", color: "#8b5cf6", border: "rgba(139,92,246,0.2)", href: "/admin/orders?status=SHIPPED" },
            ].map((s) => (
              <Link key={s.label} href={s.href}
                className="rounded-2xl p-3 text-center transition-all hover:scale-105"
                style={{ background: s.bg, border: `1px solid ${s.border}` }}>
                <p className="text-2xl font-black" style={{ color: s.color }}>{s.count}</p>
                <p className="text-xs font-semibold mt-0.5" style={{ color: s.color }}>{s.label}</p>
              </Link>
            ))}
          </div>

          {/* قائمة الطلبيات المعلّقة */}
          {(() => {
            const pending = (stats?.recentOrders ?? []).filter(
              (o) => o.status === "NEW" || o.status === "PREPARING" || o.status === "SHIPPED"
            );
            const totalPending = (stats?.newOrders ?? 0) + (stats?.preparingOrders ?? 0) + (stats?.shippedOrders ?? 0);
            const NEXT: Record<string, { label: string; status: string; color: string; bg: string }> = {
              NEW:       { label: "تأكيد ✓",  status: "PREPARING", color: "#10b981", bg: "rgba(16,185,129,0.1)" },
              PREPARING: { label: "شحن 🚚",   status: "SHIPPED",   color: "#8b5cf6", bg: "rgba(139,92,246,0.1)" },
              SHIPPED:   { label: "تسليم ✅", status: "DELIVERED", color: "#3b82f6", bg: "rgba(59,130,246,0.1)" },
            };
            if (totalPending === 0) return (
              <div className="text-center py-6">
                <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2"
                  style={{ background: "rgba(52,211,153,0.1)" }}>
                  <CheckCircle className="w-6 h-6" style={{ color: "#34d399" }} />
                </div>
                <p className="text-sm font-semibold text-gray-400">كل الطلبيات تمت معالجتها ✅</p>
              </div>
            );
            return (
              <div className="space-y-2">
                {pending.map((order) => {
                  const next = NEXT[order.status];
                  if (!next) return null;
                  const productsSummary = order.items.map((i) => i.product.name).join("، ");
                  return (
                    <div key={order.id} className="flex items-center gap-2 p-3 rounded-2xl"
                      style={{ background: "rgba(0,0,0,0.02)", border: "1px solid rgba(0,0,0,0.04)" }}>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-gray-800 truncate">
                          {order.firstName} {order.lastName}
                          <span className="text-xs font-normal text-gray-400 mr-1">• {order.wilayaName}</span>
                        </p>
                        <p className="text-xs text-gray-400 truncate">{productsSummary} — {formatPrice(order.total)}</p>
                      </div>
                      <button
                        onClick={() => quickUpdate(order.id, next.status)}
                        disabled={updatingId === order.id}
                        className="flex-shrink-0 text-xs font-black px-3 py-1.5 rounded-xl transition-all disabled:opacity-50 whitespace-nowrap"
                        style={{ background: next.bg, color: next.color, border: `1px solid ${next.color}33` }}
                      >
                        {updatingId === order.id ? "..." : next.label}
                      </button>
                    </div>
                  );
                })}
                {totalPending > pending.length && (
                  <Link href="/admin/orders"
                    className="block text-center text-xs font-bold py-2 rounded-xl transition-colors"
                    style={{ color: "#6b7280", background: "rgba(0,0,0,0.03)" }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(0,0,0,0.06)"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(0,0,0,0.03)"; }}
                  >
                    + {totalPending - pending.length} طلبية أخرى — عرض الكل ←
                  </Link>
                )}
              </div>
            );
          })()}
        </div>
      </div>

      {/* روابط سريعة */}
      <div className="rounded-3xl p-5 bg-white"
        style={{ border: "1px solid rgba(0,0,0,0.06)", boxShadow: "0 2px 12px rgba(0,0,0,0.05)" }}>
        <h3 className="font-black text-gray-800 mb-4 flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg flex items-center justify-center bg-gradient-to-br from-amber-500 to-orange-500">
            <Plus className="w-3.5 h-3.5 text-white" />
          </div>
          روابط سريعة
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {[
            { label: "إضافة منتج جديد", href: "/admin/products/new", icon: Plus, gradient: "from-blue-500 to-cyan-500", glow: "rgba(59,130,246,0.2)" },
            { label: "الطلبات الجديدة", href: "/admin/orders?status=NEW", icon: Bell, gradient: "from-rose-500 to-pink-600", glow: "rgba(244,63,94,0.2)" },
            { label: "عرض الموقع", href: "/", icon: Eye, gradient: "from-emerald-500 to-teal-500", glow: "rgba(16,185,129,0.2)" },
          ].map((link) => (
            <Link key={link.href} href={link.href}
              className="flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-200 group"
              style={{ background: "rgba(0,0,0,0.02)", border: "1px solid transparent" }}
              onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(0,0,0,0.04)"; e.currentTarget.style.border = "1px solid rgba(0,0,0,0.06)"; e.currentTarget.style.transform = "translateX(-2px)"; e.currentTarget.style.boxShadow = `0 4px 16px ${link.glow}`; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(0,0,0,0.02)"; e.currentTarget.style.border = "1px solid transparent"; e.currentTarget.style.transform = "translateX(0)"; e.currentTarget.style.boxShadow = "none"; }}>
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center bg-gradient-to-br ${link.gradient}`}
                style={{ boxShadow: `0 3px 10px ${link.glow}` }}>
                <link.icon className="w-4 h-4 text-white" />
              </div>
              <span className="text-sm font-semibold text-gray-700 flex-1">{link.label}</span>
              <ArrowLeft className="w-3.5 h-3.5 text-gray-300 group-hover:text-gray-500 transition-colors" />
            </Link>
          ))}
        </div>
      </div>

      {/* آخر الطلبيات */}
      {stats?.recentOrders && stats.recentOrders.length > 0 && (
        <div className="rounded-3xl bg-white overflow-hidden"
          style={{ border: "1px solid rgba(0,0,0,0.06)", boxShadow: "0 2px 12px rgba(0,0,0,0.05)" }}>

          {/* رأس القسم */}
          <div className="px-5 py-4 flex items-center justify-between"
            style={{ borderBottom: "1px solid rgba(0,0,0,0.05)" }}>
            <h3 className="font-black text-gray-800 flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg flex items-center justify-center bg-gradient-to-br from-rose-500 to-pink-600">
                <ShoppingBag className="w-3.5 h-3.5 text-white" />
              </div>
              آخر الطلبيات
              {stats.newOrders > 0 && (
                <span className="text-xs px-2 py-0.5 rounded-full font-black text-white"
                  style={{ background: "linear-gradient(135deg,#818cf8,#6d28d9)" }}>
                  {stats.newOrders} جديد
                </span>
              )}
            </h3>
            <Link href="/admin/orders"
              className="text-xs font-bold px-3 py-1.5 rounded-xl flex items-center gap-1 transition-all"
              style={{ background: "rgba(0,0,0,0.04)", color: "#6b7280" }}
              onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(0,0,0,0.08)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(0,0,0,0.04)"; }}>
              عرض الكل
              <ArrowLeft className="w-3 h-3" />
            </Link>
          </div>

          {/* قائمة الطلبيات */}
          <div className="divide-y" style={{ borderColor: "rgba(0,0,0,0.04)" }}>
            {stats.recentOrders.map((order) => {
              const statusMap: Record<string, { bg: string; color: string; label: string }> = {
                NEW:       { bg: "rgba(99,102,241,0.1)",  color: "#6366f1", label: "جديد" },
                PREPARING: { bg: "rgba(245,158,11,0.1)",  color: "#f59e0b", label: "قيد التحضير" },
                SHIPPED:   { bg: "rgba(139,92,246,0.1)",  color: "#8b5cf6", label: "تم الشحن" },
                DELIVERED: { bg: "rgba(16,185,129,0.1)",  color: "#10b981", label: "مُسلَّم" },
                CANCELLED: { bg: "rgba(239,68,68,0.1)",   color: "#ef4444", label: "ملغى" },
              };
              const sc = statusMap[order.status] ?? { bg: "rgba(0,0,0,0.05)", color: "#6b7280", label: order.status };
              const productsSummary = order.items
                .map((i) => `${i.product.name}${i.quantity > 1 ? ` ×${i.quantity}` : ""}`)
                .join("، ");
              const isNew = order.status === "NEW";
              const password = typeof window !== "undefined" ? sessionStorage.getItem("admin-password") ?? "" : "";

              const updateStatus = async (newStatus: string, e: React.MouseEvent) => {
                e.preventDefault();
                e.stopPropagation();
                try {
                  await fetch("/api/admin", {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json", "x-admin-password": password },
                    body: JSON.stringify({ orderId: order.id, status: newStatus }),
                  });
                  const res = await fetch("/api/admin", { headers: { "x-admin-password": password } });
                  setStats(await res.json());
                  toast.success(newStatus === "PREPARING" ? "✅ تم تأكيد الطلبية" : "❌ تم إلغاء الطلبية");
                } catch { toast.error("حدث خطأ"); }
              };

              return (
                <div key={order.id} className="px-4 py-3 hover:bg-gray-50 transition-colors">
                  {/* الصف الأول: حالة + اسم + سعر */}
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-xs px-2 py-0.5 rounded-full font-black flex-shrink-0"
                      style={{ background: sc.bg, color: sc.color }}>
                      {sc.label}
                    </span>
                    <span className="text-sm font-black text-gray-800 truncate flex-1 min-w-0">
                      {order.firstName} {order.lastName}
                    </span>
                    <span className="text-sm font-black text-gray-800 flex-shrink-0">
                      {formatPrice(order.total)}
                    </span>
                  </div>

                  {/* الصف الثاني: رقم + منتجات + أزرار */}
                  <div className="flex items-center gap-2 mt-1.5 min-w-0">
                    <span className="text-xs text-gray-400 flex-shrink-0">#{order.orderNumber}</span>
                    <span className="text-xs flex-shrink-0" style={{ color: "rgba(0,0,0,0.3)" }}>
                      {order.deliveryType === "home" ? "🏠" : "🏢"}
                    </span>
                    <p className="text-xs text-gray-400 truncate flex-1 min-w-0">{productsSummary}</p>
                    {isNew ? (
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <button
                          onClick={(e) => updateStatus("PREPARING", e)}
                          className="flex items-center gap-0.5 px-2 py-1 rounded-lg text-xs font-black transition-all"
                          style={{ background: "rgba(16,185,129,0.12)", color: "#10b981", border: "1px solid rgba(16,185,129,0.25)" }}
                        >
                          <CheckCircle className="w-3 h-3" />
                          تأكيد
                        </button>
                        <button
                          onClick={(e) => updateStatus("CANCELLED", e)}
                          className="flex items-center gap-0.5 px-2 py-1 rounded-lg text-xs font-black transition-all"
                          style={{ background: "rgba(239,68,68,0.1)", color: "#ef4444", border: "1px solid rgba(239,68,68,0.2)" }}
                        >
                          <XCircle className="w-3 h-3" />
                          إلغاء
                        </button>
                      </div>
                    ) : (
                      <Link href="/admin/orders"
                        className="flex-shrink-0 w-6 h-6 rounded-lg flex items-center justify-center hover:bg-gray-100 transition-colors">
                        <ArrowLeft className="w-3 h-3 text-gray-300" />
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

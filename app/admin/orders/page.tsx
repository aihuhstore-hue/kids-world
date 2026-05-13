"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  Download, RefreshCw, Trash2, Phone, Home, Building2,
  Package, Tag, MapPin, Calendar, TrendingUp, ShoppingBag,
  Clock, Truck, CheckCircle2, CircleDot, XCircle, Ban,
  ChevronDown, ChevronUp, User,
} from "lucide-react";
import { formatPrice, getStatusLabel } from "@/lib/utils";
import toast from "react-hot-toast";
import type { Order } from "@/types";

/* ─── Config ─────────────────────────────────────────── */
const STATUS_FLOW = [
  { key: "NEW",       label: "جديد",          icon: "🆕", color: "blue" },
  { key: "PREPARING", label: "قيد التحضير",   icon: "⚙️", color: "amber" },
  { key: "SHIPPED",   label: "تم الشحن",       icon: "🚚", color: "purple" },
  { key: "DELIVERED", label: "مُسلَّم",         icon: "✅", color: "green" },
];

const STATUS_STYLE: Record<string, { pill: string; bar: string; step: string }> = {
  NEW:       { pill: "bg-blue-100 text-blue-700 border-blue-200",     bar: "bg-blue-500",   step: "bg-blue-500 text-white" },
  PREPARING: { pill: "bg-amber-100 text-amber-700 border-amber-200",  bar: "bg-amber-500",  step: "bg-amber-500 text-white" },
  SHIPPED:   { pill: "bg-purple-100 text-purple-700 border-purple-200",bar: "bg-purple-500",step: "bg-purple-500 text-white" },
  DELIVERED: { pill: "bg-green-100 text-green-700 border-green-200",  bar: "bg-green-500",  step: "bg-green-500 text-white" },
  CANCELLED: { pill: "bg-red-100 text-red-600 border-red-200",        bar: "bg-red-400",    step: "bg-red-400 text-white" },
};

const NEXT: Record<string, { value: string; label: string; cls: string }> = {
  NEW:      { value: "PREPARING", label: "✅ تأكيد الطلبية",     cls: "bg-blue-600 hover:bg-blue-700 text-white" },
  PREPARING:{ value: "SHIPPED",   label: "🚚 تأكيد الشحن",       cls: "bg-purple-600 hover:bg-purple-700 text-white" },
  SHIPPED:  { value: "DELIVERED", label: "📦 تأكيد الاستلام",    cls: "bg-green-600 hover:bg-green-700 text-white" },
};

const FILTERS = [
  { value: "",           label: "الكل",           dot: "bg-gray-400" },
  { value: "NEW",        label: "جديد",           dot: "bg-blue-500" },
  { value: "PREPARING",  label: "قيد التحضير",    dot: "bg-amber-500" },
  { value: "SHIPPED",    label: "تم الشحن",        dot: "bg-purple-500" },
  { value: "DELIVERED",  label: "مُسلَّم",          dot: "bg-green-500" },
  { value: "CANCELLED",  label: "ملغى",           dot: "bg-red-400" },
];

type OrderWithGender = Order & { gender?: string };

/* ─── Step Progress Bar ──────────────────────────────── */
function StatusBar({ status }: { status: string }) {
  if (status === "CANCELLED") return null;
  const idx = STATUS_FLOW.findIndex((s) => s.key === status);
  return (
    <div className="flex items-center gap-0 w-full">
      {STATUS_FLOW.map((s, i) => {
        const done = i <= idx;
        const active = i === idx;
        return (
          <div key={s.key} className="flex items-center flex-1">
            <div className={`flex flex-col items-center gap-0.5 flex-shrink-0`}>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                done ? STATUS_STYLE[s.key]?.step ?? "bg-gray-300 text-gray-500"
                     : "bg-gray-100 text-gray-400"
              } ${active ? "ring-2 ring-offset-1 ring-current scale-110" : ""}`}>
                {done ? "✓" : i + 1}
              </div>
              <span className={`text-[10px] font-semibold whitespace-nowrap ${done ? "text-gray-700" : "text-gray-400"}`}>
                {s.label}
              </span>
            </div>
            {i < STATUS_FLOW.length - 1 && (
              <div className={`flex-1 h-0.5 mx-1 mb-3 rounded-full transition-all ${i < idx ? "bg-gray-400" : "bg-gray-100"}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ─── Main Component ─────────────────────────────────── */
function AdminOrdersInner() {
  const searchParams = useSearchParams();
  const [orders, setOrders] = useState<OrderWithGender[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState(searchParams.get("status") ?? "");
  const [updating, setUpdating] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    const pass = sessionStorage.getItem("admin-password") ?? "";
    setPassword(pass);
    fetchOrders(pass);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  const fetchOrders = async (pass?: string) => {
    setLoading(true);
    try {
      const p = pass ?? password;
      const url = `/api/orders${filter ? `?status=${filter}` : ""}`;
      const res = await fetch(url, { headers: { "x-admin-password": p } });
      const data = await res.json();
      setOrders(res.ok ? (data.orders ?? []) : []);
      if (!res.ok) toast.error(data.error ?? "خطأ");
    } catch { toast.error("خطأ في الاتصال"); }
    finally { setLoading(false); }
  };

  const updateStatus = async (id: string, status: string) => {
    setUpdating(id);
    try {
      const res = await fetch(`/api/orders/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", "x-admin-password": password },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        setOrders((prev) => prev.map((o) => o.id === id ? { ...o, status } : o));
        toast.success(`تم التحديث: ${getStatusLabel(status)}`);
      } else toast.error("فشل التحديث");
    } finally { setUpdating(null); }
  };

  const deleteOrder = async (id: string, num: string) => {
    if (!confirm(`حذف الطلبية #${num} نهائياً؟`)) return;
    setUpdating(id);
    try {
      const res = await fetch(`/api/orders/${id}`, { method: "DELETE", headers: { "x-admin-password": password } });
      if (res.ok) { setOrders((p) => p.filter((o) => o.id !== id)); toast.success("تم الحذف"); }
      else toast.error("فشل الحذف");
    } finally { setUpdating(null); }
  };

  const exportCSV = () => {
    const h = ["رقم الطلبية","الاسم","اللقب","الجنس","الهاتف","الولاية","البلدية","العنوان","التوصيل","المنتجات","المجموع الفرعي","التوصيل","الخصم","الإجمالي","الحالة","التاريخ"].join(",");
    const rows = orders.map((o) => [
      o.orderNumber, o.firstName, o.lastName,
      o.gender === "girl" ? "بنت" : o.gender === "boy" ? "ولد" : "",
      o.phone, o.wilayaName, o.commune, o.address,
      o.deliveryType === "home" ? "للمنزل" : "مكتب بريد",
      o.items?.map((i) => `${i.product?.name ?? "منتج"} x${i.quantity}`).join(" | "),
      o.subtotal, o.deliveryFee, o.discount, o.total,
      getStatusLabel(o.status),
      new Date(o.createdAt).toLocaleDateString("ar-DZ"),
    ].join(","));
    const blob = new Blob(["﻿" + [h, ...rows].join("\n")], { type: "text/csv;charset=utf-8;" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `orders-${Date.now()}.csv`;
    a.click();
  };

  const revenue = orders.filter((o) => o.status !== "CANCELLED").reduce((s, o) => s + o.total, 0);
  const newCount = orders.filter((o) => o.status === "NEW").length;
  const deliveredCount = orders.filter((o) => o.status === "DELIVERED").length;

  return (
    <div className="space-y-5">

      {/* ── Stats ── */}
      {!loading && orders.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { icon: ShoppingBag, label: "إجمالي الطلبيات", value: orders.length, color: "text-blue-600", bg: "bg-blue-50" },
            { icon: Clock,       label: "جديدة تنتظر",     value: newCount,       color: "text-amber-600", bg: "bg-amber-50" },
            { icon: CheckCircle2,label: "مُسلَّمة",          value: deliveredCount, color: "text-green-600", bg: "bg-green-50" },
            { icon: TrendingUp,  label: "الإيرادات",        value: formatPrice(revenue), color: "text-purple-600", bg: "bg-purple-50", isText: true },
          ].map((s, i) => (
            <div key={i} className="bg-white rounded-2xl p-4 border border-gray-100 flex items-center gap-3 shadow-sm">
              <div className={`w-10 h-10 ${s.bg} rounded-xl flex items-center justify-center flex-shrink-0`}>
                <s.icon className={`w-5 h-5 ${s.color}`} />
              </div>
              <div>
                <p className="text-xs text-gray-400 font-medium">{s.label}</p>
                <p className={`${s.isText ? "text-base" : "text-xl"} font-black text-gray-900`}>{s.value}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Filters + Actions ── */}
      <div className="flex items-center justify-between gap-3 flex-wrap bg-white rounded-2xl p-3 border border-gray-100 shadow-sm">
        <div className="flex gap-1.5 flex-wrap">
          {FILTERS.map((f) => (
            <button key={f.value} onClick={() => setFilter(f.value)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                filter === f.value ? "bg-gray-900 text-white shadow-sm" : "text-gray-600 hover:bg-gray-100"
              }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${filter === f.value ? "bg-white" : f.dot}`} />
              {f.label}
              {f.value === "NEW" && newCount > 0 && (
                <span className="bg-red-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">{newCount}</span>
              )}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <button onClick={() => fetchOrders()} className="p-2 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors border border-gray-200" title="تحديث">
            <RefreshCw className="w-4 h-4 text-gray-500" />
          </button>
          <button onClick={exportCSV} className="flex items-center gap-1.5 px-3 py-2 bg-emerald-600 text-white rounded-xl text-xs font-semibold hover:bg-emerald-700 transition-colors">
            <Download className="w-3.5 h-3.5" /> تصدير CSV
          </button>
        </div>
      </div>

      {!loading && (
        <p className="text-xs text-gray-400 px-1">
          {orders.length === 0 ? "لا توجد طلبيات" : `${orders.length} طلبية`}
          {deliveredCount > 0 && ` — ${deliveredCount} مُسلَّمة`}
        </p>
      )}

      {/* ── List ── */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 text-gray-300">
          <RefreshCw className="w-8 h-8 animate-spin mb-3" />
          <p className="text-sm">جاري التحميل...</p>
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-24 bg-white rounded-2xl border border-gray-100">
          <Package className="w-14 h-14 text-gray-200 mx-auto mb-3" />
          <p className="text-gray-400 font-semibold">لا توجد طلبيات</p>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => {
            const next = NEXT[order.status];
            const canCancel = !["CANCELLED", "DELIVERED"].includes(order.status);
            const busy = updating === order.id;
            const st = STATUS_STYLE[order.status] ?? STATUS_STYLE.NEW;
            const isOpen = expanded === order.id;
            const productNames = order.items?.map((i) => `${i.product?.name ?? "منتج"} ×${i.quantity}`).join("، ") ?? "—";
            const totalQty = order.items?.reduce((s, i) => s + i.quantity, 0) ?? 0;

            return (
              <div key={order.id} className={`bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm transition-all ${busy ? "opacity-60 pointer-events-none" : "hover:shadow-md"}`}>

                {/* ── Top color bar ── */}
                <div className={`h-1 w-full ${st.bar}`} />

                {/* ── Header row ── */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-gray-50">
                  <div className="flex items-center gap-2.5">
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${st.pill}`}>
                      {getStatusLabel(order.status)}
                    </span>
                    <span className="font-mono text-sm font-bold text-gray-600">#{order.orderNumber}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-400 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(order.createdAt).toLocaleDateString("ar-DZ", { day: "numeric", month: "short" })}
                      {" "}
                      {new Date(order.createdAt).toLocaleTimeString("ar-DZ", { hour: "2-digit", minute: "2-digit" })}
                    </span>
                    <button onClick={() => setExpanded(isOpen ? null : order.id)}
                      className="p-1 rounded-lg hover:bg-gray-100 transition-colors text-gray-400">
                      {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="p-4 space-y-3">

                  {/* ── Customer Summary Row ── */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 min-w-0">
                      {/* Avatar */}
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0 ${
                        order.gender === "girl" ? "bg-pink-50" : order.gender === "boy" ? "bg-blue-50" : "bg-gray-100"
                      }`}>
                        {order.gender === "girl" ? "👧" : order.gender === "boy" ? "👦" : <User className="w-5 h-5 text-gray-400" />}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-black text-gray-900">{order.firstName} {order.lastName}</p>
                          {order.gender && (
                            <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                              order.gender === "girl" ? "bg-pink-50 text-pink-600" : "bg-blue-50 text-blue-600"
                            }`}>
                              {order.gender === "girl" ? "بنت" : "ولد"}
                            </span>
                          )}
                        </div>
                        <a href={`tel:${order.phone}`} dir="ltr"
                          className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 font-medium mt-0.5">
                          <Phone className="w-3.5 h-3.5" />{order.phone}
                        </a>
                        <div className="flex items-center gap-1 text-xs text-gray-500 mt-0.5">
                          <MapPin className="w-3 h-3 text-gray-400" />
                          {order.wilayaName}{order.commune ? ` / ${order.commune}` : ""}
                        </div>
                      </div>
                    </div>

                    {/* Delivery badge */}
                    <div className={`flex flex-col items-center gap-1 px-3 py-2 rounded-xl flex-shrink-0 ${
                      order.deliveryType === "home" ? "bg-blue-50 border border-blue-100" : "bg-orange-50 border border-orange-100"
                    }`}>
                      {order.deliveryType === "home"
                        ? <Home className="w-4 h-4 text-blue-600" />
                        : <Building2 className="w-4 h-4 text-orange-600" />}
                      <span className={`text-xs font-bold ${order.deliveryType === "home" ? "text-blue-700" : "text-orange-700"}`}>
                        {order.deliveryType === "home" ? "للمنزل" : "مكتب بريد"}
                      </span>
                    </div>
                  </div>

                  {/* ── Products + Total (always visible) ── */}
                  <div className="bg-gray-50 rounded-xl px-3 py-2.5 space-y-1.5">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-1.5">
                        <Package className="w-4 h-4 text-gray-400" />
                        <span className="text-xs font-bold text-gray-500">{order.items?.length ?? 0} منتج — {totalQty} قطعة</span>
                      </div>
                      <span className="text-base font-black text-gray-900">{formatPrice(order.total)}</span>
                    </div>
                    {order.items?.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 bg-yellow-100 text-yellow-700 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">
                            {item.quantity}
                          </span>
                          <span className="text-gray-700 font-medium">{item.product?.name ?? "منتج"}</span>
                        </div>
                        <span className="text-gray-500 text-xs flex-shrink-0">{formatPrice(item.price * item.quantity)}</span>
                      </div>
                    ))}
                  </div>

                  {/* ── Expanded Details ── */}
                  {isOpen && (
                    <div className="space-y-3 pt-1 border-t border-gray-100">

                      {/* Status progress */}
                      <div className="pt-2">
                        <StatusBar status={order.status} />
                      </div>

                      {/* Address detail */}
                      {order.address && (
                        <div className="flex items-start gap-2 text-sm text-gray-600 bg-gray-50 rounded-xl px-3 py-2">
                          <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                          <span>{order.address}</span>
                        </div>
                      )}

                      {/* Price breakdown */}
                      <div className="bg-gray-50 rounded-xl px-3 py-3 space-y-2">
                        <p className="text-xs font-bold text-gray-500 mb-1">تفصيل السعر</p>
                        <div className="flex justify-between text-sm text-gray-600">
                          <span>سعر المنتجات</span>
                          <span className="font-semibold">{formatPrice(order.subtotal)}</span>
                        </div>
                        <div className="flex justify-between text-sm text-gray-600">
                          <span className="flex items-center gap-1"><Truck className="w-3.5 h-3.5" />رسوم التوصيل</span>
                          <span className="font-semibold">{formatPrice(order.deliveryFee)}</span>
                        </div>
                        {(order.discount ?? 0) > 0 && (
                          <div className="flex justify-between text-sm text-green-600">
                            <span className="flex items-center gap-1"><Tag className="w-3.5 h-3.5" />خصم {order.promoCode ? `(${order.promoCode})` : ""}</span>
                            <span className="font-semibold">−{formatPrice(order.discount)}</span>
                          </div>
                        )}
                        <div className="border-t border-gray-200 pt-2 flex justify-between">
                          <span className="font-bold text-gray-800">الإجمالي النهائي</span>
                          <span className="text-lg font-black text-gray-900">{formatPrice(order.total)}</span>
                        </div>
                      </div>

                      {/* Notes */}
                      {order.notes && (
                        <div className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2">
                          <span className="font-bold">📝 ملاحظة: </span>{order.notes}
                        </div>
                      )}
                    </div>
                  )}

                  {/* ── Actions ── */}
                  <div className="flex gap-2 pt-1">
                    {next && (
                      <button onClick={() => updateStatus(order.id, next.value)} disabled={busy}
                        className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all disabled:opacity-50 ${next.cls}`}>
                        <CheckCircle2 className="w-4 h-4" />{next.label}
                      </button>
                    )}
                    {canCancel && (
                      <button onClick={() => updateStatus(order.id, "CANCELLED")} disabled={busy}
                        className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-sm font-semibold bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 transition-colors disabled:opacity-50">
                        <Ban className="w-4 h-4" />إلغاء
                      </button>
                    )}
                    {order.status === "CANCELLED" && (
                      <div className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold bg-red-50 text-red-500 border border-red-200">
                        <XCircle className="w-4 h-4" /> طلبية ملغاة
                      </div>
                    )}
                    {order.status === "DELIVERED" && (
                      <div className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold bg-green-50 text-green-700 border border-green-200">
                        <CircleDot className="w-4 h-4" /> تم التسليم بنجاح
                      </div>
                    )}
                    <button onClick={() => deleteOrder(order.id, order.orderNumber)} disabled={busy}
                      className="p-2.5 rounded-xl text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors border border-gray-200 disabled:opacity-50"
                      title="حذف نهائي">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function AdminOrders() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center py-24 text-gray-300"><span className="animate-spin text-2xl">⏳</span></div>}>
      <AdminOrdersInner />
    </Suspense>
  );
}

"use client";

import { useEffect, useState } from "react";
import {
  Download, RefreshCw, Trash2, CheckCircle, XCircle,
  Phone, Home, Building2, Package, Tag, MapPin,
  Calendar, Hash, TrendingUp, ShoppingBag, Clock, Truck,
} from "lucide-react";
import { formatPrice, getStatusLabel } from "@/lib/utils";
import toast from "react-hot-toast";
import type { Order } from "@/types";

const STATUSES = [
  { value: "", label: "الكل" },
  { value: "NEW", label: "🆕 جديد" },
  { value: "PREPARING", label: "⚙️ تحضير" },
  { value: "SHIPPED", label: "🚚 شُحن" },
  { value: "DELIVERED", label: "✅ مُسلَّم" },
  { value: "CANCELLED", label: "❌ ملغى" },
];

const STATUS_CONFIG: Record<string, { bg: string; text: string; dot: string }> = {
  NEW:       { bg: "bg-blue-50",   text: "text-blue-700",   dot: "bg-blue-500" },
  PREPARING: { bg: "bg-amber-50",  text: "text-amber-700",  dot: "bg-amber-500" },
  SHIPPED:   { bg: "bg-purple-50", text: "text-purple-700", dot: "bg-purple-500" },
  DELIVERED: { bg: "bg-green-50",  text: "text-green-700",  dot: "bg-green-500" },
  CANCELLED: { bg: "bg-red-50",    text: "text-red-600",    dot: "bg-red-500" },
};

const NEXT_STATUS: Record<string, { value: string; label: string; cls: string }> = {
  NEW:      { value: "PREPARING", label: "بدء التحضير",   cls: "bg-amber-500 hover:bg-amber-600 text-white" },
  PREPARING:{ value: "SHIPPED",   label: "تم الشحن",      cls: "bg-purple-600 hover:bg-purple-700 text-white" },
  SHIPPED:  { value: "DELIVERED", label: "تأكيد التسليم", cls: "bg-green-600 hover:bg-green-700 text-white" },
};

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [updating, setUpdating] = useState<string | null>(null);
  const [password, setPassword] = useState("");

  useEffect(() => {
    const pass = sessionStorage.getItem("admin-password") ?? "";
    setPassword(pass);
    fetchOrders(pass);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

  const fetchOrders = async (pass?: string) => {
    setLoading(true);
    try {
      const activePass = pass ?? password;
      const url = `/api/orders${statusFilter ? `?status=${statusFilter}` : ""}`;
      const res = await fetch(url, { headers: { "x-admin-password": activePass } });
      const data = await res.json();
      setOrders(res.ok ? (data.orders ?? []) : []);
      if (!res.ok) toast.error(data.error ?? "خطأ في تحميل الطلبيات");
    } catch {
      toast.error("خطأ في الاتصال");
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (orderId: string, status: string) => {
    setUpdating(orderId);
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", "x-admin-password": password },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status } : o)));
        toast.success(`✅ ${getStatusLabel(status)}`);
      } else toast.error("فشل تحديث الحالة");
    } finally {
      setUpdating(null);
    }
  };

  const deleteOrder = async (orderId: string, orderNumber: string) => {
    if (!confirm(`حذف الطلبية #${orderNumber}؟`)) return;
    setUpdating(orderId);
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: "DELETE",
        headers: { "x-admin-password": password },
      });
      if (res.ok) {
        setOrders((prev) => prev.filter((o) => o.id !== orderId));
        toast.success("تم الحذف");
      } else toast.error("فشل الحذف");
    } finally {
      setUpdating(null);
    }
  };

  const exportCSV = () => {
    const headers = ["رقم الطلبية","الاسم","الجنس","الهاتف","الولاية","البلدية","التوصيل","المجموع الفرعي","التوصيل","الخصم","الإجمالي","الحالة","التاريخ"].join(",");
    const rows = orders.map((o) =>
      [
        o.orderNumber,
        `${o.firstName} ${o.lastName}`,
        (o as Order & { gender?: string }).gender === "girl" ? "بنت" : (o as Order & { gender?: string }).gender === "boy" ? "ولد" : "",
        o.phone,
        o.wilayaName,
        o.commune,
        o.deliveryType === "home" ? "منزل" : "مكتب بريد",
        o.subtotal,
        o.deliveryFee,
        o.discount,
        o.total,
        getStatusLabel(o.status),
        new Date(o.createdAt).toLocaleDateString("ar-DZ"),
      ].join(",")
    );
    const blob = new Blob(["﻿" + [headers, ...rows].join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `orders-${Date.now()}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  // Stats
  const totalRevenue = orders.filter(o => o.status !== "CANCELLED").reduce((s, o) => s + o.total, 0);
  const newCount = orders.filter(o => o.status === "NEW").length;
  const deliveredCount = orders.filter(o => o.status === "DELIVERED").length;

  return (
    <div className="space-y-5">

      {/* ── Stats ── */}
      {!loading && orders.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white rounded-2xl p-4 border border-gray-100 flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center flex-shrink-0">
              <ShoppingBag className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-gray-400 font-medium">إجمالي الطلبيات</p>
              <p className="text-xl font-black text-gray-900">{orders.length}</p>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-4 border border-gray-100 flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center flex-shrink-0">
              <Clock className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-xs text-gray-400 font-medium">طلبيات جديدة</p>
              <p className="text-xl font-black text-gray-900">{newCount}</p>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-4 border border-gray-100 flex items-center gap-3">
            <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center flex-shrink-0">
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-xs text-gray-400 font-medium">الإيرادات</p>
              <p className="text-lg font-black text-gray-900">{formatPrice(totalRevenue)}</p>
            </div>
          </div>
        </div>
      )}

      {/* ── Filters ── */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex gap-1.5 flex-wrap">
          {STATUSES.map((s) => (
            <button
              key={s.value}
              onClick={() => setStatusFilter(s.value)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                statusFilter === s.value
                  ? "bg-gray-900 text-white shadow-sm"
                  : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => fetchOrders()}
            className="p-2 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
            title="تحديث"
          >
            <RefreshCw className="w-4 h-4 text-gray-500" />
          </button>
          <button
            onClick={exportCSV}
            className="flex items-center gap-1.5 px-3 py-2 bg-emerald-600 text-white rounded-xl text-xs font-semibold hover:bg-emerald-700 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            تصدير CSV
          </button>
        </div>
      </div>

      {!loading && (
        <p className="text-xs text-gray-400">
          {orders.length === 0 ? "لا توجد طلبيات" : `${orders.length} طلبية — ${deliveredCount} مُسلَّمة`}
        </p>
      )}

      {/* ── Orders List ── */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-gray-300">
          <RefreshCw className="w-8 h-8 animate-spin mb-3" />
          <p className="text-sm font-medium">جاري التحميل...</p>
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
          <Package className="w-14 h-14 text-gray-200 mx-auto mb-3" />
          <p className="text-gray-400 font-semibold">لا توجد طلبيات</p>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => {
            const next = NEXT_STATUS[order.status];
            const canCancel = order.status !== "CANCELLED" && order.status !== "DELIVERED";
            const busy = updating === order.id;
            const cfg = STATUS_CONFIG[order.status] ?? { bg: "bg-gray-50", text: "text-gray-600", dot: "bg-gray-400" };
            const gender = (order as Order & { gender?: string }).gender;
            const productNames = order.items?.map((i) => i.product?.name ?? "منتج").join("، ") ?? "";
            const totalQty = order.items?.reduce((s, i) => s + i.quantity, 0) ?? 0;

            return (
              <div
                key={order.id}
                className={`bg-white rounded-2xl border border-gray-100 overflow-hidden transition-opacity shadow-sm hover:shadow-md ${busy ? "opacity-60 pointer-events-none" : ""}`}
              >
                {/* ── Header Bar ── */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-gray-50 bg-gray-50/60">
                  <div className="flex items-center gap-2.5">
                    <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${cfg.bg} ${cfg.text}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                      {getStatusLabel(order.status)}
                    </div>
                    <span className="font-mono text-sm font-bold text-gray-700 flex items-center gap-1">
                      <Hash className="w-3 h-3 text-gray-400" />
                      {order.orderNumber}
                    </span>
                  </div>
                  <span className="text-xs text-gray-400 flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {new Date(order.createdAt).toLocaleDateString("ar-DZ", { day: "numeric", month: "short", year: "numeric" })}
                    {" — "}
                    {new Date(order.createdAt).toLocaleTimeString("ar-DZ", { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>

                <div className="p-4 space-y-3">
                  {/* ── Customer Info + Delivery ── */}
                  <div className="flex items-start justify-between gap-4">
                    {/* Left: customer */}
                    <div className="space-y-1.5 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-black text-gray-900 text-base">
                          {order.firstName} {order.lastName}
                        </p>
                        {gender && (
                          <span className={`text-sm px-2 py-0.5 rounded-full font-semibold ${
                            gender === "girl" ? "bg-pink-50 text-pink-600" : "bg-blue-50 text-blue-600"
                          }`}>
                            {gender === "girl" ? "👧 بنت" : "👦 ولد"}
                          </span>
                        )}
                      </div>
                      <a
                        href={`tel:${order.phone}`}
                        className="flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-700 font-medium w-fit"
                        dir="ltr"
                      >
                        <Phone className="w-3.5 h-3.5" />
                        {order.phone}
                      </a>
                      <div className="flex items-center gap-1.5 text-sm text-gray-500">
                        <MapPin className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                        <span>
                          {order.wilayaName}
                          {order.commune ? <span className="text-gray-400"> / {order.commune}</span> : null}
                        </span>
                      </div>
                      {order.address && (
                        <p className="text-xs text-gray-400 pr-5">{order.address}</p>
                      )}
                    </div>

                    {/* Right: delivery badge */}
                    <div className={`flex flex-col items-center gap-1 px-3 py-2 rounded-2xl flex-shrink-0 ${
                      order.deliveryType === "home" ? "bg-blue-50" : "bg-orange-50"
                    }`}>
                      {order.deliveryType === "home"
                        ? <Home className="w-5 h-5 text-blue-600" />
                        : <Building2 className="w-5 h-5 text-orange-600" />}
                      <span className={`text-xs font-bold ${
                        order.deliveryType === "home" ? "text-blue-700" : "text-orange-700"
                      }`}>
                        {order.deliveryType === "home" ? "للمنزل" : "مكتب البريد"}
                      </span>
                    </div>
                  </div>

                  {/* ── Products ── */}
                  <div className="bg-gray-50 rounded-xl px-3 py-2.5 flex items-center gap-2">
                    <Package className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    <p className="text-sm text-gray-700 flex-1 truncate">{productNames}</p>
                    <span className="text-xs bg-gray-200 text-gray-600 font-bold px-2 py-0.5 rounded-full flex-shrink-0">
                      {totalQty} قطعة
                    </span>
                  </div>

                  {/* ── Price Breakdown ── */}
                  <div className="bg-gray-50 rounded-xl px-3 py-2.5 space-y-1.5">
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>المجموع الفرعي</span>
                      <span className="font-semibold text-gray-700">{formatPrice(order.subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <Truck className="w-3 h-3" /> رسوم التوصيل
                      </span>
                      <span className="font-semibold text-gray-700">{formatPrice(order.deliveryFee)}</span>
                    </div>
                    {(order.discount ?? 0) > 0 && (
                      <div className="flex justify-between text-xs">
                        <span className="text-green-600 flex items-center gap-1">
                          <Tag className="w-3 h-3" />
                          خصم {order.promoCode ? `(${order.promoCode})` : ""}
                        </span>
                        <span className="font-semibold text-green-600">- {formatPrice(order.discount)}</span>
                      </div>
                    )}
                    <div className="border-t border-gray-200 pt-1.5 flex justify-between">
                      <span className="text-sm font-bold text-gray-700">الإجمالي</span>
                      <span className="text-base font-black text-gray-900">{formatPrice(order.total)}</span>
                    </div>
                  </div>

                  {/* ── Notes ── */}
                  {order.notes && (
                    <div className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2">
                      <span className="font-bold">📝 ملاحظة: </span>{order.notes}
                    </div>
                  )}

                  {/* ── Actions ── */}
                  <div className="flex gap-2 pt-1">
                    {next && (
                      <button
                        onClick={() => updateStatus(order.id, next.value)}
                        disabled={busy}
                        className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-colors disabled:opacity-50 ${next.cls}`}
                      >
                        <CheckCircle className="w-4 h-4" />
                        {next.label}
                      </button>
                    )}
                    {canCancel && (
                      <button
                        onClick={() => updateStatus(order.id, "CANCELLED")}
                        disabled={busy}
                        className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-sm font-semibold bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 transition-colors disabled:opacity-50"
                      >
                        <XCircle className="w-4 h-4" />
                        إلغاء
                      </button>
                    )}
                    <button
                      onClick={() => deleteOrder(order.id, order.orderNumber)}
                      disabled={busy}
                      className="p-2.5 rounded-xl text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors disabled:opacity-50"
                      title="حذف نهائي"
                    >
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

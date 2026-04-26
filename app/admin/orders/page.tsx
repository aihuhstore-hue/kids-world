"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import {
  Download,
  RefreshCw,
  Trash2,
  CheckCircle,
  XCircle,
  Phone,
  MapPin,
  Home,
  Building2,
  Package,
  Tag,
  Clock,
  User,
  LayoutList,
  LayoutGrid,
  ChevronDown,
} from "lucide-react";
import { formatPrice, getStatusLabel } from "@/lib/utils";
import toast from "react-hot-toast";
import type { Order } from "@/types";

const STATUSES = [
  { value: "", label: "الكل", color: "bg-gray-900 text-white" },
  { value: "NEW", label: "جديد", color: "bg-blue-600 text-white" },
  { value: "PREPARING", label: "قيد التحضير", color: "bg-yellow-500 text-white" },
  { value: "SHIPPED", label: "تم الشحن", color: "bg-purple-600 text-white" },
  { value: "DELIVERED", label: "مُسلَّم", color: "bg-green-600 text-white" },
  { value: "CANCELLED", label: "ملغى", color: "bg-red-500 text-white" },
];

const STATUS_STYLES: Record<string, string> = {
  NEW: "bg-blue-50 text-blue-700 border border-blue-200",
  PREPARING: "bg-yellow-50 text-yellow-700 border border-yellow-200",
  SHIPPED: "bg-purple-50 text-purple-700 border border-purple-200",
  DELIVERED: "bg-green-50 text-green-700 border border-green-200",
  CANCELLED: "bg-red-50 text-red-600 border border-red-200",
};

const STATUS_DOT: Record<string, string> = {
  NEW: "bg-blue-500",
  PREPARING: "bg-yellow-500",
  SHIPPED: "bg-purple-500",
  DELIVERED: "bg-green-500",
  CANCELLED: "bg-red-500",
};

const NEXT_STATUS: Record<string, { value: string; label: string; style: string }> = {
  NEW: { value: "PREPARING", label: "تأكيد", style: "bg-yellow-500 hover:bg-yellow-600 text-white" },
  PREPARING: { value: "SHIPPED", label: "شحن", style: "bg-purple-600 hover:bg-purple-700 text-white" },
  SHIPPED: { value: "DELIVERED", label: "تسليم", style: "bg-green-600 hover:bg-green-700 text-white" },
};

function getProductImages(product: { images: string } | undefined): string[] {
  if (!product?.images) return [];
  try { return JSON.parse(product.images); } catch { return []; }
}

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [updating, setUpdating] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [viewMode, setViewMode] = useState<"compact" | "full">("compact");
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

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
      if (!res.ok) {
        toast.error(data.error ?? "خطأ في تحميل الطلبيات");
        setOrders([]);
      } else {
        setOrders(data.orders ?? []);
      }
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
        toast.success(`تم التحديث: ${getStatusLabel(status)}`);
      } else {
        toast.error("فشل تحديث الحالة");
      }
    } finally {
      setUpdating(null);
    }
  };

  const deleteOrder = async (orderId: string, orderNumber: string) => {
    if (!confirm(`هل أنت متأكد من حذف الطلبية ${orderNumber}؟\nلا يمكن التراجع عن هذا الإجراء.`)) return;
    setUpdating(orderId);
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: "DELETE",
        headers: { "x-admin-password": password },
      });
      if (res.ok) {
        setOrders((prev) => prev.filter((o) => o.id !== orderId));
        toast.success("تم حذف الطلبية");
      } else {
        toast.error("فشل حذف الطلبية");
      }
    } finally {
      setUpdating(null);
    }
  };

  const exportCSV = () => {
    const headers = [
      "رقم الطلبية", "الاسم", "الهاتف", "الولاية", "البلدية",
      "التوصيل", "المجموع الفرعي", "الخصم", "التوصيل", "الإجمالي", "كود الخصم", "الحالة", "التاريخ",
    ].join(",");
    const rows = orders.map((o) =>
      [
        o.orderNumber,
        `${o.firstName} ${o.lastName}`,
        o.phone,
        o.wilayaName,
        o.commune,
        o.deliveryType === "home" ? "منزل" : "مكتب",
        o.subtotal,
        o.discount ?? 0,
        o.deliveryFee,
        o.total,
        o.promoCode ?? "",
        getStatusLabel(o.status),
        new Date(o.createdAt).toLocaleDateString("ar-DZ"),
      ].join(",")
    );
    const csv = [headers, ...rows].join("\n");
    const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `orders-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const toggleExpand = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  return (
    <div>
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <div className="flex flex-wrap gap-1.5">
          {STATUSES.map((s) => (
            <button
              key={s.value}
              onClick={() => setStatusFilter(s.value)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                statusFilter === s.value
                  ? s.color
                  : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
        <div className="mr-auto flex gap-2 items-center">
          {/* View toggle */}
          <div className="flex items-center bg-white border border-gray-200 rounded-xl overflow-hidden">
            <button
              onClick={() => setViewMode("compact")}
              title="عرض مضغوط"
              className={`px-3 py-2 transition-colors ${viewMode === "compact" ? "bg-gray-900 text-white" : "text-gray-500 hover:bg-gray-50"}`}
            >
              <LayoutList className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode("full")}
              title="عرض كامل"
              className={`px-3 py-2 transition-colors ${viewMode === "full" ? "bg-gray-900 text-white" : "text-gray-500 hover:bg-gray-50"}`}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>
          <button
            onClick={() => fetchOrders()}
            className="p-2 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
            title="تحديث"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={exportCSV}
            className="flex items-center gap-1.5 px-3 py-2 bg-green-600 text-white rounded-xl text-xs font-semibold hover:bg-green-700 transition-colors"
          >
            <Download className="w-4 h-4" />
            CSV
          </button>
        </div>
      </div>

      {!loading && (
        <p className="text-xs text-gray-400 mb-3">
          {orders.length === 0 ? "لا توجد طلبيات" : `${orders.length} طلبية`}
        </p>
      )}

      {/* Orders */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-16 text-gray-400">
          <RefreshCw className="w-8 h-8 animate-spin mb-3 text-gray-300" />
          <p>جاري التحميل...</p>
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
          <Package className="w-12 h-12 text-gray-200 mx-auto mb-3" />
          <p className="text-gray-400 font-medium">لا توجد طلبيات في هذه الفئة</p>
        </div>
      ) : viewMode === "compact" ? (
        /* ── Compact View ── */
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {orders.map((order, idx) => {
            const nextStatus = NEXT_STATUS[order.status];
            const canCancel = order.status !== "CANCELLED" && order.status !== "DELIVERED";
            const isExpanded = expanded.has(order.id);
            const isUpdating = updating === order.id;

            return (
              <div key={order.id} className={idx !== 0 ? "border-t border-gray-100" : ""}>
                {/* Row */}
                <div className={`flex items-center gap-2 px-4 py-3 transition-colors ${isUpdating ? "opacity-60" : "hover:bg-gray-50"}`}>
                  {/* Status dot + badge */}
                  <div className="flex items-center gap-2 flex-shrink-0 w-28">
                    <span className={`w-2 h-2 rounded-full flex-shrink-0 ${STATUS_DOT[order.status] ?? "bg-gray-400"}`} />
                    <span className={`text-xs px-2 py-0.5 rounded-full font-semibold whitespace-nowrap ${STATUS_STYLES[order.status] ?? "bg-gray-100 text-gray-600"}`}>
                      {getStatusLabel(order.status)}
                    </span>
                  </div>

                  {/* Order # */}
                  <span className="font-mono font-bold text-xs text-gray-500 flex-shrink-0 w-16 truncate">
                    #{order.orderNumber}
                  </span>

                  {/* Customer */}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-gray-900 truncate">
                      {order.firstName} {order.lastName}
                    </p>
                    <p className="text-xs text-gray-400 truncate" dir="ltr">
                      {order.phone} • {order.wilayaName}
                    </p>
                  </div>

                  {/* Delivery type */}
                  <div className={`hidden sm:flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-lg flex-shrink-0 ${
                    order.deliveryType === "home" ? "bg-blue-50 text-blue-600" : "bg-orange-50 text-orange-600"
                  }`}>
                    {order.deliveryType === "home" ? <Home className="w-3 h-3" /> : <Building2 className="w-3 h-3" />}
                    <span className="hidden md:inline">{order.deliveryType === "home" ? "منزل" : "مكتب"}</span>
                  </div>

                  {/* Items count */}
                  <span className="hidden md:block text-xs text-gray-400 flex-shrink-0 w-14 text-center">
                    {order.items?.length ?? 0} منتج
                  </span>

                  {/* Price */}
                  <span className="font-bold text-sm text-gray-900 flex-shrink-0 w-20 text-left" dir="ltr">
                    {formatPrice(order.total)}
                  </span>

                  {/* Actions */}
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    {nextStatus && (
                      <button
                        onClick={() => updateStatus(order.id, nextStatus.value)}
                        disabled={isUpdating}
                        className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors disabled:opacity-50 ${nextStatus.style}`}
                      >
                        <CheckCircle className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">{nextStatus.label}</span>
                      </button>
                    )}
                    {canCancel && (
                      <button
                        onClick={() => updateStatus(order.id, "CANCELLED")}
                        disabled={isUpdating}
                        className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 transition-colors disabled:opacity-50"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">إلغاء</span>
                      </button>
                    )}
                    <button
                      onClick={() => toggleExpand(order.id)}
                      className={`p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 transition-colors ${isExpanded ? "bg-gray-100 text-gray-600" : ""}`}
                      title="تفاصيل"
                    >
                      <ChevronDown className={`w-4 h-4 transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                    </button>
                    <button
                      onClick={() => deleteOrder(order.id, order.orderNumber)}
                      disabled={isUpdating}
                      className="p-1.5 rounded-lg text-gray-300 hover:bg-red-50 hover:text-red-500 transition-colors disabled:opacity-50"
                      title="حذف"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Expandable details */}
                {isExpanded && (
                  <div className="border-t border-dashed border-gray-100 bg-gray-50 px-4 py-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {/* Customer info */}
                    <div className="space-y-2">
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5" /> معلومات الزبون
                      </p>
                      <a href={`tel:${order.phone}`} className="flex items-center gap-2 text-sm text-blue-600 font-medium" dir="ltr">
                        <Phone className="w-4 h-4 flex-shrink-0" />{order.phone}
                      </a>
                      <div className="flex items-start gap-2 text-sm text-gray-600">
                        <MapPin className="w-4 h-4 flex-shrink-0 mt-0.5 text-gray-400" />
                        <div>
                          <p className="font-medium">{order.wilayaName}</p>
                          {order.commune && <p className="text-gray-500 text-xs">{order.commune}</p>}
                          {order.address && <p className="text-gray-500 text-xs">{order.address}</p>}
                        </div>
                      </div>
                      {order.notes && (
                        <div className="bg-amber-50 border border-amber-200 rounded-xl px-3 py-2 text-xs text-amber-800">
                          <span className="font-bold">ملاحظة: </span>{order.notes}
                        </div>
                      )}
                      <p className="text-xs text-gray-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(order.createdAt).toLocaleString("ar-DZ", {
                          year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
                        })}
                      </p>
                    </div>

                    {/* Products */}
                    <div className="space-y-2">
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                        <Package className="w-3.5 h-3.5" /> المنتجات ({order.items?.length ?? 0})
                      </p>
                      <div className="space-y-1.5">
                        {order.items?.map((item) => {
                          const imgs = getProductImages(item.product);
                          return (
                            <div key={item.id} className="flex items-center gap-2 bg-white rounded-xl p-2 border border-gray-100">
                              <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                                {imgs[0] ? (
                                  <Image src={imgs[0]} alt={item.product?.name ?? ""} width={40} height={40} className="w-full h-full object-cover" />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center"><Package className="w-4 h-4 text-gray-300" /></div>
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-semibold text-gray-800 truncate">{item.product?.name ?? "منتج محذوف"}</p>
                                <p className="text-xs text-gray-500">{item.quantity} × {formatPrice(item.price)}</p>
                              </div>
                              <p className="text-xs font-bold text-gray-900 flex-shrink-0">{formatPrice(item.price * item.quantity)}</p>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Pricing */}
                    <div className="space-y-2">
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">الفاتورة</p>
                      <div className="bg-white rounded-xl p-3 border border-gray-100 space-y-2 text-sm">
                        <div className="flex justify-between text-gray-600">
                          <span>المجموع الفرعي</span>
                          <span className="font-medium">{formatPrice(order.subtotal)}</span>
                        </div>
                        {(order.discount ?? 0) > 0 && (
                          <div className="flex justify-between text-green-600">
                            <span className="flex items-center gap-1"><Tag className="w-3 h-3" /> خصم ({order.promoCode})</span>
                            <span className="font-medium">-{formatPrice(order.discount)}</span>
                          </div>
                        )}
                        <div className="flex justify-between text-gray-600">
                          <span>التوصيل</span>
                          <span className="font-medium">{formatPrice(order.deliveryFee)}</span>
                        </div>
                        <div className="h-px bg-gray-100" />
                        <div className="flex justify-between font-black text-gray-900">
                          <span>الإجمالي</span>
                          <span className="text-green-700">{formatPrice(order.total)}</span>
                        </div>
                      </div>
                      {/* Status selector */}
                      <div className="relative">
                        <select
                          value={order.status}
                          disabled={isUpdating}
                          onChange={(e) => updateStatus(order.id, e.target.value)}
                          className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:border-blue-400 disabled:opacity-50 appearance-none bg-white cursor-pointer"
                        >
                          <option value="NEW">جديد</option>
                          <option value="PREPARING">قيد التحضير</option>
                          <option value="SHIPPED">تم الشحن</option>
                          <option value="DELIVERED">مُسلَّم</option>
                          <option value="CANCELLED">ملغى</option>
                        </select>
                        <ChevronDown className="w-4 h-4 absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        /* ── Full Card View ── */
        <div className="space-y-4">
          {orders.map((order) => {
            const nextStatus = NEXT_STATUS[order.status];
            const hasDiscount = (order.discount ?? 0) > 0;
            const isUpdating = updating === order.id;

            return (
              <div
                key={order.id}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
              >
                {/* Header */}
                <div className="flex items-center justify-between px-5 py-3 bg-gray-50 border-b border-gray-100">
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-black text-gray-800 text-sm">#{order.orderNumber}</span>
                    <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${STATUS_STYLES[order.status] ?? "bg-gray-100 text-gray-600"}`}>
                      {getStatusLabel(order.status)}
                    </span>
                    {hasDiscount && (
                      <span className="text-xs px-2 py-0.5 bg-green-100 text-green-700 rounded-full flex items-center gap-1">
                        <Tag className="w-3 h-3" />{order.promoCode}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-gray-400">
                    <Clock className="w-3.5 h-3.5" />
                    {new Date(order.createdAt).toLocaleString("ar-DZ", {
                      year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
                    })}
                  </div>
                </div>

                <div className="p-5 grid grid-cols-1 lg:grid-cols-3 gap-5">
                  {/* Customer Info */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5" /> معلومات الزبون
                    </h4>
                    <p className="font-bold text-gray-900 text-base">{order.firstName} {order.lastName}</p>
                    <a href={`tel:${order.phone}`} className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 font-medium" dir="ltr">
                      <Phone className="w-4 h-4 flex-shrink-0" />{order.phone}
                    </a>
                    <div className="flex items-start gap-2 text-sm text-gray-600">
                      <MapPin className="w-4 h-4 flex-shrink-0 mt-0.5 text-gray-400" />
                      <div>
                        <p className="font-medium">{order.wilayaName}</p>
                        {order.commune && <p className="text-gray-500">{order.commune}</p>}
                        {order.address && <p className="text-gray-500 text-xs mt-0.5">{order.address}</p>}
                      </div>
                    </div>
                    <div className={`flex items-center gap-2 text-sm font-medium px-3 py-1.5 rounded-xl w-fit ${
                      order.deliveryType === "home" ? "bg-blue-50 text-blue-700" : "bg-orange-50 text-orange-700"
                    }`}>
                      {order.deliveryType === "home" ? <Home className="w-4 h-4" /> : <Building2 className="w-4 h-4" />}
                      {order.deliveryType === "home" ? "توصيل للمنزل" : "مكتب البريد"}
                    </div>
                    {order.notes && (
                      <div className="bg-amber-50 border border-amber-200 rounded-xl px-3 py-2 text-xs text-amber-800">
                        <span className="font-bold">ملاحظة: </span>{order.notes}
                      </div>
                    )}
                  </div>

                  {/* Order Items */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Package className="w-3.5 h-3.5" /> المنتجات ({order.items?.length ?? 0})
                    </h4>
                    <div className="space-y-2">
                      {order.items?.map((item) => {
                        const imgs = getProductImages(item.product);
                        return (
                          <div key={item.id} className="flex items-center gap-3 p-2.5 bg-gray-50 rounded-xl">
                            <div className="w-14 h-14 rounded-xl overflow-hidden bg-white border border-gray-200 flex-shrink-0">
                              {imgs[0] ? (
                                <Image src={imgs[0]} alt={item.product?.name ?? "منتج"} width={56} height={56} className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-300"><Package className="w-6 h-6" /></div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold text-gray-800 truncate">{item.product?.name ?? "منتج محذوف"}</p>
                              <p className="text-xs text-gray-500">الكمية: {item.quantity} × {formatPrice(item.price)}</p>
                            </div>
                            <p className="text-sm font-bold text-gray-900 flex-shrink-0">{formatPrice(item.price * item.quantity)}</p>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Pricing + Actions */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">الفاتورة والإجراءات</h4>
                    <div className="bg-gray-50 rounded-xl p-3 space-y-2 text-sm">
                      <div className="flex justify-between text-gray-600">
                        <span>المجموع الفرعي</span>
                        <span className="font-medium">{formatPrice(order.subtotal)}</span>
                      </div>
                      {hasDiscount && (
                        <div className="flex justify-between text-green-600">
                          <span className="flex items-center gap-1"><Tag className="w-3 h-3" /> خصم ({order.promoCode})</span>
                          <span className="font-medium">-{formatPrice(order.discount)}</span>
                        </div>
                      )}
                      <div className="flex justify-between text-gray-600">
                        <span>التوصيل</span>
                        <span className="font-medium">{formatPrice(order.deliveryFee)}</span>
                      </div>
                      <div className="h-px bg-gray-200" />
                      <div className="flex justify-between font-black text-gray-900 text-base">
                        <span>الإجمالي</span>
                        <span className="text-green-700">{formatPrice(order.total)}</span>
                      </div>
                    </div>
                    <div className="relative">
                      <select
                        value={order.status}
                        disabled={isUpdating}
                        onChange={(e) => updateStatus(order.id, e.target.value)}
                        className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2 pr-8 focus:outline-none focus:border-blue-400 disabled:opacity-50 appearance-none bg-white cursor-pointer"
                      >
                        <option value="NEW">جديد</option>
                        <option value="PREPARING">قيد التحضير</option>
                        <option value="SHIPPED">تم الشحن</option>
                        <option value="DELIVERED">مُسلَّم</option>
                        <option value="CANCELLED">ملغى</option>
                      </select>
                      <ChevronDown className="w-4 h-4 absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                    </div>
                    <div className="flex flex-col gap-2">
                      {nextStatus && (
                        <button
                          onClick={() => updateStatus(order.id, nextStatus.value)}
                          disabled={isUpdating}
                          className={`flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-sm font-semibold transition-colors disabled:opacity-50 ${nextStatus.style}`}
                        >
                          <CheckCircle className="w-4 h-4" />
                          {nextStatus.label}
                        </button>
                      )}
                      {order.status !== "CANCELLED" && order.status !== "DELIVERED" && (
                        <button
                          onClick={() => updateStatus(order.id, "CANCELLED")}
                          disabled={isUpdating}
                          className="flex items-center justify-center gap-2 w-full py-2 rounded-xl text-sm font-medium transition-colors disabled:opacity-50 bg-red-50 text-red-600 hover:bg-red-100 border border-red-200"
                        >
                          <XCircle className="w-4 h-4" />
                          إلغاء الطلبية
                        </button>
                      )}
                      <button
                        onClick={() => deleteOrder(order.id, order.orderNumber)}
                        disabled={isUpdating}
                        className="flex items-center justify-center gap-2 w-full py-2 rounded-xl text-xs font-medium transition-colors disabled:opacity-50 bg-gray-100 text-gray-500 hover:bg-red-50 hover:text-red-500"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        حذف الطلبية
                      </button>
                    </div>
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

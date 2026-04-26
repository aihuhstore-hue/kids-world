"use client";

import { useEffect, useState } from "react";
import {
  Download,
  RefreshCw,
  Trash2,
  CheckCircle,
  XCircle,
  Phone,
  Home,
  Building2,
  Package,
  Tag,
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
  NEW: "bg-blue-100 text-blue-700",
  PREPARING: "bg-yellow-100 text-yellow-700",
  SHIPPED: "bg-purple-100 text-purple-700",
  DELIVERED: "bg-green-100 text-green-700",
  CANCELLED: "bg-red-100 text-red-600",
};

const NEXT_STATUS: Record<string, { value: string; label: string; cls: string }> = {
  NEW: { value: "PREPARING", label: "تأكيد الطلبية", cls: "bg-blue-600 hover:bg-blue-700 text-white" },
  PREPARING: { value: "SHIPPED", label: "تم الشحن", cls: "bg-purple-600 hover:bg-purple-700 text-white" },
  SHIPPED: { value: "DELIVERED", label: "تأكيد التسليم", cls: "bg-green-600 hover:bg-green-700 text-white" },
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
        toast.success(`تم التحديث: ${getStatusLabel(status)}`);
      } else {
        toast.error("فشل تحديث الحالة");
      }
    } finally {
      setUpdating(null);
    }
  };

  const deleteOrder = async (orderId: string, orderNumber: string) => {
    if (!confirm(`حذف الطلبية ${orderNumber}؟`)) return;
    setUpdating(orderId);
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: "DELETE",
        headers: { "x-admin-password": password },
      });
      if (res.ok) {
        setOrders((prev) => prev.filter((o) => o.id !== orderId));
        toast.success("تم الحذف");
      } else {
        toast.error("فشل الحذف");
      }
    } finally {
      setUpdating(null);
    }
  };

  const exportCSV = () => {
    const headers = ["رقم الطلبية","الاسم","الهاتف","الولاية","البلدية","التوصيل","الإجمالي","الحالة","التاريخ"].join(",");
    const rows = orders.map((o) =>
      [
        o.orderNumber,
        `${o.firstName} ${o.lastName}`,
        o.phone,
        o.wilayaName,
        o.commune,
        o.deliveryType === "home" ? "منزل" : "مكتب",
        o.total,
        getStatusLabel(o.status),
        new Date(o.createdAt).toLocaleDateString("ar-DZ"),
      ].join(",")
    );
    const blob = new Blob(["﻿" + [headers, ...rows].join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `orders-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      {/* فلاتر الحالة */}
      <div className="flex flex-wrap gap-1.5 mb-4">
        {STATUSES.map((s) => (
          <button
            key={s.value}
            onClick={() => setStatusFilter(s.value)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              statusFilter === s.value ? s.color : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
            }`}
          >
            {s.label}
          </button>
        ))}
        <div className="mr-auto flex gap-2">
          <button
            onClick={() => fetchOrders()}
            className="p-2 bg-white border border-gray-200 rounded-xl hover:bg-gray-50"
            title="تحديث"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={exportCSV}
            className="flex items-center gap-1.5 px-3 py-2 bg-green-600 text-white rounded-xl text-xs font-semibold hover:bg-green-700"
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

      {/* قائمة الطلبيات */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-16 text-gray-400">
          <RefreshCw className="w-8 h-8 animate-spin mb-3 text-gray-300" />
          <p>جاري التحميل...</p>
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
          <Package className="w-12 h-12 text-gray-200 mx-auto mb-3" />
          <p className="text-gray-400 font-medium">لا توجد طلبيات</p>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => {
            const next = NEXT_STATUS[order.status];
            const canCancel = order.status !== "CANCELLED" && order.status !== "DELIVERED";
            const busy = updating === order.id;
            const productNames = order.items
              ?.map((i) => i.product?.name ?? "منتج")
              .join("، ") ?? "";

            return (
              <div
                key={order.id}
                className={`bg-white rounded-2xl border border-gray-100 p-4 space-y-3 transition-opacity ${busy ? "opacity-60" : ""}`}
              >
                {/* الرأس: حالة + رقم + تاريخ */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${STATUS_STYLES[order.status] ?? "bg-gray-100 text-gray-600"}`}>
                      {getStatusLabel(order.status)}
                    </span>
                    <span className="font-mono text-sm font-bold text-gray-700">#{order.orderNumber}</span>
                  </div>
                  <span className="text-xs text-gray-400">
                    {new Date(order.createdAt).toLocaleDateString("ar-DZ", { day: "numeric", month: "short", year: "numeric" })}
                  </span>
                </div>

                {/* معلومات الزبون */}
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <p className="font-bold text-gray-900">{order.firstName} {order.lastName}</p>
                    <a href={`tel:${order.phone}`} className="flex items-center gap-1.5 text-sm text-blue-600" dir="ltr">
                      <Phone className="w-3.5 h-3.5" />{order.phone}
                    </a>
                    <p className="text-sm text-gray-500">{order.wilayaName}{order.commune ? ` — ${order.commune}` : ""}</p>
                  </div>
                  <div className={`flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-xl flex-shrink-0 ${
                    order.deliveryType === "home" ? "bg-blue-50 text-blue-700" : "bg-orange-50 text-orange-700"
                  }`}>
                    {order.deliveryType === "home" ? <Home className="w-3.5 h-3.5" /> : <Building2 className="w-3.5 h-3.5" />}
                    {order.deliveryType === "home" ? "منزل" : "مكتب"}
                  </div>
                </div>

                {/* المنتجات والسعر */}
                <div className="bg-gray-50 rounded-xl px-3 py-2.5 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <Package className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    <p className="text-sm text-gray-700 truncate">{productNames}</p>
                  </div>
                  <div className="flex-shrink-0 text-right">
                    <p className="font-black text-gray-900">{formatPrice(order.total)}</p>
                    {(order.discount ?? 0) > 0 && (
                      <p className="text-xs text-green-600 flex items-center gap-1">
                        <Tag className="w-3 h-3" />{order.promoCode}
                      </p>
                    )}
                  </div>
                </div>

                {order.notes && (
                  <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2">
                    <span className="font-bold">ملاحظة: </span>{order.notes}
                  </p>
                )}

                {/* أزرار الإجراءات */}
                <div className="flex gap-2 pt-1">
                  {next && (
                    <button
                      onClick={() => updateStatus(order.id, next.value)}
                      disabled={busy}
                      className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-sm font-semibold transition-colors disabled:opacity-50 ${next.cls}`}
                    >
                      <CheckCircle className="w-4 h-4" />
                      {next.label}
                    </button>
                  )}
                  {canCancel && (
                    <button
                      onClick={() => updateStatus(order.id, "CANCELLED")}
                      disabled={busy}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 transition-colors disabled:opacity-50"
                    >
                      <XCircle className="w-4 h-4" />
                      إلغاء
                    </button>
                  )}
                  <button
                    onClick={() => deleteOrder(order.id, order.orderNumber)}
                    disabled={busy}
                    className="p-2 rounded-xl text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors disabled:opacity-50"
                    title="حذف"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

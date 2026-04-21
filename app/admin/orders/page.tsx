"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import {
  Download,
  RefreshCw,
  Trash2,
  CheckCircle,
  XCircle,
  ChevronDown,
  Phone,
  MapPin,
  Home,
  Building2,
  Package,
  Tag,
  Clock,
  User,
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

const NEXT_STATUS: Record<string, { value: string; label: string; style: string }> = {
  NEW: { value: "PREPARING", label: "تأكيد الطلب", style: "bg-yellow-500 hover:bg-yellow-600 text-white" },
  PREPARING: { value: "SHIPPED", label: "تم الشحن", style: "bg-purple-600 hover:bg-purple-700 text-white" },
  SHIPPED: { value: "DELIVERED", label: "تأكيد التسليم", style: "bg-green-600 hover:bg-green-700 text-white" },
};

function getProductImages(product: { images: string } | undefined): string[] {
  if (!product?.images) return [];
  try {
    return JSON.parse(product.images);
  } catch {
    return [];
  }
}

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
      const res = await fetch(url, {
        headers: { "x-admin-password": activePass },
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "خطأ في تحميل الطلبات");
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
        headers: {
          "Content-Type": "application/json",
          "x-admin-password": password,
        },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        setOrders((prev) =>
          prev.map((o) => (o.id === orderId ? { ...o, status } : o))
        );
        toast.success(`تم التحديث: ${getStatusLabel(status)}`);
      } else {
        toast.error("فشل تحديث الحالة");
      }
    } finally {
      setUpdating(null);
    }
  };

  const deleteOrder = async (orderId: string, orderNumber: string) => {
    if (
      !confirm(
        `هل أنت متأكد من حذف الطلب ${orderNumber}؟\nلا يمكن التراجع عن هذا الإجراء.`
      )
    )
      return;

    setUpdating(orderId);
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: "DELETE",
        headers: { "x-admin-password": password },
      });
      if (res.ok) {
        setOrders((prev) => prev.filter((o) => o.id !== orderId));
        toast.success("تم حذف الطلب");
      } else {
        toast.error("فشل حذف الطلب");
      }
    } finally {
      setUpdating(null);
    }
  };

  const exportCSV = () => {
    const headers = [
      "رقم الطلب", "الاسم", "الهاتف", "الولاية", "البلدية",
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
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `orders-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2 mb-6">
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
        <div className="mr-auto flex gap-2">
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
        <p className="text-xs text-gray-400 mb-4">
          {orders.length === 0 ? "لا توجد طلبات" : `${orders.length} طلب`}
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
          <p className="text-gray-400 font-medium">لا توجد طلبات في هذه الفئة</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const nextStatus = NEXT_STATUS[order.status];
            const hasDiscount = (order.discount ?? 0) > 0;

            return (
              <div
                key={order.id}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
              >
                {/* ── Header Bar ── */}
                <div className="flex items-center justify-between px-5 py-3 bg-gray-50 border-b border-gray-100">
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-black text-gray-800 text-sm">
                      #{order.orderNumber}
                    </span>
                    <span
                      className={`text-xs px-2.5 py-1 rounded-full font-semibold ${
                        STATUS_STYLES[order.status] ?? "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {getStatusLabel(order.status)}
                    </span>
                    {hasDiscount && (
                      <span className="text-xs px-2 py-0.5 bg-green-100 text-green-700 rounded-full flex items-center gap-1">
                        <Tag className="w-3 h-3" />
                        {order.promoCode}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-gray-400">
                    <Clock className="w-3.5 h-3.5" />
                    {new Date(order.createdAt).toLocaleString("ar-DZ", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                </div>

                <div className="p-5 grid grid-cols-1 lg:grid-cols-3 gap-5">
                  {/* ── Customer Info ── */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5" />
                      معلومات الزبون
                    </h4>

                    <div className="space-y-2">
                      <p className="font-bold text-gray-900 text-base">
                        {order.firstName} {order.lastName}
                      </p>

                      <a
                        href={`tel:${order.phone}`}
                        className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 font-medium"
                        dir="ltr"
                      >
                        <Phone className="w-4 h-4 flex-shrink-0" />
                        {order.phone}
                      </a>

                      <div className="flex items-start gap-2 text-sm text-gray-600">
                        <MapPin className="w-4 h-4 flex-shrink-0 mt-0.5 text-gray-400" />
                        <div>
                          <p className="font-medium">{order.wilayaName}</p>
                          <p className="text-gray-500">{order.commune}</p>
                          <p className="text-gray-500 text-xs mt-0.5">{order.address}</p>
                        </div>
                      </div>

                      <div
                        className={`flex items-center gap-2 text-sm font-medium px-3 py-1.5 rounded-xl w-fit ${
                          order.deliveryType === "home"
                            ? "bg-blue-50 text-blue-700"
                            : "bg-orange-50 text-orange-700"
                        }`}
                      >
                        {order.deliveryType === "home" ? (
                          <Home className="w-4 h-4" />
                        ) : (
                          <Building2 className="w-4 h-4" />
                        )}
                        {order.deliveryType === "home"
                          ? "توصيل للمنزل"
                          : "مكتب البريد"}
                      </div>

                      {order.notes && (
                        <div className="bg-amber-50 border border-amber-200 rounded-xl px-3 py-2 text-xs text-amber-800">
                          <span className="font-bold">ملاحظة: </span>
                          {order.notes}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* ── Order Items ── */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Package className="w-3.5 h-3.5" />
                      المنتجات ({order.items?.length ?? 0})
                    </h4>

                    <div className="space-y-2">
                      {order.items?.map((item) => {
                        const imgs = getProductImages(item.product);
                        const img = imgs[0] ?? null;
                        return (
                          <div
                            key={item.id}
                            className="flex items-center gap-3 p-2.5 bg-gray-50 rounded-xl"
                          >
                            {/* Product Image */}
                            <div className="w-14 h-14 rounded-xl overflow-hidden bg-white border border-gray-200 flex-shrink-0">
                              {img ? (
                                <Image
                                  src={img}
                                  alt={item.product?.name ?? "منتج"}
                                  width={56}
                                  height={56}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-300">
                                  <Package className="w-6 h-6" />
                                </div>
                              )}
                            </div>

                            {/* Info */}
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold text-gray-800 truncate">
                                {item.product?.name ?? "منتج محذوف"}
                              </p>
                              <p className="text-xs text-gray-500">
                                الكمية: {item.quantity} × {formatPrice(item.price)}
                              </p>
                            </div>

                            {/* Subtotal */}
                            <p className="text-sm font-bold text-gray-900 flex-shrink-0">
                              {formatPrice(item.price * item.quantity)}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* ── Pricing + Actions ── */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                      الفاتورة والإجراءات
                    </h4>

                    {/* Pricing breakdown */}
                    <div className="bg-gray-50 rounded-xl p-3 space-y-2 text-sm">
                      <div className="flex justify-between text-gray-600">
                        <span>المجموع الفرعي</span>
                        <span className="font-medium">{formatPrice(order.subtotal)}</span>
                      </div>
                      {hasDiscount && (
                        <div className="flex justify-between text-green-600">
                          <span className="flex items-center gap-1">
                            <Tag className="w-3 h-3" />
                            خصم ({order.promoCode})
                          </span>
                          <span className="font-medium">
                            -{formatPrice(order.discount)}
                          </span>
                        </div>
                      )}
                      <div className="flex justify-between text-gray-600">
                        <span>التوصيل</span>
                        <span className="font-medium">
                          {formatPrice(order.deliveryFee)}
                        </span>
                      </div>
                      <div className="h-px bg-gray-200" />
                      <div className="flex justify-between font-black text-gray-900 text-base">
                        <span>الإجمالي</span>
                        <span className="text-green-700">{formatPrice(order.total)}</span>
                      </div>
                    </div>

                    {/* Status change dropdown */}
                    <div className="relative">
                      <select
                        value={order.status}
                        disabled={updating === order.id}
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

                    {/* Quick action buttons */}
                    <div className="flex flex-col gap-2">
                      {nextStatus && (
                        <button
                          onClick={() => updateStatus(order.id, nextStatus.value)}
                          disabled={updating === order.id}
                          className={`flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-sm font-semibold transition-colors disabled:opacity-50 ${nextStatus.style}`}
                        >
                          <CheckCircle className="w-4 h-4" />
                          {nextStatus.label}
                        </button>
                      )}

                      {order.status !== "CANCELLED" &&
                        order.status !== "DELIVERED" && (
                          <button
                            onClick={() =>
                              updateStatus(order.id, "CANCELLED")
                            }
                            disabled={updating === order.id}
                            className="flex items-center justify-center gap-2 w-full py-2 rounded-xl text-sm font-medium transition-colors disabled:opacity-50 bg-red-50 text-red-600 hover:bg-red-100 border border-red-200"
                          >
                            <XCircle className="w-4 h-4" />
                            إلغاء الطلب
                          </button>
                        )}

                      <button
                        onClick={() =>
                          deleteOrder(order.id, order.orderNumber)
                        }
                        disabled={updating === order.id}
                        className="flex items-center justify-center gap-2 w-full py-2 rounded-xl text-xs font-medium transition-colors disabled:opacity-50 bg-gray-100 text-gray-500 hover:bg-red-50 hover:text-red-500"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        حذف الطلب
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

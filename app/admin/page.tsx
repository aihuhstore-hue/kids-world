"use client";

import { useEffect, useState } from "react";
import { ShoppingBag, Package, DollarSign, Bell } from "lucide-react";
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
    fetch("/api/admin", {
      headers: { "x-admin-password": password },
    })
      .then((r) => r.json())
      .then(setStats)
      .catch(console.error);
  }, []);

  const cards = [
    {
      label: "إجمالي الطلبات",
      value: stats?.totalOrders ?? "—",
      icon: ShoppingBag,
      color: "bg-blue-100 text-blue-600",
    },
    {
      label: "طلبات جديدة",
      value: stats?.newOrders ?? "—",
      icon: Bell,
      color: "bg-red-100 text-red-600",
    },
    {
      label: "المنتجات النشطة",
      value: stats?.totalProducts ?? "—",
      icon: Package,
      color: "bg-green-100 text-green-600",
    },
    {
      label: "الإيرادات",
      value: stats ? formatPrice(stats.revenue) : "—",
      icon: DollarSign,
      color: "bg-yellow-100 text-yellow-600",
    },
  ];

  return (
    <div>
      <h2 className="text-xl font-bold text-gray-800 mb-6">
        مرحباً بك في لوحة التحكم 👋
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {cards.map((card) => (
          <div key={card.label} className="bg-white rounded-2xl p-5 shadow-sm">
            <div className={`w-10 h-10 ${card.color} rounded-xl flex items-center justify-center mb-3`}>
              <card.icon className="w-5 h-5" />
            </div>
            <p className="text-2xl font-black text-gray-800">{card.value}</p>
            <p className="text-gray-500 text-sm mt-0.5">{card.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <h3 className="font-bold text-gray-800 mb-3">روابط سريعة</h3>
          <div className="space-y-2">
            {[
              { label: "إضافة منتج جديد", href: "/admin/products/new" },
              { label: "عرض الطلبات الجديدة", href: "/admin/orders?status=NEW" },
              { label: "عرض الموقع", href: "/" },
            ].map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="block px-3 py-2 bg-gray-50 hover:bg-yellow-50 rounded-xl text-sm text-gray-700 transition-colors"
              >
                {link.label} ←
              </a>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <h3 className="font-bold text-gray-800 mb-3">حالات الطلبات</h3>
          <div className="space-y-2 text-sm text-gray-600">
            <div className="flex justify-between">
              <span className="badge bg-blue-100 text-blue-700">جديد</span>
              <span>ينتظر التأكيد</span>
            </div>
            <div className="flex justify-between">
              <span className="badge bg-yellow-100 text-yellow-700">قيد التحضير</span>
              <span>يتم تجهيز الطلب</span>
            </div>
            <div className="flex justify-between">
              <span className="badge bg-purple-100 text-purple-700">تم الشحن</span>
              <span>في طريقه للعميل</span>
            </div>
            <div className="flex justify-between">
              <span className="badge bg-green-100 text-green-700">مُسلَّم</span>
              <span>تم التسليم بنجاح</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

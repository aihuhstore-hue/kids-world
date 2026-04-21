"use client";

import { useEffect, useState } from "react";
import {
  Plus,
  Trash2,
  ToggleLeft,
  ToggleRight,
  Tag,
  Ticket,
  RefreshCw,
} from "lucide-react";
import toast from "react-hot-toast";
import type { PromoCode } from "@/types";

const EMPTY_FORM = {
  code: "",
  type: "PERCENT" as "PERCENT" | "FIXED",
  value: "",
  minOrder: "",
  maxUses: "",
  expiresAt: "",
};

export default function AdminPromoPage() {
  const [promos, setPromos] = useState<PromoCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [password, setPassword] = useState("");

  useEffect(() => {
    const pass = sessionStorage.getItem("admin-password") ?? "";
    setPassword(pass);
    fetchPromos(pass);
  }, []);

  const fetchPromos = async (pass?: string) => {
    setLoading(true);
    try {
      const activePass = pass ?? password;
      const res = await fetch("/api/admin/promo", {
        headers: { "x-admin-password": activePass },
      });
      const data = await res.json();
      setPromos(data.promos ?? []);
    } catch {
      toast.error("خطأ في تحميل الأكواد");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.code || !form.value) {
      toast.error("أدخل الكود والقيمة");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/admin/promo", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-password": password,
        },
        body: JSON.stringify({
          code: form.code.trim().toUpperCase(),
          type: form.type,
          value: parseFloat(form.value),
          minOrder: form.minOrder ? parseFloat(form.minOrder) : 0,
          maxUses: form.maxUses ? parseInt(form.maxUses) : null,
          expiresAt: form.expiresAt || null,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "حدث خطأ");
        return;
      }

      toast.success("تم إنشاء الكود بنجاح ✅");
      setPromos((prev) => [data, ...prev]);
      setForm(EMPTY_FORM);
      setShowForm(false);
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (promo: PromoCode) => {
    const newState = !promo.isActive;
    try {
      const res = await fetch(`/api/admin/promo/${promo.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-admin-password": password,
        },
        body: JSON.stringify({ isActive: newState }),
      });
      if (res.ok) {
        setPromos((prev) =>
          prev.map((p) =>
            p.id === promo.id ? { ...p, isActive: newState } : p
          )
        );
        toast.success(newState ? "تم تفعيل الكود" : "تم إيقاف الكود");
      }
    } catch {
      toast.error("حدث خطأ");
    }
  };

  const deletePromo = async (promo: PromoCode) => {
    if (!confirm(`حذف الكود "${promo.code}"؟`)) return;
    try {
      const res = await fetch(`/api/admin/promo/${promo.id}`, {
        method: "DELETE",
        headers: { "x-admin-password": password },
      });
      if (res.ok) {
        setPromos((prev) => prev.filter((p) => p.id !== promo.id));
        toast.success("تم حذف الكود");
      }
    } catch {
      toast.error("حدث خطأ");
    }
  };

  const formatExpiry = (date: Date | null | undefined) => {
    if (!date) return "—";
    const d = new Date(date);
    const now = new Date();
    if (d < now) return <span className="text-red-500">منتهي الصلاحية</span>;
    return d.toLocaleDateString("ar-DZ");
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Ticket className="w-5 h-5 text-gray-700" />
          <span className="text-sm text-gray-500">{promos.length} كود</span>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => fetchPromos()}
            className="p-2 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-xl text-sm font-medium hover:bg-gray-800 transition-colors"
          >
            <Plus className="w-4 h-4" />
            كود جديد
          </button>
        </div>
      </div>

      {/* Create Form */}
      {showForm && (
        <div className="bg-white rounded-2xl border border-gray-200 p-5 mb-6 shadow-sm">
          <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Tag className="w-4 h-4" />
            إنشاء كود خصم جديد
          </h3>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Code */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  الكود <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={form.code}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      code: e.target.value.toUpperCase().replace(/[^A-Z0-9_-]/g, ""),
                    }))
                  }
                  placeholder="SUMMER20"
                  dir="ltr"
                  className="input-field font-mono"
                  required
                />
                <p className="text-xs text-gray-400 mt-0.5">
                  أحرف إنجليزية كبيرة وأرقام فقط
                </p>
              </div>

              {/* Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  نوع الخصم <span className="text-red-500">*</span>
                </label>
                <select
                  value={form.type}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      type: e.target.value as "PERCENT" | "FIXED",
                    }))
                  }
                  className="input-field"
                >
                  <option value="PERCENT">نسبة مئوية (%)</option>
                  <option value="FIXED">مبلغ ثابت (دج)</option>
                </select>
              </div>

              {/* Value */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {form.type === "PERCENT" ? "النسبة (%)" : "المبلغ (دج)"}{" "}
                  <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={form.value}
                  onChange={(e) => setForm((f) => ({ ...f, value: e.target.value }))}
                  placeholder={form.type === "PERCENT" ? "10" : "500"}
                  min="0"
                  max={form.type === "PERCENT" ? "100" : undefined}
                  className="input-field"
                  required
                />
              </div>

              {/* Min Order */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  الحد الأدنى للطلب (دج)
                </label>
                <input
                  type="number"
                  value={form.minOrder}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, minOrder: e.target.value }))
                  }
                  placeholder="0"
                  min="0"
                  className="input-field"
                />
              </div>

              {/* Max Uses */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  الحد الأقصى للاستخدام
                </label>
                <input
                  type="number"
                  value={form.maxUses}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, maxUses: e.target.value }))
                  }
                  placeholder="غير محدود"
                  min="1"
                  className="input-field"
                />
              </div>

              {/* Expires At */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  تاريخ الانتهاء
                </label>
                <input
                  type="date"
                  value={form.expiresAt}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, expiresAt: e.target.value }))
                  }
                  min={new Date().toISOString().split("T")[0]}
                  className="input-field"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2.5 bg-gray-900 text-white rounded-xl font-medium text-sm hover:bg-gray-800 disabled:opacity-50 transition-colors"
              >
                {saving ? "جاري الحفظ..." : "إنشاء الكود"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setForm(EMPTY_FORM);
                }}
                className="px-6 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-medium text-sm hover:bg-gray-200 transition-colors"
              >
                إلغاء
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Promo Codes List */}
      {loading ? (
        <div className="text-center py-12 text-gray-400">جاري التحميل...</div>
      ) : promos.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
          <Ticket className="w-12 h-12 text-gray-200 mx-auto mb-3" />
          <p className="text-gray-400 font-medium">لا توجد أكواد خصم بعد</p>
          <p className="text-gray-300 text-sm mt-1">أنشئ أول كود بالضغط على "كود جديد"</p>
        </div>
      ) : (
        <div className="grid gap-3">
          {promos.map((promo) => (
            <div
              key={promo.id}
              className={`bg-white rounded-2xl border p-4 flex flex-wrap items-center gap-4 transition-all ${
                promo.isActive
                  ? "border-gray-100 shadow-sm"
                  : "border-gray-100 opacity-60"
              }`}
            >
              {/* Code Badge */}
              <div className="flex-shrink-0">
                <span
                  className={`font-mono font-black text-lg px-3 py-1 rounded-xl ${
                    promo.isActive
                      ? "bg-gray-900 text-white"
                      : "bg-gray-200 text-gray-500"
                  }`}
                >
                  {promo.code}
                </span>
              </div>

              {/* Details */}
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap gap-2 items-center">
                  <span
                    className={`text-sm font-bold px-2.5 py-1 rounded-lg ${
                      promo.type === "PERCENT"
                        ? "bg-blue-100 text-blue-700"
                        : "bg-purple-100 text-purple-700"
                    }`}
                  >
                    {promo.type === "PERCENT"
                      ? `خصم ${promo.value}%`
                      : `خصم ${promo.value.toLocaleString("ar-DZ")} دج`}
                  </span>
                  {promo.minOrder > 0 && (
                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-lg">
                      حد أدنى: {promo.minOrder.toLocaleString("ar-DZ")} دج
                    </span>
                  )}
                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-lg">
                    استُخدم {promo.usedCount} مرة
                    {promo.maxUses ? ` / ${promo.maxUses}` : ""}
                  </span>
                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-lg">
                    ينتهي: {formatExpiry(promo.expiresAt)}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  onClick={() => toggleActive(promo)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-colors ${
                    promo.isActive
                      ? "bg-green-100 text-green-700 hover:bg-green-200"
                      : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                  }`}
                  title={promo.isActive ? "إيقاف الكود" : "تفعيل الكود"}
                >
                  {promo.isActive ? (
                    <>
                      <ToggleRight className="w-4 h-4" />
                      مفعّل
                    </>
                  ) : (
                    <>
                      <ToggleLeft className="w-4 h-4" />
                      موقوف
                    </>
                  )}
                </button>
                <button
                  onClick={() => deletePromo(promo)}
                  className="p-1.5 bg-gray-100 text-gray-400 rounded-xl hover:bg-red-100 hover:text-red-500 transition-colors"
                  title="حذف الكود"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

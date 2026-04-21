"use client";

import { useState, useEffect, useRef } from "react";
import { Save, Upload, Loader2, CheckCircle, Eye } from "lucide-react";
import Image from "next/image";
import toast from "react-hot-toast";
import EmojiPicker from "@/components/admin/EmojiPicker";

export default function SuccessPageSettings() {
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    success_title: "",
    success_message: "",
    success_image: "",
    success_step1: "",
    success_step2: "",
    success_step3: "",
  });

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((data) => {
        setForm({
          success_title: data.success_title || "تم تأكيد طلبك! 🎉",
          success_message: data.success_message || "شكراً لك! سيتصل بك فريقنا خلال 24 ساعة لتأكيد الطلب",
          success_image: data.success_image || "",
          success_step1: data.success_step1 || "سيتصل بك مستشارنا لتأكيد الطلب",
          success_step2: data.success_step2 || "يتم تحضير وشحن طلبك خلال 24-48 ساعة",
          success_step3: data.success_step3 || "يصلك طلبك خلال 2-5 أيام عمل",
        });
      });
  }, []);

  const update = (key: keyof typeof form, val: string) =>
    setForm((prev) => ({ ...prev, [key]: val }));

  const handleUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const password = sessionStorage.getItem("admin-password") ?? "";
    setUploading(true);
    const formData = new FormData();
    formData.append("file", files[0]);
    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        headers: { "x-admin-password": password },
        body: formData,
      });
      const data = await res.json();
      if (res.ok && data.url) {
        update("success_image", data.url);
        toast.success("تم رفع الصورة ✅");
      } else {
        toast.error(data.error ?? "فشل رفع الصورة");
      }
    } catch {
      toast.error("خطأ في رفع الصورة");
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    const password = sessionStorage.getItem("admin-password") ?? "";
    try {
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-admin-password": password },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        toast.success("تم حفظ الإعدادات ✅");
      } else {
        toast.error("حدث خطأ");
      }
    } catch {
      toast.error("خطأ في الاتصال");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl space-y-5">
      <div className="flex items-center justify-between mb-2">
        <h1 className="font-black text-gray-900 text-lg">تخصيص صفحة الشكر</h1>
        <a
          href="/order-success?orderNumber=ORD-12345"
          target="_blank"
          className="flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-700 font-medium"
        >
          <Eye className="w-4 h-4" />
          معاينة
        </a>
      </div>

      <div className="bg-white rounded-2xl shadow-sm p-6 space-y-5">
        {/* العنوان */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">العنوان الرئيسي</label>
          <div className="flex gap-2 items-center">
            <input
              value={form.success_title}
              onChange={(e) => update("success_title", e.target.value)}
              className="input-field flex-1"
              placeholder="تم تأكيد طلبك! 🎉"
            />
            <EmojiPicker onSelect={(emoji) => update("success_title", form.success_title + emoji)} />
          </div>
        </div>

        {/* الرسالة */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">الرسالة</label>
          <div className="flex gap-2 items-start">
            <textarea
              rows={2}
              value={form.success_message}
              onChange={(e) => update("success_message", e.target.value)}
              className="input-field flex-1 resize-none"
              placeholder="شكراً لك! سيتصل بك فريقنا..."
            />
            <EmojiPicker onSelect={(emoji) => update("success_message", form.success_message + emoji)} />
          </div>
        </div>

        {/* الصورة */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">صورة (اختياري)</label>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => handleUpload(e.target.files)}
          />
          {form.success_image ? (
            <div className="space-y-2">
              <div className="relative h-40 rounded-xl overflow-hidden bg-gray-100">
                <Image src={form.success_image} alt="success" fill className="object-cover" />
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  تغيير الصورة
                </button>
                <button
                  type="button"
                  onClick={() => update("success_image", "")}
                  className="text-sm text-red-500 hover:text-red-600 font-medium"
                >
                  حذف الصورة
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="w-full border-2 border-dashed border-gray-200 rounded-xl p-6 text-center hover:border-blue-300 transition-colors"
            >
              {uploading ? (
                <Loader2 className="w-6 h-6 animate-spin mx-auto text-blue-500" />
              ) : (
                <>
                  <Upload className="w-6 h-6 mx-auto text-gray-400 mb-2" />
                  <p className="text-sm text-gray-500">اضغط لرفع صورة</p>
                </>
              )}
            </button>
          )}
          <div className="flex gap-2 items-center mt-2">
            <input
              value={form.success_image}
              onChange={(e) => update("success_image", e.target.value)}
              className="input-field flex-1 text-sm"
              dir="ltr"
              placeholder="أو أدخل رابط صورة مباشرة..."
            />
          </div>
        </div>

        {/* الخطوات */}
        <div className="space-y-3">
          <label className="block text-sm font-semibold text-gray-700">الخطوات</label>
          {([
            { key: "success_step1" as const, label: "خطوة 1: التأكيد", color: "bg-blue-50" },
            { key: "success_step2" as const, label: "خطوة 2: الشحن", color: "bg-yellow-50" },
            { key: "success_step3" as const, label: "خطوة 3: التوصيل", color: "bg-green-50" },
          ]).map(({ key, label, color }) => (
            <div key={key} className={`${color} rounded-xl p-3`}>
              <p className="text-xs font-bold text-gray-600 mb-1.5">{label}</p>
              <div className="flex gap-2 items-center">
                <input
                  value={form[key]}
                  onChange={(e) => update(key, e.target.value)}
                  className="input-field flex-1 text-sm bg-white"
                />
                <EmojiPicker onSelect={(emoji) => update(key, form[key] + emoji)} />
              </div>
            </div>
          ))}
        </div>
      </div>

      <button
        onClick={handleSave}
        disabled={loading}
        className="w-full flex items-center justify-center gap-2 py-3 bg-gray-900 text-white rounded-2xl font-bold hover:bg-gray-800 disabled:opacity-60 transition-colors"
      >
        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
        {loading ? "جاري الحفظ..." : "حفظ التغييرات"}
      </button>
    </div>
  );
}

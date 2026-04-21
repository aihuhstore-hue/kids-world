"use client";

import { useState } from "react";
import { Eye, EyeOff, Lock, CheckCircle } from "lucide-react";
import toast from "react-hot-toast";

export default function AdminSettings() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      toast.error("كلمة السر الجديدة وتأكيدها غير متطابقتين");
      return;
    }

    if (newPassword.length < 4) {
      toast.error("كلمة السر يجب أن تكون 4 أحرف على الأقل");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/admin/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error ?? "حدث خطأ");
        return;
      }

      // تحديث كلمة السر في الجلسة
      sessionStorage.setItem("admin-password", newPassword);
      setSuccess(true);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      toast.success("تم تغيير كلمة السر بنجاح ✅");
    } catch {
      toast.error("خطأ في الاتصال");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md">
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
          <div className="w-10 h-10 bg-yellow-100 rounded-xl flex items-center justify-center">
            <Lock className="w-5 h-5 text-yellow-600" />
          </div>
          <div>
            <h2 className="font-bold text-gray-800">تغيير كلمة السر</h2>
            <p className="text-sm text-gray-400">تغيير كلمة سر لوحة التحكم</p>
          </div>
        </div>

        {success && (
          <div className="bg-green-50 border border-green-200 rounded-2xl p-4 mb-4 flex items-center gap-2 text-green-700">
            <CheckCircle className="w-5 h-5 flex-shrink-0" />
            <p className="text-sm font-medium">تم تغيير كلمة السر بنجاح!</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* كلمة السر الحالية */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              كلمة السر الحالية <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type={showCurrent ? "text" : "password"}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
                placeholder="أدخل كلمة السر الحالية"
                className="input-field pl-10"
              />
              <button
                type="button"
                onClick={() => setShowCurrent(!showCurrent)}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* كلمة السر الجديدة */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              كلمة السر الجديدة <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type={showNew ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                placeholder="أدخل كلمة السر الجديدة"
                className="input-field pl-10"
              />
              <button
                type="button"
                onClick={() => setShowNew(!showNew)}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {newPassword.length > 0 && newPassword.length < 4 && (
              <p className="text-red-500 text-xs mt-1">يجب أن تكون 4 أحرف على الأقل</p>
            )}
          </div>

          {/* تأكيد كلمة السر */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              تأكيد كلمة السر الجديدة <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type={showConfirm ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                placeholder="أعد كتابة كلمة السر الجديدة"
                className={`input-field pl-10 ${
                  confirmPassword && confirmPassword !== newPassword
                    ? "input-error"
                    : ""
                }`}
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {confirmPassword && confirmPassword !== newPassword && (
              <p className="text-red-500 text-xs mt-1">كلمتا السر غير متطابقتين</p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-primary py-3 flex items-center justify-center gap-2 mt-2"
          >
            <Lock className="w-4 h-4" />
            {loading ? "جاري الحفظ..." : "حفظ كلمة السر الجديدة"}
          </button>
        </form>
      </div>
    </div>
  );
}

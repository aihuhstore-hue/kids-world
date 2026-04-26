"use client";

import { useState, useEffect } from "react";
import { Eye, EyeOff, Lock, CheckCircle, Ticket, Send, Bot, Copy } from "lucide-react";
import toast from "react-hot-toast";

export default function AdminSettings() {
  // ── كلمة السر ──
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // ── إعدادات الموقع ──
  const [showPromoCode, setShowPromoCode] = useState(true);
  const [savingPromo, setSavingPromo] = useState(false);

  // ── تلغرام ──
  const [tgToken, setTgToken] = useState("");
  const [tgChatId, setTgChatId] = useState("");
  const [showToken, setShowToken] = useState(false);
  const [savingTg, setSavingTg] = useState(false);
  const [testingTg, setTestingTg] = useState(false);

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((data) => {
        if (data.showPromoCode !== undefined) setShowPromoCode(data.showPromoCode === "true");
        if (data.telegram_bot_token) setTgToken(data.telegram_bot_token);
        if (data.telegram_chat_id) setTgChatId(data.telegram_chat_id);
      });
  }, []);

  const pw = () => sessionStorage.getItem("admin-password") ?? "";

  // حفظ تلغرام
  const handleSaveTg = async () => {
    if (!tgToken.trim() || !tgChatId.trim()) {
      toast.error("أدخل التوكن والـ Chat ID");
      return;
    }
    setSavingTg(true);
    try {
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-admin-password": pw() },
        body: JSON.stringify({ telegram_bot_token: tgToken.trim(), telegram_chat_id: tgChatId.trim() }),
      });
      if (res.ok) toast.success("تم حفظ إعدادات تلغرام ✅");
      else toast.error("فشل الحفظ");
    } catch {
      toast.error("خطأ في الاتصال");
    } finally {
      setSavingTg(false);
    }
  };

  // اختبار تلغرام
  const handleTestTg = async () => {
    setTestingTg(true);
    try {
      const res = await fetch("/api/telegram/test", {
        method: "POST",
        headers: { "x-admin-password": pw() },
      });
      const data = await res.json();
      if (data.ok) toast.success("✅ وصل الإشعار على تلغرام!");
      else if (data.error === "no_config") toast.error("احفظ البيانات أولاً");
      else toast.error("خطأ: " + (data.error ?? "غير معروف"));
    } catch {
      toast.error("خطأ في الاتصال");
    } finally {
      setTestingTg(false);
    }
  };

  const handleTogglePromo = async (val: boolean) => {
    setShowPromoCode(val);
    setSavingPromo(true);
    try {
      await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-admin-password": pw() },
        body: JSON.stringify({ showPromoCode: String(val) }),
      });
      toast.success(val ? "تم تفعيل كود الخصم ✅" : "تم إخفاء كود الخصم ✅");
    } catch {
      toast.error("حدث خطأ");
    } finally {
      setSavingPromo(false);
    }
  };

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
    <div className="max-w-md space-y-5">

      {/* ── بوت تلغرام ── */}
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <div className="flex items-center gap-3 mb-5 pb-4 border-b border-gray-100">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "linear-gradient(135deg,#0088cc,#005f99)" }}>
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="font-bold text-gray-800">بوت تلغرام</h2>
            <p className="text-sm text-gray-400">إشعارات الطلبيات + استرجاع كلمة السر</p>
          </div>
        </div>

        <div className="space-y-4">
          {/* خطوات الإعداد */}
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 space-y-2 overflow-hidden">
            <p className="text-xs font-bold text-blue-700 mb-2">كيفية الإعداد:</p>
            {[
              "افتح تلغرام وابحث عن @BotFather",
              "أرسل /newbot واتبع التعليمات للحصول على التوكن",
              "ابحث عن بوتك وأرسل له /start",
              "للحصول على Chat ID: api.telegram.org/bot{TOKEN}/getUpdates",
            ].map((text, i) => (
              <div key={i} className="flex items-start gap-2 text-xs text-blue-800 min-w-0">
                <span className="w-5 h-5 rounded-full bg-blue-200 text-blue-700 font-bold flex items-center justify-center flex-shrink-0">{i + 1}</span>
                <span className="break-words min-w-0 flex-1">{text}</span>
              </div>
            ))}
          </div>

          {/* التوكن */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Bot Token
            </label>
            <div className="relative">
              <input
                type={showToken ? "text" : "password"}
                value={tgToken}
                onChange={(e) => setTgToken(e.target.value)}
                placeholder="123456789:AAF..."
                className="input-field pl-16 font-mono text-sm"
                dir="ltr"
              />
              <div className="absolute left-2 top-1/2 -translate-y-1/2 flex gap-1">
                <button
                  type="button"
                  onClick={() => setShowToken(!showToken)}
                  className="p-1.5 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showToken ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
                {tgToken && (
                  <button
                    type="button"
                    onClick={() => { navigator.clipboard.writeText(tgToken); toast.success("تم النسخ"); }}
                    className="p-1.5 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Chat ID */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Chat ID
            </label>
            <input
              type="text"
              value={tgChatId}
              onChange={(e) => setTgChatId(e.target.value)}
              placeholder="123456789"
              className="input-field font-mono text-sm"
              dir="ltr"
            />
          </div>

          {/* ما يفعله البوت */}
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-gray-50 rounded-xl p-3 text-center">
              <p className="text-lg mb-1">🛒</p>
              <p className="text-xs font-semibold text-gray-700">إشعار طلبية جديدة</p>
              <p className="text-xs text-gray-400">تلقائي عند كل طلب</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-3 text-center">
              <p className="text-lg mb-1">🔐</p>
              <p className="text-xs font-semibold text-gray-700">كود استرجاع السر</p>
              <p className="text-xs text-gray-400">عند نسيان كلمة السر</p>
            </div>
          </div>

          {/* أزرار */}
          <div className="flex gap-2 pt-1">
            <button
              onClick={handleSaveTg}
              disabled={savingTg}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold text-white transition-colors disabled:opacity-50"
              style={{ background: "linear-gradient(135deg,#0088cc,#005f99)" }}
            >
              {savingTg ? "جاري الحفظ..." : "حفظ"}
            </button>
            <button
              onClick={handleTestTg}
              disabled={testingTg || !tgToken || !tgChatId}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors disabled:opacity-40"
            >
              <Send className="w-4 h-4" />
              {testingTg ? "جاري الإرسال..." : "اختبار"}
            </button>
          </div>
        </div>
      </div>

      {/* ── إعدادات الموقع ── */}
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <div className="flex items-center gap-3 mb-5 pb-4 border-b border-gray-100">
          <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
            <Ticket className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h2 className="font-bold text-gray-800">إعدادات الموقع</h2>
            <p className="text-sm text-gray-400">التحكم في عناصر صفحة الطلب</p>
          </div>
        </div>

        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
          <div>
            <p className="font-semibold text-gray-700 text-sm">كود الخصم</p>
            <p className="text-xs text-gray-400 mt-0.5">
              {showPromoCode ? "يظهر حقل كود الخصم في صفحة الطلب" : "مخفي من صفحة الطلب"}
            </p>
          </div>
          <button
            type="button"
            disabled={savingPromo}
            onClick={() => handleTogglePromo(!showPromoCode)}
            className={`relative w-12 h-6 rounded-full transition-colors flex-shrink-0 ${
              showPromoCode ? "bg-green-500" : "bg-gray-300"
            } ${savingPromo ? "opacity-50" : ""}`}
          >
            <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${showPromoCode ? "right-1" : "left-1"}`} />
          </button>
        </div>
      </div>

      {/* ── تغيير كلمة السر ── */}
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
          {[
            { label: "كلمة السر الحالية", val: currentPassword, set: setCurrentPassword, show: showCurrent, setShow: setShowCurrent },
            { label: "كلمة السر الجديدة", val: newPassword, set: setNewPassword, show: showNew, setShow: setShowNew },
            { label: "تأكيد كلمة السر الجديدة", val: confirmPassword, set: setConfirmPassword, show: showConfirm, setShow: setShowConfirm },
          ].map((f, i) => (
            <div key={i}>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {f.label} <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={f.show ? "text" : "password"}
                  value={f.val}
                  onChange={(e) => f.set(e.target.value)}
                  required
                  placeholder="••••••••"
                  className={`input-field pl-10 ${
                    i === 2 && f.val && f.val !== newPassword ? "input-error" : ""
                  }`}
                />
                <button
                  type="button"
                  onClick={() => f.setShow(!f.show)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {f.show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {i === 1 && f.val.length > 0 && f.val.length < 4 && (
                <p className="text-red-500 text-xs mt-1">يجب أن تكون 4 أحرف على الأقل</p>
              )}
              {i === 2 && f.val && f.val !== newPassword && (
                <p className="text-red-500 text-xs mt-1">كلمتا السر غير متطابقتين</p>
              )}
            </div>
          ))}

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

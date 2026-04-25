"use client";

import { useState, useEffect } from "react";
import { Save, Loader2, Eye, EyeOff, CheckCircle, Zap, Trash2, Send } from "lucide-react";
import toast from "react-hot-toast";

interface IntegrationField {
  key: string;
  label: string;
  placeholder: string;
  secret?: boolean;
  hint?: string;
}

const INTEGRATIONS = [
  {
    id: "facebook",
    title: "Facebook / Meta",
    emoji: "📘",
    color: "from-blue-600 to-blue-700",
    glow: "rgba(37,99,235,0.25)",
    fields: [
      { key: "fb_pixel_id", label: "Pixel ID", placeholder: "123456789012345", hint: "من Meta Events Manager" },
      { key: "fb_access_token", label: "Conversions API Token", placeholder: "EAAxxxxxxxxx...", secret: true, hint: "من Meta Business → Conversions API" },
    ] as IntegrationField[],
  },
  {
    id: "tiktok",
    title: "TikTok Ads",
    emoji: "🎵",
    color: "from-slate-800 to-slate-900",
    glow: "rgba(0,0,0,0.3)",
    fields: [
      { key: "tiktok_pixel_id", label: "Pixel ID", placeholder: "CXXXXXXXXXXXXXXX", hint: "من TikTok Ads Manager → Assets → Events" },
    ] as IntegrationField[],
  },
  {
    id: "snapchat",
    title: "Snapchat Ads",
    emoji: "👻",
    color: "from-yellow-400 to-yellow-500",
    glow: "rgba(234,179,8,0.3)",
    fields: [
      { key: "snap_pixel_id", label: "Pixel ID", placeholder: "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx", hint: "من Snapchat Ads Manager → Pixels" },
    ] as IntegrationField[],
  },
  {
    id: "google",
    title: "Google Analytics",
    emoji: "📊",
    color: "from-red-500 to-orange-500",
    glow: "rgba(239,68,68,0.25)",
    fields: [
      { key: "ga_id", label: "Measurement ID", placeholder: "G-XXXXXXXXXX", hint: "من Google Analytics → Admin → Data Streams" },
    ] as IntegrationField[],
  },
  {
    id: "social",
    title: "روابط التواصل الاجتماعي",
    emoji: "🔗",
    color: "from-purple-500 to-pink-500",
    glow: "rgba(168,85,247,0.25)",
    fields: [
      { key: "fb_page_url", label: "رابط صفحة Facebook", placeholder: "https://facebook.com/kidsworldj", hint: "يظهر في أسفل الموقع" },
      { key: "instagram_url", label: "رابط حساب Instagram", placeholder: "https://instagram.com/kidsworldj", hint: "يظهر في أسفل الموقع" },
      { key: "tiktok_page_url", label: "رابط حساب TikTok", placeholder: "https://tiktok.com/@kidsworldj", hint: "يظهر في أسفل الموقع" },
      { key: "whatsapp_number", label: "رقم WhatsApp", placeholder: "213555123456", hint: "الرقم بدون + مثلاً 213555123456 — يظهر في أسفل الموقع" },
    ] as IntegrationField[],
  },
  {
    id: "email",
    title: "إشعارات البريد الإلكتروني",
    emoji: "📧",
    color: "from-indigo-500 to-violet-600",
    glow: "rgba(99,102,241,0.25)",
    fields: [
      {
        key: "resend_api_key",
        label: "Resend API Key",
        placeholder: "re_xxxxxxxxxxxxxxxxxxxxxxxxxx",
        secret: true,
        hint: "من resend.com — مجاني 3000 إيميل/شهر",
      },
      {
        key: "notification_email",
        label: "إيميل الاستقبال",
        placeholder: "you@gmail.com",
        hint: "الإيميل الذي سيستقبل إشعارات الطلبيات الجديدة",
      },
    ] as IntegrationField[],
  },
  {
    id: "sheets",
    title: "Google Sheets",
    emoji: "📊",
    color: "from-green-600 to-emerald-700",
    glow: "rgba(22,163,74,0.25)",
    fields: [
      {
        key: "google_sheets_webhook",
        label: "رابط Google Apps Script Webhook",
        placeholder: "https://script.google.com/macros/s/AKfy.../exec",
        hint: "كل طلبية جديدة تُضاف تلقائياً لجدول Google Sheets الخاص بك",
      },
    ] as IntegrationField[],
  },
];

export default function IntegrationsPage() {
  const [values, setValues] = useState<Record<string, string>>({});
  const [shown, setShown] = useState<Record<string, boolean>>({});
  const [saving, setSaving] = useState<string | null>(null);
  const [saved, setSaved] = useState<Record<string, boolean>>({});

  useEffect(() => {
    fetch("/api/settings").then((r) => r.json()).then((data) => {
      const vals: Record<string, string> = {};
      INTEGRATIONS.forEach((g) => g.fields.forEach((f) => { vals[f.key] = data[f.key] ?? ""; }));
      setValues(vals);
    });
  }, []);

  const handleSave = async (integrationId: string) => {
    const integration = INTEGRATIONS.find((g) => g.id === integrationId)!;
    const payload: Record<string, string> = {};
    integration.fields.forEach((f) => { payload[f.key] = values[f.key] ?? ""; });

    setSaving(integrationId);
    try {
      const password = sessionStorage.getItem("admin-password") ?? "";
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-admin-password": password },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        toast.success(`تم حفظ إعدادات ${integration.title} ✅`);
        setSaved((p) => ({ ...p, [integrationId]: true }));
        setTimeout(() => setSaved((p) => ({ ...p, [integrationId]: false })), 3000);
      } else {
        toast.error("حدث خطأ أثناء الحفظ");
      }
    } catch {
      toast.error("خطأ في الاتصال");
    } finally {
      setSaving(null);
    }
  };

  return (
    <div className="max-w-2xl space-y-5">

      {/* Header */}
      <div className="rounded-3xl p-5 relative overflow-hidden"
        style={{ background: "linear-gradient(135deg,#1a1a3e 0%,#16213e 60%,#0f3460 100%)", boxShadow: "0 8px 32px rgba(0,0,0,0.15)" }}>
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl flex items-center justify-center"
            style={{ background: "linear-gradient(135deg,#f59e0b,#f97316)", boxShadow: "0 4px 16px rgba(245,158,11,0.4)" }}>
            <Zap className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-black text-white">ربط المنصات الإعلانية</h2>
            <p className="text-xs" style={{ color: "rgba(255,255,255,0.45)" }}>
              أدخل الكود مرة واحدة — يُطبَّق تلقائياً على كامل الموقع
            </p>
          </div>
        </div>
      </div>

      {/* البطاقات */}
      {INTEGRATIONS.map((integration) => (
        <div key={integration.id} className="rounded-3xl bg-white overflow-hidden"
          style={{ border: "1px solid rgba(0,0,0,0.06)", boxShadow: "0 2px 12px rgba(0,0,0,0.05)" }}>

          {/* رأس البطاقة */}
          <div className={`px-5 py-4 bg-gradient-to-r ${integration.color} flex items-center gap-3`}>
            <span className="text-2xl">{integration.emoji}</span>
            <h3 className="font-black text-white text-base">{integration.title}</h3>
            {values[integration.fields[0].key] && (
              <>
                <span className="mr-auto text-xs px-2.5 py-1 rounded-full font-bold"
                  style={{ background: "rgba(255,255,255,0.2)", color: "#fff" }}>
                  ✓ مُفعَّل
                </span>
                <button
                  type="button"
                  title="حذف جميع بيانات هذه المنصة"
                  onClick={async () => {
                    if (!confirm(`هل تريد حذف إعدادات ${integration.title} ؟`)) return;
                    const cleared: Record<string, string> = {};
                    integration.fields.forEach((f) => { cleared[f.key] = ""; });
                    setValues((p) => ({ ...p, ...cleared }));
                    const password = sessionStorage.getItem("admin-password") ?? "";
                    await fetch("/api/settings", {
                      method: "POST",
                      headers: { "Content-Type": "application/json", "x-admin-password": password },
                      body: JSON.stringify(cleared),
                    });
                    toast.success(`تم حذف إعدادات ${integration.title}`);
                  }}
                  className="text-xs px-2.5 py-1 rounded-full font-bold flex items-center gap-1 transition-colors"
                  style={{ background: "rgba(239,68,68,0.25)", color: "#fca5a5" }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(239,68,68,0.45)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(239,68,68,0.25)"; }}
                >
                  <Trash2 className="w-3 h-3" />
                  حذف
                </button>
              </>
            )}
          </div>

          {/* الحقول */}
          <div className="p-5 space-y-4">
            {integration.fields.map((field) => (
              <div key={field.key}>
                <label className="block text-sm font-bold text-gray-700 mb-1">
                  {field.label}
                </label>
                {field.hint && (
                  <p className="text-xs text-gray-400 mb-1.5">{field.hint}</p>
                )}
                <div className="relative flex items-center gap-2">
                  <div className="relative flex-1">
                    <input
                      type={field.secret && !shown[field.key] ? "password" : "text"}
                      value={values[field.key] ?? ""}
                      onChange={(e) => setValues((p) => ({ ...p, [field.key]: e.target.value }))}
                      placeholder={field.placeholder}
                      dir="ltr"
                      className="input-field text-sm font-mono w-full"
                      style={{ paddingLeft: field.secret ? "2.5rem" : undefined }}
                    />
                    {field.secret && (
                      <button type="button"
                        onClick={() => setShown((p) => ({ ...p, [field.key]: !p[field.key] }))}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
                        {shown[field.key] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    )}
                  </div>
                  {values[field.key] && (
                    <button
                      type="button"
                      title="حذف"
                      onClick={() => setValues((p) => ({ ...p, [field.key]: "" }))}
                      className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-xl bg-red-50 hover:bg-red-100 text-red-400 hover:text-red-600 transition-colors border border-red-100"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            ))}

            <button
              onClick={() => handleSave(integration.id)}
              disabled={saving === integration.id}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-sm font-bold text-white transition-all duration-200 disabled:opacity-60 bg-gradient-to-r ${integration.color}`}
              style={{ boxShadow: `0 4px 16px ${integration.glow}` }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.boxShadow = `0 8px 24px ${integration.glow}`; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = `0 4px 16px ${integration.glow}`; }}
            >
              {saving === integration.id ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : saved[integration.id] ? (
                <CheckCircle className="w-4 h-4" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              {saving === integration.id ? "جاري الحفظ..." : saved[integration.id] ? "تم الحفظ!" : "حفظ"}
            </button>

            {/* زر اختبار الإيميل */}
            {integration.id === "email" && (
              <button
                type="button"
                onClick={async () => {
                  const password = sessionStorage.getItem("admin-password") ?? "";
                  const res = await fetch("/api/email/test", {
                    method: "POST",
                    headers: { "x-admin-password": password },
                  });
                  const data = await res.json();
                  if (data.ok) toast.success("✅ تم إرسال إيميل تجريبي — تحقق من صندوقك");
                  else if (data.error === "no_api_key") toast.error("أدخل API Key أولاً واحفظ");
                  else if (data.error === "no_email") toast.error("أدخل الإيميل أولاً واحفظ");
                  else toast.error(`خطأ: ${data.error}`);
                }}
                className="flex items-center gap-2 px-5 py-2.5 rounded-2xl text-sm font-bold transition-all duration-200 border"
                style={{ color: "#6366f1", borderColor: "rgba(99,102,241,0.3)", background: "rgba(99,102,241,0.05)" }}
              >
                <Send className="w-4 h-4" />
                إرسال إيميل تجريبي
              </button>
            )}

            {/* تعليمات Google Sheets */}
            {integration.id === "sheets" && (
              <div className="mt-3 p-4 rounded-2xl bg-green-50 border border-green-100">
                <p className="text-xs font-black text-green-800 mb-2">📋 خطوات الإعداد:</p>
                <ol className="text-xs text-green-700 space-y-1 list-decimal list-inside">
                  <li>افتح Google Sheets وأنشئ جدول جديد</li>
                  <li>اذهب إلى: <strong>Extensions → Apps Script</strong></li>
                  <li>احذف الكود الموجود والصق الكود أدناه</li>
                  <li>اضغط <strong>Deploy → New Deployment → Web App</strong></li>
                  <li>اختر: <strong>Anyone</strong> في Execute as وWho has access</li>
                  <li>انسخ الرابط والصقه في الحقل أعلاه</li>
                </ol>
                <div className="mt-3 bg-gray-900 rounded-xl p-3 overflow-x-auto">
                  <pre className="text-xs text-green-300 font-mono whitespace-pre-wrap">{`function doPost(e) {
  var sheet = SpreadsheetApp.getActiveSheet();
  var d = JSON.parse(e.postData.contents);
  sheet.appendRow([
    d.orderNumber, d.firstName+' '+d.lastName,
    d.phone, d.wilayaName, d.commune,
    d.deliveryType==='home'?'منزل':'مكتب بريد',
    d.total+' دج', d.status,
    new Date(d.createdAt).toLocaleString('ar-DZ')
  ]);
  return ContentService
    .createTextOutput(JSON.stringify({ok:true}))
    .setMimeType(ContentService.MimeType.JSON);
}`}</pre>
                </div>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { wilayas, getDeliveryPrice } from "@/lib/algeria-data";
import { formatPrice } from "@/lib/utils";
import { useCartStore } from "@/store/cart";

export default function CheckoutPage() {
  const router = useRouter();
  const { items, updateQuantity, removeItem, clearCart, totalPrice } = useCartStore();
  const [mounted, setMounted] = useState(false);

  // Form fields
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [gender, setGender] = useState<"girl" | "boy" | "">("");
  const [wilayaCode, setWilayaCode] = useState("");
  const [commune, setCommune] = useState("");
  const [deliveryType, setDeliveryType] = useState<"home" | "office">("home");
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");

  // Delivery
  const [communes, setCommunes] = useState<string[]>([]);
  const [deliveryFee, setDeliveryFee] = useState(0);

  // Promo
  const [promoInput, setPromoInput] = useState("");
  const [promoLoading, setPromoLoading] = useState(false);
  const [appliedPromo, setAppliedPromo] = useState<{ code: string; discount: number } | null>(null);
  const [promoError, setPromoError] = useState("");
  const [showPromo, setShowPromo] = useState(false);

  // Submit
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    setMounted(true);
    fetch("/api/settings")
      .then((r) => r.json())
      .then((d) => setShowPromo(d.showPromoCode === "true"))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!wilayaCode) return;
    const w = wilayas.find((w) => w.code === wilayaCode);
    if (w) {
      setCommunes(w.communes);
      setCommune("");
      setDeliveryFee(getDeliveryPrice(wilayaCode, deliveryType));
    }
  }, [wilayaCode, deliveryType]);

  const subtotal = totalPrice();
  const discount = appliedPromo?.discount ?? 0;
  const total = subtotal + deliveryFee - discount;

  const validate = () => {
    const e: Record<string, string> = {};
    if (firstName.trim().length < 2) e.firstName = "الاسم مطلوب";
    if (lastName.trim().length < 2) e.lastName = "اللقب مطلوب";
    if (!/^(05|06|07)\d{8}$/.test(phone)) e.phone = "رقم الهاتف غير صحيح";
    if (!gender) e.gender = "يرجى اختيار جنس الطفل";
    if (!wilayaCode) e.wilayaCode = "يرجى اختيار الولاية";
    if (deliveryType === "home" && address.trim().length < 5) e.address = "يرجى إدخال العنوان";
    return e;
  };

  const applyPromo = async () => {
    if (!promoInput.trim()) return;
    setPromoLoading(true);
    setPromoError("");
    try {
      const res = await fetch(`/api/promo?code=${encodeURIComponent(promoInput.trim())}&total=${subtotal}`);
      const data = await res.json();
      if (data.valid) {
        setAppliedPromo({ code: promoInput.trim().toUpperCase(), discount: data.discount });
        setPromoInput("");
      } else {
        setPromoError(data.message ?? "كود غير صحيح");
      }
    } catch {
      setPromoError("حدث خطأ");
    } finally {
      setPromoLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setErrors({});
    setLoading(true);
    try {
      const wilaya = wilayas.find((w) => w.code === wilayaCode);
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName, lastName, phone, gender,
          wilayaCode, wilayaName: wilaya?.name ?? wilayaCode,
          commune, deliveryType, address, notes,
          items: items.map((i) => ({ productId: i.id, quantity: i.quantity, price: i.price })),
          subtotal, discount, deliveryFee, total,
          promoCode: appliedPromo?.code ?? null,
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        alert(err.error ?? "حدث خطأ، حاول مرة أخرى");
        return;
      }
      const order = await res.json();
      clearCart();
      router.push(`/order-success?orderNumber=${order.orderNumber}`);
    } catch {
      alert("تعذّر الاتصال، تحقق من الإنترنت وحاول مجدداً");
    } finally {
      setLoading(false);
    }
  };

  // ─── Loading ───
  if (!mounted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // ─── Empty cart ───
  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-3xl shadow p-10 text-center max-w-sm w-full">
          <p className="text-4xl mb-4">🛒</p>
          <h2 className="text-xl font-bold text-gray-700 mb-2">السلة فارغة</h2>
          <p className="text-gray-400 text-sm mb-6">أضف منتجات للسلة أولاً</p>
          <Link href="/" className="block bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-bold py-3 px-6 rounded-2xl transition-colors">
            تصفح المنتجات
          </Link>
        </div>
      </div>
    );
  }

  // ─── Checkout ───
  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-4 py-3 flex items-center gap-3">
        <Link href="/" className="text-gray-500 hover:text-gray-700 text-sm">→ الرئيسية</Link>
        <span className="text-gray-300">/</span>
        <span className="text-gray-800 font-bold text-sm">إتمام الطلب</span>
      </div>

      <div className="max-w-lg mx-auto px-4 py-6 space-y-4">

        {/* ── ملخص السلة ── */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
            <span className="font-bold text-gray-800">🛒 منتجاتك ({items.length})</span>
          </div>
          <div className="divide-y divide-gray-50">
            {items.map((item) => (
              <div key={item.id} className="flex items-center gap-3 px-4 py-3">
                {item.image && (
                  <img src={item.image} alt={item.name} className="w-14 h-14 rounded-xl object-cover flex-shrink-0 bg-gray-100"
                    onError={(e) => { e.currentTarget.style.display = "none"; }} />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-800 truncate">{item.name}</p>
                  <p className="text-sm text-yellow-600 font-bold">{formatPrice(item.price)}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <button type="button" onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="w-6 h-6 rounded-lg border border-gray-200 bg-white flex items-center justify-center text-gray-600 hover:bg-gray-50">−</button>
                    <span className="text-sm font-bold w-4 text-center">{item.quantity}</span>
                    <button type="button" onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="w-6 h-6 rounded-lg border border-gray-200 bg-white flex items-center justify-center text-gray-600 hover:bg-gray-50">+</button>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className="text-sm font-black text-gray-900">{formatPrice(item.price * item.quantity)}</span>
                  <button type="button" onClick={() => removeItem(item.id)} className="text-red-400 hover:text-red-600 text-xs">حذف</button>
                </div>
              </div>
            ))}
          </div>

          {/* كود الخصم */}
          {showPromo && (
            <div className="px-4 pb-3">
              {appliedPromo ? (
                <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-xl px-3 py-2">
                  <span className="text-sm text-green-700 font-bold">✅ {appliedPromo.code} — وفّرت {formatPrice(appliedPromo.discount)}</span>
                  <button onClick={() => setAppliedPromo(null)} className="text-green-600 text-xs hover:underline">إزالة</button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <input value={promoInput} onChange={(e) => setPromoInput(e.target.value.toUpperCase())}
                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), applyPromo())}
                    placeholder="كود الخصم..." dir="ltr"
                    className="flex-1 border-2 border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-yellow-400 uppercase" />
                  <button type="button" onClick={applyPromo} disabled={promoLoading || !promoInput.trim()}
                    className="px-4 py-2 bg-gray-800 text-white text-sm font-medium rounded-xl disabled:opacity-50">
                    {promoLoading ? "..." : "تطبيق"}
                  </button>
                </div>
              )}
              {promoError && <p className="text-red-500 text-xs mt-1">{promoError}</p>}
            </div>
          )}

          {/* المجموع */}
          <div className="px-4 pb-4 space-y-1.5 border-t border-gray-100 pt-3">
            <div className="flex justify-between text-sm text-gray-500">
              <span>{formatPrice(subtotal)}</span><span>المجموع الفرعي</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-sm text-green-600">
                <span>−{formatPrice(discount)}</span><span>خصم</span>
              </div>
            )}
            <div className="flex justify-between text-sm text-gray-500">
              <span>{deliveryFee > 0 ? formatPrice(deliveryFee) : "يُحدد بعد اختيار الولاية"}</span><span>التوصيل</span>
            </div>
            <div className="flex justify-between font-black text-gray-900 pt-1 border-t border-gray-100">
              <span className="text-lg">{deliveryFee > 0 ? formatPrice(total) : "—"}</span><span>الإجمالي</span>
            </div>
            <p className="text-center text-xs text-gray-400">💵 الدفع عند الاستلام فقط</p>
          </div>
        </div>

        {/* ── فورم الطلب ── */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-l from-yellow-400 to-amber-300 px-4 py-3">
            <h2 className="font-black text-lg text-gray-900">📝 بيانات التوصيل</h2>
            <p className="text-sm text-gray-700">الدفع عند الاستلام — لا تدفع الآن</p>
          </div>

          <form onSubmit={handleSubmit} className="p-4 space-y-4">

            {/* الاسم واللقب */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">الاسم *</label>
                <input value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="محمد"
                  className={`w-full border-2 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-yellow-400 ${errors.firstName ? "border-red-400" : "border-gray-200"}`} />
                {errors.firstName && <p className="text-red-500 text-xs mt-0.5">{errors.firstName}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">اللقب *</label>
                <input value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="بن علي"
                  className={`w-full border-2 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-yellow-400 ${errors.lastName ? "border-red-400" : "border-gray-200"}`} />
                {errors.lastName && <p className="text-red-500 text-xs mt-0.5">{errors.lastName}</p>}
              </div>
            </div>

            {/* الهاتف */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">رقم الهاتف *</label>
              <input value={phone} onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                placeholder="0550000000" dir="ltr" inputMode="numeric"
                className={`w-full border-2 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-yellow-400 text-left ${errors.phone ? "border-red-400" : "border-gray-200"}`} />
              {errors.phone && <p className="text-red-500 text-xs mt-0.5">{errors.phone}</p>}
            </div>

            {/* جنس الطفل */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">جنس الطفل *</label>
              <div className="flex gap-4">
                {(["girl", "boy"] as const).map((g) => (
                  <label key={g} className="flex flex-col items-center gap-1 cursor-pointer">
                    <input type="radio" name="gender" value={g} checked={gender === g} onChange={() => setGender(g)} className="hidden" />
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl border-2 transition-all
                      ${gender === g
                        ? g === "girl" ? "border-pink-400 bg-pink-100 scale-110" : "border-blue-400 bg-blue-100 scale-110"
                        : g === "girl" ? "border-pink-200 bg-pink-50" : "border-blue-200 bg-blue-50"}`}>
                      {g === "girl" ? "👧" : "👦"}
                    </div>
                    <span className={`text-xs font-semibold ${gender === g ? (g === "girl" ? "text-pink-600" : "text-blue-600") : "text-gray-400"}`}>
                      {g === "girl" ? "بنت" : "ولد"}
                    </span>
                  </label>
                ))}
              </div>
              {errors.gender && <p className="text-red-500 text-xs mt-0.5">{errors.gender}</p>}
            </div>

            {/* الولاية */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">الولاية *</label>
              <select value={wilayaCode} onChange={(e) => setWilayaCode(e.target.value)}
                className={`w-full border-2 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-yellow-400 bg-white ${errors.wilayaCode ? "border-red-400" : "border-gray-200"}`}>
                <option value="">— اختر الولاية —</option>
                {wilayas.map((w) => (
                  <option key={w.code} value={w.code}>{w.code} - {w.name}</option>
                ))}
              </select>
              {errors.wilayaCode && <p className="text-red-500 text-xs mt-0.5">{errors.wilayaCode}</p>}
            </div>

            {/* نوع التوصيل */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">نوع التوصيل *</label>
              <div className="grid grid-cols-2 gap-3">
                {(["home", "office"] as const).map((t) => (
                  <label key={t} className={`flex items-center gap-2 p-3 rounded-xl border-2 cursor-pointer transition-colors
                    ${deliveryType === t ? "border-yellow-400 bg-yellow-50" : "border-gray-200 hover:border-gray-300"}`}>
                    <input type="radio" name="deliveryType" value={t} checked={deliveryType === t} onChange={() => setDeliveryType(t)} className="hidden" />
                    <span className="text-lg">{t === "home" ? "🏠" : "🏢"}</span>
                    <div>
                      <p className="text-sm font-medium">{t === "home" ? "للمنزل" : "مكتب بريد"}</p>
                      {wilayaCode && <p className="text-xs text-gray-500">{formatPrice(getDeliveryPrice(wilayaCode, t))}</p>}
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* البلدية - فقط للمنزل */}
            {deliveryType === "home" && communes.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">البلدية *</label>
                <select value={commune} onChange={(e) => setCommune(e.target.value)}
                  className="w-full border-2 border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-yellow-400 bg-white">
                  <option value="">— اختر البلدية —</option>
                  {communes.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            )}

            {/* العنوان - فقط للمنزل */}
            {deliveryType === "home" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">العنوان التفصيلي *</label>
                <input value={address} onChange={(e) => setAddress(e.target.value)}
                  placeholder="مثال: حي النصر، رقم 12، عمارة ب..."
                  className={`w-full border-2 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-yellow-400 ${errors.address ? "border-red-400" : "border-gray-200"}`} />
                {errors.address && <p className="text-red-500 text-xs mt-0.5">{errors.address}</p>}
              </div>
            )}

            {/* ملاحظات */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">ملاحظات (اختياري)</label>
              <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2}
                placeholder="أي ملاحظات إضافية..."
                className="w-full border-2 border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-yellow-400 resize-none" />
            </div>

            {/* زر الإرسال */}
            <button type="submit" disabled={loading || items.length === 0}
              className="w-full bg-gray-900 hover:bg-gray-800 disabled:opacity-60 text-white font-black text-lg py-4 rounded-2xl transition-colors flex items-center justify-center gap-2 shadow-lg">
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>جاري إرسال الطلب...</span>
                </>
              ) : (
                <span>🛒 تأكيد الطلب</span>
              )}
            </button>

          </form>
        </div>

      </div>
    </div>
  );
}

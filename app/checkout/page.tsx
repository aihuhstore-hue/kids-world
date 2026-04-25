"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  Home,
  Building2,
  Loader2,
  CheckCircle,
  Tag,
  X,
  Ticket,
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  ArrowRight,
  Package,
} from "lucide-react";
import { wilayas, getDeliveryPrice } from "@/lib/algeria-data";
import { orderFormSchema, type OrderFormData } from "@/types";
import { formatPrice } from "@/lib/utils";
import { useCartStore } from "@/store/cart";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

export default function CheckoutPage() {
  const router = useRouter();
  const { items, updateQuantity, removeItem, clearCart, totalPrice } = useCartStore();

  const [loading, setLoading] = useState(false);
  const [communes, setCommunes] = useState<string[]>([]);
  const [deliveryFee, setDeliveryFee] = useState(0);
  const [selectedWilaya, setSelectedWilaya] = useState("");
  const [showPromoCode, setShowPromoCode] = useState(false);
  const [promoInput, setPromoInput] = useState("");
  const [promoLoading, setPromoLoading] = useState(false);
  const [appliedPromo, setAppliedPromo] = useState<{
    code: string;
    discount: number;
    message: string;
  } | null>(null);
  const [promoError, setPromoError] = useState("");

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<OrderFormData>({
    resolver: zodResolver(orderFormSchema),
    defaultValues: { deliveryType: "home" },
  });

  const watchedWilaya = watch("wilayaCode");
  const watchedDeliveryType = watch("deliveryType");

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((data) => setShowPromoCode(data.showPromoCode === "true"))
      .catch(() => setShowPromoCode(false));
  }, []);

  useEffect(() => {
    if (watchedWilaya) {
      const wilaya = wilayas.find((w) => w.code === watchedWilaya);
      if (wilaya) {
        setCommunes(wilaya.communes);
        setSelectedWilaya(watchedWilaya);
        setValue("commune", "");
        setDeliveryFee(getDeliveryPrice(watchedWilaya, watchedDeliveryType as "home" | "office"));
      }
    }
  }, [watchedWilaya, watchedDeliveryType, setValue]);

  useEffect(() => {
    if (selectedWilaya) {
      setDeliveryFee(getDeliveryPrice(selectedWilaya, watchedDeliveryType as "home" | "office"));
    }
  }, [watchedDeliveryType, selectedWilaya]);

  const subtotal = totalPrice();
  const discount = appliedPromo?.discount ?? 0;
  const total = subtotal + deliveryFee - discount;

  const applyPromo = async () => {
    if (!promoInput.trim()) return;
    setPromoLoading(true);
    setPromoError("");
    try {
      const res = await fetch(`/api/promo?code=${encodeURIComponent(promoInput.trim())}&total=${subtotal}`);
      const data = await res.json();
      if (data.valid) {
        setAppliedPromo({ code: promoInput.trim().toUpperCase(), discount: data.discount, message: data.message });
        setPromoInput("");
      } else {
        setPromoError(data.message ?? "كود غير صحيح");
      }
    } catch {
      setPromoError("حدث خطأ أثناء التحقق من الكود");
    } finally {
      setPromoLoading(false);
    }
  };

  const removePromo = () => {
    setAppliedPromo(null);
    setPromoError("");
    setPromoInput("");
  };

  const onSubmit = async (data: OrderFormData) => {
    if (items.length === 0) return;
    setLoading(true);
    try {
      const wilaya = wilayas.find((w) => w.code === data.wilayaCode);
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          wilayaName: wilaya?.name ?? data.wilayaCode,
          items: items.map((item) => ({
            productId: item.id,
            quantity: item.quantity,
            price: item.price,
          })),
          subtotal,
          discount,
          deliveryFee,
          total,
          promoCode: appliedPromo?.code ?? null,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        alert(err.error ?? "حدث خطأ أثناء إرسال الطلب");
        return;
      }

      const order = await res.json();
      clearCart();
      router.push(`/order-success?orderNumber=${order.orderNumber}`);
    } catch {
      alert("حدث خطأ أثناء إرسال الطلب. يرجى المحاولة مرة أخرى.");
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-gray-50 flex items-center">
          <div className="max-w-md mx-auto px-4 py-20 text-center">
            <div className="bg-white rounded-3xl shadow-sm p-10">
              <ShoppingCart className="w-16 h-16 text-gray-200 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-gray-700 mb-2">السلة فارغة</h2>
              <p className="text-gray-400 mb-6 text-sm">أضف منتجات للسلة أولاً لإتمام الطلب</p>
              <Link href="/" className="btn-primary inline-flex items-center gap-2">
                <ArrowRight className="w-4 h-4" />
                تصفح المنتجات
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-2xl font-black text-gray-900 mb-6 flex items-center gap-2">
            <ShoppingCart className="w-6 h-6" />
            إتمام الطلب
          </h1>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* ── Left: Cart Summary ── */}
            <div className="space-y-4">
              <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                  <h2 className="font-bold text-gray-800 flex items-center gap-2">
                    <Package className="w-5 h-5 text-gray-500" />
                    منتجاتك ({items.length})
                  </h2>
                </div>

                <div className="p-4 space-y-3">
                  {items.map((item) => (
                    <div key={item.id} className="flex items-center gap-3 bg-gray-50 rounded-2xl p-3">
                      <div className="relative w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 bg-white border border-gray-200">
                        <Image src={item.image} alt={item.name} fill className="object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm text-gray-800 truncate">{item.name}</p>
                        <p className="text-sm font-bold text-gray-900 mt-0.5">{formatPrice(item.price)}</p>
                        <div className="flex items-center gap-2 mt-1.5">
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="w-6 h-6 bg-white rounded-lg border border-gray-200 flex items-center justify-center hover:bg-gray-100 transition-colors"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="text-sm font-bold w-4 text-center">{item.quantity}</span>
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="w-6 h-6 bg-white rounded-lg border border-gray-200 flex items-center justify-center hover:bg-gray-100 transition-colors"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2 flex-shrink-0">
                        <p className="font-black text-gray-900 text-sm">
                          {formatPrice(item.price * item.quantity)}
                        </p>
                        <button
                          type="button"
                          onClick={() => removeItem(item.id)}
                          className="p-1 text-red-400 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Promo Code */}
                {showPromoCode && (
                  <div className="px-4 pb-4">
                    <div className="border border-dashed border-gray-200 rounded-2xl p-3">
                      <p className="text-xs font-semibold text-gray-500 mb-2 flex items-center gap-1">
                        <Ticket className="w-3.5 h-3.5" />
                        كود الخصم (اختياري)
                      </p>
                      {appliedPromo ? (
                        <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-xl px-3 py-2">
                          <div className="flex items-center gap-2">
                            <Tag className="w-4 h-4 text-green-600" />
                            <div>
                              <p className="text-sm font-bold text-green-700">{appliedPromo.code}</p>
                              <p className="text-xs text-green-600">
                                {appliedPromo.message} — وفّرت {formatPrice(appliedPromo.discount)}
                              </p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={removePromo}
                            className="p-1 hover:bg-green-100 rounded-lg transition-colors"
                          >
                            <X className="w-4 h-4 text-green-600" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={promoInput}
                            onChange={(e) => { setPromoInput(e.target.value.toUpperCase()); setPromoError(""); }}
                            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), applyPromo())}
                            placeholder="أدخل الكود هنا..."
                            className="input-field flex-1 text-sm uppercase"
                            dir="ltr"
                          />
                          <button
                            type="button"
                            onClick={applyPromo}
                            disabled={promoLoading || !promoInput.trim()}
                            className="px-4 py-2 bg-gray-800 text-white text-sm font-medium rounded-xl hover:bg-gray-700 disabled:opacity-50 transition-colors flex-shrink-0"
                          >
                            {promoLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "تطبيق"}
                          </button>
                        </div>
                      )}
                      {promoError && <p className="text-red-500 text-xs mt-1.5">{promoError}</p>}
                    </div>
                  </div>
                )}

                {/* Price Summary */}
                <div className="mx-4 mb-4 bg-gray-50 rounded-2xl p-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">المجموع الفرعي:</span>
                    <span className="font-bold text-gray-800">{formatPrice(subtotal)}</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500 flex items-center gap-1">
                        <Tag className="w-3 h-3" />
                        خصم ({appliedPromo?.code}):
                      </span>
                      <span className="font-bold text-green-600">-{formatPrice(discount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">التوصيل:</span>
                    <span className="font-bold text-gray-800">
                      {deliveryFee > 0 ? formatPrice(deliveryFee) : "يُحسب بعد اختيار الولاية"}
                    </span>
                  </div>
                  <div className="h-px bg-gray-200" />
                  <div className="flex justify-between">
                    <span className="font-bold text-gray-700">الإجمالي:</span>
                    <span className="text-xl font-black text-gray-900">
                      {deliveryFee > 0 ? formatPrice(total) : "—"}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 text-center pt-1">💵 الدفع عند الاستلام فقط</p>
                </div>
              </div>
            </div>

            {/* ── Right: Order Form ── */}
            <div>
              <div className="bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden">
                <div className="bg-gradient-to-l from-yellow-400 to-amber-300 px-6 py-4">
                  <h2 className="font-black text-xl text-gray-900 flex items-center gap-2">
                    📝 بيانات التوصيل
                  </h2>
                  <p className="text-gray-800 text-sm mt-0.5">الدفع عند الاستلام — لا تدفع الآن</p>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
                  {/* Name Row */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        الاسم <span className="text-red-500">*</span>
                      </label>
                      <input
                        {...register("firstName")}
                        placeholder="محمد"
                        className={`input-field ${errors.firstName ? "input-error" : ""}`}
                      />
                      {errors.firstName && (
                        <p className="text-red-500 text-xs mt-1">{errors.firstName.message}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        اللقب <span className="text-red-500">*</span>
                      </label>
                      <input
                        {...register("lastName")}
                        placeholder="بن علي"
                        className={`input-field ${errors.lastName ? "input-error" : ""}`}
                      />
                      {errors.lastName && (
                        <p className="text-red-500 text-xs mt-1">{errors.lastName.message}</p>
                      )}
                    </div>
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      رقم الهاتف <span className="text-red-500">*</span>
                    </label>
                    <input
                      {...register("phone")}
                      placeholder="0550000000"
                      dir="ltr"
                      inputMode="numeric"
                      maxLength={10}
                      onInput={(e) => {
                        const input = e.currentTarget;
                        input.value = input.value.replace(/\D/g, "").slice(0, 10);
                      }}
                      className={`input-field text-left ${errors.phone ? "input-error" : ""}`}
                    />
                    {errors.phone && (
                      <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>
                    )}
                  </div>

                  {/* Wilaya */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      الولاية <span className="text-red-500">*</span>
                    </label>
                    <select
                      {...register("wilayaCode")}
                      className={`input-field ${errors.wilayaCode ? "input-error" : ""}`}
                    >
                      <option value="">— اختر الولاية —</option>
                      {wilayas.map((w) => (
                        <option key={w.code} value={w.code}>
                          {w.code} - {w.name}
                        </option>
                      ))}
                    </select>
                    {errors.wilayaCode && (
                      <p className="text-red-500 text-xs mt-1">{errors.wilayaCode.message}</p>
                    )}
                  </div>

                  {/* Delivery Type */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      نوع التوصيل <span className="text-red-500">*</span>
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <label
                        className={`flex items-center gap-3 p-3 rounded-2xl border-2 cursor-pointer transition-colors ${
                          watchedDeliveryType === "home"
                            ? "border-primary-300 bg-yellow-50"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <input type="radio" {...register("deliveryType")} value="home" className="hidden" />
                        <Home className="w-5 h-5 text-gray-600 flex-shrink-0" />
                        <div>
                          <p className="font-medium text-sm">للمنزل</p>
                          {selectedWilaya && (
                            <p className="text-xs text-gray-500">
                              {formatPrice(getDeliveryPrice(selectedWilaya, "home"))}
                            </p>
                          )}
                        </div>
                      </label>
                      <label
                        className={`flex items-center gap-3 p-3 rounded-2xl border-2 cursor-pointer transition-colors ${
                          watchedDeliveryType === "office"
                            ? "border-primary-300 bg-yellow-50"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <input type="radio" {...register("deliveryType")} value="office" className="hidden" />
                        <Building2 className="w-5 h-5 text-gray-600 flex-shrink-0" />
                        <div>
                          <p className="font-medium text-sm">مكتب البريد</p>
                          {selectedWilaya && (
                            <p className="text-xs text-gray-500">
                              {formatPrice(getDeliveryPrice(selectedWilaya, "office"))}
                            </p>
                          )}
                        </div>
                      </label>
                    </div>
                  </div>

                  {/* Commune - only for home delivery */}
                  {watchedDeliveryType === "home" && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        البلدية <span className="text-red-500">*</span>
                      </label>
                      <select
                        {...register("commune")}
                        disabled={communes.length === 0}
                        className={`input-field ${errors.commune ? "input-error" : ""} disabled:opacity-50`}
                      >
                        <option value="">
                          {communes.length === 0 ? "— اختر الولاية أولاً —" : "— اختر البلدية —"}
                        </option>
                        {communes.map((c) => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* Address - only for home delivery */}
                  {watchedDeliveryType === "home" && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        العنوان التفصيلي <span className="text-red-500">*</span>
                      </label>
                      <input
                        {...register("address")}
                        placeholder="مثال: حي النصر، رقم 12، عمارة ب..."
                        className={`input-field ${errors.address ? "input-error" : ""}`}
                      />
                      {errors.address && (
                        <p className="text-red-500 text-xs mt-1">{errors.address.message}</p>
                      )}
                    </div>
                  )}

                  {/* Notes */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      ملاحظات (اختياري)
                    </label>
                    <textarea
                      {...register("notes")}
                      rows={2}
                      placeholder="أي ملاحظات إضافية للتوصيل..."
                      className="input-field resize-none"
                    />
                  </div>

                  {/* Submit */}
                  <button
                    type="submit"
                    disabled={loading || items.length === 0}
                    className="w-full bg-gray-900 hover:bg-gray-800 disabled:opacity-60 text-white font-black text-lg py-4 rounded-2xl transition-colors flex items-center justify-center gap-2 shadow-lg"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>جاري إرسال الطلب...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-5 h-5" />
                        <span>🛒 تأكيد الطلب</span>
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

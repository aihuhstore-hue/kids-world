"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import {
  Home,
  Building2,
  Loader2,
  CheckCircle,
  Tag,
  X,
  Ticket,
} from "lucide-react";
import { wilayas, getDeliveryPrice } from "@/lib/algeria-data";
import { orderFormSchema, type OrderFormData } from "@/types";
import { formatPrice } from "@/lib/utils";
import type { ParsedProduct } from "@/types";

interface OrderFormProps {
  product: ParsedProduct;
  quantity?: number;
}

export default function OrderForm({ product, quantity: initialQuantity = 1 }: OrderFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [quantity, setQuantity] = useState(initialQuantity);
  const [communes, setCommunes] = useState<string[]>([]);
  const [deliveryFee, setDeliveryFee] = useState(0);
  const [selectedWilaya, setSelectedWilaya] = useState<string>("");

  const [showPromoCode, setShowPromoCode] = useState(false);

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((data) => setShowPromoCode(data.showPromoCode === "true"))
      .catch(() => setShowPromoCode(false));
  }, []);

  // Promo code state
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
    if (watchedWilaya) {
      const wilaya = wilayas.find((w) => w.code === watchedWilaya);
      if (wilaya) {
        setCommunes(wilaya.communes);
        setSelectedWilaya(watchedWilaya);
        setValue("commune", "");
        const fee = getDeliveryPrice(
          watchedWilaya,
          watchedDeliveryType as "home" | "office"
        );
        setDeliveryFee(fee);
      }
    }
  }, [watchedWilaya, watchedDeliveryType, setValue]);

  useEffect(() => {
    if (selectedWilaya) {
      const fee = getDeliveryPrice(
        selectedWilaya,
        watchedDeliveryType as "home" | "office"
      );
      setDeliveryFee(fee);
    }
  }, [watchedDeliveryType, selectedWilaya]);

  const subtotal = product.price * quantity;
  const discount = appliedPromo?.discount ?? 0;
  const total = subtotal + deliveryFee - discount;

  const applyPromo = async () => {
    if (!promoInput.trim()) return;
    setPromoLoading(true);
    setPromoError("");

    try {
      const res = await fetch(
        `/api/promo?code=${encodeURIComponent(promoInput.trim())}&total=${subtotal}`
      );
      const data = await res.json();

      if (data.valid) {
        setAppliedPromo({
          code: promoInput.trim().toUpperCase(),
          discount: data.discount,
          message: data.message,
        });
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
    setLoading(true);
    try {
      const wilaya = wilayas.find((w) => w.code === data.wilayaCode);
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          wilayaName: wilaya?.name ?? data.wilayaCode,
          items: [{ productId: product.id, quantity, price: product.price }],
          subtotal,
          discount,
          deliveryFee,
          total,
          promoCode: appliedPromo?.code ?? null,
        }),
      });

      if (!res.ok) throw new Error("فشل إرسال الطلب");
      const order = await res.json();
      router.push(`/order-success?orderNumber=${order.orderNumber}`);
    } catch {
      alert("حدث خطأ أثناء إرسال الطلب. يرجى المحاولة مرة أخرى.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden">
      {/* Form Header */}
      <div className="bg-gradient-to-l from-yellow-400 to-amber-300 px-6 py-4">
        <h2 className="font-black text-xl text-gray-900 flex items-center gap-2">
          📝 أكمل طلبك الآن
        </h2>
        <p className="text-gray-800 text-sm mt-0.5">
          الدفع عند الاستلام — لا تدفع الآن
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
        {/* Quantity */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            الكمية
          </label>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              className="w-10 h-10 rounded-xl border-2 border-gray-200 flex items-center justify-center text-xl font-bold text-gray-600 hover:border-gray-400 transition-colors"
            >
              −
            </button>
            <span className="w-10 text-center text-lg font-bold text-gray-800">
              {quantity}
            </span>
            <button
              type="button"
              onClick={() => setQuantity((q) => Math.min(10, q + 1))}
              className="w-10 h-10 rounded-xl border-2 border-gray-200 flex items-center justify-center text-xl font-bold text-gray-600 hover:border-gray-400 transition-colors"
            >
              +
            </button>
            <span className="text-xs text-gray-400">(الحد الأقصى 10)</span>
          </div>
        </div>

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
              <p className="text-red-500 text-xs mt-1">
                {errors.firstName.message}
              </p>
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
              <p className="text-red-500 text-xs mt-1">
                {errors.lastName.message}
              </p>
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
            <p className="text-red-500 text-xs mt-1">
              {errors.wilayaCode.message}
            </p>
          )}
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
                {communes.length === 0
                  ? "— اختر الولاية أولاً —"
                  : "— اختر البلدية —"}
              </option>
              {communes.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            {errors.commune && (
              <p className="text-red-500 text-xs mt-1">
                {errors.commune.message}
              </p>
            )}
          </div>
        )}

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
              <input
                type="radio"
                {...register("deliveryType")}
                value="home"
                className="hidden"
              />
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
              <input
                type="radio"
                {...register("deliveryType")}
                value="office"
                className="hidden"
              />
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
          {errors.deliveryType && (
            <p className="text-red-500 text-xs mt-1">
              {errors.deliveryType.message}
            </p>
          )}
        </div>

        {/* Address */}
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
            <p className="text-red-500 text-xs mt-1">
              {errors.address.message}
            </p>
          )}
        </div>


        {/* ── Promo Code ── */}
        {showPromoCode && <div className="border border-dashed border-gray-200 rounded-2xl p-3">
          <p className="text-xs font-semibold text-gray-500 mb-2 flex items-center gap-1">
            <Ticket className="w-3.5 h-3.5" />
            كود الخصم (اختياري)
          </p>

          {appliedPromo ? (
            <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-xl px-3 py-2">
              <div className="flex items-center gap-2">
                <Tag className="w-4 h-4 text-green-600" />
                <div>
                  <p className="text-sm font-bold text-green-700">
                    {appliedPromo.code}
                  </p>
                  <p className="text-xs text-green-600">
                    {appliedPromo.message} — وفّرت{" "}
                    {formatPrice(appliedPromo.discount)}
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
                onChange={(e) => {
                  setPromoInput(e.target.value.toUpperCase());
                  setPromoError("");
                }}
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
                {promoLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  "تطبيق"
                )}
              </button>
            </div>
          )}

          {promoError && (
            <p className="text-red-500 text-xs mt-1.5">{promoError}</p>
          )}
        </div>}

        {/* Order Summary */}
        <div className="bg-gray-50 rounded-2xl p-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="font-bold text-gray-800">
              {formatPrice(subtotal)}
            </span>
            <span className="text-gray-500">سعر المنتج × {quantity}:</span>
          </div>

          {discount > 0 && (
            <div className="flex justify-between text-sm">
              <span className="font-bold text-green-600">
                -{formatPrice(discount)}
              </span>
              <span className="text-gray-500 flex items-center gap-1">
                <Tag className="w-3 h-3" />
                خصم كود {appliedPromo?.code}:
              </span>
            </div>
          )}

          <div className="flex justify-between text-sm">
            <span className="font-bold text-gray-800">
              {deliveryFee > 0 ? formatPrice(deliveryFee) : "—"}
            </span>
            <span className="text-gray-500">رسوم التوصيل:</span>
          </div>

          <div className="h-px bg-gray-200" />
          <div className="flex justify-between">
            <span className="text-xl font-black text-gray-900">
              {deliveryFee > 0
                ? formatPrice(total)
                : "يُحسب بعد اختيار الولاية"}
            </span>
            <span className="font-bold text-gray-700">المجموع الكلي:</span>
          </div>
          <p className="text-xs text-gray-400 text-center pt-1">
            💵 الدفع عند الاستلام فقط
          </p>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
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
  );
}

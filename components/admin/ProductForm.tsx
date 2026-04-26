"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  Plus,
  Trash2,
  Save,
  ArrowRight,
  Package,
  ImageIcon,
  Tag,
  BarChart3,
  Star,
  Upload,
  Loader2,
  Link as LinkIcon,
} from "lucide-react";
import EmojiPicker from "./EmojiPicker";
import { useRef } from "react";
import toast from "react-hot-toast";

interface ProductFormData {
  name: string;
  slug: string;
  description: string;
  longDescription: string;
  hookTitle: string;
  price: string;
  oldPrice: string;
  ageGroup: string;
  type: string;
  stock: string;
  showStock: boolean;
  isActive: boolean;
}

interface ProductFormProps {
  initialData?: Partial<ProductFormData>;
  initialFeatures?: string[];
  initialImages?: string[];
  productId?: string; // если передан — режим редактирования
  mode: "create" | "edit";
}

const EMPTY_FORM: ProductFormData = {
  name: "",
  slug: "",
  description: "",
  longDescription: "",
  hookTitle: "",
  price: "",
  oldPrice: "",
  ageGroup: "YEARS_3_5",
  type: "TOY",
  stock: "10",
  showStock: true,
  isActive: true,
};

const AGE_GROUPS = [
  { value: "MONTHS_0_18", label: "👶 من 0 إلى 18 شهر" },
  { value: "MONTHS_18_36", label: "🧒 من 18 إلى 36 شهر" },
  { value: "YEARS_3_5", label: "🎨 من 3 إلى 5 سنوات" },
  { value: "YEARS_6_PLUS", label: "📚 من 6 سنوات فما فوق" },
];

export default function ProductForm({
  initialData,
  initialFeatures = [""],
  initialImages = [""],
  productId,
  mode,
}: ProductFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [features, setFeatures] = useState<string[]>(
    initialFeatures.length ? initialFeatures : [""]
  );
  const [images, setImages] = useState<string[]>(
    initialImages.length ? initialImages : [""]
  );
  const [form, setForm] = useState<ProductFormData>({
    ...EMPTY_FORM,
    ...initialData,
  });
  const [activeTab, setActiveTab] = useState<"basic" | "pricing" | "media" | "features">("basic");
  const [trackStock, setTrackStock] = useState<boolean>(
    initialData?.stock !== undefined ? parseInt(String(initialData.stock)) > 0 : true
  );

  const update = (key: keyof ProductFormData, value: string | boolean) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const generateSlug = (name: string) =>
    name
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^\w-]/g, "")
      .slice(0, 60);

  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const password = sessionStorage.getItem("admin-password") ?? "";
    setUploading(true);

    const uploadedUrls: string[] = [];
    for (const file of Array.from(files)) {
      const formData = new FormData();
      formData.append("file", file);
      try {
        const res = await fetch("/api/upload", {
          method: "POST",
          headers: { "x-admin-password": password },
          body: formData,
        });
        const data = await res.json();
        if (res.ok && data.url) {
          uploadedUrls.push(data.url);
        } else {
          toast.error(data.error ?? `فشل رفع ${file.name}`);
        }
      } catch {
        toast.error(`خطأ في رفع ${file.name}`);
      }
    }

    if (uploadedUrls.length > 0) {
      setImages((prev) => {
        const filtered = prev.filter((i) => i.trim());
        return [...filtered, ...uploadedUrls];
      });
      toast.success(`تم رفع ${uploadedUrls.length} صورة بنجاح ✅`);
    }
    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validFeatures = features.filter((f) => f.trim());
    const validImages = images.filter((i) => i.trim());

    if (!form.name) {
      toast.error("يرجى إدخال اسم المنتج");
      return;
    }

    if (!form.price || parseFloat(form.price) <= 0) {
      toast.error("يرجى إدخال سعر المنتج");
      setActiveTab("pricing");
      return;
    }

    setLoading(true);
    const password = sessionStorage.getItem("admin-password") ?? "";

    try {
      const payload = {
        ...form,
        slug: form.slug || generateSlug(form.name),
        price: parseFloat(form.price) || 0,
        oldPrice: form.oldPrice ? parseFloat(form.oldPrice) : null,
        stock: trackStock ? (parseInt(form.stock) || 0) : 0,
        showStock: form.showStock,
        features: validFeatures,
        images: validImages,
      };

      const url =
        mode === "edit" ? `/api/products/${productId}` : "/api/products";
      const method = mode === "edit" ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          "x-admin-password": password,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error ?? "حدث خطأ أثناء الحفظ");
        return;
      }

      toast.success(
        mode === "edit" ? "تم تحديث المنتج بنجاح ✅" : "تم إنشاء المنتج بنجاح ✅"
      );
      router.push("/admin/products");
    } finally {
      setLoading(false);
    }
  };

  const discount = form.price && form.oldPrice
    ? Math.round(
        ((parseFloat(form.oldPrice) - parseFloat(form.price)) /
          parseFloat(form.oldPrice)) *
          100
      )
    : null;

  const tabs = [
    { id: "basic", label: "المعلومات", icon: Package },
    { id: "pricing", label: "السعر والتصنيف", icon: Tag },
    { id: "media", label: "الصور", icon: ImageIcon },
    { id: "features", label: "المميزات", icon: Star },
  ] as const;

  return (
    <div className="max-w-3xl">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button
          type="button"
          onClick={() => router.push("/admin/products")}
          className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
        >
          <ArrowRight className="w-5 h-5 text-gray-600" />
        </button>
        <h1 className="font-black text-gray-900 text-lg">
          {mode === "edit" ? "تعديل المنتج" : "إضافة منتج جديد"}
        </h1>
        {mode === "edit" && (
          <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full font-medium">
            وضع التعديل
          </span>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-2xl mb-5">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-semibold transition-all ${
              activeTab === tab.id
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <tab.icon className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* ── Tab: Basic Info ── */}
        {activeTab === "basic" && (
          <div className="bg-white rounded-2xl p-5 shadow-sm space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                اسم المنتج <span className="text-red-500">*</span>
              </label>
              <input
                value={form.name}
                onChange={(e) => {
                  update("name", e.target.value);
                  if (!form.slug || mode === "create")
                    update("slug", generateSlug(e.target.value));
                }}
                className="input-field"
                placeholder="مثال: لعبة المكعبات التعليمية الملونة"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                العنوان الجذاب (Hook)
              </label>
              <div className="flex gap-2 items-center">
                <input
                  value={form.hookTitle}
                  onChange={(e) => update("hookTitle", e.target.value)}
                  className="input-field flex-1"
                  placeholder="هل تريد لعبة تنمي ذكاء طفلك وتبعده عن الشاشات؟ 🧠"
                />
                <EmojiPicker
                  onSelect={(emoji) => update("hookTitle", form.hookTitle + emoji)}
                />
              </div>
              <p className="text-xs text-gray-400 mt-1">
                يظهر في أعلى صفحة المنتج — اجعله مقنعاً
              </p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                وصف مختصر
              </label>
              <textarea
                rows={2}
                value={form.description}
                onChange={(e) => update("description", e.target.value)}
                className="input-field resize-none"
                placeholder="وصف قصير وجذاب للمنتج..."
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                وصف تفصيلي (اختياري)
              </label>
              <textarea
                rows={4}
                value={form.longDescription}
                onChange={(e) => update("longDescription", e.target.value)}
                className="input-field resize-none"
                placeholder="تفاصيل إضافية عن المنتج، طريقة الاستخدام، المواد..."
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                رابط URL (Slug)
              </label>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-400">/product/</span>
                <input
                  value={form.slug}
                  onChange={(e) => update("slug", e.target.value)}
                  className="input-field flex-1 text-sm"
                  dir="ltr"
                  placeholder="educational-blocks-toy"
                />
              </div>
            </div>
          </div>
        )}

        {/* ── Tab: Pricing & Classification ── */}
        {activeTab === "pricing" && (
          <div className="bg-white rounded-2xl p-5 shadow-sm space-y-4">
            {/* Prices */}
            <div>
              <h3 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <BarChart3 className="w-4 h-4" />
                السعر
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    السعر الحالي (دج)
                  </label>
                  <input
                    type="number"
                    value={form.price}
                    onChange={(e) => update("price", e.target.value)}
                    className="input-field"
                    min="0"
                    placeholder="2500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    السعر القديم (قبل الخصم)
                  </label>
                  <input
                    type="number"
                    value={form.oldPrice}
                    onChange={(e) => update("oldPrice", e.target.value)}
                    className="input-field"
                    min="0"
                    placeholder="3500"
                  />
                </div>
              </div>
              {discount !== null && discount > 0 && (
                <div className="mt-2 bg-red-50 border border-red-200 rounded-xl px-3 py-2 text-sm text-red-700 font-semibold">
                  سيظهر خصم -{discount}% على المنتج 🎉
                </div>
              )}
            </div>

            {/* Classification */}
            <div>
              <h3 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <Tag className="w-4 h-4" />
                التصنيف
              </h3>

              {/* Type */}
              <div className="mb-3">
                <label className="block text-xs font-medium text-gray-600 mb-2">
                  نوع المنتج
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { value: "TOY", label: "🧸 لعبة", desc: "ألعاب تعليمية وترفيهية" },
                    { value: "BOOK", label: "📚 كتاب", desc: "كتب وقصص للأطفال" },
                  ].map((t) => (
                    <label
                      key={t.value}
                      className={`flex items-center gap-3 p-3 rounded-2xl border-2 cursor-pointer transition-all ${
                        form.type === t.value
                          ? "border-gray-900 bg-gray-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <input
                        type="radio"
                        name="type"
                        value={t.value}
                        checked={form.type === t.value}
                        onChange={() => update("type", t.value)}
                        className="hidden"
                      />
                      <div>
                        <p className="font-bold text-sm">{t.label}</p>
                        <p className="text-xs text-gray-500">{t.desc}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Age Group */}
              <div className="mb-3">
                <label className="block text-xs font-medium text-gray-600 mb-2">
                  الفئة العمرية
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {AGE_GROUPS.map((ag) => (
                    <label
                      key={ag.value}
                      className={`flex items-center gap-2 p-2.5 rounded-xl border-2 cursor-pointer text-sm transition-all ${
                        form.ageGroup === ag.value
                          ? "border-blue-500 bg-blue-50 text-blue-700 font-semibold"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <input
                        type="radio"
                        name="ageGroup"
                        value={ag.value}
                        checked={form.ageGroup === ag.value}
                        onChange={() => update("ageGroup", ag.value)}
                        className="hidden"
                      />
                      {ag.label}
                    </label>
                  ))}
                </div>
              </div>

              {/* Stock + Active */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-medium text-gray-600">
                      المخزون (قطع)
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setTrackStock((prev) => {
                          if (prev) update("stock", "0");
                          return !prev;
                        });
                      }}
                      className={`relative w-9 h-5 rounded-full transition-colors flex-shrink-0 ${
                        trackStock ? "bg-green-500" : "bg-gray-300"
                      }`}
                    >
                      <div
                        className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${
                          trackStock ? "right-0.5" : "left-0.5"
                        }`}
                      />
                    </button>
                  </div>
                  <input
                    type="number"
                    value={trackStock ? form.stock : ""}
                    onChange={(e) => update("stock", e.target.value)}
                    disabled={!trackStock}
                    className={`input-field transition-opacity ${!trackStock ? "opacity-40 cursor-not-allowed bg-gray-50" : ""}`}
                    min="0"
                    placeholder={trackStock ? "10" : "غير محدد"}
                  />
                  {!trackStock && (
                    <p className="text-xs text-gray-400 mt-1">تتبع المخزون معطّل</p>
                  )}
                  {trackStock && parseInt(form.stock) <= 5 && parseInt(form.stock) > 0 && (
                    <p className="text-xs text-orange-500 mt-1">⚠ مخزون منخفض</p>
                  )}
                  {trackStock && parseInt(form.stock) === 0 && (
                    <p className="text-xs text-red-500 mt-1">🔴 نفد المخزون</p>
                  )}
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    الحالة
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer p-3 rounded-xl border-2 border-gray-200 hover:border-gray-300 transition-all">
                    <div
                      className={`relative w-10 h-5 rounded-full transition-colors ${
                        form.isActive ? "bg-green-500" : "bg-gray-300"
                      }`}
                    >
                      <div
                        className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                          form.isActive ? "right-0.5" : "left-0.5"
                        }`}
                      />
                    </div>
                    <span className="text-sm font-medium">
                      {form.isActive ? "نشط (مرئي)" : "مخفي"}
                    </span>
                    <input
                      type="checkbox"
                      checked={form.isActive}
                      onChange={(e) => update("isActive", e.target.checked)}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {/* Show Stock Toggle */}
              <div className="border border-dashed border-gray-200 rounded-xl p-3">
                <label className="flex items-center justify-between cursor-pointer">
                  <div>
                    <p className="text-sm font-semibold text-gray-700">
                      إظهار المخزون للزبائن
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {form.showStock
                        ? "يظهر «بقيت X قطع» في صفحة المنتج"
                        : "لا يظهر عدد المخزون للزبائن"}
                    </p>
                  </div>
                  <div
                    className={`relative w-12 h-6 rounded-full transition-colors flex-shrink-0 ${
                      form.showStock ? "bg-blue-500" : "bg-gray-300"
                    }`}
                  >
                    <div
                      className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${
                        form.showStock ? "right-1" : "left-1"
                      }`}
                    />
                  </div>
                  <input
                    type="checkbox"
                    checked={form.showStock}
                    onChange={(e) => update("showStock", e.target.checked)}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          </div>
        )}

        {/* ── Tab: Images ── */}
        {activeTab === "media" && (
          <div className="bg-white rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-700 flex items-center gap-2">
                <ImageIcon className="w-4 h-4" />
                صور المنتج
              </h3>
              <button
                type="button"
                onClick={() => setImages([...images, ""])}
                className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1 font-medium"
              >
                <Plus className="w-3.5 h-3.5" />
                رابط URL
              </button>
            </div>

            {/* ── Upload Zone ── */}
            <div
              className={`relative border-2 border-dashed rounded-2xl p-6 text-center transition-all ${
                uploading
                  ? "border-blue-300 bg-blue-50"
                  : "border-gray-200 hover:border-blue-300 hover:bg-blue-50 cursor-pointer"
              }`}
              onClick={() => !uploading && fileInputRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                handleFileUpload(e.dataTransfer.files);
              }}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
                multiple
                className="hidden"
                onChange={(e) => handleFileUpload(e.target.files)}
              />

              {uploading ? (
                <div className="flex flex-col items-center gap-2">
                  <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                  <p className="text-sm font-medium text-blue-600">جاري رفع الصور...</p>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2">
                  <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto">
                    <Upload className="w-6 h-6 text-blue-500" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-700 text-sm">
                      اسحب الصور هنا أو اضغط للاختيار
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      JPG, PNG, WebP, GIF — الحد الأقصى 5MB لكل صورة
                    </p>
                  </div>
                  <button
                    type="button"
                    className="mt-1 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-xl hover:bg-blue-700 transition-colors flex items-center gap-2"
                  >
                    <Upload className="w-4 h-4" />
                    رفع من الحاسوب
                  </button>
                </div>
              )}
            </div>

            {/* ── URL Inputs ── */}
            {images.length > 0 && (
              <div className="space-y-3">
                <p className="text-xs font-semibold text-gray-500 flex items-center gap-1">
                  <LinkIcon className="w-3 h-3" />
                  روابط الصور
                </p>
                {images.map((img, i) => (
                  <div key={i} className="space-y-2">
                    <div className="flex gap-2 items-center">
                      <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center text-xs font-bold text-gray-500 flex-shrink-0">
                        {i + 1}
                      </div>
                      <input
                        value={img}
                        onChange={(e) => {
                          const n = [...images];
                          n[i] = e.target.value;
                          setImages(n);
                        }}
                        className="input-field flex-1 text-sm"
                        dir="ltr"
                        placeholder="https://example.com/image.jpg"
                      />
                      <button
                        type="button"
                        onClick={() => setImages(images.filter((_, j) => j !== i))}
                        className="p-2 text-red-400 hover:bg-red-50 rounded-xl transition-colors flex-shrink-0"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    {/* Preview */}
                    {img.trim() && (
                      <div className={`relative rounded-xl overflow-hidden bg-gray-100 mr-8 ${i === 0 ? "h-52" : "h-24"}`}>
                        <Image
                          src={img}
                          alt={`صورة ${i + 1}`}
                          fill
                          className="object-cover"
                          onError={() => {}}
                        />
                        {i === 0 && (
                          <div className="absolute top-2 right-2 bg-yellow-400 text-xs font-bold px-2 py-0.5 rounded-lg text-gray-900">
                            الصورة الرئيسية
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Grid Preview */}
            {images.filter((i) => i.trim()).length > 1 && (
              <div>
                <p className="text-xs font-semibold text-gray-500 mb-2">معاينة المعرض:</p>
                <div className="grid grid-cols-4 gap-2">
                  {images.filter((i) => i.trim()).map((img, i) => (
                    <div
                      key={i}
                      className="relative aspect-square rounded-xl overflow-hidden bg-gray-100 border-2 border-transparent hover:border-blue-300 transition-colors"
                    >
                      <Image src={img} alt="" fill className="object-cover" onError={() => {}} />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── Tab: Features ── */}
        {activeTab === "features" && (
          <div className="bg-white rounded-2xl p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-700 flex items-center gap-2">
                <Star className="w-4 h-4" />
                مميزات المنتج
              </h3>
              <button
                type="button"
                onClick={() => setFeatures([...features, ""])}
                className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1 font-medium"
              >
                <Plus className="w-3.5 h-3.5" />
                إضافة ميزة
              </button>
            </div>

            <p className="text-xs text-gray-400">
              تظهر في صفحة المنتج مع أيقونة ✓ — اجعلها واضحة وجذابة
            </p>

            <div className="space-y-2">
              {features.map((f, i) => (
                <div key={i} className="flex gap-2 items-center">
                  <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center text-xs text-green-600 flex-shrink-0">
                    ✓
                  </div>
                  <input
                    value={f}
                    onChange={(e) => {
                      const n = [...features];
                      n[i] = e.target.value;
                      setFeatures(n);
                    }}
                    className="input-field flex-1 text-sm"
                    placeholder="مثال: يُنمّي المهارات الحركية الدقيقة"
                  />
                  <EmojiPicker
                    onSelect={(emoji) => {
                      const n = [...features];
                      n[i] = n[i] + emoji;
                      setFeatures(n);
                    }}
                  />
                  {features.length > 1 && (
                    <button
                      type="button"
                      onClick={() => setFeatures(features.filter((_, j) => j !== i))}
                      className="p-2 text-red-400 hover:bg-red-50 rounded-xl transition-colors flex-shrink-0"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>

            {features.filter((f) => f.trim()).length > 0 && (
              <div className="mt-4 bg-gray-50 rounded-xl p-3">
                <p className="text-xs font-semibold text-gray-500 mb-2">معاينة:</p>
                <div className="space-y-1">
                  {features.filter((f) => f.trim()).map((f, i) => (
                    <p key={i} className="text-sm text-gray-700 flex items-center gap-2">
                      <span className="text-green-500 font-bold">✓</span>
                      {f}
                    </p>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex gap-3">
          {activeTab !== "basic" && (
            <button
              type="button"
              onClick={() => {
                const order = ["basic", "pricing", "media", "features"];
                const idx = order.indexOf(activeTab);
                setActiveTab(order[idx - 1] as typeof activeTab);
              }}
              className="px-5 py-3 border border-gray-200 rounded-2xl font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              → السابق
            </button>
          )}

          {activeTab !== "features" ? (
            <button
              type="button"
              onClick={() => {
                const order = ["basic", "pricing", "media", "features"];
                const idx = order.indexOf(activeTab);
                setActiveTab(order[idx + 1] as typeof activeTab);
              }}
              className="flex-1 py-3 bg-gray-100 text-gray-800 rounded-2xl font-semibold hover:bg-gray-200 transition-colors"
            >
              التالي ←
            </button>
          ) : null}

          <button
            type="submit"
            disabled={loading}
            className="flex-1 flex items-center justify-center gap-2 py-3 bg-gray-900 text-white rounded-2xl font-bold hover:bg-gray-800 disabled:opacity-60 transition-colors shadow-lg"
          >
            <Save className="w-5 h-5" />
            {loading
              ? "جاري الحفظ..."
              : mode === "edit"
              ? "حفظ التعديلات"
              : "إنشاء المنتج"}
          </button>
        </div>
      </form>
    </div>
  );
}

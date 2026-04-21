"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Plus,
  Pencil,
  Eye,
  EyeOff,
  Trash2,
  Search,
  RefreshCw,
  Package,
  LayoutGrid,
  List,
  ArrowUpDown,
  ExternalLink,
  AlertTriangle,
} from "lucide-react";
import { formatPrice, getAgeGroupLabel, parseProduct } from "@/lib/utils";
import toast from "react-hot-toast";
import type { ParsedProduct, Product } from "@/types";

const AGE_FILTERS = [
  { value: "", label: "كل الأعمار" },
  { value: "MONTHS_0_18", label: "0–18 شهر" },
  { value: "MONTHS_18_36", label: "18–36 شهر" },
  { value: "YEARS_3_5", label: "3–5 سنوات" },
  { value: "YEARS_6_PLUS", label: "6+ سنوات" },
];

const TYPE_FILTERS = [
  { value: "", label: "الكل" },
  { value: "TOY", label: "ألعاب" },
  { value: "BOOK", label: "كتب" },
];

const SORT_OPTIONS = [
  { value: "newest", label: "الأحدث" },
  { value: "oldest", label: "الأقدم" },
  { value: "price_asc", label: "السعر ↑" },
  { value: "price_desc", label: "السعر ↓" },
  { value: "stock_asc", label: "المخزون ↑" },
];

function StockBadge({ stock }: { stock: number }) {
  if (stock === 0)
    return (
      <span className="text-xs px-2 py-0.5 bg-red-100 text-red-600 rounded-full font-semibold">
        نفد
      </span>
    );
  if (stock <= 5)
    return (
      <span className="text-xs px-2 py-0.5 bg-orange-100 text-orange-600 rounded-full font-semibold flex items-center gap-1">
        <AlertTriangle className="w-3 h-3" />
        {stock} متبقي
      </span>
    );
  return (
    <span className="text-xs px-2 py-0.5 bg-green-100 text-green-700 rounded-full font-semibold">
      {stock} في المخزون
    </span>
  );
}

export default function AdminProducts() {
  const [products, setProducts] = useState<ParsedProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [password, setPassword] = useState("");
  const [view, setView] = useState<"grid" | "list">("grid");
  const [search, setSearch] = useState("");
  const [ageFilter, setAgeFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [sort, setSort] = useState("newest");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchProducts = useCallback(
    async (pass?: string) => {
      setLoading(true);
      try {
        const activePass = pass ?? password;
        const params = new URLSearchParams();
        if (ageFilter) params.set("ageGroup", ageFilter);
        if (typeFilter) params.set("type", typeFilter);
        if (search) params.set("search", search);
        params.set("sort", sort);

        const res = await fetch(`/api/products?${params}`, {
          headers: { "x-admin-password": activePass },
        });
        const data = await res.json();
        setProducts((data as Product[]).map(parseProduct));
      } finally {
        setLoading(false);
      }
    },
    [password, ageFilter, typeFilter, search, sort]
  );

  useEffect(() => {
    const pass = sessionStorage.getItem("admin-password") ?? "";
    setPassword(pass);
    fetchProducts(pass);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ageFilter, typeFilter, sort]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchProducts();
  };

  const toggleActive = async (id: string, isActive: boolean) => {
    try {
      await fetch(`/api/products/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-admin-password": password,
        },
        body: JSON.stringify({ isActive: !isActive }),
      });
      setProducts((prev) =>
        prev.map((p) => (p.id === id ? { ...p, isActive: !isActive } : p))
      );
      toast.success(isActive ? "تم إخفاء المنتج" : "تم إظهار المنتج");
    } catch {
      toast.error("حدث خطأ");
    }
  };

  const deleteProduct = async (id: string, name: string) => {
    if (!confirm(`حذف "${name}" نهائياً؟\nهذا الإجراء لا يمكن التراجع عنه.`)) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/products/${id}`, {
        method: "DELETE",
        headers: { "x-admin-password": password },
      });
      if (res.ok) {
        setProducts((prev) => prev.filter((p) => p.id !== id));
        toast.success("تم حذف المنتج");
      } else {
        const data = await res.json();
        toast.error(data.error ?? "فشل الحذف");
      }
    } finally {
      setDeletingId(null);
    }
  };

  // Stats
  const totalActive = products.filter((p) => p.isActive).length;
  const totalHidden = products.filter((p) => !p.isActive).length;
  const lowStock = products.filter((p) => p.stock <= 5 && p.isActive).length;

  return (
    <div className="space-y-5">
      {/* Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "إجمالي المنتجات", value: products.length, color: "bg-blue-50 text-blue-700" },
          { label: "نشطة", value: totalActive, color: "bg-green-50 text-green-700" },
          { label: "مخفية", value: totalHidden, color: "bg-gray-100 text-gray-600" },
          { label: "مخزون منخفض", value: lowStock, color: "bg-orange-50 text-orange-600" },
        ].map((stat) => (
          <div key={stat.label} className={`rounded-2xl p-4 ${stat.color}`}>
            <p className="text-2xl font-black">{stat.value}</p>
            <p className="text-xs font-medium mt-0.5 opacity-80">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4 space-y-3">
        {/* Search */}
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="ابحث عن منتج..."
              className="input-field pr-9 text-sm"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-gray-900 text-white rounded-xl text-sm font-medium hover:bg-gray-800 transition-colors"
          >
            بحث
          </button>
        </form>

        {/* Filters Row */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Type Filter */}
          <div className="flex gap-1 bg-gray-100 p-1 rounded-xl">
            {TYPE_FILTERS.map((f) => (
              <button
                key={f.value}
                onClick={() => setTypeFilter(f.value)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                  typeFilter === f.value
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Age Filter */}
          <select
            value={ageFilter}
            onChange={(e) => setAgeFilter(e.target.value)}
            className="text-xs border border-gray-200 rounded-xl px-3 py-2 bg-white focus:outline-none focus:border-gray-400"
          >
            {AGE_FILTERS.map((f) => (
              <option key={f.value} value={f.value}>
                {f.label}
              </option>
            ))}
          </select>

          {/* Sort */}
          <div className="flex items-center gap-1 border border-gray-200 rounded-xl px-3 py-1.5">
            <ArrowUpDown className="w-3.5 h-3.5 text-gray-400" />
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="text-xs bg-transparent focus:outline-none text-gray-700"
            >
              {SORT_OPTIONS.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>

          <div className="mr-auto flex items-center gap-2">
            {/* View Toggle */}
            <div className="flex gap-1 bg-gray-100 p-1 rounded-xl">
              <button
                onClick={() => setView("grid")}
                className={`p-1.5 rounded-lg transition-all ${view === "grid" ? "bg-white shadow-sm" : "text-gray-400"}`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setView("list")}
                className={`p-1.5 rounded-lg transition-all ${view === "list" ? "bg-white shadow-sm" : "text-gray-400"}`}
              >
                <List className="w-3.5 h-3.5" />
              </button>
            </div>

            <button
              onClick={() => fetchProducts()}
              className="p-2 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
              title="تحديث"
            >
              <RefreshCw className="w-4 h-4 text-gray-500" />
            </button>

            <Link
              href="/admin/products/new"
              className="flex items-center gap-1.5 px-4 py-2 bg-gray-900 text-white rounded-xl text-sm font-semibold hover:bg-gray-800 transition-colors"
            >
              <Plus className="w-4 h-4" />
              منتج جديد
            </Link>
          </div>
        </div>
      </div>

      {/* Products */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-16 text-gray-400">
          <RefreshCw className="w-8 h-8 animate-spin mb-3 text-gray-300" />
          <p>جاري التحميل...</p>
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
          <Package className="w-12 h-12 text-gray-200 mx-auto mb-3" />
          <p className="text-gray-400 font-medium">لا توجد منتجات</p>
          <Link
            href="/admin/products/new"
            className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-gray-900 text-white rounded-xl text-sm font-medium"
          >
            <Plus className="w-4 h-4" />
            أضف منتجاً
          </Link>
        </div>
      ) : view === "grid" ? (
        /* ── Grid View ── */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {products.map((product) => (
            <div
              key={product.id}
              className={`bg-white rounded-2xl overflow-hidden shadow-sm border transition-all ${
                product.isActive
                  ? "border-gray-100 hover:shadow-md"
                  : "border-gray-100 opacity-60"
              }`}
            >
              {/* Image */}
              <div className="relative aspect-square bg-gray-50">
                <Image
                  src={product.images[0] ?? "https://picsum.photos/400/400"}
                  alt={product.name}
                  fill
                  className="object-cover"
                />
                {/* Badges */}
                <div className="absolute top-2 right-2 flex flex-col gap-1">
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                      product.isActive
                        ? "bg-green-500 text-white"
                        : "bg-gray-500 text-white"
                    }`}
                  >
                    {product.isActive ? "نشط" : "مخفي"}
                  </span>
                  <span className="text-xs px-2 py-0.5 bg-white/90 text-gray-700 rounded-full font-medium">
                    {product.type === "TOY" ? "🧸 لعبة" : "📚 كتاب"}
                  </span>
                </div>
                {product.stock === 0 && (
                  <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                    <span className="bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                      نفد المخزون
                    </span>
                  </div>
                )}
              </div>

              <div className="p-3 space-y-2">
                <p className="font-bold text-gray-800 text-sm line-clamp-2 leading-snug">
                  {product.name}
                </p>

                <div className="flex flex-wrap gap-1">
                  <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">
                    {getAgeGroupLabel(product.ageGroup)}
                  </span>
                  <StockBadge stock={product.stock} />
                </div>

                <div className="flex items-center gap-2">
                  <span className="font-black text-gray-900 text-sm">
                    {formatPrice(product.price)}
                  </span>
                  {product.oldPrice && (
                    <span className="text-xs text-gray-400 line-through">
                      {formatPrice(product.oldPrice)}
                    </span>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 pt-1 border-t border-gray-100">
                  <Link
                    href={`/product/${product.slug}`}
                    target="_blank"
                    className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="عرض في الموقع"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Link>
                  <Link
                    href={`/admin/products/${product.id}/edit`}
                    className="p-1.5 text-gray-400 hover:text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors"
                    title="تعديل"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </Link>
                  <button
                    onClick={() => toggleActive(product.id, product.isActive)}
                    className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                    title={product.isActive ? "إخفاء" : "إظهار"}
                  >
                    {product.isActive ? (
                      <EyeOff className="w-3.5 h-3.5" />
                    ) : (
                      <Eye className="w-3.5 h-3.5" />
                    )}
                  </button>
                  <button
                    onClick={() => deleteProduct(product.id, product.name)}
                    disabled={deletingId === product.id}
                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 mr-auto"
                    title="حذف نهائي"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* ── List View ── */
        <div className="space-y-2">
          {products.map((product) => (
            <div
              key={product.id}
              className={`bg-white rounded-2xl border flex items-center gap-4 p-3 transition-all ${
                product.isActive
                  ? "border-gray-100 hover:shadow-sm"
                  : "border-gray-100 opacity-60"
              }`}
            >
              {/* Image */}
              <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-gray-50 flex-shrink-0">
                <Image
                  src={product.images[0] ?? "https://picsum.photos/100/100"}
                  alt={product.name}
                  fill
                  className="object-cover"
                />
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="font-bold text-gray-800 text-sm truncate">
                  {product.name}
                </p>
                <div className="flex flex-wrap gap-1 mt-1">
                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                    {product.type === "TOY" ? "🧸 لعبة" : "📚 كتاب"}
                  </span>
                  <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">
                    {getAgeGroupLabel(product.ageGroup)}
                  </span>
                  <StockBadge stock={product.stock} />
                </div>
              </div>

              {/* Price */}
              <div className="text-left flex-shrink-0">
                <p className="font-black text-gray-900 text-sm">
                  {formatPrice(product.price)}
                </p>
                {product.oldPrice && (
                  <p className="text-xs text-gray-400 line-through">
                    {formatPrice(product.oldPrice)}
                  </p>
                )}
              </div>

              {/* Status */}
              <span
                className={`text-xs px-2.5 py-1 rounded-full font-semibold flex-shrink-0 ${
                  product.isActive
                    ? "bg-green-100 text-green-700"
                    : "bg-gray-100 text-gray-500"
                }`}
              >
                {product.isActive ? "نشط" : "مخفي"}
              </span>

              {/* Actions */}
              <div className="flex items-center gap-1 flex-shrink-0">
                <Link
                  href={`/product/${product.slug}`}
                  target="_blank"
                  className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  title="عرض"
                >
                  <ExternalLink className="w-4 h-4" />
                </Link>
                <Link
                  href={`/admin/products/${product.id}/edit`}
                  className="p-1.5 text-gray-400 hover:text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors"
                  title="تعديل"
                >
                  <Pencil className="w-4 h-4" />
                </Link>
                <button
                  onClick={() => toggleActive(product.id, product.isActive)}
                  className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                  title={product.isActive ? "إخفاء" : "إظهار"}
                >
                  {product.isActive ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
                <button
                  onClick={() => deleteProduct(product.id, product.name)}
                  disabled={deletingId === product.id}
                  className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                  title="حذف"
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

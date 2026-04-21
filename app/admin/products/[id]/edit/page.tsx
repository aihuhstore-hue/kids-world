"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import ProductForm from "@/components/admin/ProductForm";
import { RefreshCw } from "lucide-react";

export default function EditProductPage() {
  const params = useParams();
  const id = params.id as string;

  const [product, setProduct] = useState<{
    name: string;
    slug: string;
    description: string;
    longDescription: string | null;
    hookTitle: string;
    price: number;
    oldPrice: number | null;
    ageGroup: string;
    type: string;
    stock: number;
    showStock: boolean;
    isActive: boolean;
    features: string;
    images: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await fetch(`/api/products/${id}`);
        if (!res.ok) {
          setError("المنتج غير موجود");
          return;
        }
        const data = await res.json();
        setProduct(data);
      } catch {
        setError("حدث خطأ أثناء التحميل");
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-gray-400">
        <RefreshCw className="w-8 h-8 animate-spin mb-3 text-gray-300" />
        <p>جاري تحميل المنتج...</p>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="text-center py-16 text-red-500">
        <p className="font-bold">{error || "المنتج غير موجود"}</p>
      </div>
    );
  }

  const features = (() => {
    try { return JSON.parse(product.features) as string[]; } catch { return [""]; }
  })();

  const images = (() => {
    try { return JSON.parse(product.images) as string[]; } catch { return [""]; }
  })();

  return (
    <ProductForm
      mode="edit"
      productId={id}
      initialData={{
        name: product.name,
        slug: product.slug,
        description: product.description,
        longDescription: product.longDescription ?? "",
        hookTitle: product.hookTitle,
        price: product.price.toString(),
        oldPrice: product.oldPrice?.toString() ?? "",
        ageGroup: product.ageGroup,
        type: product.type,
        stock: product.stock.toString(),
        showStock: product.showStock,
        isActive: product.isActive,
      }}
      initialFeatures={features.length ? features : [""]}
      initialImages={images.length ? images : [""]}
    />
  );
}

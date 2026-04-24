"use client";

import Image from "next/image";
import Link from "next/link";
import { ShoppingCart, Star, Tag } from "lucide-react";
import { useCartStore } from "@/store/cart";
import { formatPrice, getAgeGroupLabel } from "@/lib/utils";
import { PRODUCT_TYPE_LABELS, type ParsedProduct } from "@/types";
import toast from "react-hot-toast";

interface ProductCardProps {
  product: ParsedProduct;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCartStore();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    addItem({
      id: product.id,
      slug: product.slug,
      name: product.name,
      price: product.price,
      image: product.images[0] ?? "",
    });
    toast.success(`تمت إضافة "${product.name}" للسلة`);
  };

  const typeLabel = PRODUCT_TYPE_LABELS[product.type as "BOOK" | "TOY"] ?? product.type;
  const ageLabel = getAgeGroupLabel(product.ageGroup);
  const mainImage = product.images[0] ?? "https://picsum.photos/400/400";

  return (
    <Link href={`/product/${product.slug}`} className="block group">
      <div className="card hover:scale-[1.02] transition-transform duration-200">
        {/* Image */}
        <div className="relative aspect-square bg-gray-50">
          <Image
            src={mainImage}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />

          {/* Badges */}
          <div className="absolute top-3 right-3 flex flex-col gap-1">
            {product.oldPrice && (
              <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-lg">
                خصم!
              </span>
            )}
          </div>

          {/* Type badge */}
          <div className="absolute bottom-3 left-3">
            <span className="bg-white/90 backdrop-blur-sm text-gray-700 text-xs font-medium px-2 py-1 rounded-lg flex items-center gap-1">
              <Tag className="w-3 h-3" />
              {typeLabel}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          <p className="text-xs text-secondary-500 font-medium mb-1 flex items-center gap-1">
            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
            {ageLabel}
          </p>
          <h3 className="font-bold text-gray-800 text-sm leading-snug mb-2 line-clamp-2">
            {product.name}
          </h3>

          {/* Price */}
          <div className="flex items-center gap-2 mb-3">
            <span className="text-lg font-black text-gray-900">
              {formatPrice(product.price)}
            </span>
            {product.oldPrice && (
              <span className="text-sm text-gray-400 line-through">
                {formatPrice(product.oldPrice)}
              </span>
            )}
          </div>

          {/* Buttons */}
          <div className="flex gap-2">
            <button
              onClick={handleAddToCart}
              className="flex-shrink-0 w-10 h-10 bg-primary-100 hover:bg-primary-200 text-gray-800 rounded-xl flex items-center justify-center transition-colors"
              title="أضف للسلة"
            >
              <ShoppingCart className="w-4 h-4" />
            </button>
            <Link
              href={`/product/${product.slug}`}
              className="flex-1 bg-gray-900 hover:bg-gray-800 text-white text-center text-sm font-bold py-2 px-3 rounded-xl transition-colors"
            >
              اطلب الآن
            </Link>
          </div>
        </div>
      </div>
    </Link>
  );
}

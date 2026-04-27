import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import OrderForm from "@/components/product/OrderForm";
import ImageGallery from "@/components/product/ImageGallery";
import { prisma } from "@/lib/prisma";
import { parseProduct, formatPrice, getAgeGroupLabel } from "@/lib/utils";
import { PRODUCT_TYPE_LABELS } from "@/types";
import { CheckCircle, Tag, Users, Package, Star } from "lucide-react";

export const revalidate = 60;

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const decodedSlug = decodeURIComponent(slug);
  const product = await prisma.product.findUnique({
    where: { slug: decodedSlug },
  });
  if (!product) return {};
  return {
    title: product.name,
    description: product.description,
    openGraph: {
      title: product.name,
      description: product.description,
      images: [JSON.parse(product.images)[0]],
    },
  };
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const decodedSlug = decodeURIComponent(slug);
  const rawProduct = await prisma.product.findUnique({
    where: { slug: decodedSlug, isActive: true },
  });

  if (!rawProduct) notFound();

  const product = parseProduct(rawProduct);
  const discount = product.oldPrice
    ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)
    : null;

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50">
        {/* Hook Title Banner */}
        <div className="bg-gradient-to-l from-gray-900 to-gray-800 text-white py-6">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <p className="text-lg sm:text-xl font-bold leading-relaxed">
              {product.hookTitle}
            </p>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
            {/* Left: Product Info */}
            <div className="space-y-6">
              {/* Images */}
              <ImageGallery
                images={product.images}
                productName={product.name}
                discount={discount}
              />

              {/* Product Details */}
              <div className="bg-white rounded-3xl p-6 shadow-sm">
                {/* Badges */}
                <div className="flex flex-wrap gap-2 mb-3">
                  <span className="badge bg-blue-100 text-blue-700">
                    <Tag className="w-3 h-3 me-1" />
                    {PRODUCT_TYPE_LABELS[product.type as "BOOK" | "TOY"] ?? product.type}
                  </span>
                  <span className="badge bg-yellow-100 text-yellow-700">
                    <Users className="w-3 h-3 me-1" />
                    {getAgeGroupLabel(product.ageGroup)}
                  </span>
                  <span className="badge bg-green-100 text-green-700">
                    <Package className="w-3 h-3 me-1" />
                    في المخزون
                  </span>
                </div>

                <h1 className="text-2xl font-black text-gray-900 mb-2">
                  {product.name}
                </h1>
                <p className="text-gray-500 text-sm leading-relaxed mb-4">
                  {product.description}
                </p>

                {/* Price */}
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-3xl font-black text-gray-900">
                    {formatPrice(product.price)}
                  </span>
                  {product.oldPrice && (
                    <span className="text-lg text-gray-400 line-through">
                      {formatPrice(product.oldPrice)}
                    </span>
                  )}
                </div>

                {/* Stars */}
                <div className="flex items-center gap-1 mb-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className="w-5 h-5 text-yellow-400 fill-yellow-400"
                    />
                  ))}
                  <span className="text-sm text-gray-500 mr-2">
                    (4.9) — 127 تقييم
                  </span>
                </div>

                {/* Features */}
                <div className="space-y-2">
                  <h3 className="font-bold text-gray-800 mb-2">المميزات:</h3>
                  {product.features.map((feature, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                      <span className="text-sm text-gray-700">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Long Description */}
              {product.longDescription && (
                <div className="bg-white rounded-3xl p-6 shadow-sm">
                  <h3 className="font-bold text-gray-800 mb-3 text-lg">
                    وصف تفصيلي
                  </h3>
                  <p className="text-gray-600 leading-relaxed text-sm whitespace-pre-line">
                    {product.longDescription}
                  </p>
                </div>
              )}
            </div>

            {/* Right: Order Form */}
            <div className="lg:sticky lg:top-20 lg:self-start">
              <OrderForm product={product} />

              {/* Trust badges */}
              <div className="mt-4 grid grid-cols-3 gap-3">
                <div className="bg-white rounded-2xl p-3 text-center shadow-sm">
                  <span className="text-2xl block mb-1">🚚</span>
                  <p className="text-xs text-gray-600 font-medium">
                    توصيل سريع
                  </p>
                </div>
                <div className="bg-white rounded-2xl p-3 text-center shadow-sm">
                  <span className="text-2xl block mb-1">💵</span>
                  <p className="text-xs text-gray-600 font-medium">
                    دفع عند الاستلام
                  </p>
                </div>
                <div className="bg-white rounded-2xl p-3 text-center shadow-sm">
                  <span className="text-2xl block mb-1">🛡️</span>
                  <p className="text-xs text-gray-600 font-medium">
                    منتج آمن
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

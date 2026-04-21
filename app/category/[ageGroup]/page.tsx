import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import ProductCard from "@/components/product/ProductCard";
import { prisma } from "@/lib/prisma";
import { parseProduct } from "@/lib/utils";
import { AGE_GROUP_SLUG, AGE_GROUP_LABELS, AGE_GROUP_EMOJI } from "@/types";
import SortSelect from "./SortSelect";

interface Props {
  params: Promise<{ ageGroup: string }>;
  searchParams: Promise<{ type?: string; sort?: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { ageGroup } = await params;
  const ageGroupKey = AGE_GROUP_SLUG[ageGroup];
  if (!ageGroupKey) return {};
  const label = AGE_GROUP_LABELS[ageGroupKey];
  return {
    title: `منتجات ${label}`,
    description: `كتب وألعاب تعليمية مخصصة للأطفال ${label}`,
  };
}

export default async function CategoryPage({ params, searchParams }: Props) {
  const { ageGroup } = await params;
  const resolvedSearch = await searchParams;
  const ageGroupKey = AGE_GROUP_SLUG[ageGroup];
  if (!ageGroupKey) notFound();

  const typeFilter = resolvedSearch.type;
  const sort = resolvedSearch.sort ?? "newest";

  const orderBy =
    sort === "price-asc"
      ? { price: "asc" as const }
      : sort === "price-desc"
      ? { price: "desc" as const }
      : { createdAt: "desc" as const };

  const products = await prisma.product.findMany({
    where: {
      ageGroup: ageGroupKey,
      isActive: true,
      ...(typeFilter ? { type: typeFilter } : {}),
    },
    orderBy,
  });

  const parsed = products.map(parseProduct);
  const label = AGE_GROUP_LABELS[ageGroupKey];
  const emoji = AGE_GROUP_EMOJI[ageGroupKey];

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50">
        {/* Header banner */}
        <div className="bg-gradient-to-l from-yellow-100 to-blue-50 py-10 border-b border-yellow-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <span className="text-6xl mb-4 block">{emoji}</span>
              <h1 className="text-3xl font-black text-gray-900 mb-2">{label}</h1>
              <p className="text-gray-500">
                {parsed.length} منتج متاح
              </p>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Filters */}
          <div className="flex flex-wrap items-center gap-3 mb-8 bg-white p-4 rounded-2xl shadow-sm">
            <span className="font-medium text-gray-700">الفلاتر:</span>

            <a
              href={`/category/${ageGroup}`}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                !typeFilter
                  ? "bg-gray-900 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              الكل
            </a>
            <a
              href={`/category/${ageGroup}?type=BOOK`}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                typeFilter === "BOOK"
                  ? "bg-gray-900 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              📚 كتب
            </a>
            <a
              href={`/category/${ageGroup}?type=TOY`}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                typeFilter === "TOY"
                  ? "bg-gray-900 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              🧸 ألعاب
            </a>

            <div className="mr-auto flex items-center gap-2">
              <span className="text-sm text-gray-500">الترتيب:</span>
              <SortSelect sort={sort} ageGroup={ageGroup} typeFilter={typeFilter} />
            </div>
          </div>

          {/* Products Grid */}
          {parsed.length === 0 ? (
            <div className="text-center py-20">
              <span className="text-6xl block mb-4">😔</span>
              <h2 className="text-xl font-bold text-gray-700 mb-2">
                لا توجد منتجات حالياً
              </h2>
              <p className="text-gray-400">
                سيتم إضافة منتجات قريباً في هذه الفئة
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {parsed.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}

"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import ProductCard from "@/components/product/ProductCard";
import type { ParsedProduct } from "@/types";

interface BestSellersProps {
  products: (ParsedProduct & { salesCount?: number })[];
}

export default function BestSellers({ products }: BestSellersProps) {
  if (!products || products.length === 0) return null;

  return (
    <section className="py-16 bg-gradient-to-br from-blue-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex items-end justify-between mb-10"
        >
          <div>
            <h2 className="section-title text-right">الأكثر مبيعاً 🔥</h2>
            <p className="text-gray-500 mt-1">منتجات يحبها الأطفال ويثق بها الآباء</p>
          </div>
          <Link
            href="/category/6-plus-years"
            className="text-secondary-500 hover:text-secondary-600 font-medium text-sm hidden sm:block"
          >
            عرض الكل ←
          </Link>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product, i) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="relative"
            >
              {/* شارة الترتيب */}
              {i < 3 && (
                <div className="absolute -top-2 -right-2 z-10 w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-black shadow-lg"
                  style={{
                    background: i === 0 ? "linear-gradient(135deg,#f59e0b,#f97316)" :
                                i === 1 ? "linear-gradient(135deg,#94a3b8,#64748b)" :
                                          "linear-gradient(135deg,#cd7c2f,#a0522d)"
                  }}>
                  {i === 0 ? "🥇" : i === 1 ? "🥈" : "🥉"}
                </div>
              )}
              {/* عدد المبيعات */}
              {(product.salesCount ?? 0) > 0 && (
                <div className="absolute -top-2 -left-2 z-10 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow">
                  🔥 {product.salesCount} طلب
                </div>
              )}
              <ProductCard product={product} />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

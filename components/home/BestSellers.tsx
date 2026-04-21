"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import ProductCard from "@/components/product/ProductCard";
import type { ParsedProduct } from "@/types";

interface BestSellersProps {
  products: ParsedProduct[];
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
            >
              <ProductCard product={product} />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

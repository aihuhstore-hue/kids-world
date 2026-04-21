"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { ChevronLeft, Star, Truck, ShieldCheck } from "lucide-react";

export default function HeroSection() {
  return (
    <section className="relative bg-gradient-to-br from-yellow-50 via-white to-blue-50 overflow-hidden min-h-[90vh] flex items-center">
      {/* Background decorative circles */}
      <div className="absolute top-10 right-10 w-64 h-64 bg-primary-200 rounded-full opacity-20 blur-3xl" />
      <div className="absolute bottom-10 left-10 w-80 h-80 bg-secondary-200 rounded-full opacity-20 blur-3xl" />
      <div className="absolute top-1/2 left-1/2 w-40 h-40 bg-pink-200 rounded-full opacity-30 blur-2xl -translate-x-1/2 -translate-y-1/2" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Text */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center lg:text-right"
          >
            <div className="inline-flex items-center gap-2 bg-primary-100 text-primary-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
              <Star className="w-4 h-4 fill-primary-400 text-primary-400" />
              <span>أكثر من 500 عائلة جزائرية تثق بنا</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-gray-900 leading-tight mb-6">
              ازرع فيه{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-l from-yellow-400 to-orange-400">
                حب الاكتشاف
              </span>{" "}
              من اليوم الأول 🌱
            </h1>

            <p className="text-gray-500 text-lg leading-relaxed mb-8 max-w-xl">
              كتب وألعاب تعليمية مختارة بعناية لكل مرحلة عمرية. توصيل لجميع
              ولايات الجزائر الـ 58. دفع عند الاستلام.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 mb-10">
              <Link
                href="#categories"
                className="btn-primary text-lg px-8 py-4 inline-flex items-center gap-2 w-full sm:w-auto justify-center"
              >
                <span>اكتشف حسب عمر طفلك</span>
                <ChevronLeft className="w-5 h-5" />
              </Link>
              <Link
                href="/category/6-plus-years"
                className="btn-outline text-lg px-8 py-4 w-full sm:w-auto text-center"
              >
                📚 الأكثر مبيعاً
              </Link>
            </div>

            {/* Trust badges */}
            <div className="flex items-center justify-center lg:justify-start flex-wrap gap-6 text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <Truck className="w-4 h-4 text-green-600" />
                </div>
                <span>توصيل لـ 58 ولاية</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <ShieldCheck className="w-4 h-4 text-blue-600" />
                </div>
                <span>دفع عند الاستلام</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                  <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                </div>
                <span>منتجات مختارة</span>
              </div>
            </div>
          </motion.div>

          {/* Image */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="relative"
          >
            <div className="relative w-full aspect-square max-w-lg mx-auto">
              {/* Floating badges */}
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ repeat: Infinity, duration: 3 }}
                className="absolute top-4 right-4 z-20 bg-white shadow-lg rounded-2xl px-4 py-2"
              >
                <div className="flex items-center gap-2">
                  <span className="text-2xl">📦</span>
                  <div>
                    <p className="font-bold text-sm text-gray-800">توصيل سريع</p>
                    <p className="text-xs text-gray-400">2-5 أيام</p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                animate={{ y: [0, 10, 0] }}
                transition={{ repeat: Infinity, duration: 3.5, delay: 0.5 }}
                className="absolute bottom-8 left-4 z-20 bg-white shadow-lg rounded-2xl px-4 py-2"
              >
                <div className="flex items-center gap-2">
                  <span className="text-2xl">⭐</span>
                  <div>
                    <p className="font-bold text-sm text-gray-800">4.9 / 5</p>
                    <p className="text-xs text-gray-400">500+ تقييم</p>
                  </div>
                </div>
              </motion.div>

              {/* Main image */}
              <div className="w-full h-full bg-gradient-to-br from-yellow-100 to-blue-100 rounded-[3rem] overflow-hidden">
                <Image
                  src="https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=600&h=600&fit=crop"
                  alt="طفل يلعب ويتعلم"
                  fill
                  className="object-cover"
                  priority
                />
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

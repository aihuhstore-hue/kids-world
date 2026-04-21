"use client";

import Link from "next/link";
import { motion } from "framer-motion";

const categories = [
  {
    emoji: "👶",
    title: "من 0 إلى 18 شهر",
    subtitle: "ألعاب حسية ومثيرة",
    href: "/category/0-18-months",
    bg: "from-pink-100 to-rose-50",
    border: "border-pink-200",
    badge: "bg-pink-200 text-pink-800",
  },
  {
    emoji: "🧒",
    title: "من 18 إلى 36 شهر",
    subtitle: "لعب وتعلم أول الكلمات",
    href: "/category/18-36-months",
    bg: "from-yellow-100 to-amber-50",
    border: "border-yellow-200",
    badge: "bg-yellow-200 text-yellow-800",
  },
  {
    emoji: "🎨",
    title: "من 3 إلى 5 سنوات",
    subtitle: "إبداع وفن ومهارات",
    href: "/category/3-5-years",
    bg: "from-green-100 to-emerald-50",
    border: "border-green-200",
    badge: "bg-green-200 text-green-800",
  },
  {
    emoji: "📚",
    title: "من 6 سنوات فما فوق",
    subtitle: "قراءة وعلوم ومعرفة",
    href: "/category/6-plus-years",
    bg: "from-blue-100 to-sky-50",
    border: "border-blue-200",
    badge: "bg-blue-200 text-blue-800",
  },
];

export default function AgeCategories() {
  return (
    <section id="categories" className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h2 className="section-title">اختر حسب عمر طفلك</h2>
          <p className="section-subtitle">
            كل مرحلة عمرية تحتاج منتجات مناسبة تحفز التطور والنمو
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((cat, i) => (
            <motion.div
              key={cat.href}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
            >
              <Link href={cat.href} className="block group">
                <div
                  className={`bg-gradient-to-br ${cat.bg} border ${cat.border} rounded-3xl p-6 text-center hover:shadow-lg transition-all duration-300 group-hover:scale-[1.02]`}
                >
                  <div className="text-6xl mb-4 group-hover:scale-110 transition-transform duration-300 inline-block">
                    {cat.emoji}
                  </div>
                  <h3 className="font-bold text-gray-800 text-base mb-1">
                    {cat.title}
                  </h3>
                  <p className="text-gray-500 text-sm mb-4">{cat.subtitle}</p>
                  <span
                    className={`inline-block ${cat.badge} text-xs font-medium px-3 py-1 rounded-full`}
                  >
                    تصفح المنتجات →
                  </span>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

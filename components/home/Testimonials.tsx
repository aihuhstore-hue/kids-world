"use client";

import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";

const testimonials = [
  {
    name: "أم كريم",
    city: "الجزائر العاصمة",
    rating: 5,
    text: "اشتريت مجموعة كتب لابني البالغ 4 سنوات وهو لا يتركها! الجودة ممتازة والتوصيل كان في 3 أيام فقط. شكراً عالم الأطفال!",
    emoji: "👩",
  },
  {
    name: "والد سارة",
    city: "وهران",
    rating: 5,
    text: "اللعبة التعليمية التي طلبتها لبنتي (3 سنوات) رائعة جداً. تلعب بها ساعات وتتعلم في نفس الوقت. سأطلب مرة أخرى بالتأكيد.",
    emoji: "👨",
  },
  {
    name: "أم يوسف",
    city: "قسنطينة",
    rating: 5,
    text: "خدمة ممتازة والدفع عند الاستلام أراحني كثيراً. المنتج مطابق لما في الصور. أنصح كل الأمهات بهذا المتجر.",
    emoji: "👩",
  },
  {
    name: "سيد حسين",
    city: "عنابة",
    rating: 5,
    text: "طلبت هدية لحفيدي وكانت مفاجأة رائعة. التغليف جميل والمنتج عالي الجودة. التوصيل للمنزل مباشرة ممتاز.",
    emoji: "👴",
  },
  {
    name: "أم رنا",
    city: "تيزي وزو",
    rating: 5,
    text: "اشتريت كتب قصص للأطفال ومجموعة ألعاب. كلها وصلت سليمة ومطابقة. طفلتي تحبها جداً. خدمة من الأفضل!",
    emoji: "👩",
  },
  {
    name: "والد فارس",
    city: "سطيف",
    rating: 5,
    text: "أنصح بهذا المتجر لكل الآباء. منتجات تعليمية مختارة بذكاء، أسعار معقولة، وتوصيل محترم. استمروا على هذا المستوى!",
    emoji: "👨",
  },
];

export default function Testimonials() {
  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="section-title">ماذا يقول الآباء والأمهات؟</h2>
          <p className="section-subtitle">
            أكثر من 500 عائلة جزائرية تثق بمنتجاتنا
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="bg-gradient-to-br from-yellow-50 to-white border border-yellow-100 rounded-3xl p-6 hover:shadow-md transition-shadow"
            >
              <Quote className="w-8 h-8 text-primary-300 mb-3" />
              <p className="text-gray-600 text-sm leading-relaxed mb-4">
                "{t.text}"
              </p>
              <div className="flex items-center gap-3 mt-auto">
                <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center text-xl">
                  {t.emoji}
                </div>
                <div>
                  <p className="font-bold text-gray-800 text-sm">{t.name}</p>
                  <p className="text-gray-400 text-xs">{t.city}</p>
                </div>
                <div className="mr-auto flex">
                  {Array.from({ length: t.rating }).map((_, j) => (
                    <Star
                      key={j}
                      className="w-4 h-4 text-yellow-400 fill-yellow-400"
                    />
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

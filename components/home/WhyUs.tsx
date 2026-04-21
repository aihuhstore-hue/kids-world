"use client";

import { motion } from "framer-motion";
import { Truck, Shield, Star, HeartHandshake, Package, Phone } from "lucide-react";

const features = [
  {
    icon: Truck,
    color: "bg-green-100 text-green-600",
    title: "توصيل لكل الجزائر",
    desc: "نوصل لجميع الولايات الـ 58 وكل البلديات خلال 2-5 أيام عمل",
  },
  {
    icon: Package,
    color: "bg-blue-100 text-blue-600",
    title: "دفع عند الاستلام",
    desc: "لا تدفع أي مبلغ مسبقاً — ادفع فقط عندما يصلك طلبك",
  },
  {
    icon: Shield,
    color: "bg-yellow-100 text-yellow-600",
    title: "منتجات آمنة 100%",
    desc: "جميع منتجاتنا خالية من المواد الضارة ومعتمدة للأطفال",
  },
  {
    icon: Star,
    color: "bg-pink-100 text-pink-600",
    title: "مختارة بعناية",
    desc: "نختار كل منتج بعناية ليكون ممتعاً وتعليمياً في نفس الوقت",
  },
  {
    icon: HeartHandshake,
    color: "bg-purple-100 text-purple-600",
    title: "ضمان الرضا",
    desc: "إذا لم تكن راضياً عن المنتج، تواصل معنا وسنحل المشكلة",
  },
  {
    icon: Phone,
    color: "bg-orange-100 text-orange-600",
    title: "دعم على مدار الساعة",
    desc: "فريقنا متاح لمساعدتك في أي وقت عبر الهاتف أو الرسائل",
  },
];

export default function WhyUs() {
  return (
    <section className="py-16 bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="section-title">لماذا عالم الأطفال؟</h2>
          <p className="section-subtitle">
            نحن نؤمن أن كل طفل يستحق أفضل الأدوات للتعلم واللعب
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="bg-white rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow"
            >
              <div
                className={`w-12 h-12 ${f.color} rounded-2xl flex items-center justify-center mb-4`}
              >
                <f.icon className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-gray-800 mb-2">{f.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

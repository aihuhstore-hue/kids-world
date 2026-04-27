"use client";

import { useEffect, useState } from "react";
import { ShoppingBag, ArrowDown } from "lucide-react";

export default function FloatingOrderButton() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const form = document.getElementById("order-form-section");
    if (!form) return;

    const observer = new IntersectionObserver(
      ([entry]) => setVisible(!entry.isIntersecting),
      { threshold: 0.2 }
    );
    observer.observe(form);
    return () => observer.disconnect();
  }, []);

  const scrollToForm = () => {
    document.getElementById("order-form-section")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  if (!visible) return null;

  return (
    <button
      onClick={scrollToForm}
      aria-label="اطلب من هنا"
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center gap-0.5 px-7 py-3 rounded-2xl shadow-2xl text-gray-900 transition-all duration-300"
      style={{
        background: "linear-gradient(135deg, #FCD34D, #FBBF24)",
        boxShadow: "0 8px 32px rgba(252,211,77,0.55)",
        animation: "floatBtn 2.8s ease-in-out infinite",
      }}
    >
      <div className="flex items-center gap-2">
        <ShoppingBag className="w-4 h-4" />
        <span className="font-black text-base">اطلب من هنا</span>
        <ArrowDown className="w-4 h-4 animate-bounce" />
      </div>
      <span className="text-[11px] font-semibold opacity-75">ملء الاستمارة — الدفع عند الاستلام</span>
      <style>{`
        @keyframes floatBtn {
          0%, 100% { transform: translateX(-50%) translateY(0px); box-shadow: 0 8px 32px rgba(249,115,22,0.45); }
          50%       { transform: translateX(-50%) translateY(-5px); box-shadow: 0 14px 40px rgba(249,115,22,0.55); }
        }
      `}</style>
    </button>
  );
}

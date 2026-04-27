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
      className="fixed bottom-5 left-1/2 -translate-x-1/2 z-50 flex items-center gap-1.5 px-4 py-2 rounded-full shadow-lg text-gray-900 transition-all duration-300"
      style={{
        background: "linear-gradient(135deg, #FCD34D, #FBBF24)",
        boxShadow: "0 4px 16px rgba(252,211,77,0.5)",
        animation: "floatBtn 2.8s ease-in-out infinite",
      }}
    >
      <ShoppingBag className="w-3.5 h-3.5" />
      <span className="font-bold text-sm">اطلب من هنا</span>
      <ArrowDown className="w-3.5 h-3.5 animate-bounce" />
      <style>{`
        @keyframes floatBtn {
          0%, 100% { transform: translateX(-50%) translateY(0px); box-shadow: 0 8px 32px rgba(249,115,22,0.45); }
          50%       { transform: translateX(-50%) translateY(-5px); box-shadow: 0 14px 40px rgba(249,115,22,0.55); }
        }
      `}</style>
    </button>
  );
}

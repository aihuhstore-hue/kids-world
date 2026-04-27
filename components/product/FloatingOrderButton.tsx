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
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2.5 px-6 py-3.5 rounded-full shadow-2xl text-white font-black text-sm transition-all duration-300"
      style={{
        background: "linear-gradient(135deg, #f97316, #ef4444)",
        boxShadow: "0 8px 32px rgba(249,115,22,0.45)",
        animation: "floatBtn 2.8s ease-in-out infinite",
      }}
    >
      <ShoppingBag className="w-4 h-4" />
      اطلب من هنا
      <ArrowDown className="w-4 h-4 animate-bounce" />
      <style>{`
        @keyframes floatBtn {
          0%, 100% { transform: translateX(-50%) translateY(0px); box-shadow: 0 8px 32px rgba(249,115,22,0.45); }
          50%       { transform: translateX(-50%) translateY(-5px); box-shadow: 0 14px 40px rgba(249,115,22,0.55); }
        }
      `}</style>
    </button>
  );
}

"use client";

import Link from "next/link";
import { useState } from "react";
import { ShoppingCart, Menu, X, Star } from "lucide-react";
import { useCartStore } from "@/store/cart";
import CartDrawer from "./CartDrawer";

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { totalItems, openCart } = useCartStore();
  const itemCount = totalItems();

  const navLinks = [
    { href: "/", label: "الرئيسية" },
    { href: "/category/0-18-months", label: "👶 0-18 شهر" },
    { href: "/category/18-36-months", label: "🧒 18-36 شهر" },
    { href: "/category/3-5-years", label: "🎨 3-5 سنوات" },
    { href: "/category/6-plus-years", label: "📚 6+ سنوات" },
  ];

  return (
    <>
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm shadow-sm border-b border-yellow-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2.5 group select-none">
              {/* Icon badge */}
              <div className="relative w-10 h-10 flex-shrink-0">
                <div className="w-10 h-10 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-200"
                  style={{ background: "linear-gradient(135deg,#f59e0b 0%,#f97316 50%,#ec4899 100%)", boxShadow: "0 4px 14px rgba(249,115,22,0.4)" }}>
                  <span className="text-lg leading-none select-none">🌟</span>
                </div>
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-purple-500 flex items-center justify-center text-[9px] leading-none"
                  style={{ boxShadow: "0 2px 6px rgba(168,85,247,0.5)" }}>
                  ✨
                </span>
              </div>

              {/* Text */}
              <div className="flex flex-col leading-tight">
                <div className="flex items-baseline gap-0.5">
                  <span className="font-black text-[17px] tracking-tight"
                    style={{ background: "linear-gradient(90deg,#7c3aed,#ec4899,#f97316)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                    kids
                  </span>
                  <span className="font-black text-[17px] tracking-tight text-gray-800 mx-0.5">world</span>
                  <span className="font-black text-[17px] tracking-tight"
                    style={{ background: "linear-gradient(90deg,#f97316,#f59e0b)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                    j
                  </span>
                </div>
                <span className="text-[10px] font-medium text-gray-400 tracking-wide">كتب وألعاب تعليمية</span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-yellow-50 rounded-xl transition-colors font-medium"
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* Actions */}
            <div className="flex items-center gap-2">
              {/* Cart Button */}
              <button
                onClick={openCart}
                className="relative p-2 bg-primary-300 hover:bg-primary-400 rounded-2xl transition-colors"
              >
                <ShoppingCart className="w-5 h-5 text-gray-800" />
                {itemCount > 0 && (
                  <span className="absolute -top-1 -left-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                    {itemCount > 9 ? "9+" : itemCount}
                  </span>
                )}
              </button>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="md:hidden p-2 hover:bg-gray-100 rounded-xl transition-colors"
              >
                {menuOpen ? (
                  <X className="w-5 h-5" />
                ) : (
                  <Menu className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="md:hidden border-t border-gray-100 bg-white px-4 py-3 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className="block px-3 py-2 text-sm text-gray-700 hover:bg-yellow-50 rounded-xl transition-colors font-medium"
              >
                {link.label}
              </Link>
            ))}
            <div className="pt-2 border-t border-gray-100 flex items-center gap-2 px-3 py-2">
              <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
              <span className="text-xs text-gray-500">توصيل لجميع ولايات الجزائر</span>
            </div>
          </div>
        )}
      </header>

      <CartDrawer />
    </>
  );
}

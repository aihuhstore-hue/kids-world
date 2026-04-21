"use client";

import { useState, useRef, useEffect } from "react";
import { Smile } from "lucide-react";

const CATEGORIES = [
  {
    label: "مشاعر",
    emojis: ["😊","🥰","😍","🤩","😄","😃","🥳","🤗","😎","🤭","😇","🥹"],
  },
  {
    label: "أطفال",
    emojis: ["👶","🧒","👦","👧","🎒","📚","✏️","🖍️","🎨","🧠","💡","🏫","📖","🔬","🎓"],
  },
  {
    label: "ألعاب",
    emojis: ["🧸","🎮","🎯","🎲","🎁","🎈","🎉","🎊","🎠","🎡","🃏","♟️","🪀","🪁","🎭"],
  },
  {
    label: "حيوانات",
    emojis: ["🐶","🐱","🐰","🦊","🐻","🐼","🐨","🦁","🐸","🦋","🐝","🐙","🦄","🐬","🦒"],
  },
  {
    label: "رموز",
    emojis: ["⭐","🌟","💫","✨","🌈","❤️","💛","💚","💙","💜","🏆","🥇","✅","💪","👍","🔥","💎","🎯"],
  },
];

interface EmojiPickerProps {
  onSelect: (emoji: string) => void;
  className?: string;
}

export default function EmojiPicker({ onSelect, className = "" }: EmojiPickerProps) {
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        title="اختر إيموجي"
        className={`p-2 rounded-xl transition-colors ${
          open
            ? "bg-yellow-100 text-yellow-600"
            : "text-gray-400 hover:bg-gray-100 hover:text-yellow-500"
        }`}
      >
        <Smile className="w-4 h-4" />
      </button>

      {open && (
        <div className="absolute left-0 top-full mt-1 z-50 w-64 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          {/* Tabs */}
          <div className="flex border-b border-gray-100 overflow-x-auto scrollbar-none">
            {CATEGORIES.map((cat, i) => (
              <button
                key={cat.label}
                type="button"
                onClick={() => setActiveTab(i)}
                className={`flex-shrink-0 px-3 py-2 text-xs font-semibold transition-colors ${
                  activeTab === i
                    ? "text-yellow-600 border-b-2 border-yellow-400 bg-yellow-50"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Emojis Grid */}
          <div className="p-2 grid grid-cols-6 gap-0.5 max-h-44 overflow-y-auto">
            {CATEGORIES[activeTab].emojis.map((emoji) => (
              <button
                key={emoji}
                type="button"
                onClick={() => {
                  onSelect(emoji);
                  setOpen(false);
                }}
                className="w-9 h-9 flex items-center justify-center text-xl rounded-xl hover:bg-yellow-50 transition-colors"
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

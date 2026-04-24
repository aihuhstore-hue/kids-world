"use client";

import { useState } from "react";
import Image from "next/image";

interface ImageGalleryProps {
  images: string[];
  productName: string;
  discount: number | null;
}

export default function ImageGallery({ images, productName, discount }: ImageGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  const mainImage = images[activeIndex] ?? images[0] ?? "https://picsum.photos/600/600";

  return (
    <div>
      <div className="relative aspect-square rounded-3xl overflow-hidden bg-white shadow-md">
        <Image
          src={mainImage}
          alt={productName}
          fill
          className="object-cover"
          priority
        />
        {discount && (
          <div className="absolute top-4 right-4 bg-red-500 text-white font-black text-lg px-3 py-1 rounded-2xl shadow">
            -{discount}%
          </div>
        )}
      </div>

      {images.length > 1 && (
        <div className="flex gap-2 mt-3">
          {images.slice(0, 4).map((img, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setActiveIndex(i)}
              className={`relative w-16 h-16 rounded-xl overflow-hidden bg-white shadow-sm border-2 transition-colors ${
                activeIndex === i ? "border-primary-400" : "border-transparent hover:border-primary-200"
              }`}
            >
              <Image src={img} alt={`صورة ${i + 1}`} fill className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

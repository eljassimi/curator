"use client";

import { useState } from "react";
import { ProductImage } from "@/components/ProductImage";

type Props = {
  images: string[];
  alt: string;
};

export function ProductImageCarousel({ images, alt }: Props) {
  const safeImages = images.length > 0 ? images : ["https://via.placeholder.com/960x1200?text=No+Image"];
  const [index, setIndex] = useState(0);

  function next() {
    setIndex((v) => (v + 1) % safeImages.length);
  }
  function prev() {
    setIndex((v) => (v - 1 + safeImages.length) % safeImages.length);
  }

  return (
    <div>
      <div className="relative aspect-[4/5] overflow-hidden rounded-xl bg-surface-container-low">
        <ProductImage
          src={safeImages[index]}
          alt={`${alt} ${index + 1}`}
          width={960}
          height={1200}
          priority
          className="h-full w-full object-cover"
        />
        {safeImages.length > 1 && (
          <>
            <button
              type="button"
              onClick={prev}
              className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-black/70 px-3 py-2 text-white"
              aria-label="Previous image"
            >
              ‹
            </button>
            <button
              type="button"
              onClick={next}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-black/70 px-3 py-2 text-white"
              aria-label="Next image"
            >
              ›
            </button>
          </>
        )}
      </div>

      {safeImages.length > 1 && (
        <div className="mt-4 grid grid-cols-4 gap-2">
          {safeImages.slice(0, 8).map((img, idx) => (
            <button
              key={`${img}-${idx}`}
              type="button"
              onClick={() => setIndex(idx)}
              className={`aspect-square overflow-hidden rounded-md border ${idx === index ? "border-primary" : "border-outline-variant/40"}`}
            >
              <ProductImage src={img} alt={`${alt} ${idx + 1}`} width={200} height={200} className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

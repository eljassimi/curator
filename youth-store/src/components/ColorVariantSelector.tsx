"use client";

import { useTranslations } from "next-intl";
import type { ProductColorVariant } from "@/lib/product-serialize";

type Props = {
  variants: ProductColorVariant[];
  selectedColor: string | null;
  onSelect: (colorName: string) => void;
};

export function ColorVariantSelector({ variants, selectedColor, onSelect }: Props) {
  const t = useTranslations("product");
  if (variants.length === 0) return null;

  return (
    <div className="space-y-3">
      <span className="font-sans text-xs uppercase tracking-widest text-on-surface">{t("colorVariant")}</span>
      <div className="flex flex-wrap items-center gap-2">
        {variants.map((variant) => (
          <button
            key={variant.name}
            type="button"
            onClick={() => onSelect(variant.name)}
            className={`inline-flex items-center gap-2 rounded-full border px-3 py-2 text-xs transition-colors ${
              selectedColor === variant.name
                ? "border-primary bg-surface-container-high"
                : "border-outline-variant/50 hover:border-primary/50"
            }`}
            aria-pressed={selectedColor === variant.name}
          >
            <span
              className="h-3 w-3 rounded-full border border-outline-variant/60"
              style={{ backgroundColor: variant.hex || "#ddd" }}
            />
            {variant.name}
          </button>
        ))}
      </div>
    </div>
  );
}

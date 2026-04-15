"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

const SIZES = ["S", "M", "L", "XL"] as const;

export function SizeSelector() {
  const t = useTranslations("product");
  const [selected, setSelected] = useState<(typeof SIZES)[number]>("S");

  const label: Record<(typeof SIZES)[number], string> = {
    S: t("sizeS"),
    M: t("sizeM"),
    L: t("sizeL"),
    XL: t("sizeXL"),
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="font-sans text-xs uppercase tracking-widest text-on-surface">{t("selectSize")}</span>
        <button type="button" className="text-xs text-secondary underline underline-offset-4">
          {t("sizeGuide")}
        </button>
      </div>
      <div className="flex flex-wrap gap-3">
        {SIZES.map((size) => (
          <button
            key={size}
            type="button"
            onClick={() => setSelected(size)}
            className={`flex h-14 w-14 items-center justify-center rounded-full border font-sans text-sm transition-all hover:border-primary ${
              selected === size
                ? "border-primary bg-transparent text-on-surface"
                : "border-outline-variant text-on-surface hover:bg-surface-container-low"
            }`}
            aria-pressed={selected === size}
          >
            {label[size]}
          </button>
        ))}
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { SizeSelector } from "@/components/SizeSelector";
import { ColorVariantSelector } from "@/components/ColorVariantSelector";
import { OrderForm } from "@/components/OrderForm";
import type { ProductColorVariant } from "@/lib/product-serialize";

type Props = {
  productId: string;
  colorVariants: ProductColorVariant[];
};

export function ProductPurchasePanel({ productId, colorVariants }: Props) {
  const [selectedColor, setSelectedColor] = useState<string | null>(
    colorVariants.length > 0 ? colorVariants[0].name : null,
  );

  return (
    <div className="flex flex-col gap-8">
      <SizeSelector />
      <ColorVariantSelector
        variants={colorVariants}
        selectedColor={selectedColor}
        onSelect={setSelectedColor}
      />
      <OrderForm
        productId={productId}
        selectedColor={selectedColor}
        requiresColorSelection={colorVariants.length > 0}
      />
    </div>
  );
}

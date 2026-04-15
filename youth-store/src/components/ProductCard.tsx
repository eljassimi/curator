"use client";

import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import type { ProductForClient } from "@/lib/product-serialize";
import { getLocalizedProductFields } from "@/lib/product-i18n";
import type { AppLocale } from "@/lib/product-i18n";
import { formatMad } from "@/lib/format-price";
import { ProductImage } from "@/components/ProductImage";

type Props = {
  product: ProductForClient;
  isNew?: boolean;
  isExclusive?: boolean;
};

export function ProductCard({ product, isNew, isExclusive }: Props) {
  const locale = useLocale() as AppLocale;
  const t = useTranslations("products");
  const { name } = getLocalizedProductFields(product, locale);
  const variantLabel = product.categories[0] ?? "-";
  const image = product.images[0] ?? "https://via.placeholder.com/600x800?text=No+Image";

  return (
    <article className="group">
      <Link href={`/products/${product.id}`} className="block">
        <div className="relative mb-6 aspect-[3/4] overflow-hidden rounded-xl bg-surface-container-low">
          {isNew && (
            <div className="absolute left-4 top-4 z-10 rounded-full bg-surface-container-lowest px-3 py-1 font-sans text-[10px] font-bold uppercase tracking-widest text-on-surface">
              {t("badgeNew")}
            </div>
          )}
          {isExclusive && !isNew && (
            <div className="absolute left-4 top-4 z-10 rounded-full bg-secondary px-3 py-1 font-sans text-[10px] font-bold uppercase tracking-widest text-on-secondary">
              {t("badgeExclusive")}
            </div>
          )}
          <ProductImage
            src={image}
            alt={name}
            width={600}
            height={800}
            className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          />
        </div>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="font-sans text-sm font-medium text-on-surface">{name}</h2>
            <p className="mt-1 font-sans text-xs uppercase tracking-widest text-on-surface-variant">
              {variantLabel}
            </p>
          </div>
          <p className="shrink-0 font-sans text-sm font-semibold text-on-surface">
            {formatMad(product.price.toString(), locale)}
          </p>
        </div>
      </Link>
    </article>
  );
}

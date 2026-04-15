import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { routing } from "@/i18n/routing";
import { getLocalizedProductFields } from "@/lib/product-i18n";
import type { AppLocale } from "@/lib/product-i18n";
import { formatMad } from "@/lib/format-price";
import { serializeProduct } from "@/lib/product-serialize";
import { ProductImageCarousel } from "@/components/ProductImageCarousel";
import { ProductPurchasePanel } from "@/components/ProductPurchasePanel";

type Props = {
  params: Promise<{ locale: string; id: string }>;
};

export default async function ProductDetailPage({ params }: Props) {
  const { locale, id } = await params;

  if (!routing.locales.includes(locale as AppLocale)) {
    notFound();
  }

  setRequestLocale(locale);

  const product = await prisma.product.findUnique({ where: { id } });
  if (!product) notFound();

  const t = await getTranslations("product");
  const serialized = serializeProduct(product);
  const { name, description } = getLocalizedProductFields(serialized, locale as AppLocale);
  const editionCategory = serialized.categories[0] ?? "Essentials";
  const editionLine = `${t("editionPrefix")} 01 / ${editionCategory.toUpperCase()}`;

  return (
    <main className="mx-auto max-w-[1600px] px-6 py-12 md:px-12 md:py-16">
      <div className="grid grid-cols-1 items-start gap-12 lg:grid-cols-2 lg:gap-20">
        <section className="relative">
          <ProductImageCarousel images={serialized.images} alt={name} />
        </section>

        <section className="flex flex-col gap-10">
          <div className="space-y-4">
            <span className="font-sans text-xs uppercase tracking-[0.2em] text-secondary">{editionLine}</span>
            <h1 className="font-headline text-4xl font-medium tracking-tight text-primary md:text-5xl lg:text-6xl">
              {name}
            </h1>
            <p className="font-headline text-2xl italic text-on-surface-variant md:text-3xl">
              {formatMad(product.price.toString(), locale as AppLocale)}
            </p>
            <p className="max-w-xl font-sans text-sm leading-relaxed text-on-surface-variant md:text-base">
              {description}
            </p>
          </div>

          <ProductPurchasePanel productId={product.id} colorVariants={serialized.colorVariants} />
        </section>
      </div>
    </main>
  );
}

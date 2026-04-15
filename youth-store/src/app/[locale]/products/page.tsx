import { Suspense } from "react";
import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { serializeProduct } from "@/lib/product-serialize";
import { ProductCard } from "@/components/ProductCard";
import { ProductsToolbar } from "@/components/ProductsToolbar";
import { NewsletterSection } from "@/components/NewsletterSection";

type SearchParams = { category?: string; sort?: string };

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const t = await getTranslations("products");
  const sp = await searchParams;
  const category = sp.category?.trim() || undefined;
  const sort = sp.sort || "new";

  const orderBy =
    sort === "price_asc"
      ? { price: "asc" as const }
      : sort === "price_desc"
        ? { price: "desc" as const }
        : { createdAt: "desc" as const };

  const rows = await prisma.product.findMany({
    orderBy,
  });
  const products = rows
    .map(serializeProduct)
    .filter((p) => (category ? p.categories.includes(category) : true));

  const categories = Array.from(
    new Set(
      rows
        .map(serializeProduct)
        .flatMap((p) => p.categories)
        .filter(Boolean),
    ),
  ).sort();

  const now = Date.now();
  const isNewThreshold = 14 * 24 * 60 * 60 * 1000;

  return (
    <div className="bg-surface">
      <main className="mx-auto max-w-[1920px] px-6 py-12 md:px-8 md:py-16">
        <section className="mb-12 md:mb-16">
          <h1 className="font-headline text-5xl tracking-tight text-primary md:text-7xl md:leading-[1.05]">
            {t("title")} <span className="italic">{t("titleItalic")}</span>
          </h1>
          <p className="mt-4 max-w-lg text-sm leading-relaxed text-on-surface-variant md:text-base">
            {t("intro")}
          </p>
        </section>

        <Suspense fallback={<div className="mb-12 h-14 animate-pulse rounded-full bg-surface-container-low" />}>
          <ProductsToolbar categories={categories} />
        </Suspense>

        {products.length === 0 ? (
          <p className="py-16 text-center text-sm text-on-surface-variant">{t("empty")}</p>
        ) : (
          <ul className="grid grid-cols-1 gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-4">
            {products.map((product) => {
              const created = new Date(product.createdAt).getTime();
              const isNew = now - created < isNewThreshold;
              return (
                <li key={product.id}>
                  <ProductCard product={product} isNew={isNew} />
                </li>
              );
            })}
          </ul>
        )}

        <NewsletterSection />
      </main>
    </div>
  );
}

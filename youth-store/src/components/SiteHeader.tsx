"use client";

import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { LocaleSwitcher } from "@/components/LocaleSwitcher";
import { MaterialIcon } from "@/components/MaterialIcon";

export function SiteHeader() {
  const t = useTranslations("nav");
  const pathname = usePathname();
  if (pathname.startsWith("/admin")) return null;
  const onShop = pathname === "/products" || pathname.startsWith("/products/");

  const navCaps =
    "font-sans text-xs uppercase tracking-[0.2em] transition-colors duration-300";

  return (
    <header className="sticky top-0 z-50 border-b border-outline-variant/20 bg-surface/80 backdrop-blur-xl">
      <nav className="mx-auto flex w-full max-w-[1920px] items-center justify-between px-6 py-5 md:px-8 md:py-6">
        <div className="flex items-center gap-10 md:gap-12">
          <Link
            href="/"
            className="font-headline text-2xl italic tracking-tighter text-primary"
            dir="ltr"
          >
            CURATOR
          </Link>
          <div className="hidden items-center gap-8 md:flex">
            <Link
              href="/products"
              className={`${navCaps} ${onShop ? "border-b border-primary pb-1 text-primary" : "text-outline hover:text-secondary"}`}
            >
              {t("shop")}
            </Link>
            <Link
              href="/products?category=Men"
              className={`${navCaps} text-outline hover:text-secondary`}
            >
              {t("men")}
            </Link>
            <Link
              href="/products?category=Women"
              className={`${navCaps} text-outline hover:text-secondary`}
            >
              {t("women")}
            </Link>
          </div>
        </div>
        <div className="flex items-center gap-4 md:gap-6">
          <Link
            href="/admin"
            className={`hidden font-sans text-[10px] uppercase tracking-widest text-outline hover:text-secondary sm:inline`}
          >
            {t("admin")}
          </Link>
          <LocaleSwitcher />
          <button
            type="button"
            className="text-primary transition-colors hover:text-secondary"
            aria-label="Search"
          >
            <MaterialIcon name="search" className="!text-[22px]" />
          </button>
          <Link href="/products" className="text-primary transition-colors hover:text-secondary" aria-label={t("shop")}>
            <MaterialIcon name="shopping_bag" className="!text-[22px]" />
          </Link>
        </div>
      </nav>
    </header>
  );
}

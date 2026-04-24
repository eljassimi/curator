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
  const navCaps = "font-sans text-[11px] uppercase tracking-[0.24em] transition-colors duration-300";
  const navItem = (active: boolean) =>
    `${navCaps} ${active ? "text-primary" : "text-outline hover:text-secondary"}`;
  const actionButton =
    "inline-flex h-10 w-10 items-center justify-center rounded-full border border-outline-variant/30 text-primary transition-colors hover:border-secondary/50 hover:text-secondary";

  return (
    <header className="sticky top-0 z-50 border-b border-outline-variant/20 bg-surface/80 backdrop-blur-xl">
      <nav className="mx-auto flex w-full max-w-[1920px] items-center justify-between px-6 py-4 md:px-8 md:py-5">
        <div className="flex items-center gap-8 md:gap-10">
          <Link
            href="/"
            className="font-headline text-2xl italic tracking-tighter text-primary"
            dir="ltr"
          >
            CURATOR
          </Link>
          <div className="hidden items-center gap-7 md:flex">
            <Link
              href="/products"
              className={navItem(onShop)}
            >
              {t("shop")}
            </Link>
            <Link
              href="/products?category=Men"
              className={navItem(false)}
            >
              {t("men")}
            </Link>
            <Link
              href="/products?category=Women"
              className={navItem(false)}
            >
              {t("women")}
            </Link>
          </div>
        </div>
        <div className="flex items-center gap-3 md:gap-4">
          <LocaleSwitcher />
          <Link
            href="/admin/login"
            className={actionButton}
            aria-label="Account"
          >
            <MaterialIcon name="person" className="!text-[20px]" />
          </Link>
          <Link
            href="/products"
            className={actionButton}
            aria-label={t("shop")}
          >
            <MaterialIcon name="shopping_bag" className="!text-[20px]" />
          </Link>
        </div>
      </nav>
    </header>
  );
}

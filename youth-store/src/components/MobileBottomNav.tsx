"use client";

import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { MaterialIcon } from "@/components/MaterialIcon";

export function MobileBottomNav() {
  const t = useTranslations("mobileNav");
  const pathname = usePathname();
  const onProducts = pathname === "/products" || pathname.startsWith("/products/");
  const onHome = pathname === "/";

  return (
    <nav
      className="fixed bottom-0 left-0 z-50 flex w-full justify-around border-t border-outline-variant/30 bg-surface-container-lowest/90 py-3 backdrop-blur-lg md:hidden"
      style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))" }}
      aria-label={t("aria")}
    >
      <Link
        href="/"
        className={`flex flex-col items-center gap-0.5 ${onHome ? "text-primary" : "text-outline"}`}
      >
        <MaterialIcon name="explore" className="!text-[22px]" filled={onHome} />
        <span className="text-[10px] font-semibold uppercase tracking-tighter">{t("explore")}</span>
      </Link>
      <span className="flex flex-col items-center gap-0.5 text-outline opacity-80">
        <MaterialIcon name="search" className="!text-[22px]" />
        <span className="text-[10px] font-semibold uppercase tracking-tighter">{t("search")}</span>
      </span>
      <Link
        href="/products"
        className={`flex flex-col items-center gap-0.5 ${onProducts ? "text-primary" : "text-outline"}`}
      >
        <MaterialIcon name="shopping_bag" className="!text-[22px]" filled={onProducts} />
        <span className="text-[10px] font-semibold uppercase tracking-tighter">{t("shop")}</span>
      </Link>
      <span className="flex flex-col items-center gap-0.5 text-outline opacity-80">
        <MaterialIcon name="person" className="!text-[22px]" />
        <span className="text-[10px] font-semibold uppercase tracking-tighter">{t("profile")}</span>
      </span>
    </nav>
  );
}

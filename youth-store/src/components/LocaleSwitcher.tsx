"use client";

import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";

export function LocaleSwitcher() {
  const t = useTranslations("locale");
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  return (
    <label className="flex items-center gap-2">
      <span className="hidden font-sans text-[10px] uppercase tracking-widest text-outline sm:inline">
        Lang
      </span>
      <select
        className="cursor-pointer appearance-none rounded-lg border border-outline-variant/50 bg-surface-container-lowest/80 px-2 py-1.5 pr-6 font-sans text-[10px] uppercase tracking-wider text-on-surface focus:border-primary focus:outline-none focus:ring-0"
        value={locale}
        onChange={(e) => router.replace(pathname, { locale: e.target.value })}
        aria-label="Language"
      >
        {routing.locales.map((loc) => (
          <option key={loc} value={loc}>
            {t(loc)}
          </option>
        ))}
      </select>
    </label>
  );
}

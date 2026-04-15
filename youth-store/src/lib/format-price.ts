import type { AppLocale } from "./product-i18n";

const localeMap: Record<AppLocale, string> = {
  en: "en-MA",
  ar: "ar-MA",
  fr: "fr-MA",
};

export function formatMad(amount: number | string, locale: AppLocale): string {
  const n = typeof amount === "string" ? Number(amount) : amount;
  return new Intl.NumberFormat(localeMap[locale], {
    style: "currency",
    currency: "MAD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(n);
}

import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";

export default async function ThankYouPage() {
  const t = await getTranslations("thankYou");

  return (
    <main className="mx-auto max-w-[1200px] px-6 py-24 md:py-32">
      <section className="mx-auto max-w-2xl rounded-2xl border border-outline-variant/30 bg-surface-container-lowest p-8 text-center md:p-12">
        <p className="font-sans text-xs uppercase tracking-[0.35em] text-secondary">{t("eyebrow")}</p>
        <h1 className="mt-4 font-headline text-4xl text-primary md:text-5xl">{t("title")}</h1>
        <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-on-surface-variant md:text-base">
          {t("body")}
        </p>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/products"
            className="rounded-xl bg-primary px-6 py-3 text-xs uppercase tracking-widest text-on-primary"
          >
            {t("ctaShop")}
          </Link>
          <Link
            href="/"
            className="rounded-xl border border-outline-variant/50 px-6 py-3 text-xs uppercase tracking-widest text-on-surface"
          >
            {t("ctaHome")}
          </Link>
        </div>
      </section>
    </main>
  );
}

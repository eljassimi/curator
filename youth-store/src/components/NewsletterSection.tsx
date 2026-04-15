"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

export function NewsletterSection() {
  const t = useTranslations("home");
  const [submitted, setSubmitted] = useState(false);

  return (
    <section className="mt-24 bg-surface-container-low py-20 md:mt-32">
      <div className="mx-auto max-w-4xl px-8 text-center">
        <h2 className="font-headline text-3xl text-primary md:text-4xl">{t("newsletterTitle")}</h2>
        <p className="mx-auto mt-4 max-w-lg text-sm leading-relaxed text-on-surface-variant">{t("newsletterBody")}</p>
        {submitted ? (
          <p className="mt-8 text-sm text-secondary">{t("newsletterThanks")}</p>
        ) : (
          <form
            className="mx-auto mt-10 flex max-w-md flex-col gap-4 sm:flex-row"
            onSubmit={(e) => {
              e.preventDefault();
              setSubmitted(true);
            }}
          >
            <input
              type="email"
              required
              placeholder={t("newsletterPlaceholder")}
              className="min-h-[52px] flex-1 rounded-xl border-none bg-surface-container-lowest px-6 py-4 text-sm text-on-surface placeholder:text-outline focus:outline-none focus:ring-1 focus:ring-primary"
            />
            <button
              type="submit"
              className="rounded-xl bg-primary px-8 py-4 text-xs font-bold uppercase tracking-widest text-on-primary transition-transform active:scale-95 silk-gradient-hover"
            >
              {t("newsletterCta")}
            </button>
          </form>
        )}
      </div>
    </section>
  );
}

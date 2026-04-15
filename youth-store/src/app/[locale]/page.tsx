import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { ArticlesSlider } from "@/components/home/ArticlesSlider";
import { HeroCanvasGate } from "@/components/home/HeroCanvasGate";

const HERO_IMG =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuAT8cX3gmDgRGKM8iCx-Z-2RXcGFOEAMTvPK419f677qaCCIxA10LRNOpyvPU2eacFqZSyG6s2lRzT8sWjlpk652y3Qngu3vFLGpN6hFLpkd7wyghm5qgv-gBIpG9laJa3RFndFwVcrLgwvv2S_noupXD4R0oV6d7t_5o-yHnoLqluTieC04w0e9HBrWGi0__h9gSgDbviFfBO_X85-1q4Z1K971WJONPO_GX8ehZfvfmHAcAqEFtFWXrLkGyiZqXwpZva_nKlpLtvz";

const CAMPAIGN_IMG =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuA5pMfJ3uiVQMngtLc8LkPLTdufhrEY3NdOHlRsFXpDWGSxxoock0swZoWfVZQXqL5dSGYBkzGvizmRZ9zYvfQfRZDZ8CKIFrOoimCzopNeqEIPMWenMzqGxZyt2iGfTO47RQAacMniCglgCzqMSOrjGoF5Tkd5UeIXFqDYY9B9wBMl6yNrHggyN5PybwNuogo40xXcKgA4uT-p29bs8f43SawFZUQ6VQkJ_tMGWfc2RbwyqO1ZUg7uPb1E8Cn8Fnj9HJIGRxyl3FzA";

const CAT_MEN =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuCQsHUgCzZSzyojxSbMoTvWv9Esoh2Yt6O6n3uewUXt_z4esTV7zYH_fSL99qH6EeSz9_HimTMYx4wv64hzxJqRWq3ULAA7JJ23Shq4s5f5Zi3KclyG4Nul7XigXOfPomPp666xzD2skTF7wVJvs6knWX7an0T6C1ZiCqIY-uboZMNrlakbP5eAvRuPDbyjx7WeQIwbix-g5VEEJx0ZMvRXx-yoqmc-ZHNHL_rD3he0-BQfJH2-VtqrGdxVLm1FUKUgr-KPoOc25GH9";

const CAT_WOMEN =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuClOOHhYjhgV3bXFXiqw3_bZ-PeAn00G2P3Y1yTtoamqmMdOEKkWVsdGMB54JhuRcTl6g4UVpFhbPy7xnucmo8CQZRXsmFGqCVvlui8PVvp5lhE1IPTM0nToLMLqfmlNdCcQFdQBqtY_-guPQcE_jw24q0tSO2w6IVFiLcjXWzm3JAB6Ui_1zG6Z-7DHULST_n_9iNvE2LwTYIhkHz06bae_-ndxNu_dJW6wMcei-cnINfO23395mnWKuXk-_p5PXxh3KwUWxht-zVk";

const CAT_NEW =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuALU4bwwkc_wU8IT9edK4sqGYBvVYQZO7esYH4umxE6sU5U0TbRHkbWj2tR3YSfqqEOn57-vXYGvUIqq5wzDCrZRrL9P0PozXC8EIp9S81NwHuAhNjAXe8dnysszMM6Nps8k_-xELD_V9Du1aDP2gFG7dANamcsyXmvoyOg0CqpFmPPIG53AWW2bParXL4OrgQKDP4_9aCKXzmLhT0KKaiLtMuxuf2k8R1xqt07eYq7EFMbfhvGWp2QBDuHJkwbMG0iFcO3rb8PjYON";

const FEATURED = [
  {
    src: "https://lh3.googleusercontent.com/aida-public/AB6AXuBPIXOvXwE1VNkk6n0tAf7Fih35SoFNjnFHZGTnZGbKYi3Z40tAlBulnK02tpPE0y2AMTTq5ywnWCqbrb2DU4rjmI_hfNV63xg4dDKdrvQ6R1V6Xuc9gl0XvsAuWCIoTvJaTo2KRwfY0tn1CaUcAv-Z6jbgd6dPkmLkZnhYnUDtTWA-SSAXGqvY11IBpcf9AxrneHNQHkkdANFdYWqQb7ESzhHh6pqvEQ0qo54aiQDYR_guGuYpORo9ZU5BSY_ybgiFNVJ1mHV1mO6w",
    shift: false,
  },
  {
    src: "https://lh3.googleusercontent.com/aida-public/AB6AXuByjW-jZXwWwO0CxXw9usojN3-SM3DynCXl1PZvquN3gqHnCz33mA8tWnU8RHTlVMz6zUA_LUlXOODt_x3iOD4KknSV0XtwIVzeQAWlTY89scWf7LhO729P5PYdnX6pN1WTuYFeQswxpXffMWRuS3zRFdQC84S4IH--rP0I-tZ7JkvLUmAKvWxPqhaC0hSrjcs3xyGWNT2gqGYAwTvp5prqS68oZ75OkRW8PkArqTn6cUbIXzvUQAZCbL44jpGtZZclCJUxNhvxvmxv",
    shift: true,
  },
  {
    src: "https://lh3.googleusercontent.com/aida-public/AB6AXuBWBR4AzgOiGWIfwDc9sZPAY4z0yTnx4f24mbqbkAT6T8ATcf8yG8X3TRGQoFXHu3HdS7WKhBh4wtDJtIyd-2FLTpswrAhrefNh0Kh6ctI2xVHp0p20jSM7mSC0HtD9Qdd9wz-MCOoTAD1U2sGrylSwVRlx7FEVv_zcN3Nx6FUhFTv9NmRi8mj2ESWV1lw4ZjExrlbUQ4MVvyqPDk9NqPc7y-4brlSKsLVaZdtYcu16Qs7jmMBHKogIMxLBw_vd7yKrmIWAmX4lyRgF",
    shift: false,
  },
  {
    src: "https://lh3.googleusercontent.com/aida-public/AB6AXuDKhIo8z6y7-rXcNbXQTamSriipqRMmO_256STHb_kBueq9i5vBxaeVQL7EuNWxK0X4jLaWxFPujxvTwmkFOaiqnTeAJXVvUBd6oKn05am2RaEJHOckRqvEC_Sb35J2OAh8xDsdDJEL_8JsNTXPySD6RC2I6IRQ0pV1d32aSsdIl3dUHXueqeFvmhmt_uf6A1B5sg4dzynJoOUPnV8ePZRmkmKz7NQipuM5ijOJ4VnXe40jSrLIEn-u-JRphy-C9afC6RCL1GeKkVbm",
    shift: true,
  },
] as const;

export default async function HomePage() {
  const t = await getTranslations("home");

  const journalArticles = [
    {
      category: t("article1Category"),
      title: t("article1Title"),
      excerpt: t("article1Excerpt"),
      image: FEATURED[0].src,
      href: "/products",
    },
    {
      category: t("article2Category"),
      title: t("article2Title"),
      excerpt: t("article2Excerpt"),
      image: FEATURED[2].src,
      href: "/products",
    },
    {
      category: t("article3Category"),
      title: t("article3Title"),
      excerpt: t("article3Excerpt"),
      image: CAMPAIGN_IMG,
      href: "/products",
    },
  ];

  return (
    <div className="bg-surface">
      <section className="relative min-h-[100dvh] w-full overflow-hidden bg-surface-container-low">
        <div className="absolute inset-0 z-0">
          <Image
            src={HERO_IMG}
            alt=""
            fill
            priority
            className="object-cover"
            sizes="100vw"
            unoptimized
          />
        </div>
        <HeroCanvasGate />
        <div className="pointer-events-none absolute inset-0 z-[2] bg-gradient-to-b from-black/20 via-black/5 to-black/25" aria-hidden />
        <div className="relative z-10 flex min-h-[100dvh] flex-col items-center justify-center px-6 text-center">
          <h1 className="font-headline text-5xl font-extralight italic tracking-tighter text-white drop-shadow-2xl md:text-8xl lg:text-9xl">
            {t("heroLine1")}{" "}
            <span className="font-normal not-italic">{t("heroLine2")}</span>
          </h1>
          <p className="mt-6 max-w-md font-sans text-xs uppercase tracking-[0.2em] text-white/90 md:text-sm">
            {t("heroTagline")}
          </p>
          <div className="mt-12">
            <Link
              href="/products"
              className="inline-block rounded-xl bg-primary px-10 py-4 font-sans text-xs uppercase tracking-widest text-on-primary transition-transform duration-150 active:scale-95 silk-gradient-hover"
            >
              {t("shopNow")}
            </Link>
          </div>
        </div>
        <div className="absolute bottom-10 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-3 text-white/60">
          <span className="text-[10px] uppercase tracking-[0.4em]">{t("scroll")}</span>
          <div className="h-12 w-px bg-white/30" />
        </div>
      </section>

      <section className="mx-auto max-w-[1920px] px-6 py-24 md:px-24 md:py-32">
        <div className="mb-16 flex flex-col items-end justify-between gap-8 md:mb-20 md:flex-row">
          <div className="max-w-xl">
            <span className="mb-4 block font-sans text-xs uppercase tracking-widest text-secondary">
              {t("seasonLabel")}
            </span>
            <h2 className="font-headline text-4xl leading-tight text-primary md:text-6xl">
              {t("collectionTitle")}{" "}
              <span className="italic">{t("collectionItalic")}</span> {t("collectionTitleEnd")}
            </h2>
          </div>
          <Link
            href="/products"
            className="font-sans text-xs uppercase tracking-widest text-primary underline decoration-primary/20 underline-offset-8 transition-colors hover:decoration-primary"
          >
            {t("viewAll")}
          </Link>
        </div>
        <div className="grid grid-cols-1 gap-10 md:grid-cols-4 md:gap-8">
          {FEATURED.map(({ src, shift }, i) => (
            <div key={i} className={`group ${shift ? "md:mt-24" : ""}`}>
              <div className="mb-6 aspect-[3/4] overflow-hidden rounded-xl bg-surface-container-low">
                <Image
                  src={src}
                  alt=""
                  width={600}
                  height={800}
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  unoptimized
                />
              </div>
            </div>
          ))}
        </div>
      </section>

      <ArticlesSlider
        eyebrow={t("articlesEyebrow")}
        title={t("articlesTitle")}
        readLabel={t("articlesRead")}
        articles={journalArticles}
      />

      <section className="py-16 md:py-28">
        <div className="relative h-[min(70vh,600px)] w-full overflow-hidden">
          <Image
            src={CAMPAIGN_IMG}
            alt=""
            fill
            className="object-cover"
            sizes="100vw"
            unoptimized
          />
          <div className="absolute inset-0 flex items-center justify-center bg-black/30 px-8">
            <div className="max-w-2xl text-center text-white">
              <span className="mb-6 block font-sans text-xs tracking-[0.5em] text-white/90">
                {t("campaignEyebrow")}
              </span>
              <h2 className="mb-6 font-headline text-4xl leading-none md:text-6xl lg:text-7xl">
                {t("campaignTitle")} <span className="italic">{t("campaignTitleItalic")}</span>
              </h2>
              <p className="mb-10 font-sans text-sm leading-relaxed opacity-80 md:text-base">
                {t("campaignBody")}
              </p>
              <Link
                href="/products"
                className="inline-block rounded-xl border border-white/40 px-10 py-4 font-sans text-xs uppercase tracking-widest text-white transition-all hover:bg-white hover:text-primary"
              >
                {t("campaignCta")}
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1920px] px-6 pb-24 md:px-24 md:pb-32">
        <div className="grid h-auto grid-cols-1 gap-6 md:grid-cols-12 md:h-[800px]">
          <Link
            href="/products?category=Men"
            className="relative min-h-[320px] overflow-hidden rounded-xl bg-surface-container md:col-span-7 md:min-h-0"
          >
            <Image src={CAT_MEN} alt="" fill className="object-cover transition-transform duration-1000 hover:scale-110" unoptimized />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            <div className="absolute bottom-10 left-10 text-white md:bottom-12 md:left-12">
              <h3 className="mb-4 font-headline text-4xl italic md:text-5xl">{t("categoryMen")}</h3>
              <span className="inline-block border-b border-white/30 pb-1 font-sans text-xs uppercase tracking-widest transition-all hover:border-white">
                {t("exploreMen")}
              </span>
            </div>
          </Link>
          <div className="grid min-h-[640px] grid-rows-2 gap-6 md:col-span-5 md:min-h-0">
            <Link
              href="/products?category=Women"
              className="relative min-h-[280px] overflow-hidden rounded-xl bg-surface-container md:min-h-0"
            >
              <Image src={CAT_WOMEN} alt="" fill className="object-cover transition-transform duration-1000 hover:scale-110" unoptimized />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              <div className="absolute bottom-8 left-8 text-white">
                <h3 className="mb-2 font-headline text-3xl italic md:text-4xl">{t("categoryWomen")}</h3>
                <span className="inline-block border-b border-white/30 pb-1 font-sans text-[10px] uppercase tracking-widest hover:border-white">
                  {t("shopWomen")}
                </span>
              </div>
            </Link>
            <Link
              href="/products"
              className="relative flex min-h-[280px] flex-col justify-end overflow-hidden rounded-xl bg-surface-container p-8 md:min-h-0"
            >
              <Image src={CAT_NEW} alt="" fill className="object-cover transition-transform duration-1000 hover:scale-110" unoptimized />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              <div className="relative z-10 text-white">
                <h3 className="mb-2 font-headline text-3xl italic md:text-4xl">{t("categoryNew")}</h3>
                <p className="font-sans text-xs uppercase tracking-widest text-white/70">{t("categoryNewSub")}</p>
              </div>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

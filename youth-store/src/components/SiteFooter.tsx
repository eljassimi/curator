import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { MaterialIcon } from "@/components/MaterialIcon";

export async function SiteFooter() {
  const t = await getTranslations("footer");

  return (
    <footer className="mt-auto border-t border-outline-variant/40 bg-surface px-8 py-16 md:px-24">
      <div className="mx-auto grid max-w-[1920px] grid-cols-1 gap-12 md:grid-cols-3">
        <div className="md:col-span-1">
          <div className="mb-6 font-headline text-3xl italic tracking-tighter text-primary" dir="ltr">
            CURATOR
          </div>
          <p className="max-w-xs text-sm leading-relaxed text-on-surface-variant">{t("mission")}</p>
          <p className="mt-8 font-sans text-[10px] font-medium uppercase tracking-widest text-outline">
            {t("copyright")}
          </p>
        </div>
        <div className="grid grid-cols-2 gap-8 md:col-span-2">
          <div>
            <h4 className="mb-6 font-headline text-xl text-primary">{t("columnCompany")}</h4>
            <ul className="space-y-3 text-sm text-on-surface-variant">
              <li>
                <span className="cursor-default hover:text-secondary">{t("journal")}</span>
              </li>
              <li>
                <span className="cursor-default hover:text-secondary">{t("ethics")}</span>
              </li>
              <li>
                <Link href="/products" className="underline-offset-4 hover:text-secondary">
                  {t("shop")}
                </Link>
              </li>
              <li>
                <Link href="/admin" className="hover:text-secondary">
                  {t("adminLink")}
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="mb-6 font-headline text-xl text-primary">{t("columnConnect")}</h4>
            <div className="flex flex-wrap gap-4 text-on-surface-variant">
              <MaterialIcon name="public" className="!text-xl cursor-default hover:text-secondary" />
              <MaterialIcon name="brand_awareness" className="!text-xl cursor-default hover:text-secondary" />
              <MaterialIcon name="photo_camera" className="!text-xl cursor-default hover:text-secondary" />
            </div>
            <p className="mt-6 text-sm text-on-surface-variant">{t("newsletterHint")}</p>
          </div>
        </div>
      </div>
    </footer>
  );
}

"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { MaterialIcon } from "@/components/MaterialIcon";
import { useRouter } from "@/i18n/navigation";

type Props = {
  productId: string;
  selectedColor: string | null;
  requiresColorSelection: boolean;
};

const inputClass =
  "w-full rounded-xl border-none bg-surface-container-highest px-4 py-3 font-sans text-sm text-on-surface placeholder:text-outline transition-all focus:outline-none focus:ring-0 focus:border-b-2 focus:border-primary";

const labelClass = "font-sans text-[10px] uppercase tracking-widest text-on-surface-variant px-1";

export function OrderForm({ productId, selectedColor, requiresColorSelection }: Props) {
  const t = useTranslations("product");
  const locale = useLocale();
  const router = useRouter();
  const [customerName, setCustomerName] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customerName, phone, city, productId, selectedColor }),
      });
      if (!res.ok) throw new Error("order failed");
      setStatus("success");
      setCustomerName("");
      setPhone("");
      setCity("");
      const thanksPath = locale === "en" ? "/thank-you" : `/${locale}/thank-you`;
      router.push(thanksPath);
    } catch {
      setStatus("error");
    }
  }

  return (
    <div className="space-y-8 rounded-xl bg-surface-container-low p-6 md:p-8">
      <div className="space-y-1">
        <h3 className="font-headline text-xl text-primary">{t("orderTitle")}</h3>
        <p className="font-sans text-xs uppercase tracking-tighter text-on-surface-variant">{t("orderSubtitle")}</p>
      </div>
      <form onSubmit={onSubmit} className="space-y-6">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <label className={labelClass}>{t("customerName")}</label>
            <input
              required
              className={inputClass}
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              autoComplete="name"
              placeholder="John Doe"
            />
          </div>
          <div className="space-y-2">
            <label className={labelClass}>{t("phone")}</label>
            <input
              required
              type="tel"
              className={inputClass}
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              autoComplete="tel"
              placeholder="+212 …"
            />
          </div>
        </div>
        <div className="space-y-2">
          <label className={labelClass}>{t("city")}</label>
          <input
            required
            className={inputClass}
            value={city}
            onChange={(e) => setCity(e.target.value)}
            autoComplete="address-level2"
            placeholder="Casablanca"
          />
        </div>
        <button
          type="submit"
          disabled={status === "loading" || (requiresColorSelection && !selectedColor)}
          className="w-full rounded-xl bg-primary py-5 font-sans text-sm font-medium uppercase tracking-[0.25em] text-on-primary transition-transform active:scale-[0.98] disabled:opacity-60 silk-gradient-hover"
        >
          {status === "loading" ? t("submitting") : t("submit")}
        </button>
        {status === "success" && (
          <p className="text-center text-sm text-secondary">{t("success")}</p>
        )}
        {status === "error" && <p className="text-center text-sm text-error">{t("error")}</p>}
      </form>
      <div className="flex flex-wrap items-center justify-center gap-6 border-t border-outline-variant/30 pt-6 font-sans text-[10px] uppercase tracking-widest text-on-surface-variant">
        <span className="flex items-center gap-2">
          <MaterialIcon name="local_shipping" className="!text-lg" />
          {t("trustShipping")}
        </span>
        <span className="flex items-center gap-2">
          <MaterialIcon name="verified" className="!text-lg" />
          {t("trustAuthentic")}
        </span>
      </div>
    </div>
  );
}

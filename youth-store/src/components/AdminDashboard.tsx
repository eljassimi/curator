"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import {
  Area,
  CartesianGrid,
  ComposedChart,
  Bar,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatMad } from "@/lib/format-price";
import type { AppLocale } from "@/lib/product-i18n";
import { getLocalizedProductFields } from "@/lib/product-i18n";
import type { ProductForClient } from "@/lib/product-serialize";
import { MaterialIcon } from "@/components/MaterialIcon";
import { ProductImageUploader } from "@/components/ProductImageUploader";

type OrderWithProduct = {
  id: string;
  customerName: string;
  phone: string;
  city: string;
  selectedColor: string | null;
  productId: string;
  createdAt: string;
  product: ProductForClient;
};

const fieldInput =
  "w-full rounded-xl border border-outline-variant/40 bg-surface-container-lowest px-3 py-2.5 font-sans text-sm text-on-surface placeholder:text-outline focus:border-primary focus:outline-none focus:ring-0";

const fieldLabel = "font-sans text-[10px] font-medium uppercase tracking-widest text-on-surface-variant";
const PRESET_CATEGORIES = ["T-Shirt", "Jackets", "Pants", "Hoodies", "Shirts", "Men", "Women"] as const;

const EMPTY_PRODUCT_FORM = {
  name: "",
  nameAr: "",
  nameFr: "",
  price: "",
  description: "",
  descriptionAr: "",
  descriptionFr: "",
  categories: [] as string[],
  imageUrls: [] as string[],
  variantsText: "",
};

type AdminView = "overview" | "orders" | "products";

function dayKey(daysAgo: number): string {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString().slice(0, 10);
}

function ordersInDayOffsets(orders: OrderWithProduct[], fromDaysAgo: number, toDaysAgo: number): OrderWithProduct[] {
  const keys = new Set<string>();
  for (let i = fromDaysAgo; i >= toDaysAgo; i--) {
    keys.add(dayKey(i));
  }
  return orders.filter((o) => keys.has(o.createdAt.slice(0, 10)));
}

function pctDelta(cur: number, prev: number): number {
  if (prev === 0) return cur === 0 ? 0 : 100;
  return ((cur - prev) / prev) * 100;
}

function fmtPct(n: number) {
  return `${n >= 0 ? "+" : ""}${n.toFixed(1)}%`;
}

export function AdminDashboard({ view }: { view: AdminView }) {
  const t = useTranslations("admin");
  const locale = useLocale() as AppLocale;
  const [orders, setOrders] = useState<OrderWithProduct[]>([]);
  const [products, setProducts] = useState<ProductForClient[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ ...EMPTY_PRODUCT_FORM });
  const [creating, setCreating] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [chartRange, setChartRange] = useState<7 | 30>(7);
  const [txnSearch, setTxnSearch] = useState("");
  const [imageUploadBusy, setImageUploadBusy] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [o, p] = await Promise.all([fetch("/api/orders"), fetch("/api/products")]);
      if (o.status === 401 || p.status === 401) {
        window.location.href = "/admin/login";
        return;
      }
      if (o.ok) setOrders(await o.json());
      if (p.ok) setProducts(await p.json());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  function closeProductModal() {
    setEditingProductId(null);
    setShowCreateForm(false);
    setForm({ ...EMPTY_PRODUCT_FORM });
  }

  function openCreateModal() {
    setEditingProductId(null);
    setForm({ ...EMPTY_PRODUCT_FORM });
    setShowCreateForm(true);
  }

  function beginEditProduct(product: ProductForClient) {
    setEditingProductId(product.id);
    setForm({
      name: product.name,
      nameAr: product.nameAr ?? "",
      nameFr: product.nameFr ?? "",
      price: product.price,
      description: product.description,
      descriptionAr: product.descriptionAr ?? "",
      descriptionFr: product.descriptionFr ?? "",
      categories: [...product.categories],
      imageUrls: [...product.images],
      variantsText: product.colorVariants
        .map((v) => (v.hex ? `${v.name}:${v.hex}` : v.name))
        .join(", "),
    });
    setShowCreateForm(true);
  }

  async function saveProduct(e: React.FormEvent) {
    e.preventDefault();
    setCreating(true);
    try {
      const images = [...form.imageUrls];
      const colorVariants = form.variantsText
        .split(",")
        .map((v) => v.trim())
        .filter(Boolean)
        .map((entry) => {
          const [name, hex] = entry.split(":");
          return { name: name.trim(), hex: hex?.trim() || null };
        });

      const payload = {
        name: form.name,
        nameAr: form.nameAr || undefined,
        nameFr: form.nameFr || undefined,
        price: Number(form.price),
        description: form.description,
        descriptionAr: form.descriptionAr || undefined,
        descriptionFr: form.descriptionFr || undefined,
        categories: form.categories,
        images,
        colorVariants,
      };

      const res = editingProductId
        ? await fetch(`/api/products/${editingProductId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          })
        : await fetch("/api/products", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });
      if (res.ok) {
        closeProductModal();
        await load();
      }
    } finally {
      setCreating(false);
    }
  }

  async function deleteProduct(id: string) {
    setDeletingId(id);
    try {
      const res = await fetch(`/api/products/${id}`, { method: "DELETE" });
      if (res.ok) await load();
    } finally {
      setDeletingId(null);
    }
  }

  const totalRevenue = useMemo(
    () => orders.reduce((sum, order) => sum + Number(order.product.price), 0),
    [orders],
  );

  const chartData = useMemo(() => {
    const rows: { label: string; orders: number; revenue: number }[] = [];
    for (let k = chartRange - 1; k >= 0; k--) {
      const d = new Date();
      d.setHours(0, 0, 0, 0);
      d.setDate(d.getDate() - k);
      const key = d.toISOString().slice(0, 10);
      const dayOrders = orders.filter((o) => o.createdAt.slice(0, 10) === key);
      const revenue = dayOrders.reduce((s, o) => s + Number(o.product.price), 0);
      const label =
        chartRange <= 14
          ? d.toLocaleDateString(locale === "ar" ? "ar-MA" : locale === "fr" ? "fr-FR" : "en-GB", {
              weekday: "short",
            })
          : d.toLocaleDateString(locale === "ar" ? "ar-MA" : locale === "fr" ? "fr-FR" : "en-GB", {
              month: "short",
              day: "numeric",
            });
      rows.push({ label, orders: dayOrders.length, revenue });
    }
    return rows;
  }, [orders, chartRange, locale]);

  const orderDeltaPct = useMemo(() => {
    const cur = ordersInDayOffsets(orders, chartRange - 1, 0).length;
    const prev = ordersInDayOffsets(orders, chartRange * 2 - 1, chartRange).length;
    return pctDelta(cur, prev);
  }, [orders, chartRange]);

  const revenueDeltaPct = useMemo(() => {
    const sum = (list: OrderWithProduct[]) => list.reduce((s, o) => s + Number(o.product.price), 0);
    const cur = sum(ordersInDayOffsets(orders, chartRange - 1, 0));
    const prev = sum(ordersInDayOffsets(orders, chartRange * 2 - 1, chartRange));
    return pctDelta(cur, prev);
  }, [orders, chartRange]);

  const newProducts30d = useMemo(() => {
    const cutoff = Date.now() - 30 * 24 * 60 * 60 * 1000;
    return products.filter((p) => new Date(p.createdAt).getTime() >= cutoff).length;
  }, [products]);

  const avgOrder = orders.length ? totalRevenue / orders.length : 0;

  const recentOrders = useMemo(() => {
    const q = txnSearch.trim().toLowerCase();
    const sorted = [...orders].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
    if (!q) return sorted.slice(0, 8);
    return sorted
      .filter((o) => {
        const { name } = getLocalizedProductFields(o.product, locale);
        return (
          o.customerName.toLowerCase().includes(q) ||
          name.toLowerCase().includes(q) ||
          o.phone.toLowerCase().includes(q) ||
          o.city.toLowerCase().includes(q)
        );
      })
      .slice(0, 8);
  }, [orders, txnSearch, locale]);

  const greetingKey = useMemo(() => {
    const h = new Date().getHours();
    if (h < 12) return "goodMorning" as const;
    if (h < 18) return "goodAfternoon" as const;
    return "goodEvening" as const;
  }, []);

  const todayLabel = useMemo(
    () =>
      new Date().toLocaleDateString(locale === "ar" ? "ar-MA" : locale === "fr" ? "fr-FR" : "en-GB", {
        weekday: "long",
        month: "short",
        day: "numeric",
      }),
    [locale],
  );

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center font-sans text-sm text-on-surface-variant">
        {t("loading")}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface">
      <nav className="sticky top-0 z-30 flex items-center gap-2 overflow-x-auto border-b border-outline-variant/25 bg-surface-container-lowest/95 px-4 py-3 backdrop-blur-md lg:hidden">
        <Link
          href="/admin"
          className={`shrink-0 rounded-full px-4 py-2 font-sans text-[10px] uppercase tracking-widest ${view === "overview" ? "bg-primary text-on-primary" : "bg-surface-container-low text-on-surface"}`}
        >
          {t("navDashboard")}
        </Link>
        <Link
          href="/admin/orders"
          className={`flex shrink-0 items-center gap-2 rounded-full px-4 py-2 font-sans text-[10px] uppercase tracking-widest ${view === "orders" ? "bg-primary text-on-primary" : "bg-surface-container-low text-on-surface"}`}
        >
          {t("navOrders")}
          {orders.length > 0 ? (
            <span className="rounded-full bg-error px-1.5 py-0.5 text-[9px] font-semibold text-on-primary">{orders.length > 99 ? "99+" : orders.length}</span>
          ) : null}
        </Link>
        <Link
          href="/admin/products"
          className={`shrink-0 rounded-full px-4 py-2 font-sans text-[10px] uppercase tracking-widest ${view === "products" ? "bg-primary text-on-primary" : "bg-surface-container-low text-on-surface"}`}
        >
          {t("navProducts")}
        </Link>
      </nav>

      <div className="mx-auto flex max-w-[1600px] gap-0 lg:gap-10">
        <aside className="hidden w-56 shrink-0 flex-col border-r border-outline-variant/30 bg-surface-container-lowest py-10 pl-8 pr-6 shadow-[4px_0_24px_-18px_rgba(0,0,0,0.08)] lg:flex">
          <div className="mb-10 font-headline text-xl italic tracking-tighter text-primary" dir="ltr">
            CURATOR
          </div>
          <nav className="flex flex-col gap-1 font-sans text-[10px] uppercase tracking-[0.2em] text-on-surface-variant">
            <Link
              href="/admin"
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors hover:bg-surface-container-low hover:text-primary ${view === "overview" ? "bg-surface-container-low text-primary shadow-sm" : "text-on-surface"}`}
            >
              <MaterialIcon name="dashboard" className="!text-xl" />
              {t("navDashboard")}
            </Link>
            <Link
              href="/admin/orders"
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors hover:bg-surface-container-low hover:text-primary ${view === "orders" ? "bg-surface-container-low text-primary shadow-sm" : "text-on-surface"}`}
            >
              <MaterialIcon name="receipt_long" className="!text-xl" />
              <span className="flex-1">{t("navOrders")}</span>
              {orders.length > 0 ? (
                <span className="rounded-full bg-error/90 px-2 py-0.5 text-[9px] font-semibold text-on-primary">
                  {orders.length > 99 ? "99+" : orders.length}
                </span>
              ) : null}
            </Link>
            <Link
              href="/admin/products"
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors hover:bg-surface-container-low hover:text-primary ${view === "products" ? "bg-surface-container-low text-primary shadow-sm" : "text-on-surface"}`}
            >
              <MaterialIcon name="inventory_2" className="!text-xl" />
              {t("navProducts")}
            </Link>
          </nav>
        </aside>

        <div className="flex-1 px-6 py-10 md:px-10 lg:py-14">
          <header className="mb-10 border-b border-outline-variant/30 pb-8 md:mb-12">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
              <div>
                {view === "overview" ? (
                  <>
                    <p className="font-sans text-xs uppercase tracking-[0.25em] text-secondary">{todayLabel}</p>
                    <h1 className="mt-2 font-headline text-3xl text-primary md:text-5xl">
                      {greetingKey === "goodMorning"
                        ? t("goodMorning")
                        : greetingKey === "goodAfternoon"
                          ? t("goodAfternoon")
                          : t("goodEvening")}
                      , <span className="italic text-secondary">CURATOR</span>
                    </h1>
                    <p className="mt-3 max-w-lg font-sans text-sm leading-relaxed text-on-surface-variant">{t("dashIntro")}</p>
                  </>
                ) : (
                  <>
                    <h1 className="font-headline text-4xl text-primary md:text-5xl">
                      {view === "orders" ? t("orders") : t("products")}
                    </h1>
                    <p className="mt-2 font-sans text-sm text-on-surface-variant">{t("subtitle")}</p>
                  </>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-3">
                {view === "overview" ? (
                  <div className="flex items-center gap-2 rounded-xl border border-outline-variant/30 bg-surface-container-low px-4 py-2 font-sans text-xs text-on-surface-variant">
                    <MaterialIcon name="calendar_month" className="!text-lg text-secondary" />
                    {todayLabel}
                  </div>
                ) : null}
                <button
                  type="button"
                  className="rounded-xl border border-outline-variant/40 px-4 py-2.5 font-sans text-[10px] uppercase tracking-widest transition-colors hover:border-primary hover:bg-surface-container-low"
                  onClick={() => {
                    void fetch("/api/auth/logout", { method: "POST" }).then(() => {
                      window.location.href = "/admin/login";
                    });
                  }}
                >
                  Logout
                </button>
              </div>
            </div>
          </header>

          {view === "overview" && (
            <>
              <section className="mb-10 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <div className="rounded-2xl border border-outline-variant/20 bg-surface-container-lowest p-6 shadow-[0_18px_40px_-28px_rgba(0,0,0,0.2)]">
                  <div className="mb-4 flex items-center justify-between">
                    <span className="font-sans text-[10px] font-medium uppercase tracking-widest text-on-surface-variant">
                      {t("kpiOrders")}
                    </span>
                    <MaterialIcon name="receipt_long" className="!text-xl text-outline-variant" />
                  </div>
                  <p className="font-headline text-3xl text-primary md:text-4xl">{orders.length}</p>
                  <p
                    className={`mt-2 font-sans text-xs font-medium ${orderDeltaPct >= 0 ? "text-green-800" : "text-error"}`}
                  >
                    {fmtPct(orderDeltaPct)} <span className="font-normal text-on-surface-variant">{t("changeVsPrev")}</span>
                  </p>
                </div>
                <div className="rounded-2xl border border-outline-variant/20 bg-surface-container-lowest p-6 shadow-[0_18px_40px_-28px_rgba(0,0,0,0.2)]">
                  <div className="mb-4 flex items-center justify-between">
                    <span className="font-sans text-[10px] font-medium uppercase tracking-widest text-on-surface-variant">
                      {t("kpiProducts")}
                    </span>
                    <MaterialIcon name="inventory_2" className="!text-xl text-outline-variant" />
                  </div>
                  <p className="font-headline text-3xl text-primary md:text-4xl">{products.length}</p>
                  <p className="mt-2 font-sans text-xs text-on-surface-variant">
                    {t("newProductsCaption", { count: newProducts30d })}
                  </p>
                </div>
                <div className="rounded-2xl border border-outline-variant/20 bg-surface-container-lowest p-6 shadow-[0_18px_40px_-28px_rgba(0,0,0,0.2)]">
                  <div className="mb-4 flex items-center justify-between">
                    <span className="font-sans text-[10px] font-medium uppercase tracking-widest text-on-surface-variant">
                      {t("kpiRevenue")}
                    </span>
                    <MaterialIcon name="payments" className="!text-xl text-outline-variant" />
                  </div>
                  <p className="font-headline text-2xl text-primary md:text-3xl">{formatMad(totalRevenue.toFixed(2), locale)}</p>
                  <p
                    className={`mt-2 font-sans text-xs font-medium ${revenueDeltaPct >= 0 ? "text-green-800" : "text-error"}`}
                  >
                    {fmtPct(revenueDeltaPct)} <span className="font-normal text-on-surface-variant">{t("changeVsPrev")}</span>
                  </p>
                </div>
                <div className="rounded-2xl border border-outline-variant/20 bg-surface-container-lowest p-6 shadow-[0_18px_40px_-28px_rgba(0,0,0,0.2)]">
                  <div className="mb-4 flex items-center justify-between">
                    <span className="font-sans text-[10px] font-medium uppercase tracking-widest text-on-surface-variant">
                      {t("kpiAvgOrder")}
                    </span>
                    <MaterialIcon name="show_chart" className="!text-xl text-outline-variant" />
                  </div>
                  <p className="font-headline text-2xl text-primary md:text-3xl">{formatMad(avgOrder.toFixed(2), locale)}</p>
                  <p className="mt-2 font-sans text-xs text-on-surface-variant">{t("avgOrderHint")}</p>
                </div>
              </section>

              <section className="mb-12 rounded-2xl border border-outline-variant/20 bg-surface-container-lowest p-6 shadow-[0_24px_50px_-32px_rgba(0,0,0,0.18)] md:p-8">
                <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <h2 className="font-headline text-2xl text-primary md:text-3xl">{t("salesOverview")}</h2>
                    <p className="mt-1 font-sans text-sm text-on-surface-variant">
                      {t("chartOrders")} · {t("chartRevenue")}
                    </p>
                  </div>
                  <div className="flex gap-2 rounded-xl bg-surface-container-low p-1">
                    <button
                      type="button"
                      onClick={() => setChartRange(7)}
                      className={`rounded-lg px-4 py-2 font-sans text-[10px] uppercase tracking-widest transition-colors ${chartRange === 7 ? "bg-primary text-on-primary" : "text-on-surface-variant hover:text-primary"}`}
                    >
                      {t("range7d")}
                    </button>
                    <button
                      type="button"
                      onClick={() => setChartRange(30)}
                      className={`rounded-lg px-4 py-2 font-sans text-[10px] uppercase tracking-widest transition-colors ${chartRange === 30 ? "bg-primary text-on-primary" : "text-on-surface-variant hover:text-primary"}`}
                    >
                      {t("range30d")}
                    </button>
                  </div>
                </div>
                <div className="h-[min(340px,55vw)] w-full min-h-[260px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="adminRevFill" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#705b36" stopOpacity={0.35} />
                          <stop offset="100%" stopColor="#705b36" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--color-outline-variant)" vertical={false} />
                      <XAxis dataKey="label" tick={{ fill: "#444748", fontSize: 11 }} axisLine={false} tickLine={false} />
                      <YAxis
                        yAxisId="rev"
                        tick={{ fill: "#444748", fontSize: 11 }}
                        axisLine={false}
                        tickLine={false}
                        width={44}
                      />
                      <YAxis
                        yAxisId="ord"
                        orientation="right"
                        tick={{ fill: "#444748", fontSize: 11 }}
                        axisLine={false}
                        tickLine={false}
                        width={36}
                        allowDecimals={false}
                      />
                      <Tooltip
                        contentStyle={{
                          borderRadius: "12px",
                          border: "1px solid #c4c7c7",
                          fontFamily: "var(--font-inter), sans-serif",
                          fontSize: "12px",
                        }}
                        formatter={(value, name) => {
                          const n = value == null ? 0 : typeof value === "number" ? value : Number(value);
                          if (name === "revenue")
                            return [formatMad((Number.isFinite(n) ? n : 0).toFixed(2), locale), t("chartRevenue")];
                          return [Number.isFinite(n) ? n : 0, t("chartOrders")];
                        }}
                      />
                      <Bar yAxisId="ord" dataKey="orders" fill="#1a1c1c" radius={[6, 6, 0, 0]} maxBarSize={28} opacity={0.88} />
                      <Area
                        yAxisId="rev"
                        type="monotone"
                        dataKey="revenue"
                        stroke="#705b36"
                        strokeWidth={2}
                        fill="url(#adminRevFill)"
                        dot={false}
                        activeDot={{ r: 4, fill: "#705b36" }}
                      />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
              </section>

              <section className="mb-16 scroll-mt-28">
                <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <h2 className="font-headline text-2xl text-primary md:text-3xl">{t("recentActivity")}</h2>
                  <div className="relative max-w-md flex-1">
                    <MaterialIcon
                      name="search"
                      className="pointer-events-none absolute left-3 top-1/2 !text-lg -translate-y-1/2 text-outline-variant"
                    />
                    <input
                      type="search"
                      value={txnSearch}
                      onChange={(e) => setTxnSearch(e.target.value)}
                      placeholder={t("searchPlaceholder")}
                      className="w-full rounded-xl border border-outline-variant/30 bg-surface-container-low py-2.5 pl-10 pr-4 font-sans text-sm text-on-surface placeholder:text-outline focus:border-primary focus:outline-none"
                    />
                  </div>
                </div>
                {recentOrders.length === 0 ? (
                  <p className="rounded-2xl border border-dashed border-outline-variant/40 bg-surface-container-low px-6 py-12 text-center font-sans text-sm text-on-surface-variant">
                    {txnSearch.trim() ? t("noSearchResults") : t("noOrders")}
                  </p>
                ) : (
                  <div className="overflow-x-auto rounded-2xl border border-outline-variant/20 bg-surface-container-lowest shadow-[0_18px_40px_-28px_rgba(0,0,0,0.15)]">
                    <table className="w-full min-w-[640px] text-left">
                      <thead>
                        <tr className="border-b border-outline-variant/30 bg-surface-container-low">
                          <th className="px-5 py-4 font-headline text-sm font-medium text-primary">{t("orderId")}</th>
                          <th className="px-5 py-4 font-headline text-sm font-medium text-primary">{t("product")}</th>
                          <th className="px-5 py-4 font-headline text-sm font-medium text-primary">{t("customer")}</th>
                          <th className="px-5 py-4 font-headline text-sm font-medium text-primary">{t("date")}</th>
                          <th className="px-5 py-4 font-headline text-sm font-medium text-primary">{t("amount")}</th>
                        </tr>
                      </thead>
                      <tbody className="font-sans text-sm text-on-surface">
                        {recentOrders.map((order) => {
                          const { name } = getLocalizedProductFields(order.product, locale);
                          return (
                            <tr key={order.id} className="border-b border-outline-variant/15 last:border-0">
                              <td className="px-5 py-4 font-mono text-xs text-on-surface-variant">{order.id.slice(0, 8)}…</td>
                              <td className="px-5 py-4">{name}</td>
                              <td className="px-5 py-4">{order.customerName}</td>
                              <td className="whitespace-nowrap px-5 py-4 text-on-surface-variant">
                                {new Date(order.createdAt).toLocaleString(
                                  locale === "ar" ? "ar-MA" : locale === "fr" ? "fr-FR" : "en-GB",
                                  { dateStyle: "short", timeStyle: "short" },
                                )}
                              </td>
                              <td className="px-5 py-4 font-medium">{formatMad(order.product.price, locale)}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </section>
            </>
          )}

          {view === "orders" && (
            <section className="mb-16 scroll-mt-28">
            <h2 className="mb-6 font-headline text-2xl text-primary">{t("orders")}</h2>
            {orders.length === 0 ? (
              <p className="rounded-xl bg-surface-container-low px-6 py-10 text-center font-sans text-sm text-on-surface-variant">
                {t("noOrders")}
              </p>
            ) : (
              <div className="overflow-x-auto rounded-xl border border-outline-variant/20 bg-surface-container-lowest">
                <table className="w-full min-w-[640px] text-left">
                  <thead>
                    <tr className="border-b border-outline-variant/30 bg-surface-container-low">
                      <th className="px-5 py-4 font-headline text-sm font-medium text-primary">{t("customer")}</th>
                      <th className="px-5 py-4 font-headline text-sm font-medium text-primary">{t("phone")}</th>
                      <th className="px-5 py-4 font-headline text-sm font-medium text-primary">{t("city")}</th>
                      <th className="px-5 py-4 font-headline text-sm font-medium text-primary">{t("product")}</th>
                      <th className="px-5 py-4 font-headline text-sm font-medium text-primary">{t("colorLabel")}</th>
                      <th className="px-5 py-4 font-headline text-sm font-medium text-primary">{t("date")}</th>
                    </tr>
                  </thead>
                  <tbody className="font-sans text-sm text-on-surface">
                    {orders.map((order) => {
                      const { name } = getLocalizedProductFields(order.product, locale);
                      return (
                        <tr key={order.id} className="border-b border-outline-variant/15 last:border-0">
                          <td className="px-5 py-4">{order.customerName}</td>
                          <td className="px-5 py-4">{order.phone}</td>
                          <td className="px-5 py-4">{order.city}</td>
                          <td className="px-5 py-4">{name}</td>
                          <td className="px-5 py-4">{order.selectedColor || "-"}</td>
                          <td className="whitespace-nowrap px-5 py-4 text-on-surface-variant">
                            {new Date(order.createdAt).toLocaleString(
                              locale === "ar" ? "ar-MA" : locale === "fr" ? "fr-FR" : "en-GB",
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </section>
          )}

          {view === "products" && (
          <>
          <section id="add-product" className="mb-6 scroll-mt-28">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="font-headline text-2xl text-primary">{t("addProduct")}</h2>
              <button
                type="button"
                onClick={() => (showCreateForm ? closeProductModal() : openCreateModal())}
                className="rounded-lg bg-primary px-4 py-2 font-sans text-xs uppercase tracking-widest text-on-primary"
              >
                {showCreateForm ? t("cancel") : t("addNew")}
              </button>
            </div>
            {showCreateForm && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
              <div className="max-h-[90vh] w-full max-w-4xl overflow-auto rounded-xl border border-outline-variant/20 bg-surface-container-lowest p-6 sm:p-8">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="font-headline text-2xl text-primary">
                  {editingProductId ? t("editProduct") : t("addProduct")}
                </h3>
                <button type="button" onClick={() => closeProductModal()} className="text-sm underline">
                  {t("cancel")}
                </button>
              </div>
              <form
                onSubmit={(e) => void saveProduct(e)}
                className="grid grid-cols-1 gap-5 sm:grid-cols-2"
              >
              <label className="flex flex-col gap-2 sm:col-span-2">
                <span className={fieldLabel}>{t("nameEn")}</span>
                <input
                  required
                  className={fieldInput}
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                />
              </label>
              <label className="flex flex-col gap-2">
                <span className={fieldLabel}>{t("nameAr")}</span>
                <input className={fieldInput} value={form.nameAr} onChange={(e) => setForm((f) => ({ ...f, nameAr: e.target.value }))} />
              </label>
              <label className="flex flex-col gap-2">
                <span className={fieldLabel}>{t("nameFr")}</span>
                <input className={fieldInput} value={form.nameFr} onChange={(e) => setForm((f) => ({ ...f, nameFr: e.target.value }))} />
              </label>
              <label className="flex flex-col gap-2">
                <span className={fieldLabel}>{t("priceMad")}</span>
                <input
                  required
                  type="number"
                  min={0}
                  step="0.01"
                  className={fieldInput}
                  value={form.price}
                  onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
                />
              </label>
              <label className="flex flex-col gap-2">
                <span className={fieldLabel}>{t("category")}</span>
                <div className="grid grid-cols-2 gap-2 rounded-xl border border-outline-variant/30 bg-surface-container-low p-3">
                  {PRESET_CATEGORIES.map((cat) => {
                    const checked = form.categories.includes(cat);
                    return (
                      <label key={cat} className="flex items-center gap-2 text-xs">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={(e) =>
                            setForm((f) => ({
                              ...f,
                              categories: e.target.checked
                                ? [...f.categories, cat]
                                : f.categories.filter((c) => c !== cat),
                            }))
                          }
                        />
                        {cat}
                      </label>
                    );
                  })}
                </div>
                {form.categories.some((c) => !(PRESET_CATEGORIES as readonly string[]).includes(c)) ? (
                  <div className="mt-3 border-t border-outline-variant/20 pt-3">
                    <span className={fieldLabel}>{t("extraCategoriesHint")}</span>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {form.categories
                        .filter((c) => !(PRESET_CATEGORIES as readonly string[]).includes(c))
                        .map((cat) => (
                          <label key={cat} className="flex items-center gap-2 rounded-lg border border-outline-variant/30 bg-surface-container-low px-2 py-1 text-xs">
                            <input
                              type="checkbox"
                              checked
                              onChange={() =>
                                setForm((f) => ({ ...f, categories: f.categories.filter((x) => x !== cat) }))
                              }
                            />
                            {cat}
                          </label>
                        ))}
                    </div>
                  </div>
                ) : null}
              </label>
              <label className="flex flex-col gap-2 sm:col-span-2">
                <span className={fieldLabel}>{t("descriptionEn")}</span>
                <textarea
                  required
                  rows={3}
                  className={fieldInput}
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                />
              </label>
              <label className="flex flex-col gap-2 sm:col-span-2">
                <span className={fieldLabel}>{t("descriptionAr")}</span>
                <textarea rows={2} className={fieldInput} value={form.descriptionAr} onChange={(e) => setForm((f) => ({ ...f, descriptionAr: e.target.value }))} />
              </label>
              <label className="flex flex-col gap-2 sm:col-span-2">
                <span className={fieldLabel}>{t("descriptionFr")}</span>
                <textarea rows={2} className={fieldInput} value={form.descriptionFr} onChange={(e) => setForm((f) => ({ ...f, descriptionFr: e.target.value }))} />
              </label>
              <ProductImageUploader
                value={form.imageUrls}
                setUrls={(action) =>
                  setForm((f) => ({
                    ...f,
                    imageUrls: typeof action === "function" ? action(f.imageUrls) : action,
                  }))
                }
                disabled={creating}
                onBusyChange={setImageUploadBusy}
              />
              <label className="flex flex-col gap-2 sm:col-span-2">
                <span className={fieldLabel}>Color variants (e.g. Black:#000000, White:#ffffff)</span>
                <textarea
                  rows={3}
                  className={fieldInput}
                  value={form.variantsText}
                  onChange={(e) => setForm((f) => ({ ...f, variantsText: e.target.value }))}
                />
              </label>
              <button
                type="submit"
                disabled={creating || form.imageUrls.length === 0 || imageUploadBusy}
                title={
                  imageUploadBusy
                    ? t("waitForUploads")
                    : form.imageUrls.length === 0
                      ? t("needOneImage")
                      : undefined
                }
                className="sm:col-span-2 rounded-xl bg-primary py-4 font-sans text-xs font-semibold uppercase tracking-widest text-on-primary transition-transform active:scale-[0.99] disabled:opacity-60 silk-gradient-hover"
              >
                {creating
                  ? editingProductId
                    ? t("updating")
                    : t("creating")
                  : editingProductId
                    ? t("saveChanges")
                    : t("saveProduct")}
              </button>
              </form>
              </div>
              </div>
            )}
          </section>

          <section id="products" className="scroll-mt-28">
            <h2 className="mb-6 font-headline text-2xl text-primary">{t("products")}</h2>
            {products.length === 0 ? (
              <p className="rounded-xl bg-surface-container-low px-6 py-10 text-center font-sans text-sm text-on-surface-variant">
                {t("noProducts")}
              </p>
            ) : (
              <div className="overflow-x-auto rounded-xl border border-outline-variant/20 bg-surface-container-lowest">
                <table className="w-full min-w-[760px] text-left">
                  <thead>
                    <tr className="border-b border-outline-variant/30 bg-surface-container-low">
                      <th className="px-5 py-4 font-headline text-sm font-medium text-primary">{t("product")}</th>
                      <th className="px-5 py-4 font-headline text-sm font-medium text-primary">{t("category")}</th>
                      <th className="px-5 py-4 font-headline text-sm font-medium text-primary">{t("priceMad")}</th>
                      <th className="px-5 py-4 font-headline text-sm font-medium text-primary">Variants</th>
                      <th className="px-5 py-4 font-headline text-sm font-medium text-primary">Images</th>
                      <th className="px-5 py-4 font-headline text-sm font-medium text-primary">Action</th>
                    </tr>
                  </thead>
                  <tbody className="font-sans text-sm text-on-surface">
                    {products.map((product) => {
                      const { name } = getLocalizedProductFields(product, locale);
                      return (
                        <tr key={product.id} className="border-b border-outline-variant/15 last:border-0">
                          <td className="px-5 py-4">{name}</td>
                          <td className="px-5 py-4">{product.categories.join(", ")}</td>
                          <td className="px-5 py-4">{formatMad(product.price.toString(), locale)}</td>
                          <td className="px-5 py-4">{product.colorVariants.map((v) => v.name).join(", ") || "-"}</td>
                          <td className="px-5 py-4">{product.images.length}</td>
                          <td className="px-5 py-4">
                            <div className="flex flex-wrap items-center gap-3">
                              <button
                                type="button"
                                className="font-sans text-xs uppercase tracking-widest text-primary underline underline-offset-4"
                                onClick={() => beginEditProduct(product)}
                              >
                                {t("edit")}
                              </button>
                              <button
                                type="button"
                                className="font-sans text-xs uppercase tracking-widest text-secondary underline underline-offset-4"
                                disabled={deletingId === product.id}
                                onClick={() => void deleteProduct(product.id)}
                              >
                                {deletingId === product.id ? t("deleting") : t("delete")}
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </section>
          </>
          )}
        </div>
      </div>
    </div>
  );
}

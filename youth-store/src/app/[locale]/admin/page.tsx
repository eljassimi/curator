import { AdminDashboard } from "@/components/AdminDashboard";
import { getAdminSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { routing } from "@/i18n/routing";

export default async function AdminPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!routing.locales.includes(locale as (typeof routing.locales)[number])) {
    redirect("/admin/login");
  }
  const session = await getAdminSession();
  if (!session) {
    const loginPath = locale === routing.defaultLocale ? "/admin/login" : `/${locale}/admin/login`;
    redirect(loginPath);
  }
  return <AdminDashboard view="overview" />;
}

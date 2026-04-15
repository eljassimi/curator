import { redirect } from "next/navigation";
import { AdminLoginForm } from "@/components/AdminLoginForm";
import { getAdminSession } from "@/lib/auth";

export default async function AdminLoginPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const session = await getAdminSession();
  if (session) {
    redirect(locale === "en" ? "/admin" : `/${locale}/admin`);
  }

  return (
    <main className="mx-auto w-full max-w-[1200px] px-6 py-12">
      <AdminLoginForm locale={locale} />
    </main>
  );
}

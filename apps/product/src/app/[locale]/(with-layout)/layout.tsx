import { setRequestLocale } from "@daodao/i18n/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Footer, Sidebar } from "@/components/layout";

export default async function WithLayout({ children, params }: LayoutProps<"/[locale]">) {
  const { locale } = await params;
  setRequestLocale(locale);

  const cookieStore = await cookies();
  if (!cookieStore.get("auth_token")) {
    redirect(`/${locale}/auth/login`);
  }

  return (
    <>
      {children}
      <Sidebar />
      <Footer />
    </>
  );
}

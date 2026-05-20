import { setRequestLocale } from "@daodao/i18n/server";
import { Footer, Sidebar } from "@/components/layout";

export default async function WithLayout({ children, params }: LayoutProps<"/[locale]">) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <>
      {children}
      <Sidebar />
      <Footer />
    </>
  );
}

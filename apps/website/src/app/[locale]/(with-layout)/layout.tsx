import { setRequestLocale } from "@daodao/i18n/server";
import { Footer, Header } from "@/components/layout";

export default async function WithLayout({ children, params }: LayoutProps<"/[locale]">) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <>
      <Header />
      <main className="min-h-screen">{children}</main>
      <Footer />
    </>
  );
}

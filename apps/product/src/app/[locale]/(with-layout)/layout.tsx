import { setRequestLocale } from "@daodao/i18n/server";
import { Footer } from "@/components/layout";
import { WithLayoutFrame } from "@/components/layout/with-layout-frame";

export default async function WithLayout({ children, params }: LayoutProps<"/[locale]">) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <WithLayoutFrame>
      {children}
      <Footer />
    </WithLayoutFrame>
  );
}

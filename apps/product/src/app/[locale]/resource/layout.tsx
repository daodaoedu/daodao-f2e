import { setRequestLocale } from "@daodao/i18n/server";
import { ResourceFooter, ResourceHeader } from "@/components/layout";

export default async function ResourceLayout({ children, params }: LayoutProps<"/[locale]/resource">) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <>
      <ResourceHeader />
      <main className="min-h-screen pt-[69px]">{children}</main>
      <ResourceFooter />
    </>
  );
}

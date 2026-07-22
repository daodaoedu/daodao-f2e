import { setRequestLocale } from "@daodao/i18n/server";
import { LighthouseShell } from "@/components/lighthouse";

export default async function LighthouseLayout({
  children,
  params,
}: LayoutProps<"/[locale]/lighthouse">) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <LighthouseShell>{children}</LighthouseShell>;
}

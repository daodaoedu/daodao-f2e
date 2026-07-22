import { setRequestLocale } from "@daodao/i18n/server";
import { LighthouseAccessRequired } from "@/components/lighthouse";

export default async function LighthouseAccessRequiredPage({
  params,
}: PageProps<"/[locale]/lighthouse/access-required">) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <LighthouseAccessRequired />;
}

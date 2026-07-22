import { setRequestLocale } from "@daodao/i18n/server";
import { LighthouseOverview } from "@/components/lighthouse/lighthouse-overview";

export default async function LighthouseOverviewPage({
  params,
}: PageProps<"/[locale]/lighthouse">) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <LighthouseOverview />;
}

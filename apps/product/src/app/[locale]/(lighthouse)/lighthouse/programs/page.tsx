import { setRequestLocale } from "@daodao/i18n/server";
import { ProgramsManager } from "@/components/lighthouse/programs-manager";

export default async function LighthouseProgramsPage({
  params,
}: PageProps<"/[locale]/lighthouse/programs">) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <ProgramsManager />;
}

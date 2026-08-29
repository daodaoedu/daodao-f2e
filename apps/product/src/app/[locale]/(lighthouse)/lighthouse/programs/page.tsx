import { setRequestLocale } from "@daodao/i18n/server";
import { Suspense } from "react";
import { ProgramsManager } from "@/components/lighthouse/programs-manager";

export default async function LighthouseProgramsPage({
  params,
}: PageProps<"/[locale]/lighthouse/programs">) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    // ProgramsManager 讀 ?edit=<cohortId> 展開編輯表單，useSearchParams 需要 Suspense 邊界
    <Suspense fallback={null}>
      <ProgramsManager />
    </Suspense>
  );
}

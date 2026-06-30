import { QuizResultDetail, themeMap } from "@daodao/features-quiz";
import { setRequestLocale } from "@daodao/i18n/server";

export async function generateStaticParams() {
  return Array.from(themeMap.keys()).map((resultId) => ({
    resultId,
  }));
}

export async function generateMetadata({ params }: PageProps<"/[locale]/quiz/result/[resultId]">) {
  const { resultId } = await params;
  const theme = themeMap.get(resultId);

  return {
    title: theme?.title,
  };
}

export default async function QuizResultDetailPage({
  params,
}: PageProps<"/[locale]/quiz/result/[resultId]">) {
  const { locale, resultId } = await params;
  setRequestLocale(locale);
  return <QuizResultDetail resultId={resultId} />;
}

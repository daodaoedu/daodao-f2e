import { QuizResultDetail, themeMap } from "@daodao/features-quiz";

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
  const { resultId } = await params;
  return <QuizResultDetail resultId={resultId} />;
}

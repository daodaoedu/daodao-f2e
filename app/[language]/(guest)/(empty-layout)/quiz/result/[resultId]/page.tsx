import { QuizResultDetailWidget } from '@/widgets/quiz';
import { themeMap } from '@/entities/quiz';

export async function generateStaticParams() {
  return Array.from(themeMap.keys()).map((resultId) => ({
    resultId,
  }));
}

export async function generateMetadata({
  params,
}: PageProps<'/[language]/quiz/result/[resultId]'>) {
  const { resultId } = await params;
  const theme = themeMap.get(resultId);

  return {
    title: theme?.title,
  };
}

export default async function QuizResultDetailPage({
  params,
}: PageProps<'/[language]/quiz/result/[resultId]'>) {
  const { resultId } = await params;
  return <QuizResultDetailWidget resultId={resultId} />;
}

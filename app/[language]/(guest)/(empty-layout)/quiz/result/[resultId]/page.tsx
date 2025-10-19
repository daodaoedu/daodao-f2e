import { QuizResultDetailWidget } from '@/widgets/quiz';
import { themeMap } from '@/entities/quiz';
import { locales } from '@/shared/config/i18n';

export async function generateStaticParams() {
  return locales.flatMap((language) =>
    Array.from(themeMap.keys()).map((resultId) => ({
      language,
      resultId,
    }))
  );
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

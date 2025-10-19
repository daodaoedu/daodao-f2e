import { QuizQuestionWidget } from '@/widgets/quiz';
import { questionMap } from '@/entities/quiz';
import { locales } from '@/shared/config/i18n';

export async function generateStaticParams() {
  return locales.flatMap((language) =>
    Array.from(questionMap.keys()).map((questionId) => ({
      questionId,
      language,
    }))
  );
}

export async function generateMetadata({
  params,
}: PageProps<'/[language]/quiz/questions/[questionId]'>) {
  const { questionId } = await params;
  const question = questionMap.get(questionId);

  return {
    title: question?.title,
  };
}

export default async function QuizQuestionPage({
  params,
}: PageProps<'/[language]/quiz/questions/[questionId]'>) {
  const { questionId } = await params;
  return <QuizQuestionWidget questionId={questionId} />;
}

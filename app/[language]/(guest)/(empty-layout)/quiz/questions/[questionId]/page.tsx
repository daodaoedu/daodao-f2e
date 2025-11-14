import { QuizQuestionWidget } from '@/widgets/quiz';
import { questionMap } from '@/entities/quiz';

export async function generateStaticParams() {
  return Array.from(questionMap.keys()).map((questionId) => ({
    questionId,
  }));
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

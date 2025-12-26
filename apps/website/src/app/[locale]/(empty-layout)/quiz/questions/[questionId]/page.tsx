import { QuizQuestion, questionMap } from "@daodao/features-quiz";
import { notFound } from "next/navigation";

export async function generateStaticParams() {
  return Array.from(questionMap.keys()).map((questionId) => ({
    questionId,
  }));
}

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/quiz/questions/[questionId]">) {
  const { questionId } = await params;
  const question = questionMap.get(questionId);

  if (!question) {
    notFound();
  }

  return {
    title: question?.title,
  };
}

export default async function QuizQuestionPage({
  params,
}: PageProps<"/[locale]/quiz/questions/[questionId]">) {
  const { questionId } = await params;
  return <QuizQuestion questionId={questionId} />;
}

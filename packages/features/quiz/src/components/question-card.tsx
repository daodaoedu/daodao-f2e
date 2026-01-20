import { Image } from "@daodao/ui/components/image";
import type { IQuestion } from "../types";

interface QuestionCardProps {
  question: IQuestion;
  className?: string;
}

export const QuestionCard = ({ question, className }: QuestionCardProps) => {
  return (
    <div className={className}>
      <div className="absolute h-[calc(100dvh-288px)] w-full blur-md">
        <Image key={question.title} src={question.image} alt={question.title} fill />
      </div>
      <div className="relative mx-auto aspect-30/43 max-h-[calc(100dvh-288px)]">
        <Image key={question.title} src={question.image} alt={question.title} fill priority />
      </div>
    </div>
  );
};

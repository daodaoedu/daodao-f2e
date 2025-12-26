import { Button } from "@daodao/ui/components/button";
import { cn } from "@daodao/ui/lib/utils";
import type { IAnswer } from "../types";

interface AnswerOptionProps {
  answer: IAnswer;
  isSelected: boolean;
  onSelect: () => void;
  questionId: string;
}

export const AnswerOption = ({ answer, isSelected, onSelect, questionId }: AnswerOptionProps) => {
  return (
    <Button
      variant="light"
      size="lg"
      key={`${questionId}-${answer.key}`}
      className={cn(
        "text-sm",
        isSelected && "bg-[#545454] text-white hover:border-[#545454] hover:text-white"
      )}
      onClick={onSelect}
    >
      {answer.title}
    </Button>
  );
};

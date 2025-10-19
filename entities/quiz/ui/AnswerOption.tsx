import { Button } from '@/shared/ui/button';
import { cn } from '@/shared/lib/cn';
import { Answer } from '../model';

interface AnswerOptionProps {
  answer: Answer;
  isSelected: boolean;
  onSelect: () => void;
  questionId: string;
}

export const AnswerOption = ({
  answer,
  isSelected,
  onSelect,
  questionId,
}: AnswerOptionProps) => {
  return (
    <Button
      variant="light"
      size="lg"
      key={`${questionId}-${answer.key}`}
      className={cn(
        'text-sm',
        isSelected &&
          'bg-[#545454] text-white hover:border-[#545454] hover:text-white'
      )}
      onClick={onSelect}
    >
      {answer.title}
    </Button>
  );
};

import z from 'zod';
import { cn } from '@/utils/cn';
import { Button } from '@/shared/ui/button';
import { Pencil, Check } from 'lucide-react';
import { MOTIVATION_MAP, STRATEGY_MAP, OUTCOME_MAP } from '@/constants/project';

const idSchema = z.string().regex(/^[0-9a-fA-F]{24}$/);
export const validateIdWithZod = (id: string) => {
  try {
    const result = idSchema.parse(id);
    return {
      isValid: true,
      value: result,
    };
  } catch (error) {
    return {
      isValid: false,
      error,
    };
  }
};

interface PanelProps {
  children: React.ReactNode;
  className?: string;
}
export const Panel = ({ children, className = '' }: PanelProps) => (
  <div className={cn(
    'w-full max-w-full sm:w-full mx-auto rounded-2xl px-4 py-8 md:p-10',
    className
  )}
  >
    {children}
  </div>
);

export const Title = ({ title }: {
  title: string
}) => (
  <h3 className="body-md mb-2 font-sans font-medium text-basic-500">
    {title}
  </h3>
);

export const Divider = () => (
  <hr className="my-5 border-basic-100" />
);

export const Description = ({ description }: {
  description: string
}) => (
  <p className="body-md font-sans font-normal text-basic-500">{description}</p>
);

export const Tags = ({ category, tags }: {
  category: string | null;
  tags: string[];
}) => {
  let tagsMap: { label: string, value: string }[] = [];
  switch (category) {
    case 'motivation_tags':
      tagsMap = MOTIVATION_MAP;
      break;
    case 'strategy_tags':
      tagsMap = STRATEGY_MAP;
      break;
    case 'outcome_tags':
      tagsMap = OUTCOME_MAP;
      break;
    default:
      break;
  }
  return (
    <div className="mb-2 flex flex-row flex-wrap gap-2">
      {
        category && (
          tags.map((tag: string) => {
            const label = tagsMap.filter((item) => item.value === tag)[0]?.label;
            return (
              <span key={tag} className="rounded-[4px] bg-primary-lightest px-2 py-[2px] font-sans text-sm text-[#2D3648]">
                {label || tag}
              </span>
            );
          })
        )
      }
    </div>
  );
};

export const FakeInput = ({ value }: {
  value: string
}) => (
  <div
    className="rounded-lg border border-solid
      border-basic-200 px-4 py-3
      font-sans text-basic-500 hover:cursor-default"
  >
    {value}
  </div>
);

export const FakeCheckBox = ({ isChecked, text }: {
  isChecked: boolean | undefined,
  text: string
}) => (
  <div className="flex flex-row">
    <div className="flex flex-row items-center justify-center gap-[5px] hover:cursor-pointer">
      <p className={cn(
        'w-[18px] h-[18px] p-[2px] rounded-[4px] m-[1px]',
        'flex items-center justify-center border-2 border-solid',
        isChecked
          ? 'bg-primary-base border-primary-base text-white'
          : 'bg-white border-basic-400 text-basic-400'
      )}
      >
        <Check />
      </p>
      <p className="text-basic-500">
        {text}
      </p>
    </div>
  </div>
);

export const EditFormButton = ({ onClick }: { onClick: () => void }) => {
  const handleOnClick = onClick;
  return (
    <Button
      onClick={handleOnClick}
      variant="outline"
      className="flex shrink-0 items-center gap-[5px] py-1"
    >
      <Pencil className="max-w-5" />
      編輯
    </Button>
  );
};

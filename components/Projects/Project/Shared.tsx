import z from "zod";
import { cn } from "@/utils/cn";
import { Button } from "@/components/atoms/button";
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import { MOTIVATION_MAP, STRATEGY_MAP, OUTCOME_MAP } from "@/constants/project";
import { FaCheck } from "react-icons/fa6";

const idSchema = z.string().regex(/^[0-9a-fA-F]{24}$/);
export const validateIdWithZod = (id: string) => {
  try {
    const result = idSchema.parse(id);
    return {
      isValid: true,
      value: result
    };
  } catch (error) {
    return {
      isValid: false,
      error
    };
  }
};

interface PanelProps {
  children: React.ReactNode;
  className?: string;
}
export const Panel = ({ children, className = "" }: PanelProps) => {
  return (
    <div className={cn(
      "w-full max-w-full sm:w-full mx-auto rounded-2xl px-4 py-8 md:p-10",
      className
    )}
    >
      {children}
    </div>
  );
};

export const Title = ({ title }: {
  title: string
}) => {
  return (
    <h3 className="text-basic-500 body-md font-medium mb-2 font-sans">
      {title}
    </h3>
  );
};

export const Divider = () => {
  return (
    <hr className="my-5 border-basic-100" />
  );
};

export const Description = ({ description }: {
  description: string
}) => {
  return (
    <p className="body-md font-sans font-normal">{description}</p>
  );
};

export const Tags = ({ category, tags }: {
  category: string | null;
  tags: string[];
}) => {
  let tagsMap: { label: string, value: string }[] = [];
  switch (category) {
    case "motivation_tags":
      tagsMap = MOTIVATION_MAP;
      break;
    case "strategy_tags":
      tagsMap = STRATEGY_MAP;
      break;
    case "outcome_tags":
      tagsMap = OUTCOME_MAP;
      break;
    default:
      break;
  }
  return (
    <div className="flex flex-row gap-2 mb-2 flex-wrap">
      {
        category && (
          tags.map((tag: string) => {
            const label = tagsMap.filter((item) => {
              return item.value === tag;
            })[0]?.label;
            return (
              <span key={tag} className="text-sm text-[#2D3648] px-2 bg-primary-lightest rounded-[4px] py-[2px] font-sans">
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
}) => {
  return (
    <div
      className="py-3 px-4 hover:cursor-default
      border border-solid border-basic-200
      rounded-lg font-sans"
    >
      {value}
    </div>
  );
};

export const FakeCheckBox = ({ isChecked, text }: {
  isChecked: boolean | undefined,
  text: string
}) => {
  return (
    <div className="flex flex-row">
      <div className="flex flex-row justify-center items-center gap-[5px] hover:cursor-pointer">
        <p className={cn(
          "w-[18px] h-[18px] p-[2px] rounded-[4px] m-[1px]",
          "flex items-center justify-center border-2 border-solid",
          isChecked ?
            "bg-primary-base border-primary-base text-white"
            :
            "bg-white border-basic-400 text-basic-400"
        )}
        >
          <FaCheck />
        </p>
        <p className="text-basic-500">
          {text}
        </p>
      </div>
    </div>
  );
};

export const EditFormButton = ({ onClick }: { onClick: () => void }) => {
  const handleOnClick = onClick;
  return (
    <Button
      onClick={handleOnClick}
      variant="outline"
      className="flex-shrink-0 flex items-center py-1 gap-[5px]"
    >
      <EditOutlinedIcon className="max-w-5" />
      編輯
    </Button>
  );
};

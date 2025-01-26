import z from "zod";
import { cn } from "@/utils/cn";
import Button from "@/shared/components/Button";
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';

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
      "w-full max-w-full sm:w-[750px] mx-auto rounded-2xl px-4 py-8 md:p-10",
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

export const Tags = ({ tags }: {
  tags: string[];
}) => {
  return (
    <div className="flex flex-row gap-2 mb-2">
      {tags.map((tag: string) => {
        return (
          <span key={tag} className="text-sm text-[#2D3648] px-2 bg-primary-lightest rounded-[4px] py-[2px] font-sans">{tag}</span>
        );
      })}
    </div>
  );
};

export const FakeInput = ({ value }: {
  value: string
}) => {
  return (
    <div
      className="py-3 px-4
      border border-solid border-basic-200
      rounded-lg font-sans"
    >
      {value}
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

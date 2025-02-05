import z from "zod";
import { cn } from "@/utils/cn";

const idSchema = z.string().regex(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/);

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

export const numberToZh = (num: number): string => {
  const chineseNumbers = ['零', '一', '二', '三', '四', '五', '六', '七', '八', '九'];

  if (num < 10) {
    return chineseNumbers[num];
  }

  const tens = Math.floor(num / 10);
  const units = num % 10;

  if (tens === 1) {
    return units === 0 ? '十' : `十${chineseNumbers[units]}`;
  } else {
    return units === 0 ? `${chineseNumbers[tens]}十` : `${chineseNumbers[tens]}十${chineseNumbers[units]}`;
  }
};

interface PanelProps {
  children: React.ReactNode;
  className?: string;
}
export const Panel = ({ children, className = "" }: PanelProps) => {
  return (
    <div className={cn(
      "w-full max-w-full sm:w-full mx-auto rounded-2xl p-3 md:p-10",
      className
    )}
    >
      {children}
    </div>
  );
};

export const Title = ({ title, className = "" }: {
  title: string,
  className?: string,
}) => {
  return (
    <h3 className={cn(
      "text-basic-500 body-md font-medium mb-2 font-sans",
      className
    )}
    >
      {title}
    </h3>
  );
};

interface ProgressBarProps {
  progress: number; // 0 ~ 100
}

export const ProgressBar = ({ progress }: ProgressBarProps) => {
  return (
    <div className="flex items-center w-full">
      <div className="relative w-full h-2 rounded-[100px] overflow-hidden">
        <div
          className="h-full bg-primary-base transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>
      <span className="font-sans text-sm ml-3 text-basic-300">{progress}%</span>
    </div>
  );
};

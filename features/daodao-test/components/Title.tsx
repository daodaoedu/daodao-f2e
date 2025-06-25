import { cn } from "@/utils/cn";

interface TitleProps extends React.PropsWithChildren {
  className?: string;
}

export const Title = ({ children, className }: TitleProps) => {
  return (
    <div
      className={cn(
        "mb-2 pl-2 text-base font-bold leading-tight border-l-[3px] border-solid border-basic-400",
        className
      )}
    >
      {children}
    </div>
  );
};

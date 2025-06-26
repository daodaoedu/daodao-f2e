import { cn } from "@/utils/cn";
import QuoteSvg from "@/public/assets/daodao-test/quote.svg";

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

export const Slogan = ({ children }: React.PropsWithChildren) => {
  return (
    <section
      className={cn(
        "relative mb-4 text-center text-[var(--color)] font-bold bg-white rounded-md py-1 px-3",
        "before:content-[''] before:absolute before:-top-1 before:right-16",
        "before:bg-gradient-to-br before:from-white before:from-60% before:to-60% before:to-white/0",
        "before:size-3 before:rotate-45 before:skew-x-12 before:skew-y-12"
      )}
    >
      <QuoteSvg className="absolute -left-2 -top-2.5 text-[var(--color)] opacity-50" />
      {children}
    </section>
  );
};

export const List = ({ data }: { data: string[] }) => {
  return (
    <ul className="list-disc pl-4">
      {data.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  );
};

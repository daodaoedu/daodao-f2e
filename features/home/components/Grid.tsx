import { cn } from "@/utils/cn";

interface GridProps {
  children: React.ReactNode;
  className?: string;
  cols?: {
    default?: number;
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  };
  gap?: "sm" | "md" | "lg" | "xl";
}

const gapVariants = {
  sm: "gap-4",
  md: "gap-4 sm:gap-6",
  lg: "gap-4 sm:gap-6 lg:gap-8",
  xl: "gap-6 sm:gap-8 lg:gap-12",
};

export function Grid({
  children,
  className,
  cols = { default: 1, sm: 2, lg: 3 },
  gap = "md"
}: GridProps) {
  const gridCols = cn(
    cols.default && `grid-cols-${cols.default}`,
    cols.sm && `sm:grid-cols-${cols.sm}`,
    cols.md && `md:grid-cols-${cols.md}`,
    cols.lg && `lg:grid-cols-${cols.lg}`,
    cols.xl && `xl:grid-cols-${cols.xl}`,
  );

  return (
    <div
      className={cn(
        "grid",
        gridCols,
        gapVariants[gap],
        className
      )}
    >
      {children}
    </div>
  );
}

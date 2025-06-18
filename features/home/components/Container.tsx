import { cn } from "@/utils/cn";

interface ContainerProps {
  children: React.ReactNode;
  className?: string;
  size?: "sm" | "md" | "lg" | "xl" | "full";
  padding?: "none" | "sm" | "md" | "lg";
}

const containerVariants = {
  size: {
    sm: "max-w-2xl",
    md: "max-w-4xl",
    lg: "max-w-6xl",
    xl: "max-w-7xl",
    full: "max-w-none",
  },
  padding: {
    none: "",
    sm: "px-4 sm:px-6",
    md: "px-4 sm:px-6 lg:px-8",
    lg: "px-6 sm:px-8 lg:px-12",
  },
};

export function Container({
  children,
  className,
  size = "xl",
  padding = "md"
}: ContainerProps) {
  return (
    <div
      className={cn(
        "mx-auto",
        containerVariants.size[size],
        containerVariants.padding[padding],
        className
      )}
    >
      {children}
    </div>
  );
}

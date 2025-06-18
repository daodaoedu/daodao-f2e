import { cn } from "@/utils/cn";
import { Container } from "./Container";

interface SectionProps {
  children: React.ReactNode;
  className?: string;
  containerSize?: "sm" | "md" | "lg" | "xl" | "full";
  padding?: "none" | "sm" | "md" | "lg" | "xl";
  background?: "white" | "gray" | "primary" | "gradient";
  id?: string;
}

const sectionVariants = {
  padding: {
    none: "",
    sm: "py-8 sm:py-12",
    md: "py-12 sm:py-16",
    lg: "py-16 sm:py-20",
    xl: "py-20 sm:py-24 lg:py-32",
  },
  background: {
    white: "bg-basic-white",
    gray: "bg-basic-100",
    primary: "bg-primary-base text-basic-white",
    gradient: "bg-gradient-primary-palest",
  },
};

export function Section({
  children,
  className,
  containerSize = "xl",
  padding = "lg",
  background = "white",
  id
}: SectionProps) {
  return (
    <section
      id={id}
      className={cn(
        sectionVariants.padding[padding],
        sectionVariants.background[background],
        className
      )}
    >
      <Container size={containerSize}>
        {children}
      </Container>
    </section>
  );
}

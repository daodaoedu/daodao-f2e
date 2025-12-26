import { Slot } from "@radix-ui/react-slot";
import { cn } from "../lib/utils";

interface WithAsChildProps extends React.HTMLAttributes<HTMLDivElement> {
  asChild?: boolean;
}

const Container = ({ asChild, className, ...props }: WithAsChildProps) => {
  const Comp = asChild ? Slot : "div";
  return <Comp className={cn("container", className)} {...props} />;
};

const Paper = ({ asChild, className, ...props }: WithAsChildProps) => {
  const Comp = asChild ? Slot : "div";
  return <Comp className={cn("p-4 md:p-10 bg-white shadow-md rounded-xl", className)} {...props} />;
};

const backgroundVariants = {
  default: "bg-primary-palest",
};

interface BackgroundProps extends WithAsChildProps {
  variant?: keyof typeof backgroundVariants;
}

const Background = ({ asChild, className, variant = "default", ...props }: BackgroundProps) => {
  const Comp = asChild ? Slot : "div";
  return <Comp className={cn("pt-20", backgroundVariants[variant], className)} {...props} />;
};

export { Container, Paper, Background };

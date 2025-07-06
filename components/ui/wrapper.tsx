import { cn } from "@/utils/cn";
import { Slot } from "@radix-ui/react-slot";

interface WithAsChildProps extends React.HTMLAttributes<HTMLDivElement> {
  asChild?: boolean;
}

export const Container = ({
  asChild,
  className,
  ...props
}: WithAsChildProps) => {
  const Comp = asChild ? Slot : "div";
  return <Comp className={cn("container", className)} {...props} />;
};

export const Paper = ({ asChild, className, ...props }: WithAsChildProps) => {
  const Comp = asChild ? Slot : "div";
  return (
    <Comp
      className={cn("p-10 bg-white shadow-md rounded-xl", className)}
      {...props}
    />
  );
};

const backgroundVariants = {
  default: "bg-primary-palest",
};

interface BackgroundProps extends WithAsChildProps {
  variant?: keyof typeof backgroundVariants;
}

export const Background = ({
  asChild,
  className,
  variant = "default",
  ...props
}: BackgroundProps) => {
  const Comp = asChild ? Slot : "div";
  return (
    <Comp
      className={cn("pt-12", backgroundVariants[variant], className)}
      {...props}
    />
  );
};

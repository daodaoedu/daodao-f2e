import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import type * as React from "react";
import { cn } from "../lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border border-solid transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-primary-foreground shadow",
        secondary: "border-transparent bg-secondary text-secondary-foreground",
        alert: "border-transparent bg-alert text-alert-foreground shadow",
        outline: "border-primary-base bg-basic-white text-foreground",
        gray: "border-basic-100 bg-basic-100 text-basic-500",
      },
      size: {
        default: "body-sm px-3 py-1",
        sm: "text-xs px-2 py-0.5",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  asChild?: boolean;
  size?: "default" | "sm";
}

function Badge({ className, variant, asChild, size = "default", ...props }: BadgeProps) {
  const Comp = asChild ? Slot : "div";

  return <Comp className={cn(badgeVariants({ variant, size }), className)} {...props} />;
}

export { Badge, badgeVariants };

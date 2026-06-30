import { cva, type VariantProps } from "class-variance-authority";
import { Slot as SlotPrimitive } from "radix-ui";
import type * as React from "react";
import { cn } from "../lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border border-solid transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-transparent bg-logo-cyan text-white",
        secondary: "border-white bg-white/70 text-text-dark",
        alert: "border-white bg-red text-white",
        "outline-ghost": "border-light-gray bg-transparent text-text-dark",
        "outline-logo": "border-logo-cyan bg-light-blue text-text-dark",
        "outline-blue": "border-blue bg-basic-white text-text-dark",
        "outline-white": "border-blue bg-basic-white/70 text-text-dark",
        "very-light-blue": "border-very-light-blue bg-very-light-blue text-text-dark",
        gray: "border-transparent bg-very-light-gray text-basic-400",
        dark: "border-transparent bg-bg-dark text-white",
      },
      size: {
        lg: "text-lg px-4 py-1.25",
        default: "body-sm px-3 py-1",
        sm: "text-xs px-2 py-0.5",
        xs: "text-xs px-1 py-0",
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
}

function Badge({ className, variant, asChild, size = "default", ...props }: BadgeProps) {
  const Comp = asChild ? SlotPrimitive.Slot : "div";

  return <Comp className={cn(badgeVariants({ variant, size }), className)} {...props} />;
}

export { Badge, badgeVariants };

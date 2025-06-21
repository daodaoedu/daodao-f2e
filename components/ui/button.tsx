"use client";

import * as React from "react";
import { Slot, Slottable } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/utils/cn";

const buttonVariants = cva(
  cn(
    // Display
    "relative inline-flex items-center justify-center gap-2",
    // Text & Space
    "whitespace-nowrap body-md font-medium",
    // Visual Style
    "transition-[color,background-color,box-shadow] rounded-full",
    // Interaction
    "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
    "disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none",
    // SVG
    "[&_svg]:pointer-events-none [&_svg]:shrink-0"
  ),
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground hover:shadow-lg hover:shadow-primary/50 hover:bg-primary/90",
        alert: "bg-alert text-alert-foreground shadow-sm hover:bg-alert/90",
        outline:
          "border border-primary bg-background shadow-sm hover:bg-primary hover:text-primary-foreground [&_svg]:text-primary-base [&_svg]:hover:text-primary-foreground",
        secondary:
          "bg-secondary text-secondary-foreground shadow-lg hover:bg-primary-lightest",
        ghost: "hover:text-primary",
        link: "text-primary underline-offset-4 hover:underline",
        gray: "bg-basic-200 border-basic-200 text-basic-300 shadow-lg hover:bg-primary-base hover:border-primary-base hover:text-white",
        light:
          "border border-basic-200 bg-background shadow-sm hover:border-primary-base hover:text-primary-base",
      },
      size: {
        default: "h-9 px-5 py-2",
        sm: "h-8 px-3 body-sm",
        lg: "h-10 px-5",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

enum ButtonAnimationEnum {
  Ripple = "ripple",
  None = "none",
}

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  animation?: ButtonAnimationEnum | `${ButtonAnimationEnum}`;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      asChild = false,
      disabled,
      animation = ButtonAnimationEnum.Ripple,
      onClick,
      children,
      ...props
    },
    ref
  ) => {
    const rippleRef = React.useRef<HTMLDivElement>(null);
    const Comp = asChild ? Slot : "button";

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (disabled) {
        return;
      }

      onClick?.(e);

      if (animation === ButtonAnimationEnum.None) {
        return;
      }
      const rect = e.currentTarget.getBoundingClientRect();
      const ripple = document.createElement("span");

      ripple.className =
        "absolute size-10 rounded-full bg-black/30 animate-button-ripple";
      ripple.style.top = `${((e.clientY - rect.top) / rect.height) * 100}%`;
      ripple.style.left = `${((e.clientX - rect.left) / rect.width) * 100}%`;
      rippleRef.current?.appendChild(ripple);
      setTimeout(() => ripple.remove(), 1000);
    };

    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        onClick={handleClick}
        disabled={disabled}
        {...props}
      >
        <Slottable>{children}</Slottable>
        <div
          ref={rippleRef}
          className="absolute inset-0 overflow-hidden pointer-events-none rounded-[inherit]"
        />
      </Comp>
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };

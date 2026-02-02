"use client";

import { Slot, Slottable } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

import { cn } from "@/shared/lib/cn";

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
          "border border-solid border-transparent bg-primary text-primary-foreground hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/50",
        alert:
          "border border-solid border-transparent bg-alert text-alert-foreground shadow-sm hover:bg-alert/90",
        outline:
          "border border-solid border-primary bg-background text-primary-base shadow-sm hover:bg-primary hover:text-primary-foreground [&_svg]:text-primary-base [&_svg]:hover:text-primary-foreground",
        secondary:
          "border border-solid border-transparent bg-secondary text-secondary-foreground shadow-lg hover:bg-primary-lightest",
        ghost: "hover:text-primary",
        link: "text-primary underline-offset-4 hover:underline",
        gray: "border-basic-200 bg-basic-200 text-basic-300 shadow-lg hover:border-primary-base hover:bg-primary-base hover:text-white",
        light:
          "border border-basic-200 bg-background shadow-sm hover:border-primary-base hover:text-primary-base",
        ctaOrange:
          "border-2 border-tips bg-tips text-white shadow-[0_8px_10px_0_rgba(255,161,11,0.2)] hover:!bg-white hover:text-tips hover:shadow-[0_12px_20px_0_rgba(255,161,11,0.3)]",
        ctaOrangeSmall:
          "rounded-full border-2 border-tips bg-tips px-6 py-2 text-sm font-medium text-white transition-colors duration-200 hover:!bg-white hover:text-tips",
        ctaPrimary:
          "border-2 border-primary-base bg-primary-base text-white shadow-[0_8px_10px_0_rgba(22,185,179,0.2)] hover:!bg-white hover:text-primary-base hover:shadow-[0_12px_20px_0_rgba(22,185,179,0.3)]",
      },
      size: {
        default: "h-9 px-5 py-2",
        sm: "body-sm h-8 px-3",
        lg: "h-10 px-5",
        huge: "h-14 px-10 text-lg font-semibold ",
        icon: "size-9",
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

      ripple.className = "absolute size-10 rounded-full bg-black/30 animate-button-ripple";
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
          className="pointer-events-none absolute inset-0 overflow-hidden rounded-[inherit]"
        />
      </Comp>
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };

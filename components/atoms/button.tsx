"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/utils/cn";

const buttonVariants = cva(
  cn(
    // Display
    "relative inline-flex items-center justify-center gap-2",
    // Text & Space
    "whitespace-nowrap text-sm font-medium",
    // Visual Style
    "transition-[color,background-color,box-shadow] rounded-lg",
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
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        alert: "bg-alert text-alert-foreground shadow-sm hover:bg-alert/90",
        outline:
          "border border-primary bg-background shadow-sm hover:bg-primary hover:text-primary-foreground",
        secondary:
          "bg-secondary text-secondary-foreground shadow-lg hover:bg-primary-lightest",
        ghost: "hover:text-primary",
        link: "text-primary underline-offset-4 hover:underline",
        gray: "bg-basic-200 border-basic-200 text-basic-300 shadow-lg hover:bg-primary-base hover:border-primary-base hover:text-white",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 px-3",
        lg: "h-10 px-8 body-md",
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
      children,
      disabled,
      animation = ButtonAnimationEnum.Ripple,
      onClick,
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

    const rippleElement = (
      <div
        key="ripple"
        ref={rippleRef}
        className="absolute inset-0 pointer-events-none rounded-[inherit] overflow-hidden"
      />
    );

    const childElement = React.isValidElement<React.PropsWithChildren>(
      children
    ) ? (
      React.cloneElement(children, {}, [children.props.children, rippleElement])
    ) : (
      <>
        {children}
        {rippleElement}
      </>
    );

    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        onClick={handleClick}
        disabled={disabled}
        {...props}
      >
        {childElement}
      </Comp>
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };

"use client";

import { useRouter } from "@daodao/i18n/navigation";
import { Slot, Slottable } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { ChevronLeft } from "lucide-react";
import * as React from "react";

import { cn } from "../lib/utils";

const buttonVariants = cva(
  cn(
    // Display
    "relative inline-flex items-center justify-center gap-2",
    // Text & Space
    "whitespace-nowrap body-md",
    // Visual Style
    "transition-[color,background-color,box-shadow] rounded-full",
    // Interaction
    "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
    "disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none cursor-pointer",
    // SVG
    "[&_svg]:pointer-events-none [&_svg]:shrink-0"
  ),
  {
    variants: {
      variant: {
        default:
          "border border-solid border-transparent bg-logo-cyan text-white hover:bg-logo-cyan/90 hover:shadow-sm hover:shadow-logo-cyan/50",
        alert:
          "border border-solid border-transparent bg-alert text-alert-foreground shadow-sm hover:bg-alert/90",
        outline:
          "border border-solid border-logo-cyan bg-background text-text-dark hover:bg-logo-cyan hover:text-white",
        secondary:
          "border border-solid border-transparent bg-white text-text-dark shadow-[0_4px_0_color-mix(in_srgb,var(--color-logo-cyan)_40%,transparent)]",
        ghost: "text-text-dark hover:text-logo-cyan [&_svg[fill*='url']]:fill-[unset]",
        link: "text-primary underline-offset-4 hover:underline",
        gray: "border-basic-200 bg-basic-200 text-basic-300 shadow-lg hover:border-primary-base hover:bg-primary-base hover:text-white",
        light:
          "border border-basic-200 bg-background shadow-sm hover:border-primary-base hover:text-primary-base",
        white: "border border-solid border-transparent bg-basic-white text-text-dark hover:shadow",
        orange:
          "border border-solid border-transparent bg-logo-orange text-bg-dark hover:bg-logo-orange/90 hover:shadow-sm hover:shadow-logo-orange/50",
        blue: "border border-solid border-transparent bg-blue text-bg-dark hover:bg-blue/90 hover:shadow-sm hover:shadow-blue/50",
        ctaOrange:
          "border-2 border-tips bg-tips text-white shadow-[0_8px_10px_0_rgba(255,161,11,0.2)] hover:!bg-white hover:text-tips hover:shadow-[0_12px_20px_0_rgba(255,161,11,0.3)]",
        ctaOrangeSmall:
          "rounded-full border-2 border-tips bg-tips px-6 py-2 text-sm font-medium text-white transition-colors duration-200 hover:!bg-white hover:text-tips",
        ctaPrimary:
          "border-2 border-primary-base bg-primary-base text-white shadow-[0_8px_10px_0_rgba(22,185,179,0.2)] hover:!bg-white hover:text-primary-base hover:shadow-[0_12px_20px_0_rgba(22,185,179,0.3)]",
      },
      size: {
        default: "h-10 px-5 py-2",
        sm: "body-sm h-8 px-3",
        huge: "h-14 px-10 text-lg font-semibold ",
        icon: "size-10",
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
      type = "button",
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
        type={type}
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

interface BackButtonProps extends Omit<ButtonProps, "children" | "onClick"> {
  label?: string;
  onClick?: (router: ReturnType<typeof useRouter>) => void;
}

const BackButton = React.forwardRef<HTMLButtonElement, BackButtonProps>(
  ({ label, className, onClick, ...props }, ref) => {
    const router = useRouter();
    const handleBack =
      typeof onClick === "function" ? onClick : (r: ReturnType<typeof useRouter>) => r.back();

    return (
      <Button
        ref={ref}
        variant="ghost"
        onClick={() => handleBack(router)}
        className={cn("-mx-2 px-2 text-basic-400", className)}
        {...props}
      >
        <ChevronLeft className="size-7" />
        {label}
      </Button>
    );
  }
);

export { Button, BackButton, buttonVariants };

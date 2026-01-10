"use client";

import { useCompositionState } from "@daodao/shared";
import * as React from "react";
import { cn } from "../lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  invalid?: boolean;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, invalid, onKeyDown, onCompositionStart, onCompositionEnd, ...props }, ref) => {
    const { isComposing, compositionProps } = useCompositionState();

    const handleKeyDown = React.useCallback(
      (e: React.KeyboardEvent<HTMLInputElement>) => {
        // 如果正在輸入法組合狀態且按下 Enter，阻止預設行為和事件冒泡
        if (isComposing && e.key === "Enter") {
          e.preventDefault();
          e.stopPropagation();
          return;
        }

        onKeyDown?.(e);
      },
      [isComposing, onKeyDown]
    );

    const handleCompositionStart = React.useCallback(
      (e: React.CompositionEvent<HTMLInputElement>) => {
        compositionProps.onCompositionStart();
        onCompositionStart?.(e);
      },
      [compositionProps.onCompositionStart, onCompositionStart]
    );

    const handleCompositionEnd = React.useCallback(
      (e: React.CompositionEvent<HTMLInputElement>) => {
        compositionProps.onCompositionEnd();
        onCompositionEnd?.(e);
      },
      [compositionProps.onCompositionEnd, onCompositionEnd]
    );

    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-lg border border-bg-gray hover:border-logo-cyan bg-background text-sm ring-offset-background placeholder:text-light-gray",
          "px-4 py-2 focus-visible:px-[15px] focus-visible:py-[9px]",
          "focus-visible:border-2 focus-visible:border-logo-cyan focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-[#DEF5F5]",
          "disabled:cursor-not-allowed disabled:border-bg-gray disabled:bg-very-light-gray",
          invalid && "border-red",
          className
        )}
        aria-invalid={invalid}
        ref={ref}
        onKeyDown={handleKeyDown}
        onCompositionStart={handleCompositionStart}
        onCompositionEnd={handleCompositionEnd}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export { Input };

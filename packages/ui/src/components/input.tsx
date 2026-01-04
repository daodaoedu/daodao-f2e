"use client";

import * as React from "react";
import { cn } from "../lib/utils";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
    invalid?: boolean;
  }

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, invalid, ...props }, ref) => {
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
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export { Input };


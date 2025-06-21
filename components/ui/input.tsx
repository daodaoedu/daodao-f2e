import * as React from "react";
import { X } from "lucide-react";

import { Button } from "@/components/ui/button";
import useControlledState from "@/hooks/useControlledState";
import { cn } from "@/utils/cn";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  value?: string | number;
  defaultValue?: string;
  placeholder?: string;
  prefixIcon?: React.ReactNode;
  suffixIcon?: React.ReactNode;
  className?: string;
  hasClearButton?: boolean;
  onValueChange?: (value: string) => void;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      value,
      defaultValue,
      onChange,
      onValueChange,
      prefixIcon,
      suffixIcon,
      hasClearButton,
      ...props
    },
    ref
  ) => {
    const [internalValue, setInternalValue] = useControlledState(
      defaultValue ?? "",
      value == null ? value : value.toString(),
      onValueChange
    );

    const handleClear = () => {
      setInternalValue("");
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setInternalValue(e.target.value);
      onChange?.(e);
    };

    const iconClassName =
      "absolute top-1/2 -translate-y-1/2 [&>svg]:text-basic-300 [&>svg]:size-5 pointer-events-none";

    return (
      <div className={cn("relative w-full", className)}>
        {prefixIcon && (
          <span className={cn(iconClassName, "left-4")}>{prefixIcon}</span>
        )}
        <input
          ref={ref}
          className={cn(
            "h-10 w-full rounded-lg border border-basic-200 bg-transparent",
            "flex items-center justify-center px-3 py-1 body-md transition-colors",
            "placeholder:text-muted-foreground [&::-webkit-search-cancel-button]:hidden",
            "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
            "disabled:cursor-not-allowed disabled:opacity-50",
            prefixIcon && "pl-11",
            (suffixIcon || hasClearButton) && "pr-11"
          )}
          value={internalValue}
          onChange={handleChange}
          {...props}
        />
        {suffixIcon && (
          <span className={cn(iconClassName, "right-4")}>{suffixIcon}</span>
        )}
        {hasClearButton && internalValue && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-1/2 -translate-y-1/2 right-1 cursor-pointer [&>svg]:size-5"
            onClick={handleClear}
          >
            <X />
          </Button>
        )}
      </div>
    );
  }
);
Input.displayName = "Input";

export { Input };

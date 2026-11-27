import { Progress as ProgressPrimitive } from "radix-ui";
import * as React from "react";

import { cn } from "../lib/utils";

const Progress = React.forwardRef<
  React.ComponentRef<typeof ProgressPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root>
>(({ className, value, ...props }, ref) => {
  const boundedValue =
    value === null || value === undefined ? value : Math.min(100, Math.max(0, value || 0));
  return (
    <ProgressPrimitive.Root
      ref={ref}
      value={boundedValue}
      className={cn(
        "relative h-2.5 w-full overflow-hidden rounded-full bg-text-dark/40 [--active-color:var(--blue)]",
        className
      )}
      {...props}
    >
      <ProgressPrimitive.Indicator
        className="size-full flex-1 bg-(--active-color) transition-all"
        style={{ transform: `translateX(-${100 - (boundedValue || 0)}%)` }}
      />
    </ProgressPrimitive.Root>
  );
});
Progress.displayName = ProgressPrimitive.Root.displayName;

export { Progress };

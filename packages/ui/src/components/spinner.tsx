import { Loader2Icon } from "lucide-react";
import type * as React from "react";

import { cn } from "../lib/utils";

function Spinner({ className }: { className?: string }) {
  return (
    <Loader2Icon
      role="status"
      aria-label="Loading"
      className={cn("size-4 animate-spin", className)}
    />
  );
}

export { Spinner };

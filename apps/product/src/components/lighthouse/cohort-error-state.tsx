"use client";

import { Button } from "@daodao/ui/components/button";
import { AlertTriangle, RotateCw } from "lucide-react";

interface CohortErrorStateProps {
  message: string;
  retryLabel: string;
  onRetry: () => void;
}

export function CohortErrorState({ message, retryLabel, onRetry }: CohortErrorStateProps) {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center px-5 py-20 text-center">
      <AlertTriangle className="size-9 text-[#C2410C]" />
      <p className="mt-4 text-[#5A7B79]">{message}</p>
      <Button variant="outline" className="mt-5" onClick={onRetry}>
        <RotateCw className="size-4" />
        {retryLabel}
      </Button>
    </div>
  );
}

"use client";

import { useRouter } from "@daodao/i18n/navigation";
import { Button } from "@daodao/ui/components/button";
import { cn } from "@daodao/ui/lib/utils";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";

interface NavigationButtonsProps {
  currentStep: number;
  totalSteps: number;
  hasSelectedAnswer: boolean;
  basePath?: string;
}

export const NavigationButtons = ({
  currentStep,
  totalSteps,
  hasSelectedAnswer,
  basePath = "/quiz/questions",
}: NavigationButtonsProps) => {
  const router = useRouter();

  return (
    <>
      {/* Previous Button */}
      <Button
        variant="ghost"
        className={cn(
          "left-0 top-0 size-8",
          "sm:left-auto sm:right-full sm:top-1/2 sm:size-20 sm:-translate-y-1/2",
          "body-sm absolute z-20 flex-col gap-0 p-0 hover:text-black",
          "sm:bg-[radial-gradient(circle_at_center,#FFFFFF_0%,#FFFFFF00_70%)]",
          currentStep === 1 && "hidden"
        )}
        onClick={() => router.push(`${basePath}/q${currentStep - 1}`)}
        animation="none"
      >
        <ChevronLeftIcon size={20} />
        <span className="hidden sm:block">上一題</span>
      </Button>

      {/* Next Button */}
      <Button
        variant="ghost"
        className={cn(
          "right-0 top-0 size-8",
          "sm:left-full sm:right-auto sm:top-1/2 sm:size-20 sm:-translate-y-1/2",
          "body-sm absolute z-20 flex-col gap-0 p-0 hover:text-black",
          "sm:bg-[radial-gradient(circle_at_center,#FFFFFF_0%,#FFFFFF00_70%)]",
          (!hasSelectedAnswer || currentStep >= totalSteps) && "hidden"
        )}
        onClick={() => router.push(`${basePath}/q${currentStep + 1}`)}
        animation="none"
      >
        <ChevronRightIcon size={20} />
        <span className="hidden sm:block">下一題</span>
      </Button>
    </>
  );
};

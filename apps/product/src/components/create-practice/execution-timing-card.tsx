"use client";

import { BulbSvg, BookSvg, ClockSolidSvg } from "@daodao/assets";
import { Badge } from "@daodao/ui/components/badge";
import {
  EXECUTION_TIMING_OPTIONS,
  type ManualPracticeFormValues,
} from "./manual/schema";

interface ExecutionTimingCardProps {
  executionTiming: ManualPracticeFormValues["executionTiming"];
  customTiming?: ManualPracticeFormValues["customTiming"];
}

export const ExecutionTimingCard = ({
  executionTiming,
  customTiming,
}: ExecutionTimingCardProps) => {
  return (
    <div className="relative bg-light-cyan rounded-lg px-4 pt-8 pb-3 md:pb-12">
      {/* Lightbulb Icon */}
      <div className="absolute top-0 left-2.5 -translate-y-1/2">
        <BulbSvg width={42} height={53} />
      </div>

      {/* Book Illustration Background */}
      <div className="absolute bottom-0 right-0 w-[108px] h-[100px] overflow-hidden">
        <BookSvg width={126} height={118} className="opacity-70" />
      </div>

      <div className="relative">
        <h3 className="text-xs text-text-dark mb-2">執行時機</h3>
        <div className="flex flex-wrap gap-2">
          {executionTiming.map((timing) => {
            const option = EXECUTION_TIMING_OPTIONS.find(
              (opt) => opt.value === timing
            );
            if (!option) return null;
            return (
              <Badge
                key={timing}
                variant="very-light-blue"
                size="sm"
                className="text-sm py-[3px] rounded gap-1"
              >
                <ClockSolidSvg
                  width={18}
                  height={18}
                  className="text-light-cyan shrink-0"
                />
                {option.label}
              </Badge>
            );
          })}
          {customTiming && (
            <Badge
              variant="very-light-blue"
              size="sm"
              className="text-sm py-[3px] rounded gap-1"
            >
              <ClockSolidSvg
                width={18}
                height={18}
                className="text-light-cyan shrink-0"
              />
              {customTiming}
            </Badge>
          )}
        </div>
      </div>
    </div>
  );
};


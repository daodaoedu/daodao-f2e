"use client";

import { BookSvg, ClockSolidSvg } from "@daodao/assets";
import { useTranslations } from "@daodao/i18n";
import { Badge } from "@daodao/ui/components/badge";
import { EXECUTION_TIMING_OPTIONS, type ManualPracticeFormValues } from "../create/manual/schema";

interface ExecutionTimingCardProps {
  executionTiming: ManualPracticeFormValues["executionTiming"];
  customTiming?: ManualPracticeFormValues["customTiming"];
}

export const ExecutionTimingCard = ({
  executionTiming,
  customTiming,
}: ExecutionTimingCardProps) => {
  const t = useTranslations("practice");
  return (
    <div className="relative bg-light-cyan rounded-lg px-4 pt-4 pb-3 md:pb-12">
      {/* Book Illustration Background */}
      <div className="absolute bottom-0 right-0 w-[108px] h-[100px] overflow-hidden">
        <BookSvg width={126} height={118} className="opacity-70" />
      </div>

      <div className="relative">
        <h3 className="text-xs text-text-dark mb-2">{t("form_execution_timing")}</h3>
        <div className="flex flex-wrap gap-2">
          {executionTiming.map((timing) => {
            const option = EXECUTION_TIMING_OPTIONS.find((opt) => opt.value === timing);
            if (!option) return null;
            return (
              <Badge
                key={timing}
                variant="very-light-blue"
                size="sm"
                className="text-sm py-[3px] rounded gap-1"
              >
                <ClockSolidSvg width={18} height={18} className="text-light-cyan shrink-0" />
                {t(`${option.labelKey}`)}
              </Badge>
            );
          })}
          {customTiming && (
            <Badge variant="very-light-blue" size="sm" className="text-sm py-[3px] rounded gap-1">
              <ClockSolidSvg width={18} height={18} className="text-light-cyan shrink-0" />
              {customTiming}
            </Badge>
          )}
        </div>
      </div>
    </div>
  );
};

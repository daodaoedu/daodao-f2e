"use client";

import { useTranslations } from "@daodao/i18n";
import { Button } from "@daodao/ui/components/button";
import { ChevronDown, ChevronUp } from "lucide-react";
import { type ComponentProps, useId, useState } from "react";
import { ExecutionDurationCard } from "@/components/practice/shared/execution-duration-card";
import { ExecutionTimingCard } from "@/components/practice/shared/execution-timing-card";

interface PracticeScheduleDetailsProps {
  executionTiming: ComponentProps<typeof ExecutionTimingCard>["executionTiming"];
  customTiming?: string;
  durationDays: number | null;
  startDate?: string;
}

/** Keep the existing schedule details available inside the revised overview layout. */
export function PracticeScheduleDetails({
  executionTiming,
  customTiming,
  durationDays,
  startDate,
}: PracticeScheduleDetailsProps) {
  const t = useTranslations("practice");
  const [expanded, setExpanded] = useState(false);
  const contentId = useId();
  return (
    <>
      <Button
        type="button"
        variant="ghost"
        aria-expanded={expanded}
        aria-controls={contentId}
        onClick={() => setExpanded((value) => !value)}
        className="w-full h-auto justify-between px-0 text-sm text-[#9FB5B8] py-1 mb-2 cursor-pointer hover:bg-transparent"
      >
        {t("more_info")}
        {expanded ? (
          <ChevronUp className="size-4" aria-hidden="true" />
        ) : (
          <ChevronDown className="size-4" aria-hidden="true" />
        )}
      </Button>
      <div id={contentId} hidden={!expanded}>
        <div className="grid grid-cols-2 gap-3 pb-3">
          <ExecutionTimingCard executionTiming={executionTiming} customTiming={customTiming} />
          {durationDays !== null && (
            <ExecutionDurationCard
              durationDays={durationDays}
              startDate={startDate || ""}
              showRemaining
            />
          )}
        </div>
      </div>
    </>
  );
}

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
        className="mb-2 h-auto min-h-11 w-full justify-between rounded-lg px-3 py-2.5 text-sm font-medium text-text-dark hover:bg-very-light-gray hover:text-text-dark active:bg-bg-gray focus-visible:ring-2 focus-visible:ring-text-dark"
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

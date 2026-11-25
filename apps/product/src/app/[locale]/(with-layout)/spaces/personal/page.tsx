"use client";

import { useMyPractices } from "@daodao/api";
import { useTranslations } from "@daodao/i18n";
import { Spinner } from "@daodao/ui/components/spinner";
import { useMemo } from "react";
import type { InProgressTask } from "@/components/dashboard";
import { SpacePracticeSection, SpaceSubpageHeader } from "@/components/spaces";
import { mapPracticeStatusToTaskStatus } from "@/constants/task-status";
import { useActivateCohortDraft } from "@/hooks/use-activate-cohort-draft";
import { minePracticeStatus } from "@/utils/mine-filter";

/** 個人實踐子頁 (FRD 4): the viewer's own practices behind the space filter row. */
export default function PersonalSpacePage() {
  const t = useTranslations("space");
  const { data, isLoading, mutate } = useMyPractices({ limit: 100 });
  const activateCohortDraft = useActivateCohortDraft(mutate);

  const tasks = useMemo<InProgressTask[]>(
    () =>
      (data?.data || []).map((practice) => {
        const listStatus = minePracticeStatus(practice);
        return {
          id: practice.id,
          title: practice.title,
          description: practice.practiceAction || "",
          checkInCount: practice.checkInCount,
          progress: practice.progressPercentage ?? 0,
          messagesCount: 0,
          isUnreadMessages: false,
          theme: practice.themeColor || "#FCDD84",
          status: mapPracticeStatusToTaskStatus(listStatus.status ?? practice.status),
          lastCheckInDate: practice.lastCheckinAt ?? null,
          startDate: practice.startDate || null,
          endDate: practice.endDate || null,
          lockBeforeStartDate: listStatus.lockBeforeStartDate,
          onBeforeCheckIn: listStatus.needsActivation
            ? () => activateCohortDraft(practice.id)
            : undefined,
        };
      }),
    [data, activateCohortDraft]
  );

  return (
    <div className="mx-auto min-h-screen max-w-[640px] px-4 pb-[72px] pt-[68px] md:pt-6">
      <SpaceSubpageHeader title={t("personal_name")} variant="banner" />
      {isLoading ? (
        <div className="flex justify-center py-16">
          <Spinner aria-label={t("loading")} />
        </div>
      ) : (
        <SpacePracticeSection tasks={tasks} presentation="personal-space" />
      )}
    </div>
  );
}

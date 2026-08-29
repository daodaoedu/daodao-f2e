"use client";

import { useMyPractices } from "@daodao/api";
import { useTranslations } from "@daodao/i18n";
import { Spinner } from "@daodao/ui/components/spinner";
import { useMemo } from "react";
import type { InProgressTask } from "@/components/dashboard";
import { SpacePracticeSection, SpaceSubpageHeader } from "@/components/spaces";
import { mapPracticeStatusToTaskStatus } from "@/constants/task-status";

/** 個人實踐子頁 (FRD 4): the viewer's own practices behind the space filter row. */
export default function PersonalSpacePage() {
  const t = useTranslations("space");
  const { data, isLoading } = useMyPractices({ limit: 100 });

  const tasks = useMemo<InProgressTask[]>(
    () =>
      (data?.data || []).map((practice) => ({
        id: practice.id,
        title: practice.title,
        description: practice.practiceAction || "",
        checkInCount: practice.checkInCount,
        progress: practice.progressPercentage ?? 0,
        messagesCount: 0,
        isUnreadMessages: false,
        theme: practice.themeColor || "#FCDD84",
        status: mapPracticeStatusToTaskStatus(practice.status),
        lastCheckInDate: practice.lastCheckinAt ?? null,
        startDate: practice.startDate || null,
        endDate: practice.endDate || null,
      })),
    [data]
  );

  return (
    <div className="mx-auto min-h-screen max-w-[640px] px-4 pb-[72px] pt-6">
      <SpaceSubpageHeader title={t("personal_name")} subtitle={t("personal_host")} />
      {isLoading ? (
        <div className="flex justify-center py-16">
          <Spinner aria-label={t("loading")} />
        </div>
      ) : (
        <SpacePracticeSection tasks={tasks} />
      )}
    </div>
  );
}

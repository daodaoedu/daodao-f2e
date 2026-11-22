"use client";

import { type ActivityDetailType, useActivityDetail } from "@daodao/api";
import { useTranslations } from "@daodao/i18n";
import { Link } from "@daodao/i18n/navigation";
import { Spinner } from "@daodao/ui/components/spinner";
import { ArrowLeft } from "lucide-react";
import { useParams } from "next/navigation";
import { ActivityDetailView } from "@/components/activity/activity-detail-view";

/**
 * 活動詳情頁：已加入與未加入者都看得到完整活動資訊；已加入僅改變 CTA（「已加入」→ /cohorts/{id}）。
 * 已結束活動仍可查看但不能加入。版面在 ActivityDetailView，場次設定預覽共用同一份。
 */
export default function ActivityDetailPage() {
  const t = useTranslations("explore_activities");
  const params = useParams<{ cohortId: string }>();
  const cohortId = params.cohortId ? Number(params.cohortId) : null;
  const { data, isLoading } = useActivityDetail(
    cohortId !== null && !Number.isNaN(cohortId) ? cohortId : null
  );

  const activity: ActivityDetailType | undefined = data?.data;

  if (isLoading) {
    return (
      <main className="mx-auto flex w-full max-w-[960px] flex-col px-4 pt-8 pb-18">
        <div className="flex justify-center py-16">
          <Spinner aria-label={t("loading")} />
        </div>
      </main>
    );
  }

  if (!activity) {
    return (
      <main className="mx-auto flex w-full max-w-[960px] flex-col gap-6 px-4 pt-8 pb-18">
        <Link
          href="/activities"
          className="flex items-center gap-1.5 text-sm text-text-dark/70 hover:text-text-dark"
        >
          <ArrowLeft className="size-4" />
          {t("detail_back")}
        </Link>
        <p className="py-10 text-center text-sm text-text-dark">{t("detail_not_found")}</p>
      </main>
    );
  }

  return <ActivityDetailView activity={activity} />;
}

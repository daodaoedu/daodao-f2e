"use client";

import { type ActivityDetailType, useActivityDetail } from "@daodao/api";
import { DefaultAvatarSvg } from "@daodao/assets";
import { useTranslations } from "@daodao/i18n";
import { Link } from "@daodao/i18n/navigation";
import { Badge } from "@daodao/ui/components/badge";
import { Button, buttonVariants } from "@daodao/ui/components/button";
import { Spinner } from "@daodao/ui/components/spinner";
import { cn } from "@daodao/ui/lib/utils";
import {
  ArrowLeft,
  AudioLines,
  Calendar,
  DollarSign,
  ExternalLink,
  MapPin,
  PencilRuler,
} from "lucide-react";
import { useParams } from "next/navigation";
import { cloneElement } from "react";
import { CohortSessionSchedule } from "@/components/cohort/cohort-session-schedule";
import { UserStar, UsersCollaboration } from "@/components/icons/lucide-extra";
import { type ActivityDetailCta, resolveActivityDetailCta } from "@/constants/activity-detail-cta";
import {
  formatActivityPeriod,
  resolveLocationDisplay,
  resolvePracticeDisplay,
} from "@/utils/activity-detail";

/** 互動方式 i18n key 對照 */
const MODE_LABEL: Record<string, string> = {
  sync: "detail_mode_sync",
  async: "detail_mode_async",
  physical: "detail_mode_physical",
};

/**
 * 活動詳情頁：已加入與未加入者都看得到完整活動資訊；已加入僅改變 CTA（「已加入」→ /cohorts/{id}）。
 * 已結束活動仍可查看但不能加入。
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

  const isEnded = activity.runStatus === "ended";
  const location = resolveLocationDisplay(activity.location, activity.isJoined);
  const practice = resolvePracticeDisplay(activity.templateCount);
  const hostIdentifier = activity.host.identifier ?? activity.host.userId;

  return (
    <main className="mx-auto flex w-full max-w-[960px] flex-col gap-[22px] px-4 pt-7 pb-18 min-[481px]:gap-6 min-[481px]:pt-8">
      {/* 返回連結 */}
      <Link
        href="/activities"
        className="flex items-center gap-1.5 text-sm text-text-dark/70 hover:text-text-dark"
      >
        <ArrowLeft className="size-4" />
        {t("detail_back")}
      </Link>

      {/* 狀態 + 標題 */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <Badge
            variant={
              activity.runStatus === "upcoming"
                ? "very-light-blue"
                : activity.runStatus === "ongoing"
                  ? "default"
                  : "outline-logo"
            }
            size="sm"
            className="border-0 px-2.5 py-[3px] text-xs leading-[18px]"
          >
            {t(`status_${activity.runStatus}`)}
          </Badge>
        </div>
        <h1 className="text-[22px] font-bold leading-[1.35] text-bg-dark min-[481px]:text-2xl">
          {activity.displayName}
        </h1>
        {activity.tagline && (
          <p className="text-sm leading-[1.65] text-text-dark">{activity.tagline}</p>
        )}
        {!activity.tagline && activity.description && (
          <p className="text-sm leading-[1.65] text-text-dark">{activity.description}</p>
        )}
      </div>

      {/* 已結束提示 */}
      {isEnded && (
        <div className="rounded-lg border border-[#DCEBEA] bg-[#F6FAFA] px-4 py-3 text-sm text-text-dark/70">
          {t("detail_ended_notice")}
        </div>
      )}

      <div className="grid grid-cols-1 items-start gap-6 md:grid-cols-[minmax(0,1.6fr)_minmax(260px,1fr)]">
        {/* 左欄：活動資訊 → CTA → 系列介紹 */}
        <div className="flex min-w-0 flex-col gap-6">
          <section
            aria-label={t("detail_info_label")}
            className="flex flex-col gap-5 rounded-[16px] border border-[#DCEBEA] bg-white p-[18px] min-[481px]:p-5"
          >
            {/* 互動方式 */}
            <DetailRow icon={<AudioLines />} label={t("detail_mode_label")}>
              <div className="flex flex-wrap gap-1.5">
                {activity.interactionModes.map((mode) => (
                  <Badge
                    key={mode}
                    variant="very-light-blue"
                    size="sm"
                    className="border-0 px-2 py-0.5 text-xs leading-[18px]"
                  >
                    {t(MODE_LABEL[mode] ?? mode)}
                  </Badge>
                ))}
              </div>
            </DetailRow>

            {/* 活動期間 */}
            <DetailRow
              icon={<Calendar />}
              label={t("detail_period_caption")}
              caption={t("detail_period_caption")}
            >
              <span className="text-sm text-bg-dark">
                {formatActivityPeriod(activity.startDate, activity.endDate)}
              </span>
            </DetailRow>

            {/* 聚會時段 */}
            {activity.sessions.length > 0 && (
              <DetailRow
                icon={<UsersCollaboration />}
                label={t("detail_sessions_label")}
                caption={t("detail_sessions_caption")}
              >
                <CohortSessionSchedule
                  className="[&_li]:text-bg-dark"
                  sessions={activity.sessions}
                  timezone={activity.timezone}
                  hideHeading
                />
              </DetailRow>
            )}

            {/* 地點：夾在聚會時段與費用之間 */}
            <DetailRow icon={<MapPin />} label={t("detail_location_label")}>
              <span className="text-sm text-bg-dark">
                {location.kind === "visible"
                  ? location.value
                  : location.kind === "locked"
                    ? t("detail_location_locked")
                    : t("detail_location_na")}
              </span>
            </DetailRow>

            {/* 費用 */}
            <DetailRow icon={<DollarSign />} label={t("detail_fee_label")}>
              <span className="text-sm text-bg-dark">
                {activity.feeType === "free"
                  ? t("detail_fee_free")
                  : t("detail_fee_paid", { amount: activity.feeAmount ?? 0 })}
              </span>
            </DetailRow>

            {/* 實踐 */}
            <DetailRow icon={<PencilRuler />} label={t("detail_practice_label")}>
              <span className="text-sm text-bg-dark">
                {practice.kind === "count"
                  ? t("detail_practice_count", { count: practice.count })
                  : t("detail_practice_na")}
              </span>
            </DetailRow>
          </section>

          {/* CTA 按鈕：isJoined → 已加入（前往 cohort 空間）；可報名 → 報名加入／外部報名；否則停用並顯示原因 */}
          <DetailCta cta={resolveActivityDetailCta(activity)} t={t} />

          {/* 系列介紹：無外框 */}
          <section aria-labelledby="program-about-title" className="flex flex-col gap-3">
            <h2 id="program-about-title" className="text-base font-bold text-bg-dark">
              {t("detail_program_about")}
            </h2>
            <p className="text-sm font-bold text-bg-dark">{activity.programName}</p>
            <p className="text-[13px] leading-[1.7] text-text-dark">
              {t("detail_program_description")}
            </p>
          </section>
        </div>

        {/* 右欄：發起人 → 組織介紹 */}
        <aside aria-label={t("detail_about_label")} className="flex min-w-0 flex-col gap-4">
          <section className="flex flex-col gap-3 rounded-[16px] border border-[#DCEBEA] bg-white p-[18px] min-[481px]:p-5">
            <h2 className="flex items-center gap-1.5 text-base font-bold text-bg-dark">
              <UserStar className="size-4" strokeWidth={1.6} aria-hidden="true" />
              {t("detail_host_label")}
            </h2>
            <HostIdentity host={activity.host} identifier={hostIdentifier} t={t} />
          </section>

          {/* 組織介紹：無「關於」標題與外框 */}
          <section className="flex flex-col gap-2" aria-label={t("detail_org_label")}>
            <p className="text-sm font-medium text-bg-dark">{activity.organization.name}</p>
            {activity.organization.bio && (
              <p className="text-sm leading-[1.6] text-text-dark/70">{activity.organization.bio}</p>
            )}
            {activity.organization.externalLink && (
              <a
                href={activity.organization.externalLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-sm text-logo-cyan hover:underline"
              >
                <ExternalLink className="size-3.5" />
                {activity.organization.externalLink}
              </a>
            )}
          </section>
        </aside>
      </div>
    </main>
  );
}

/** 發起人：有 identifier／userId 時可點進個人頁 */
function HostIdentity({
  host,
  identifier,
  t,
}: {
  host: ActivityDetailType["host"];
  identifier: string | number | null;
  t: ReturnType<typeof useTranslations<"explore_activities">>;
}) {
  const content = (
    <>
      {host.avatar ? (
        <img src={host.avatar} alt="" className="size-6 rounded-full object-cover" />
      ) : (
        <DefaultAvatarSvg className="size-6 rounded-full" />
      )}
      <span className="text-sm font-medium text-bg-dark">{host.name}</span>
    </>
  );
  if (identifier === null || identifier === "") {
    return <div className="flex items-center gap-2">{content}</div>;
  }
  return (
    <Link
      href={`/users/${identifier}`}
      aria-label={t("detail_host_profile", { name: host.name })}
      className="flex items-center gap-2 rounded-md hover:underline underline-offset-4"
    >
      {content}
    </Link>
  );
}

/** 資訊列：Lucide 圖示（label 僅供輔助技術）＋內容；caption 為小型低對比標籤 */
function DetailRow({
  icon,
  label,
  caption,
  children,
}: {
  icon: React.ReactElement<{ className?: string }>;
  label: string;
  caption?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-3">
      <span
        role="img"
        aria-label={label}
        className="flex min-h-[21px] w-[18px] shrink-0 items-center justify-center text-text-dark/60"
      >
        {cloneElement(icon, {
          className: "size-4",
          "aria-hidden": true,
          strokeWidth: 1.6,
        } as object)}
      </span>
      <div className="min-w-0 flex-1">
        {caption && (
          <span aria-hidden="true" className="mb-0.5 block text-[11px] leading-4 text-text-dark/45">
            {caption}
          </span>
        )}
        {children}
      </div>
    </div>
  );
}

/** 詳情頁 CTA；停用狀態以按鈕文字呈現不可加入的原因 */
function DetailCta({
  cta,
  t,
}: {
  cta: ActivityDetailCta;
  t: ReturnType<typeof useTranslations<"explore_activities">>;
}) {
  switch (cta.kind) {
    case "joined":
      return (
        <Link
          href={cta.href}
          className={cn(
            buttonVariants({ variant: "default" }),
            "w-full text-sm font-bold no-underline"
          )}
        >
          {t("cta_joined")}
        </Link>
      );
    case "external":
      return (
        <a
          href={cta.href}
          target="_blank"
          rel="noopener noreferrer"
          className={cn(
            buttonVariants({ variant: "default" }),
            "w-full text-sm font-bold no-underline"
          )}
        >
          {t("detail_external_signup")}
        </a>
      );
    case "join":
      return (
        <Link
          href={cta.href}
          className={cn(
            buttonVariants({ variant: "default" }),
            "w-full text-sm font-bold no-underline"
          )}
        >
          {t("detail_join")}
        </Link>
      );
    case "disabled":
      return (
        <Button variant="default" className="w-full" disabled>
          {t(cta.reasonKey)}
        </Button>
      );
    default:
      return null;
  }
}

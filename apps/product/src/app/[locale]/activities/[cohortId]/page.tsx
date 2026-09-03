"use client";

import { type ActivityDetailType, useActivityDetail } from "@daodao/api";
import { DefaultAvatarSvg } from "@daodao/assets";
import { useTranslations } from "@daodao/i18n";
import { Link } from "@daodao/i18n/navigation";
import { Badge } from "@daodao/ui/components/badge";
import { buttonVariants } from "@daodao/ui/components/button";
import { Spinner } from "@daodao/ui/components/spinner";
import { cn } from "@daodao/ui/lib/utils";
import { format, isValid, parseISO } from "date-fns";
import {
  ArrowLeft,
  Calendar,
  Clock,
  ExternalLink,
  MapPin,
  MonitorSmartphone,
  Users,
} from "lucide-react";
import { useParams } from "next/navigation";

/** 互動方式 i18n key 對照 */
const MODE_LABEL: Record<string, string> = {
  sync: "detail_mode_sync",
  async: "detail_mode_async",
  physical: "detail_mode_physical",
};

/** 格式化日期為 YYYY/MM/DD */
const formatDate = (dateStr: string): string => {
  const parsed = parseISO(dateStr);
  return isValid(parsed) ? format(parsed, "yyyy/MM/dd") : dateStr;
};

/** 格式化時間為 HH:mm */
const formatTime = (timeStr: string): string => {
  // timeStr might be ISO or HH:mm:ss format
  if (timeStr.includes("T")) {
    const parsed = parseISO(timeStr);
    return isValid(parsed) ? format(parsed, "HH:mm") : timeStr;
  }
  return timeStr.slice(0, 5);
};

/**
 * 活動詳情頁：顯示完整活動資訊，包含發起人、互動方式、聚會時段、費用、參與人數、組織資訊。
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
      <main className="mx-auto flex w-full max-w-[640px] flex-col px-4 pt-8 pb-18">
        <div className="flex justify-center py-16">
          <Spinner aria-label={t("loading")} />
        </div>
      </main>
    );
  }

  if (!activity) {
    return (
      <main className="mx-auto flex w-full max-w-[640px] flex-col gap-6 px-4 pt-8 pb-18">
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

  return (
    <main className="mx-auto flex w-full max-w-[640px] flex-col gap-6 px-4 pt-8 pb-18">
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
          >
            {t(`status_${activity.runStatus}`)}
          </Badge>
          {activity.isJoined && (
            <Badge variant="outline-logo" size="sm">
              {t("cta_joined")}
            </Badge>
          )}
        </div>
        <h1 className="text-2xl font-bold text-bg-dark">{activity.displayName}</h1>
        {activity.tagline && (
          <p className="text-sm text-text-dark">{activity.tagline}</p>
        )}
        {!activity.tagline && activity.description && (
          <p className="text-sm text-text-dark">{activity.description}</p>
        )}
      </div>

      {/* 已結束提示 */}
      {isEnded && (
        <div className="rounded-lg border border-[#DCEBEA] bg-[#F6FAFA] px-4 py-3 text-sm text-text-dark/70">
          {t("detail_ended_notice")}
        </div>
      )}

      {/* 詳情卡片 */}
      <div className="flex flex-col gap-5 rounded-[16px] border border-[#DCEBEA] bg-white p-5">
        {/* 發起人 */}
        <DetailRow icon={<Users className="size-4" />} label={t("detail_host_label")}>
          <div className="flex items-center gap-2">
            {activity.host.avatar ? (
              <img
                src={activity.host.avatar}
                alt={activity.host.name}
                className="size-6 rounded-full object-cover"
              />
            ) : (
              <DefaultAvatarSvg className="size-6 rounded-full" />
            )}
            <span className="text-sm text-bg-dark">{activity.host.name}</span>
          </div>
        </DetailRow>

        {/* 互動方式 */}
        <DetailRow icon={<MonitorSmartphone className="size-4" />} label={t("detail_mode_label")}>
          <div className="flex flex-wrap gap-1.5">
            {activity.interactionModes.map((mode) => (
              <Badge key={mode} variant="very-light-blue" size="sm">
                {t(MODE_LABEL[mode] ?? mode)}
              </Badge>
            ))}
          </div>
        </DetailRow>

        {/* 地點 */}
        {activity.location && (
          <DetailRow icon={<MapPin className="size-4" />} label={t("detail_location_label")}>
            <span className="text-sm text-bg-dark">{activity.location}</span>
          </DetailRow>
        )}

        {/* 聚會時段 */}
        {activity.sessions.length > 0 && (
          <DetailRow icon={<Calendar className="size-4" />} label={t("detail_sessions_label")}>
            <div className="flex flex-col gap-1.5">
              {activity.sessions.map((session) => (
                <div key={session.id} className="flex items-center gap-2 text-sm text-bg-dark">
                  <span>{t("detail_session_date", { date: formatDate(session.sessionDate) })}</span>
                  {session.startTime && session.endTime && (
                    <span className="text-text-dark/60">
                      {t("detail_session_time", {
                        start: formatTime(session.startTime),
                        end: formatTime(session.endTime),
                      })}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </DetailRow>
        )}

        {/* 費用 */}
        <DetailRow icon={<Clock className="size-4" />} label={t("detail_fee_label")}>
          <span className="text-sm text-bg-dark">
            {activity.feeType === "free"
              ? t("detail_fee_free")
              : t("detail_fee_paid", { amount: activity.feeAmount ?? 0 })}
          </span>
        </DetailRow>

        {/* 參與人數 */}
        <DetailRow icon={<Users className="size-4" />} label={t("detail_participants_label")}>
          <span className="text-sm text-bg-dark">
            {activity.capacity
              ? t("detail_participants_capacity", {
                  count: activity.participantCount,
                  capacity: activity.capacity,
                })
              : t("detail_participants_count", { count: activity.participantCount })}
          </span>
        </DetailRow>

        {/* 實踐模版 */}
        {activity.templateCount > 0 && (
          <DetailRow icon={<Calendar className="size-4" />} label={t("detail_templates_label")}>
            <span className="text-sm text-bg-dark">
              {t("detail_templates_count", { count: activity.templateCount })}
            </span>
          </DetailRow>
        )}
      </div>

      {/* 組織資訊 */}
      <div className="flex flex-col gap-3 rounded-[16px] border border-[#DCEBEA] bg-white p-5">
        <h2 className="text-base font-bold text-bg-dark">{t("detail_org_label")}</h2>
        <p className="text-sm font-medium text-bg-dark">{activity.organization.name}</p>
        {activity.organization.bio && (
          <p className="text-sm text-text-dark/70">{activity.organization.bio}</p>
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
      </div>

      {/* 邀請文案 */}
      {activity.inviteMessage && (
        <div className="flex flex-col gap-2 rounded-[16px] border border-[#DCEBEA] bg-white p-5">
          <h2 className="text-base font-bold text-bg-dark">{t("detail_invite_message")}</h2>
          <p className="text-sm whitespace-pre-line text-text-dark">{activity.inviteMessage}</p>
        </div>
      )}

      {/* CTA 按鈕 */}
      <div className="sticky bottom-4 z-20">
        {isEnded ? null : activity.isJoined ? (
          <Link
            href={`/cohorts/${activity.id}`}
            className={cn(buttonVariants({ variant: "default" }), "w-full")}
          >
            {t("detail_view_cohort")}
          </Link>
        ) : activity.canJoin ? (
          activity.signupMethod === "external" && activity.externalSignupUrl ? (
            <a
              href={activity.externalSignupUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(buttonVariants({ variant: "default" }), "w-full")}
            >
              {t("detail_external_signup")}
            </a>
          ) : activity.joinToken ? (
            <Link
              href={`/cohorts/join/${activity.joinToken}`}
              className={cn(buttonVariants({ variant: "default" }), "w-full")}
            >
              {t("detail_join")}
            </Link>
          ) : null
        ) : null}
      </div>
    </main>
  );
}

/** 詳情列：icon + label + 內容 */
function DetailRow({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center gap-1.5 text-xs text-text-dark/60">
        {icon}
        {label}
      </div>
      <div className="pl-5.5">{children}</div>
    </div>
  );
}

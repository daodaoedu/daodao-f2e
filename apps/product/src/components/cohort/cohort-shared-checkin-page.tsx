"use client";

import { useCohortMemberHome } from "@daodao/api";
import { useAuth } from "@daodao/auth";
import { useTranslations } from "@daodao/i18n";
import { Link } from "@daodao/i18n/navigation";
import { Button } from "@daodao/ui/components/button";
import { Spinner } from "@daodao/ui/components/spinner";
import { format } from "date-fns";
import { useMemo } from "react";
import { CheckInButton } from "@/components/check-in/form";
import { BackgroundAnimation, Banner } from "@/components/layout";
import { CohortErrorState } from "@/components/lighthouse/cohort-error-state";
import { mapPracticeStatusToTaskStatus } from "@/constants/task-status";
import { parseLocalDate } from "@/utils/practice-period";
import { isNotMemberError } from "./cohort-member-page";
import { CohortQueryScope } from "./cohort-query-scope";
import { resolveSharedCheckinTarget } from "./shared-checkin-target";

interface ICohortSharedCheckinPageProps {
  cohortId: number;
  templateId: number;
}

/**
 * 共用實踐打卡連結（daodao-f2e#1194）：同一條 cohort＋模板連結給全期成員，
 * 依登入者身分找出自己的實踐並開啟既有打卡表單。登入導回由 AuthProvider 的受保護路由處理。
 */
export function CohortSharedCheckinPage(props: ICohortSharedCheckinPageProps) {
  const { user } = useAuth();
  // CohortQueryScope 以使用者 id 為 key；在登入者載入前就掛載，會先以 guest 掛一次、取得使用者後再重掛一次，
  // 兩次掛載各自 autoOpen，疊出兩個打卡表單（dev 實測）。等登入者確定後才掛載，只開一次。
  // 未登入者由 AuthProvider 的受保護路由導去登入，不會停在這裡。
  if (!user)
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner className="size-6" />
      </div>
    );
  return (
    <CohortQueryScope>
      <CohortSharedCheckinContent {...props} />
    </CohortQueryScope>
  );
}

function CohortSharedCheckinContent({ cohortId, templateId }: ICohortSharedCheckinPageProps) {
  const t = useTranslations("cohort");
  const homeQuery = useCohortMemberHome(cohortId);
  const home = homeQuery.data?.data;
  const notMember = isNotMemberError(homeQuery.error);
  const target = useMemo(
    () => (home ? resolveSharedCheckinTarget(home.practices, templateId, new Date()) : null),
    [home, templateId]
  );

  const cohortHomeLink = (
    <Button asChild variant="outline" size="sm">
      <Link href={`/cohorts/${cohortId}`}>{t("shared_checkin_go_cohort")}</Link>
    </Button>
  );

  let body: React.ReactNode;
  if (homeQuery.isLoading || (home && home.cohortId !== cohortId)) {
    body = (
      <div className="flex items-center justify-center py-20">
        <Spinner className="size-6" />
      </div>
    );
  } else if (notMember) {
    body = <StateCard message={t("shared_checkin_not_member")} />;
  } else if (homeQuery.error || homeQuery.validationError || !target) {
    body = (
      <CohortErrorState
        message={t("load_failed")}
        retryLabel={t("retry")}
        onRetry={() => void homeQuery.mutate()}
      />
    );
  } else if (target.kind === "not_found") {
    body = <StateCard message={t("shared_checkin_not_found")} action={cohortHomeLink} />;
  } else if (target.kind === "ambiguous") {
    body = <StateCard message={t("shared_checkin_ambiguous")} action={cohortHomeLink} />;
  } else {
    const { practice } = target;
    const startDate = practice.startDate ? parseLocalDate(practice.startDate) : null;
    const messages = {
      unavailable: t("shared_checkin_unavailable"),
      not_started: t("shared_checkin_not_started", {
        date: startDate ? format(startDate, "yyyy/MM/dd") : "",
      }),
      ended: t("shared_checkin_ended"),
      ready: t("shared_checkin_ready"),
    } as const;
    body = (
      <StateCard
        title={practice.title}
        description={practice.practiceAction}
        message={messages[target.kind]}
        action={
          target.kind === "ready" ? (
            <div className="flex flex-wrap items-center gap-2">
              <CheckInButton
                autoOpen
                showIcon
                disableBeforeStartDate
                practiceId={practice.id}
                practiceStatus={mapPracticeStatusToTaskStatus(practice.status)}
                lastCheckInDate={practice.lastCheckinAt ?? null}
                startDate={practice.startDate ?? null}
                endDate={practice.endDate ?? null}
                taskTitle={practice.title}
                progressPercentage={practice.progressPercentage ?? 0}
                onComplete={() => void homeQuery.mutate()}
              />
              <Button asChild variant="ghost" size="sm">
                <Link href={`/practices/${practice.id}`}>{t("shared_checkin_view_practice")}</Link>
              </Button>
            </div>
          ) : target.kind === "unavailable" ? (
            cohortHomeLink
          ) : (
            <Button asChild variant="outline" size="sm">
              <Link href={`/practices/${practice.id}`}>{t("shared_checkin_view_practice")}</Link>
            </Button>
          )
        }
      />
    );
  }

  return (
    <div className="relative min-h-screen">
      <Banner />
      <BackgroundAnimation />
      <main className="relative z-[25] bg-very-light-gray pb-[72px]">
        <div className="mx-auto max-w-[640px] px-4 pt-4">
          <div className="mb-4">
            {home?.organization.name && (
              <p className="text-xs font-medium text-logo-cyan">{home.organization.name}</p>
            )}
            <h1 className="mt-1 text-lg font-bold text-text-dark">
              {home?.displayName ?? t("shared_checkin_title")}
            </h1>
          </div>
          {body}
        </div>
      </main>
    </div>
  );
}

function StateCard({
  title,
  description,
  message,
  action,
}: {
  title?: string;
  description?: string | null;
  message: string;
  action?: React.ReactNode;
}) {
  return (
    <section className="flex flex-col gap-3 rounded-xl bg-white p-4 shadow-sm">
      {title && <h2 className="text-base font-semibold text-text-dark break-words">{title}</h2>}
      {description && <p className="text-sm text-text-dark/60 break-words">{description}</p>}
      <p className="text-sm text-text-dark/80">{message}</p>
      {action && <div className="self-start">{action}</div>}
    </section>
  );
}

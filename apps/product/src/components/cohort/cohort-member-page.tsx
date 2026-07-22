"use client";

import {
  exitCohort,
  setCohortExportConsent,
  updatePractice,
  useCohortMemberHome,
  useLearnerCohortFeed,
} from "@daodao/api";
import type { IShowcaseCheckIn } from "@daodao/api";
import { useTranslations } from "@daodao/i18n";
import { useRouter } from "@daodao/i18n/navigation";
import { Badge } from "@daodao/ui/components/badge";
import { Button } from "@daodao/ui/components/button";
import { Checkbox } from "@daodao/ui/components/checkbox";
import { CustomLink } from "@daodao/ui/components/custom-link";
import { Empty, EmptyDescription } from "@daodao/ui/components/empty";
import { Label } from "@daodao/ui/components/label";
import { toast } from "@daodao/ui/components/sonner";
import { Spinner } from "@daodao/ui/components/spinner";
import { useDialog } from "@daodao/ui/hooks/use-dialog";
import { cn } from "@daodao/ui/lib/utils";
import { ArrowLeft, ChevronRight, LogOut, Play, Sprout } from "lucide-react";
import { useEffect, useState } from "react";
import { BackgroundAnimation, Banner } from "@/components/layout";
import { CohortErrorState } from "@/components/lighthouse/cohort-error-state";
import { CheckInShowcaseCard } from "@/components/showcase/CheckInShowcaseCard";

function isNotMemberError(error: unknown): boolean {
  if (typeof error !== "object" || error === null || !("error" in error)) return false;
  const inner = (error as { error: unknown }).error;
  return (
    typeof inner === "object" &&
    inner !== null &&
    "code" in inner &&
    (inner as { code: unknown }).code === "APP_ERROR"
  );
}

const statusBadgeVariant: Record<string, "default" | "secondary" | "outline-logo" | "gray"> = {
  active: "default",
  completed: "outline-logo",
  draft: "gray",
  not_started: "secondary",
  archived: "gray",
};

export function CohortMemberPage({ cohortId }: { cohortId: number }) {
  const t = useTranslations("cohort");
  const router = useRouter();
  const homeQuery = useCohortMemberHome(cohortId);
  const feedQuery = useLearnerCohortFeed(cohortId);
  const home = homeQuery.data?.data;
  const feed = feedQuery.data?.data;
  const notMember = isNotMemberError(homeQuery.error);
  const [tab, setTab] = useState<"practices" | "feed" | "settings">("practices");
  const [pendingConsent, setPendingConsent] = useState<boolean | null>(null);
  const { openWarningDialog } = useDialog();

  const consentValue = pendingConsent ?? home?.exportOptIn ?? false;
  const consentDirty = pendingConsent !== null && pendingConsent !== (home?.exportOptIn ?? false);

  useEffect(() => {
    if (notMember) router.replace("/mine");
  }, [notMember, router]);

  async function activate(id: string) {
    const response = await updatePractice(id, { status: "active", isDraft: false });
    if (response.error) {
      toast.error(t("activate_failed"));
      return;
    }
    await homeQuery.mutate();
    toast.success(t("practice_activated"));
  }

  async function setConsent(consent: boolean) {
    const response = await setCohortExportConsent(cohortId, consent);
    if (response.error) {
      toast.error(t("save_failed"));
      return;
    }
    await homeQuery.mutate();
  }

  async function exit() {
    const result = await openWarningDialog({
      title: t("exit_confirm_title"),
      message: t("exit_confirm"),
      buttons: [
        { label: t("exit_cancel"), value: "cancel", variant: "outline" },
        { label: t("exit_confirm_action"), value: "confirm", variant: "orange" },
      ],
    });
    if (result.value !== "confirm") return;
    const response = await exitCohort(cohortId);
    if (response.error) {
      toast.error(t("exit_failed"));
      return;
    }
    toast.success(t("exit_success"));
    router.push("/practices");
  }

  if (homeQuery.isLoading || notMember)
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner className="size-6" />
      </div>
    );
  if (homeQuery.error || homeQuery.validationError)
    return (
      <CohortErrorState
        message={t("load_failed")}
        retryLabel={t("retry")}
        onRetry={() => void homeQuery.mutate()}
      />
    );

  return (
    <div className="relative min-h-screen">
      <Banner />
      <BackgroundAnimation />

      <main className="relative z-[25] pb-[72px] bg-very-light-gray">
        <div className="max-w-[640px] px-4 mx-auto pt-4">
          {/* Back + Cohort header */}
          <button
            type="button"
            onClick={() => router.push("/mine")}
            className="flex items-center gap-1 text-sm text-text-dark/60 hover:text-text-dark transition-colors mb-3 cursor-pointer"
          >
            <ArrowLeft className="size-4" />
            {t("back_to_mine")}
          </button>
          <div className="mb-4">
            <p className="text-xs font-medium text-logo-cyan">{home?.organization.name}</p>
            <h1 className="mt-1 text-lg font-bold text-text-dark">
              {home?.displayName ?? t("cohort_home")}
            </h1>
          </div>

          {/* Tab switcher */}
          <div className="flex border-b border-[#E5E7EB] mb-4">
            <button
              type="button"
              onClick={() => setTab("practices")}
              className={cn(
                "flex-1 py-2 text-sm font-medium transition-all",
                tab === "practices"
                  ? "text-text-dark border-b-2 border-logo-cyan -mb-px"
                  : "text-text-dark/40"
              )}
            >
              {t("my_cohort_practices")}
            </button>
            <button
              type="button"
              onClick={() => setTab("feed")}
              className={cn(
                "flex-1 py-2 text-sm font-medium transition-all",
                tab === "feed"
                  ? "text-text-dark border-b-2 border-logo-cyan -mb-px"
                  : "text-text-dark/40"
              )}
            >
              {t("cohort_feed")}
            </button>
            <button
              type="button"
              onClick={() => setTab("settings")}
              className={cn(
                "flex-1 py-2 text-sm font-medium transition-all",
                tab === "settings"
                  ? "text-text-dark border-b-2 border-logo-cyan -mb-px"
                  : "text-text-dark/40"
              )}
            >
              {t("settings")}
            </button>
          </div>

          {/* Content */}
          {tab === "practices" && (
            <div className="flex flex-col gap-3">
              {!home?.practices.length && (
                <Empty className="rounded-xl bg-white shadow-sm">
                  <EmptyDescription>{t("no_practices")}</EmptyDescription>
                </Empty>
              )}
              {home?.practices.map((practice) => (
                <CustomLink
                  key={practice.id}
                  href={`/practices/${practice.id}`}
                  className="block rounded-xl bg-white p-4 shadow-sm transition-all hover:shadow-md hover:ring-2 hover:ring-logo-cyan"
                >
                  <div className="flex items-start gap-3">
                    <span
                      className={cn(
                        "grid size-10 shrink-0 place-items-center rounded-lg",
                        practice.status === "draft"
                          ? "bg-basic-100 text-basic-400"
                          : "bg-primary-palest text-logo-cyan"
                      )}
                    >
                      <Sprout className="size-5" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <Badge variant={statusBadgeVariant[practice.status] ?? "gray"} size="sm">
                        {t(`practice_status_${practice.status}`)}
                      </Badge>
                      <h2 className="mt-1.5 text-base font-medium text-text-dark line-clamp-2">
                        {practice.title}
                      </h2>
                      {practice.practiceAction && (
                        <p className="mt-1 text-xs text-text-dark/60 line-clamp-1">
                          {practice.practiceAction}
                        </p>
                      )}
                    </div>
                    {practice.status === "draft" ? (
                      <Button
                        size="sm"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          void activate(practice.id);
                        }}
                        className="shrink-0"
                      >
                        <Play className="size-3.5" />
                        {t("activate_practice")}
                      </Button>
                    ) : (
                      <ChevronRight className="size-5 shrink-0 text-light-gray mt-0.5" />
                    )}
                  </div>
                </CustomLink>
              ))}
            </div>
          )}
          {tab === "feed" && (
            <div className="flex flex-col gap-3">
              {!feed?.items.length && (
                <Empty className="rounded-xl bg-white shadow-sm">
                  <EmptyDescription>{t("feed_empty")}</EmptyDescription>
                </Empty>
              )}
              {feed?.items.map((item) => (
                <CheckInShowcaseCard
                  key={item.id}
                  id={item.id}
                  checkin_date={item.checkinDate}
                  mood={item.mood as IShowcaseCheckIn["mood"]}
                  note={item.note}
                  tags={item.tags}
                  image_urls={item.imageUrls}
                  created_at={item.createdAt}
                  practice={item.practice}
                  user={
                    item.user
                      ? {
                          id: item.user.id,
                          name: item.user.name,
                          photo_url: item.user.photoUrl,
                          custom_id: item.user.customId,
                        }
                      : undefined
                  }
                  comment_count={item.commentCount}
                  comment_preview={item.commentPreview.map((c) => ({
                    id: c.id,
                    content: c.content,
                    created_at: c.createdAt,
                    user: c.user
                      ? {
                          id: c.user.id,
                          name: c.user.name,
                          photo_url: c.user.photoUrl,
                          custom_id: c.user.customId,
                        }
                      : undefined,
                  }))}
                />
              ))}
            </div>
          )}
          {tab === "settings" && (
            <div className="flex flex-col gap-4">
              <div className="rounded-xl bg-white p-5 shadow-sm">
                <h3 className="text-sm font-semibold text-text-dark">{t("settings_privacy")}</h3>
                <p className="mt-1 text-xs text-text-dark/50 leading-relaxed">
                  {t("settings_privacy_desc")}
                </p>
                <div className="mt-4 flex items-start gap-3">
                  <Checkbox
                    id="export-consent"
                    checked={consentValue}
                    onCheckedChange={(checked) => setPendingConsent(checked === true)}
                    className="mt-0.5"
                  />
                  <Label
                    htmlFor="export-consent"
                    className="cursor-pointer text-sm text-text-dark leading-relaxed"
                  >
                    {t("export_consent")}
                  </Label>
                </div>
                {consentDirty && (
                  <div className="mt-4 flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => {
                        void setConsent(consentValue).then(() => setPendingConsent(null));
                      }}
                    >
                      {t("save")}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setPendingConsent(null)}
                    >
                      {t("exit_cancel")}
                    </Button>
                  </div>
                )}
              </div>
              <div className="rounded-xl bg-white p-5 shadow-sm">
                <h3 className="text-sm font-semibold text-text-dark">{t("settings_membership")}</h3>
                <p className="mt-1 text-xs text-text-dark/50 leading-relaxed">
                  {t("settings_membership_desc")}
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-4 text-text-dark/60"
                  onClick={exit}
                >
                  <LogOut className="size-4" />
                  {t("exit_and_keep_personal")}
                </Button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

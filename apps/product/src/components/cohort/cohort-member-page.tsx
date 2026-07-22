"use client";

import {
  createComment,
  exitCohort,
  setCohortExportConsent,
  updatePractice,
  upsertReaction,
  useCohortMemberHome,
  useLearnerCohortFeed,
} from "@daodao/api";
import { useTranslations } from "@daodao/i18n";
import { useRouter } from "@daodao/i18n/navigation";
import { Button } from "@daodao/ui/components/button";
import { toast } from "@daodao/ui/components/sonner";
import { Textarea } from "@daodao/ui/components/textarea";
import { Heart, LogOut, Play, Sprout } from "lucide-react";
import { useEffect, useState } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { CohortErrorState } from "@/components/lighthouse/cohort-error-state";

// A non-member hitting GET /api/v1/cohorts/{cohortId} gets a 404 whose body is the
// server error envelope with error.code === "APP_ERROR" (the only app-level failure
// this endpoint returns besides auth). swr-openapi throws that body, so the HTTP
// status isn't available — detect the envelope instead.
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

export function CohortMemberPage({ cohortId }: { cohortId: number }) {
  const t = useTranslations("cohort");
  const router = useRouter();
  const homeQuery = useCohortMemberHome(cohortId);
  const feedQuery = useLearnerCohortFeed(cohortId);
  const home = homeQuery.data?.data;
  const feed = feedQuery.data?.data;
  const [tab, setTab] = useState<"practices" | "feed">("practices");
  const notMember = isNotMemberError(homeQuery.error);
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
    if (!window.confirm(t("exit_confirm"))) return;
    const response = await exitCohort(cohortId);
    if (response.error) {
      toast.error(t("exit_failed"));
      return;
    }
    toast.success(t("exit_success"));
    router.push("/practices");
  }
  if (homeQuery.isLoading)
    return <p className="px-10 py-12 text-sm text-[#5A7B79]">{t("loading")}</p>;
  if (homeQuery.error) {
    const status = (homeQuery.error as { status?: number })?.status;
    if (status === 404 || status === 403) {
      router.replace("/mine");
      return null;
    }
    return (
      <CohortErrorState
        message={t("load_failed")}
        retryLabel={t("retry")}
        onRetry={() => void homeQuery.mutate()}
      />
    );
  }
  if (homeQuery.validationError)
    return (
      <CohortErrorState
        message={t("load_failed")}
        retryLabel={t("retry")}
        onRetry={() => void homeQuery.mutate()}
      />
    );
  return (
    <div className="mx-auto w-full max-w-5xl px-5 py-10 md:px-10">
      <PageHeader rightAction="close" rightActionTo="/" />
      <header>
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-[#0D7773]">
          {home?.organization.name}
        </p>
        <h1 className="mt-3 text-2xl font-semibold tracking-[-0.04em]">
          {home?.displayName ?? t("cohort_home")}
        </h1>
        <p className="mt-3 text-[#5A7B79]">{t("cohort_home_description")}</p>
      </header>
      <div className="mt-7 flex gap-2 rounded-full bg-[#E7FAF7] p-1.5">
        <button
          type="button"
          onClick={() => setTab("practices")}
          className={`flex-1 rounded-full px-4 py-2 text-sm font-semibold ${tab === "practices" ? "bg-[#0D3036] text-white" : "text-[#456B68]"}`}
        >
          {t("my_cohort_practices")}
        </button>
        <button
          type="button"
          onClick={() => setTab("feed")}
          className={`flex-1 rounded-full px-4 py-2 text-sm font-semibold ${tab === "feed" ? "bg-[#0D3036] text-white" : "text-[#456B68]"}`}
        >
          {t("cohort_feed")}
        </button>
      </div>
      {tab === "practices" ? (
        <section className="mt-5 grid gap-4">
          <div className="rounded-3xl border border-[#CDEBE8] bg-white p-5">
            <label className="flex items-center gap-3 text-sm">
              <input
                type="checkbox"
                checked={home?.exportOptIn ?? false}
                onChange={(event) => void setConsent(event.target.checked)}
                className="size-4 accent-[#0D7773]"
              />
              {t("export_consent")}
            </label>
          </div>
          {home?.practices.map((practice) => (
            <article
              key={practice.id}
              className="cursor-pointer rounded-3xl border border-[#CDEBE8] bg-white p-6 transition-colors hover:bg-[#F0FAF8]"
              onClick={() => router.push(`/practices/${practice.id}`)}
            >
              <div className="flex items-start gap-4">
                <span className="grid size-11 shrink-0 place-items-center rounded-full bg-[#E7FAF7] text-[#0D7773]">
                  <Sprout className="size-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <h2 className="text-lg font-semibold">{practice.title}</h2>
                  <p className="mt-2 text-sm text-[#5A7B79]">{practice.practiceAction}</p>
                  <p className="mt-2 text-xs text-[#78928F]">
                    {t(`practice_status_${practice.status}`)}
                  </p>
                </div>
                {practice.status === "draft" && (
                  <Button size="sm" onClick={(e) => { e.stopPropagation(); void activate(practice.id); }}>
                    <Play className="size-4" />
                    {t("activate_practice")}
                  </Button>
                )}
              </div>
            </article>
          ))}
          <Button variant="ghost" className="justify-self-start" onClick={exit}>
            <LogOut className="size-4" />
            {t("exit_and_keep_personal")}
          </Button>
        </section>
      ) : (
        <section className="mt-5 grid gap-4">
          {!feed?.items.length && (
            <p className="rounded-3xl border border-dashed border-[#B9DCD8] px-6 py-14 text-center text-sm text-[#5A7B79]">
              {t("feed_empty")}
            </p>
          )}
          {feed?.items.map((item) => (
            <LearnerFeedItem key={item.id} item={item} />
          ))}
        </section>
      )}
    </div>
  );
}

function LearnerFeedItem({
  item,
}: {
  item: {
    id: number;
    nickname: string | null;
    mood: string | null;
    note: string | null;
    checkinDate: string;
  };
}) {
  const t = useTranslations("cohort");
  const [comment, setComment] = useState("");
  async function react() {
    const response = await upsertReaction({
      targetType: "checkin",
      targetId: String(item.id),
      reactionType: "encourage",
    });
    response.error ? toast.error(t("save_failed")) : toast.success(t("reaction_sent"));
  }
  async function submit() {
    if (!comment.trim()) return;
    const response = await createComment({
      targetType: "checkin",
      targetId: String(item.id),
      content: comment.trim(),
      visibility: "public",
    });
    if (response.error) {
      toast.error(t("save_failed"));
      return;
    }
    setComment("");
    toast.success(t("comment_sent"));
  }
  return (
    <article className="rounded-3xl border border-[#CDEBE8] bg-white p-6">
      <div className="flex justify-between gap-4">
        <div>
          <h2 className="font-semibold">{item.nickname || t("learner")}</h2>
          <p className="mt-1 text-xs text-[#78928F]">
            {new Date(item.checkinDate).toLocaleDateString()}
          </p>
        </div>
        {item.mood && (
          <span className="rounded-full bg-[#FFF6E8] px-3 py-1 text-xs">{item.mood}</span>
        )}
      </div>
      <p className="mt-4 text-sm leading-6 text-[#456B68]">
        {item.note || t("checkin_without_note")}
      </p>
      <Button size="sm" variant="outline" className="mt-4" onClick={react}>
        <Heart className="size-4" />
        {t("encourage")}
      </Button>
      <div className="mt-4 flex gap-2">
        <Textarea
          value={comment}
          onChange={(event) => setComment(event.target.value)}
          placeholder={t("write_comment")}
          className="min-h-10"
        />
        <Button size="sm" onClick={submit}>
          {t("send")}
        </Button>
      </div>
    </article>
  );
}

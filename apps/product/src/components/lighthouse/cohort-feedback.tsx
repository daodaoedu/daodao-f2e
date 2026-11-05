"use client";

import {
  type CohortFeedbackFilterType,
  type CohortFeedbackType,
  getCohortFeedback,
  isApiError,
} from "@daodao/api";
import { useTranslations } from "@daodao/i18n";
import { Button } from "@daodao/ui/components/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@daodao/ui/components/select";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Info,
  MessageSquareText,
  Star,
  Users,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useServerErrorMessage } from "@/lib/server-error/use-server-error-message";

interface CohortFeedbackProps {
  programId: number;
  cohortId: number;
}

/** Completion identities and independently ordered answers are never joined in the UI. */
export function CohortFeedback({ programId, cohortId }: CohortFeedbackProps) {
  const t = useTranslations("lighthouse");
  const { errorMessage } = useServerErrorMessage();
  const [filter, setFilter] = useState<CohortFeedbackFilterType>("all");
  const [page, setPage] = useState(1);
  const [reload, setReload] = useState(0);
  const [data, setData] = useState<CohortFeedbackType | null>(null);
  const [error, setError] = useState<unknown>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    void reload;
    setLoading(true);
    setError(null);
    setData(null);
    getCohortFeedback(programId, cohortId, filter, page)
      .then((result) => {
        if (active) setData(result);
      })
      .catch((reason: unknown) => {
        if (active) setError(reason);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [programId, cohortId, filter, page, reload]);

  const forbidden = isApiError(error) && error.status === 403;
  const hasAnswers = data?.state === "available";
  const maxRatingCount = Math.max(1, ...(data?.ratingDistribution.map((item) => item.count) ?? []));

  return (
    <section
      aria-labelledby="cohort-feedback-title"
      className="overflow-hidden rounded-3xl border border-[#CDEBE8] bg-white"
      data-testid="cohort-feedback"
    >
      <div className="border-b border-[#E8F3F2] px-5 py-5 sm:px-6 sm:py-6">
        <h2
          id="cohort-feedback-title"
          className="text-xl font-semibold tracking-[-0.03em] text-[#0D3036]"
        >
          {t("feedback_title")}
        </h2>
        <p className="mt-1 text-sm leading-6 text-[#5A7B79]">{t("feedback_description")}</p>
      </div>
      <div className="space-y-5 p-5 sm:p-6">
        <p className="flex items-center gap-2 rounded-2xl border border-[#CDEBE8] bg-[#F2F8F7] px-4 py-3 text-sm text-[#456B68]">
          <Info className="size-4 shrink-0 text-[#0D7773]" aria-hidden="true" />
          {t("feedback_custom_soon")}
        </p>
        {loading && (
          <p aria-live="polite" className="text-sm text-[#5A7B79]">
            {t("loading")}
          </p>
        )}
        {Boolean(error) && (
          <div role="alert" className="space-y-3 text-sm text-[#5A7B79]">
            <p>{forbidden ? t("feedback_forbidden") : errorMessage(error, t("load_failed"))}</p>
            {!forbidden && (
              <Button variant="outline" onClick={() => setReload((value) => value + 1)}>
                {t("retry")}
              </Button>
            )}
          </div>
        )}
        {data && (
          <>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-[#E3EFED] bg-white p-4">
                <div className="flex items-center justify-between gap-2 text-xs font-medium text-[#78928F]">
                  <span>{t("feedback_eligible_count")}</span>
                  <Users className="size-4 text-[#0D7773]" aria-hidden="true" />
                </div>
                <p className="mt-3 text-2xl font-semibold tracking-[-0.04em] text-[#0D3036]">
                  {data.eligibleCount}
                </p>
              </div>
              <div className="rounded-2xl border border-[#E3EFED] bg-white p-4">
                <div className="flex items-center justify-between gap-2 text-xs font-medium text-[#78928F]">
                  <span>{t("feedback_filter_completed")}</span>
                  <Check className="size-4 text-[#0D7773]" aria-hidden="true" />
                </div>
                <p className="mt-3 text-2xl font-semibold tracking-[-0.04em] text-[#0D3036]">
                  {data.completedCount} / {data.eligibleCount}
                </p>
                <p className="mt-1 text-[11px] text-[#78928F]">
                  {t("feedback_completed_count", {
                    completed: data.completedCount,
                    total: data.eligibleCount,
                  })}
                </p>
              </div>
            </div>
            {data.state !== "available" && (
              <p
                aria-live="polite"
                className="rounded-2xl bg-[#F2F8F7] p-4 text-sm leading-6 text-[#456B68]"
              >
                {t(`feedback_state_${data.state}`)}
              </p>
            )}
            <div className="grid gap-5 xl:grid-cols-[0.82fr_1.18fr]">
              <section
                aria-labelledby="feedback-completion-title"
                className="overflow-hidden rounded-2xl border border-[#E3EFED]"
              >
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E8F3F2] px-4 py-4 sm:px-5">
                  <h3 id="feedback-completion-title" className="font-semibold text-[#0D3036]">
                    {t("feedback_progress")}
                  </h3>
                  <div className="flex flex-wrap items-center justify-end gap-2">
                    <span className="rounded-full bg-[#EAF7F5] px-3 py-1 text-xs font-semibold text-[#0D7773]">
                      {data.completedCount} / {data.eligibleCount}
                    </span>
                    <Select
                      value={filter}
                      onValueChange={(value) => {
                        if (value === "all" || value === "completed" || value === "pending") {
                          setFilter(value);
                          setPage(1);
                        }
                      }}
                    >
                      <SelectTrigger
                        aria-label={t("feedback_filter_label")}
                        className="h-9 w-[138px] border-[#DCEAE8] text-xs"
                      >
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">{t("feedback_filter_all")}</SelectItem>
                        <SelectItem value="completed">{t("feedback_filter_completed")}</SelectItem>
                        <SelectItem value="pending">{t("feedback_filter_pending")}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <ul className="divide-y divide-[#EEF5F4]">
                  {data.participants.map((participant) => (
                    <li
                      key={participant.userId}
                      className="flex items-center justify-between gap-3 px-4 py-3 text-sm sm:px-5"
                    >
                      <span className="min-w-0 break-words font-medium text-[#345E5B]">
                        {participant.name}
                      </span>
                      <span
                        className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-medium ${participant.completed ? "bg-[#EAF7F0] text-[#28744E]" : "bg-[#F3F5F5] text-[#6D8583]"}`}
                      >
                        {t(
                          participant.completed
                            ? "feedback_filter_completed"
                            : "feedback_filter_pending"
                        )}
                      </span>
                    </li>
                  ))}
                </ul>
                {data.participants.length === 0 && (
                  <p className="px-4 py-4 text-sm text-[#78928F]">
                    {t("feedback_no_participants")}
                  </p>
                )}
                <div className="flex flex-wrap items-center justify-between gap-2 border-t border-[#EEF5F4] px-4 py-3 sm:px-5">
                  <p className="text-xs text-[#78928F]">
                    {t("feedback_page", {
                      page: data.pagination.page,
                      totalPages: Math.max(1, data.pagination.totalPages),
                      total: data.pagination.total,
                    })}
                  </p>
                  <div className="flex gap-1">
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      aria-label={t("feedback_previous")}
                      disabled={page <= 1}
                      onClick={() => setPage((value) => value - 1)}
                      className="size-8 border-[#DCEAE8]"
                    >
                      <ChevronLeft className="size-4" aria-hidden="true" />
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      aria-label={t("feedback_next")}
                      disabled={page >= data.pagination.totalPages}
                      onClick={() => setPage((value) => value + 1)}
                      className="size-8 border-[#DCEAE8]"
                    >
                      <ChevronRight className="size-4" aria-hidden="true" />
                    </Button>
                  </div>
                </div>
              </section>
              {hasAnswers && (
                <div className="space-y-5">
                  <section
                    aria-labelledby="feedback-rating-title"
                    className="rounded-2xl border border-[#E3EFED] p-4 sm:p-5"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <Star
                          className="size-4 shrink-0 fill-[#E3AC45] text-[#E3AC45]"
                          aria-hidden="true"
                        />
                        <h3 id="feedback-rating-title" className="font-semibold text-[#0D3036]">
                          {t("feedback_rating_title")}
                        </h3>
                      </div>
                      <span className="shrink-0 rounded-full bg-[#F2F8F7] px-2.5 py-1 text-[11px] font-medium text-[#456B68]">
                        {t("feedback_anonymous_summary")}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-[#78928F]">
                      {t("feedback_response_count", { count: data.totalResponses })}
                    </p>
                    <div className="mt-4 space-y-3">
                      {data.ratingDistribution.map((rating) => (
                        <div
                          key={rating.rating}
                          className="grid grid-cols-[minmax(90px,auto)_1fr_28px] items-center gap-3 text-xs"
                        >
                          <span className="sr-only">
                            {t("feedback_rating_count", {
                              rating: rating.rating,
                              count: rating.count,
                            })}
                          </span>
                          <span
                            aria-hidden="true"
                            className="flex items-center gap-1.5 text-[#456B68]"
                          >
                            <span className="inline-flex min-w-9 items-center font-semibold">
                              {rating.rating}
                              <Star
                                className="ml-0.5 size-3 fill-[#E3AC45] text-[#E3AC45]"
                                aria-hidden="true"
                              />
                            </span>
                            <span className="truncate text-[#78928F]">
                              {t(`feedback_star_${rating.rating}`)}
                            </span>
                          </span>
                          <div
                            className="h-2 overflow-hidden rounded-full bg-[#EDF4F3]"
                            aria-hidden="true"
                          >
                            <div
                              className="h-full rounded-full bg-[#16B9B3] transition-[width]"
                              style={{ width: `${(rating.count / maxRatingCount) * 100}%` }}
                            />
                          </div>
                          <span
                            aria-hidden="true"
                            className="text-right font-semibold tabular-nums text-[#345E5B]"
                          >
                            {rating.count}
                          </span>
                        </div>
                      ))}
                    </div>
                  </section>
                  <section aria-labelledby="feedback-comments-title" className="space-y-3">
                    <div className="flex items-center gap-2 px-1">
                      <MessageSquareText className="size-4 text-[#0D7773]" aria-hidden="true" />
                      <h3 id="feedback-comments-title" className="font-semibold text-[#0D3036]">
                        {t("feedback_text_title")}
                      </h3>
                    </div>
                    {data.textQuestions.map((question) => (
                      <section
                        key={question.questionId}
                        className="rounded-2xl border border-[#E3EFED] p-4 sm:p-5"
                      >
                        <h4 className="text-sm font-semibold leading-5 text-[#345E5B]">
                          {question.title}
                        </h4>
                        <div className="mt-3 space-y-2">
                          {question.answers.map((answer, index) => (
                            <blockquote
                              key={`${index}-${answer}`}
                              className="whitespace-pre-wrap break-words rounded-xl bg-[#F7FCFB] px-3.5 py-3 text-sm leading-6 text-[#456B68]"
                            >
                              {answer}
                            </blockquote>
                          ))}
                        </div>
                        {question.answers.length === 0 && (
                          <p className="mt-3 text-sm text-[#78928F]">{t("feedback_no_text")}</p>
                        )}
                      </section>
                    ))}
                  </section>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </section>
  );
}

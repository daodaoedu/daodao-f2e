"use client";

import { isApiError } from "@daodao/api";
import { useTranslations } from "@daodao/i18n";
import { useRouter } from "@daodao/i18n/navigation";
import { Button } from "@daodao/ui/components/button";
import { RadioGroup, RadioGroupItem } from "@daodao/ui/components/radio-group";
import { Textarea } from "@daodao/ui/components/textarea";
import { cn } from "@daodao/ui/lib/utils";
import { Check, Loader2, Star } from "lucide-react";
import { useRef, useState } from "react";
import { useServerErrorMessage } from "@/lib/server-error/use-server-error-message";
import type { SubmitResponseInput } from "../../schema";
import type { SurveyWithQuestions } from "../../types";

interface CohortFeedbackFormProps {
  survey: SurveyWithQuestions;
  submitResponse: (payload: SubmitResponseInput) => Promise<unknown>;
}

/** Feedback answers stay in memory; no session tracking, timestamps, or browser persistence. */
export function CohortFeedbackForm({ survey, submitResponse }: CohortFeedbackFormProps) {
  const t = useTranslations("lighthouse");
  const router = useRouter();
  const { errorMessage } = useServerErrorMessage();
  const [rating, setRating] = useState<number | null>(null);
  const [texts, setTexts] = useState<Record<string, string>>({});
  const [requiredError, setRequiredError] = useState(false);
  const [submitError, setSubmitError] = useState<unknown>(null);
  const [submitting, setSubmitting] = useState(false);
  const [completed, setCompleted] = useState(false);
  const firstQuestion = useRef<HTMLFieldSetElement>(null);
  const feedback = survey.cohortFeedback;

  async function handleSubmit() {
    if (submitting || !feedback || feedback.state !== "ready") return;
    if (rating === null) {
      setRequiredError(true);
      firstQuestion.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      firstQuestion.current?.querySelector<HTMLButtonElement>("[role=radio]")?.focus();
      return;
    }
    setSubmitting(true);
    setSubmitError(null);
    try {
      await submitResponse({
        externalId: survey.shareId,
        answers: survey.questions.map((question, index) => ({
          questionId: question.id,
          value: index === 0 ? rating : texts[question.id] || null,
        })),
      });
      setCompleted(true);
      setTexts({});
    } catch (error) {
      if (isApiError(error) && error.status === 409) {
        setCompleted(true);
        setTexts({});
      } else {
        setSubmitError(error);
      }
    } finally {
      setSubmitting(false);
    }
  }

  if (completed || feedback?.state === "completed")
    return (
      <main className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6 sm:py-12">
        <section className="rounded-3xl border border-[#CDEBE8] bg-white p-8 text-center sm:p-12">
          <div className="mx-auto grid size-12 place-items-center rounded-full bg-[#EAF7F5] text-[#0D7773]">
            <Check className="size-6" aria-hidden="true" />
          </div>
          <h1 className="mt-4 text-xl font-semibold text-[#0D3036]">
            {t("feedback_survey_completed")}
          </h1>
          <Button type="button" variant="outline" className="mt-6" onClick={() => router.push("/")}>
            {t("feedback_survey_home")}
          </Button>
        </section>
      </main>
    );

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-6 sm:px-6 sm:py-10">
      <section className="overflow-hidden rounded-3xl border border-[#CDEBE8] bg-white shadow-sm">
        <header className="border-b border-[#E8F3F2] px-5 py-5 sm:px-8 sm:py-7">
          <p className="text-xs font-medium tracking-wide text-[#78928F]">
            {t("feedback_survey_brand")}
          </p>
          <h1 className="mt-4 text-2xl font-semibold tracking-[-0.04em] text-[#0D3036]">
            {survey.title}
          </h1>
          <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-[#5A7B79]">
            {survey.description}
          </p>
        </header>
        <form
          className="space-y-6 p-5 sm:p-8"
          onSubmit={(event) => {
            event.preventDefault();
            void handleSubmit();
          }}
        >
          <div className="rounded-2xl border border-[#F1D7A8] bg-[#FFF9ED] p-4 text-sm leading-6 text-[#76551D]">
            <span className="font-semibold">{t("feedback_survey_privacy_title")}</span>
            {feedback?.privacyNotice}
          </div>
          {feedback?.state === "login_required" && (
            <div className="space-y-4">
              <p>{t("feedback_survey_login")}</p>
              <Button
                type="button"
                onClick={() =>
                  router.push(
                    `/auth/login?redirect=${encodeURIComponent(`/survey/r/${survey.shareId}`)}`
                  )
                }
              >
                {t("feedback_survey_login_action")}
              </Button>
            </div>
          )}
          {feedback?.state === "ineligible" && (
            <div className="space-y-4">
              <p role="alert">{t("feedback_survey_ineligible")}</p>
              <Button type="button" variant="outline" onClick={() => router.push("/")}>
                {t("feedback_survey_home")}
              </Button>
            </div>
          )}
          {feedback?.state === "ready" && (
            <>
              {survey.questions.map((question, index) =>
                index === 0 ? (
                  <fieldset
                    key={question.id}
                    ref={firstQuestion}
                    className={cn(
                      "rounded-2xl border p-4 sm:p-5",
                      requiredError ? "border-[#B74C42]" : "border-[#E3EFED]"
                    )}
                  >
                    <legend
                      id={`question-${question.id}`}
                      className="px-1 text-sm font-semibold text-[#0D3036]"
                    >
                      {question.questionText}{" "}
                      <span className="text-[#B74C42]" aria-hidden="true">
                        *
                      </span>
                      <span className="sr-only">{t("feedback_survey_required")}</span>
                    </legend>
                    <RadioGroup
                      value={rating === null ? "" : String(rating)}
                      onValueChange={(value) => {
                        setRating(Number(value));
                        setRequiredError(false);
                      }}
                      aria-labelledby={`question-${question.id}`}
                      aria-required="true"
                      aria-invalid={requiredError}
                      aria-describedby={requiredError ? "feedback-rating-error" : undefined}
                      className="mt-3 flex flex-wrap gap-2"
                    >
                      {[1, 2, 3, 4, 5].map((value) => (
                        <label
                          htmlFor={`feedback-star-${value}`}
                          key={value}
                          className={cn(
                            "relative inline-flex min-w-20 cursor-pointer flex-col items-center justify-center gap-1 whitespace-nowrap rounded-full border px-3 py-2 body-md transition-[color,background-color,box-shadow] has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-[#0D7773] has-[:focus-visible]:ring-offset-2 hover:bg-logo-cyan hover:text-white",
                            rating === value
                              ? "border-[#0D7773] bg-[#EAF7F5] text-[#0D5B59]"
                              : "border-[#DCEAE8] text-[#456B68]"
                          )}
                        >
                          <RadioGroupItem
                            id={`feedback-star-${value}`}
                            value={String(value)}
                            aria-label={t(`feedback_star_${value}`)}
                            className="sr-only"
                          />
                          <span className="flex items-center" aria-hidden="true">
                            {[1, 2, 3, 4, 5]
                              .filter((star) => star <= value)
                              .map((star) => (
                                <Star
                                  key={star}
                                  className="size-3.5 fill-[#E3AC45] text-[#E3AC45]"
                                />
                              ))}
                          </span>
                          <span className="text-[11px]">{t(`feedback_star_${value}`)}</span>
                        </label>
                      ))}
                    </RadioGroup>
                    {requiredError && (
                      <p
                        id="feedback-rating-error"
                        role="alert"
                        className="mt-3 text-sm text-[#B74C42]"
                      >
                        {t("feedback_survey_rating_required")}
                      </p>
                    )}
                  </fieldset>
                ) : (
                  <div key={question.id} className="space-y-2">
                    <label
                      htmlFor={`feedback-text-${question.id}`}
                      className="text-sm font-semibold text-[#0D3036]"
                    >
                      {question.questionText}{" "}
                      <span className="font-normal text-[#78928F]">
                        {t("feedback_survey_optional")}
                      </span>
                    </label>
                    <Textarea
                      id={`feedback-text-${question.id}`}
                      aria-describedby={`hint-${question.id}`}
                      value={texts[question.id] ?? ""}
                      onChange={(event) =>
                        setTexts((current) => ({ ...current, [question.id]: event.target.value }))
                      }
                      rows={3}
                      placeholder={t("feedback_survey_placeholder")}
                      className="resize-y border-[#DCEAE8]"
                    />
                    <p id={`hint-${question.id}`} className="text-xs leading-5 text-[#78928F]">
                      {t(`feedback_hint_${index + 1}`)}
                    </p>
                  </div>
                )
              )}
              {Boolean(submitError) && (
                <p role="alert" className="text-sm text-destructive">
                  {errorMessage(submitError, t("feedback_survey_submit_failed"))}
                </p>
              )}
              <div className="flex flex-wrap items-center gap-3 border-t border-[#E8F3F2] pt-5">
                <Button
                  type="submit"
                  disabled={submitting}
                  className="bg-[#0D7773] text-white hover:bg-[#0B6663]"
                >
                  {submitting && (
                    <Loader2 className="mr-2 size-4 animate-spin" aria-hidden="true" />
                  )}
                  {t(submitting ? "feedback_survey_submitting" : "feedback_survey_submit")}
                </Button>
              </div>
            </>
          )}
        </form>
      </section>
    </main>
  );
}

"use client";

import { isApiError } from "@daodao/api";
import { useRouter } from "@daodao/i18n/navigation";
import { Button } from "@daodao/ui/components/button";
import { Check, Loader2 } from "lucide-react";
import { useRef, useState } from "react";
import { managedAnswerError } from "../../lib/managed-answer";
import type { SubmitResponseInput } from "../../schema";
import type { Answer, SurveyWithQuestions } from "../../types";
import { ManagedQuestion } from "./ManagedQuestion";

interface Props {
  survey: SurveyWithQuestions;
  submitResponse: (payload: SubmitResponseInput) => Promise<unknown>;
}

/** Keep managed responses in memory and omit tracking identifiers from submissions. */
export function ManagedSurveyForm({ survey, submitResponse }: Props) {
  const router = useRouter();
  const [answers, setAnswers] = useState<Record<string, Answer["value"]>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [loginRequired, setLoginRequired] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const busy = useRef(false);
  const formRef = useRef<HTMLFormElement>(null);
  const questions = [...survey.questions].sort((a, b) => a.order - b.order);

  async function submit() {
    if (busy.current) return;
    const nextErrors: Record<string, string> = {};
    for (const question of questions) {
      const error = managedAnswerError(question, answers[question.id]);
      if (error) nextErrors[question.id] = error;
    }
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) {
      requestAnimationFrame(() => {
        const first = formRef.current?.querySelector<HTMLElement>("[aria-invalid=true]");
        first?.scrollIntoView({ behavior: "smooth", block: "center" });
        if (first?.matches("input, textarea, button")) first.focus();
        else first?.querySelector<HTMLElement>("input, textarea, button")?.focus();
      });
      return;
    }
    busy.current = true;
    setSubmitting(true);
    setSubmitError(null);
    setLoginRequired(false);
    try {
      await submitResponse({
        externalId: survey.shareId,
        answers: questions.map((question) => ({
          questionId: question.id,
          value: answers[question.id] ?? null,
        })),
      });
      setSubmitted(true);
      setAnswers({});
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : "送出失敗，請稍後再試。你的回答仍保留在此頁。"
      );
      setLoginRequired(isApiError(error) && error.status === 401);
    } finally {
      busy.current = false;
      setSubmitting(false);
    }
  }

  const completed = submitted || survey.hasResponded;
  return (
    <main className="min-h-screen bg-background px-4 py-8 text-foreground sm:py-12">
      <div className="mx-auto w-full max-w-2xl">
        <article className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
          {survey.coverUrl && (
            <div className="aspect-[10/3] w-full overflow-hidden">
              {/* Survey media URLs are provided by the saved survey metadata. */}
              <img src={survey.coverUrl} alt="問卷橫幅" className="h-full w-full object-cover" />
            </div>
          )}
          <div className="p-5 sm:p-8">
            <header className="space-y-3 border-b border-border pb-6">
              {survey.logoUrl && (
                <img
                  src={survey.logoUrl}
                  alt="問卷 Logo"
                  className="mb-7 max-h-14 max-w-full object-contain object-left sm:max-w-60"
                />
              )}
              <h1 className="break-words text-2xl font-semibold tracking-tight">{survey.title}</h1>
              {survey.description.trim() && (
                <p className="whitespace-pre-wrap break-words text-sm text-muted-foreground">
                  {survey.description}
                </p>
              )}
              {survey.isPublic === false && (
                <p className="text-xs text-muted-foreground">
                  參與者限定 ·{" "}
                  {survey.config.isAnonymous ? "匿名回應，答案不連結會員身分" : "以會員身分回應"}
                </p>
              )}
            </header>
            {completed ? (
              <output className="flex flex-col items-center gap-4 py-10 text-center">
                <div
                  className="flex size-14 items-center justify-center rounded-full bg-primary/10 text-primary motion-safe:animate-in motion-safe:zoom-in"
                  aria-label="回應已送出"
                  role="img"
                >
                  <Check className="size-7" aria-hidden="true" />
                </div>
                {survey.hasResponded && !submitted ? (
                  <p>你已完成這份問卷。</p>
                ) : (
                  survey.config.successMessage.trim() && (
                    <p className="whitespace-pre-wrap break-words text-sm">
                      {survey.config.successMessage}
                    </p>
                  )
                )}
                <Button type="button" variant="outline" onClick={() => router.push("/")}>
                  回到首頁
                </Button>
              </output>
            ) : (
              <form
                ref={formRef}
                noValidate
                onSubmit={(event) => {
                  event.preventDefault();
                  void submit();
                }}
                className="space-y-7 pt-6"
              >
                <fieldset disabled={submitting} className="min-w-0 space-y-7 disabled:opacity-70">
                  {questions.map((question) => (
                    <ManagedQuestion
                      key={question.id}
                      question={question}
                      value={answers[question.id]}
                      error={errors[question.id]}
                      onChange={(value) => {
                        setAnswers((current) => ({ ...current, [question.id]: value }));
                        setErrors((current) => {
                          const next = { ...current };
                          delete next[question.id];
                          return next;
                        });
                      }}
                    />
                  ))}
                </fieldset>
                {submitError && (
                  <div
                    role="alert"
                    className="space-y-3 rounded-md border border-destructive/30 p-3 text-sm text-destructive dark:border-red-400/50 dark:text-red-400"
                  >
                    <p>{submitError}</p>
                    {loginRequired && (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() =>
                          router.push(
                            `/auth/login?redirect=${encodeURIComponent(`/survey/r/${survey.shareId}`)}`
                          )
                        }
                      >
                        登入後繼續
                      </Button>
                    )}
                  </div>
                )}
                <Button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-[#0D7773] text-white hover:bg-[#0A605D] sm:w-auto"
                >
                  {submitting && (
                    <Loader2 className="mr-2 size-4 animate-spin" aria-hidden="true" />
                  )}
                  {submitting ? "送出中…" : "送出回應"}
                </Button>
              </form>
            )}
          </div>
        </article>
      </div>
    </main>
  );
}

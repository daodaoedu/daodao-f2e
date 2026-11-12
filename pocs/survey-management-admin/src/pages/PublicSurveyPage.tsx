import { Check, Star } from "lucide-react";
import { type FormEvent, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getPreviewSurveyByExternalId, recordPreviewSurveyResponse } from "@/api/admin-survey";
import type { AdminSurveyDetail } from "@/api/types";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { USE_PREVIEW_MOCK } from "@/config";
import { getSurveyBrandDefaults } from "@/lib/survey-brand-defaults";

type Answer = string | string[];

export function PublicSurveyPage() {
  const { externalId = "" } = useParams();
  const survey = useMemo(
    () => (USE_PREVIEW_MOCK ? getPreviewSurveyByExternalId(externalId) : null),
    [externalId]
  );
  const brandDefaults = useMemo(() => getSurveyBrandDefaults(), []);
  // Backward compatibility for preview surveys created before defaults were
  // saved as per-survey snapshots. Changing a default first freezes these records.
  const logoUrl =
    survey?.use_default_logo && !survey.logo_url ? brandDefaults.logo : survey?.logo_url;
  const bannerUrl =
    survey?.use_default_banner && !survey.cover_url ? brandDefaults.banner : survey?.cover_url;
  const [answers, setAnswers] = useState<Record<number, Answer>>({});
  const [errors, setErrors] = useState<number[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const setAnswer = (questionId: number, answer: Answer) => {
    setAnswers((current) => ({ ...current, [questionId]: answer }));
    setErrors((current) => current.filter((id) => id !== questionId));
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!survey || isSubmitting) return;
    const missing = survey.questions
      .filter((question) => question.is_required)
      .filter((question) => {
        const answer = answers[question.id];
        return Array.isArray(answer) ? answer.length === 0 : !answer?.trim();
      })
      .map((question) => question.id);
    setErrors(missing);
    if (missing.length === 0) {
      setSubmitError("");
      setIsSubmitting(true);
      try {
        if (USE_PREVIEW_MOCK) await recordPreviewSurveyResponse(externalId, answers);
        setSubmitted(true);
      } catch (error) {
        setSubmitError(error instanceof Error ? error.message : "送出失敗，請重試。");
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  if (!USE_PREVIEW_MOCK) {
    return <UnavailablePage message="請從正式問卷連結開啟此問卷。" />;
  }
  if (!survey) return <UnavailablePage message="找不到這份問卷，連結可能已失效。" />;
  if (survey.status !== "active" || survey.audience === "members") {
    return <UnavailablePage message="此問卷目前未開放公開回應。" />;
  }
  if (survey.max_responses !== null && survey.response_count >= survey.max_responses) {
    return <UnavailablePage message="此問卷已達最大回應數，暫不接受回應。" />;
  }

  return (
    <main className="min-h-screen bg-background px-4 py-8 sm:py-12">
      <div className="mx-auto w-full max-w-2xl">
        <article className="rounded-xl border border-border bg-card p-5 shadow-sm sm:p-8">
          {bannerUrl && (
            <div className="-mx-5 -mt-5 mb-5 h-24 overflow-hidden rounded-t-xl sm:-mx-8 sm:-mt-8 sm:h-32">
              <img src={bannerUrl} alt="問卷橫幅" className="h-full w-full object-cover" />
            </div>
          )}
          <header className="space-y-3 border-b border-border pb-6">
            {logoUrl && (
              <img
                src={logoUrl}
                alt="問卷 Logo"
                className="mb-7 max-h-10 max-w-40 object-contain object-left"
              />
            )}
            <h1 className="text-2xl font-semibold tracking-tight">{survey.title}</h1>
            {survey.description?.trim() && (
              <p className="whitespace-pre-wrap text-sm text-muted-foreground">
                {survey.description}
              </p>
            )}
          </header>

          {submitted ? (
            <div className="flex flex-col items-center gap-4 py-10 text-center">
              <div
                aria-label="回應已送出"
                role="img"
                className="survey-success-pop flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary"
              >
                <Check className="h-7 w-7" strokeWidth={2.5} />
              </div>
              {survey.thank_you_message?.trim() &&
                survey.thank_you_message.trim() !== "感謝你的回應。" && (
                  <p className="whitespace-pre-wrap text-sm text-muted-foreground">
                    {survey.thank_you_message}
                  </p>
                )}
            </div>
          ) : (
            <form onSubmit={submit} className="space-y-6 pt-6">
              {submitError && (
                <p role="alert" className="text-sm text-destructive">
                  {submitError}
                </p>
              )}
              {survey.questions
                .slice()
                .sort((a, b) => a.position - b.position)
                .map((question) => (
                  <PublicQuestion
                    key={question.id}
                    question={question}
                    answer={answers[question.id]}
                    hasError={errors.includes(question.id)}
                    onChange={(answer) => setAnswer(question.id, answer)}
                  />
                ))}
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "送出中…" : "送出回應"}
              </Button>
            </form>
          )}
        </article>
      </div>
    </main>
  );
}

function PublicQuestion({
  question,
  answer,
  hasError,
  onChange,
}: {
  question: AdminSurveyDetail["questions"][number];
  answer: Answer | undefined;
  hasError: boolean;
  onChange: (answer: Answer) => void;
}) {
  const options = question.options.slice().sort((a, b) => a.position - b.position);
  const selectedOptions = Array.isArray(answer) ? answer : [];
  const toggleRankingChoice = (choice: string) => {
    const current = Array.isArray(answer) ? answer : [];
    onChange(
      current.includes(choice) ? current.filter((item) => item !== choice) : [...current, choice]
    );
  };

  return (
    <section className="space-y-2.5">
      <h2 className="text-sm font-medium">
        {question.question_text}
        {question.is_required && <span className="ml-1 text-destructive">*</span>}
      </h2>

      {question.question_type === "text" &&
        (question.text_response_length !== "short" ? (
          <textarea
            value={typeof answer === "string" ? answer : ""}
            onChange={(event) => onChange(event.target.value)}
            placeholder="你的回答"
            aria-label={question.question_text}
            aria-invalid={hasError}
            rows={8}
            className="min-h-48 w-full resize-y rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
        ) : (
          <Input
            value={typeof answer === "string" ? answer : ""}
            onChange={(event) => onChange(event.target.value)}
            placeholder="你的回答"
            aria-label={question.question_text}
            aria-invalid={hasError}
            className="w-full"
          />
        ))}

      {(question.question_type === "email" || question.question_type === "link") && (
        <Input
          type={question.question_type === "email" ? "email" : "url"}
          value={typeof answer === "string" ? answer : ""}
          onChange={(event) => onChange(event.target.value)}
          placeholder={
            question.question_type === "email" ? "name@example.com" : "https://example.com"
          }
          aria-label={question.question_text}
          aria-invalid={hasError}
          className="w-full"
        />
      )}

      {(question.question_type === "single_choice" || question.question_type === "yesno") && (
        <div className="space-y-2" role="radiogroup" aria-label={question.question_text}>
          {(question.question_type === "yesno"
            ? ["是", "否"]
            : options.map((option) => option.option_text)
          ).map((choice) => (
            <label key={choice} className="flex cursor-pointer items-center gap-2 text-sm">
              <input
                type="radio"
                name={`public-${question.id}`}
                value={choice}
                checked={answer === choice}
                onChange={() => onChange(choice)}
                className="h-4 w-4 accent-primary"
              />
              <span>{choice}</span>
            </label>
          ))}
        </div>
      )}

      {question.question_type === "multiple_choice" && (
        <div className="space-y-2">
          {options.map((option) => (
            <div key={option.id} className="flex items-center gap-2 text-sm">
              <Checkbox
                aria-label={option.option_text}
                checked={selectedOptions.includes(option.option_text)}
                onCheckedChange={(checked) =>
                  onChange(
                    checked
                      ? [...selectedOptions, option.option_text]
                      : selectedOptions.filter((item) => item !== option.option_text)
                  )
                }
              />
              <span>{option.option_text}</span>
            </div>
          ))}
        </div>
      )}

      {question.question_type === "ranking" && (
        <div className="space-y-2">
          {options.map((option) => {
            const choice = option.option_text;
            const rank = selectedOptions.indexOf(choice);
            const selected = rank !== -1;
            return (
              <Button
                key={option.id}
                type="button"
                variant="outline"
                aria-pressed={selected}
                aria-label={
                  selected ? `取消「${choice}」第 ${rank + 1} 順位` : `選擇「${choice}」作為排序`
                }
                onClick={() => toggleRankingChoice(choice)}
                className={`h-auto w-full justify-start gap-3 whitespace-normal px-3 py-3 text-left font-normal ${selected ? "border-primary bg-primary/5" : ""}`}
              >
                <span
                  className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${selected ? "bg-primary text-primary-foreground" : "border border-input text-transparent"}`}
                >
                  {selected ? rank + 1 : ""}
                </span>
                <span className="min-w-0 flex-1">{choice}</span>
              </Button>
            );
          })}
        </div>
      )}

      {question.question_type === "rating" && (
        <div
          className="flex items-center gap-1"
          role="radiogroup"
          aria-label={`${question.question_text}評分`}
        >
          {[1, 2, 3, 4, 5].map((value) => (
            <Button
              key={value}
              type="button"
              variant="ghost"
              role="radio"
              aria-label={`${value} 分`}
              aria-checked={answer === String(value)}
              onClick={() => onChange(String(value))}
              className="h-10 w-10 p-1 hover:bg-amber-50"
            >
              <Star
                className={`h-7 w-7 ${Number(answer || 0) >= value ? "fill-amber-400 text-amber-500" : "text-muted-foreground"}`}
              />
            </Button>
          ))}
        </div>
      )}

      {question.question_type === "scale" && (
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            {Array.from(
              { length: Math.max(0, (question.scale_max ?? 5) - (question.scale_min ?? 1) + 1) },
              (_, index) => (question.scale_min ?? 1) + index
            ).map((value) => (
              <Button
                key={value}
                type="button"
                variant={answer === String(value) ? "primary" : "outline"}
                aria-pressed={answer === String(value)}
                onClick={() => onChange(String(value))}
                className="h-9 w-9 p-0"
              >
                {value}
              </Button>
            ))}
          </div>
          {(question.scale_min_label || question.scale_max_label) && (
            <div className="flex justify-between gap-4 text-xs text-muted-foreground">
              <span>{question.scale_min_label}</span>
              <span className="text-right">{question.scale_max_label}</span>
            </div>
          )}
        </div>
      )}

      {hasError && <p className="text-xs text-destructive">此題為必填</p>}
    </section>
  );
}

function UnavailablePage({ message }: { message: string }) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md space-y-4 text-center">
        <p className="text-muted-foreground">{message}</p>
        <Link
          to="/surveys"
          className="inline-flex h-9 items-center justify-center rounded-md border border-border bg-background px-4 text-sm font-medium text-foreground hover:bg-muted"
        >
          返回問卷管理
        </Link>
      </div>
    </main>
  );
}

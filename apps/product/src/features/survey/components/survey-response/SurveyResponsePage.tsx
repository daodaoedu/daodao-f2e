"use client";

import { Button } from "@daodao/ui/components/button";
import { Loader2 } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { useSurveyResponse } from "../../hooks/use-survey-response";
import { trackPartial, trackView } from "../../services/survey";
import type { Answer } from "../../types";
import { QuestionRenderer } from "./QuestionRenderer";
import { ThankYouPage } from "./ThankYouPage";

function getSessionKey(shareId: string): string {
  if (typeof window === "undefined") return "";
  const storageKey = `survey-session-${shareId}`;
  let key = sessionStorage.getItem(storageKey);
  if (!key) {
    key = crypto.randomUUID();
    sessionStorage.setItem(storageKey, key);
  }
  return key;
}

export function SurveyResponsePage() {
  const params = useParams();
  const router = useRouter();
  const shareId = params?.shareId as string;

  const { survey, loading, error, submitResponse } = useSurveyResponse(shareId);
  const startedAtRef = useRef<string | null>(null);
  const sessionKeyRef = useRef<string | null>(null);
  const lastTrackedPositionRef = useRef<number | null>(null);

  // Record start time + session key once survey is loaded
  useEffect(() => {
    if (!survey || !shareId) return;
    if (!startedAtRef.current) startedAtRef.current = new Date().toISOString();
    if (!sessionKeyRef.current) sessionKeyRef.current = getSessionKey(shareId);
  }, [survey, shareId]);

  // Track page view once survey is loaded
  useEffect(() => {
    if (shareId) trackView(shareId);
  }, [shareId]);
  const [answers, setAnswers] = useState<Record<string, Answer>>({});
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Set<string>>(new Set());

  const questionRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const questions = survey?.questions ?? [];

  // Restore saved answers
  useEffect(() => {
    if (!shareId) return;
    try {
      const saved = localStorage.getItem(`survey-answers-${shareId}`);
      if (saved) setAnswers(JSON.parse(saved));
    } catch {
      /* ignore */
    }
  }, [shareId]);

  // Auto-save answers (debounced)
  useEffect(() => {
    if (Object.keys(answers).length === 0) return;
    const timer = setTimeout(() => {
      try {
        localStorage.setItem(`survey-answers-${shareId}`, JSON.stringify(answers));
      } catch {
        /* ignore */
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [answers, shareId]);

  const handleAnswer = useCallback(
    (questionId: string, value: Answer["value"]) => {
      setAnswers((prev) => {
        const next = {
          ...prev,
          [questionId]: { questionId, value, answeredAt: new Date().toISOString() },
        };
        // Track partial drop-off: only when moving to a new (further) position
        const position = questions.findIndex((q) => q.id === questionId);
        if (
          position >= 0 &&
          shareId &&
          sessionKeyRef.current &&
          position !== lastTrackedPositionRef.current
        ) {
          lastTrackedPositionRef.current = position;
          trackPartial(shareId, sessionKeyRef.current, position);
        }
        return next;
      });
      setValidationErrors((prev) => {
        if (!prev.has(questionId)) return prev;
        const next = new Set(prev);
        next.delete(questionId);
        return next;
      });
    },
    [questions, shareId]
  );

  const isQuestionVisible = useCallback(
    (question: (typeof questions)[number]): boolean => {
      if (!question.conditions || question.conditions.length === 0) return true;
      return question.conditions.every((c) => {
        const depAnswer = answers[c.dependsOn];
        if (!depAnswer) return false;
        const v = depAnswer.value;
        const asArray = Array.isArray(v) ? (v as (string | number)[]).map(String) : null;
        const strValue = asArray ? asArray.join(",") : String(v ?? "");
        switch (c.operator) {
          case "equals":
            return asArray ? asArray.includes(String(c.value)) : strValue === String(c.value);
          case "not_equals":
            return asArray ? !asArray.includes(String(c.value)) : strValue !== String(c.value);
          case "contains":
            return strValue.includes(String(c.value));
          default:
            return true;
        }
      });
    },
    [answers]
  );

  const handleSubmit = useCallback(async () => {
    if (!survey) return;

    const visibleQuestions = questions.filter(isQuestionVisible);
    const missing = new Set(
      visibleQuestions.filter((q) => q.isRequired && answers[q.id]?.value == null).map((q) => q.id)
    );

    if (missing.size > 0) {
      setValidationErrors(missing);
      const firstId = visibleQuestions.find((q) => missing.has(q.id))?.id;
      if (firstId && questionRefs.current[firstId]) {
        questionRefs.current[firstId]?.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      return;
    }

    setSubmitting(true);
    try {
      await submitResponse({
        externalId: survey.shareId,
        answers: visibleQuestions.map((q) => ({
          questionId: q.id,
          value: answers[q.id]?.value ?? null,
          answeredAt: answers[q.id]?.answeredAt,
        })),
        startedAt: startedAtRef.current ?? undefined,
        sessionKey: sessionKeyRef.current ?? undefined,
      });
      localStorage.removeItem(`survey-answers-${shareId}`);
      setSubmitted(true);
    } catch (e) {
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  }, [survey, questions, answers, shareId, submitResponse, isQuestionVisible]);

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );

  if (error)
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <p className="text-destructive">{error}</p>
        <Button variant="outline" onClick={() => router.push("/")}>
          回到首頁
        </Button>
      </div>
    );

  if (submitted) return <ThankYouPage message={survey?.config?.successMessage} />;
  if (!survey) return null;

  const isCohortFeedback = survey.tags?.includes("cohort-feedback") ?? false;

  return (
    <div className="min-h-screen bg-background">
      {/* Cover / header */}
      <div className="bg-primary/10 border-b">
        <div className="max-w-2xl mx-auto px-6 py-12">
          {isCohortFeedback && (
            <p className="mb-3 font-mono text-xs font-semibold uppercase tracking-[0.18em] text-primary">
              Lighthouse · 期末回饋
            </p>
          )}
          <h1 className="text-2xl font-bold text-foreground">{survey.title}</h1>
          {survey.description && (
            <p className="mt-3 text-muted-foreground text-sm whitespace-pre-wrap">
              {survey.description}
            </p>
          )}
        </div>
      </div>

      {/* All questions */}
      <main className="max-w-2xl mx-auto px-6 py-10 space-y-8">
        {questions.map((question, index) => (
          <div
            key={question.id}
            ref={(el) => {
              questionRefs.current[question.id] = el;
            }}
            className={`rounded-xl border bg-card p-6 transition-colors ${
              validationErrors.has(question.id) ? "border-destructive" : "border-border"
            }`}
          >
            <div className="mb-4 flex items-start gap-2">
              <span className="text-xs font-mono text-muted-foreground mt-0.5 shrink-0">
                {index + 1}.
              </span>
              <p className="font-medium text-base leading-snug">
                {question.questionText}
                {question.isRequired && <span className="text-destructive ml-1">*</span>}
              </p>
            </div>

            <QuestionRenderer
              question={question}
              answer={answers[question.id]}
              onAnswer={handleAnswer}
            />

            {validationErrors.has(question.id) && (
              <p className="mt-2 text-xs text-destructive">此題為必填</p>
            )}
          </div>
        ))}

        <div className="pt-2 pb-16">
          <Button className="w-full sm:w-auto" onClick={handleSubmit} disabled={submitting}>
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                提交中...
              </>
            ) : (
              survey.config?.submitButtonText || "提交問卷"
            )}
          </Button>
        </div>
      </main>
    </div>
  );
}

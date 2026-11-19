"use client";

import { Input } from "@daodao/ui/components/input";
import { Textarea } from "@daodao/ui/components/textarea";
import { Star } from "lucide-react";
import { toggleRankedOption } from "../../lib/managed-answer";
import type { Answer, SurveyQuestion } from "../../types";

interface Props {
  question: SurveyQuestion;
  value: Answer["value"] | undefined;
  error?: string;
  onChange: (value: Answer["value"]) => void;
}

/** The published managed-survey control, using actual persisted option identifiers. */
export function ManagedQuestion({ question, value, error, onChange }: Props) {
  const labelId = `question-${question.id}`;
  const errorId = `error-${question.id}`;
  const selected = Array.isArray(value)
    ? value.filter((id): id is number => typeof id === "number")
    : [];
  const options = [...question.options].sort((a, b) => a.order - b.order);
  const type = question.questionType;
  const fieldProps = {
    "aria-labelledby": labelId,
    "aria-invalid": !!error,
    "aria-describedby": error ? errorId : undefined,
  };
  return (
    <fieldset className="min-w-0 space-y-3" aria-describedby={error ? errorId : undefined}>
      <legend id={labelId} className="mb-2 break-words text-sm font-medium">
        {question.questionText}
        {question.isRequired && (
          <span className="ml-1 text-destructive dark:text-red-400">
            <span aria-hidden="true">*</span>
            <span className="sr-only">必填</span>
          </span>
        )}
      </legend>
      {type === "text" &&
        (question.inputType === "textarea" ? (
          <Textarea
            {...fieldProps}
            value={typeof value === "string" ? value : ""}
            onChange={(event) => onChange(event.target.value)}
            rows={8}
            maxLength={10000}
            placeholder="你的回答"
            className="min-h-48"
          />
        ) : (
          <Input
            {...fieldProps}
            type={question.inputType ?? "text"}
            value={typeof value === "string" ? value : ""}
            onChange={(event) => onChange(event.target.value)}
            maxLength={10000}
            placeholder={
              question.inputType === "email"
                ? "name@example.com"
                : question.inputType === "url"
                  ? "https://example.com"
                  : "你的回答"
            }
          />
        ))}
      {(type === "single_choice" || type === "yesno") && (
        <div role="radiogroup" {...fieldProps} className="space-y-2">
          {(type === "yesno"
            ? [
                { id: 1, label: "是", order: 0 },
                { id: 0, label: "否", order: 1 },
              ]
            : options
          ).map((option) => {
            const id = option.id ?? option.order;
            const checked = type === "yesno" ? value === (id === 1) : selected.includes(id);
            return (
              <label
                key={id}
                className="flex min-h-11 cursor-pointer items-center gap-3 rounded-md px-2 text-sm hover:bg-muted"
              >
                <input
                  type="radio"
                  name={labelId}
                  checked={checked}
                  onChange={() => onChange(type === "yesno" ? id === 1 : [id])}
                  className="size-4 shrink-0 accent-primary"
                />
                <span className="min-w-0 break-words">{option.label}</span>
              </label>
            );
          })}
        </div>
      )}
      {type === "multiple_choice" && (
        <div {...fieldProps} className="space-y-2">
          {options.map((option) => {
            const id = option.id ?? option.order;
            return (
              <label
                key={id}
                className="flex min-h-11 cursor-pointer items-center gap-3 rounded-md px-2 text-sm hover:bg-muted"
              >
                <input
                  type="checkbox"
                  checked={selected.includes(id)}
                  onChange={() => onChange(toggleRankedOption(selected, id))}
                  className="size-4 shrink-0 accent-primary"
                />
                <span className="min-w-0 break-words">{option.label}</span>
              </label>
            );
          })}
        </div>
      )}
      {type === "ranking" && (
        <div {...fieldProps} className="space-y-2">
          {options.map((option) => {
            const id = option.id ?? option.order;
            const rank = selected.indexOf(id);
            return (
              <button
                key={id}
                type="button"
                aria-pressed={rank >= 0}
                aria-label={
                  rank >= 0
                    ? `取消「${option.label}」第 ${rank + 1} 順位`
                    : `選擇「${option.label}」作為排序`
                }
                onClick={() => onChange(toggleRankedOption(selected, id))}
                className={`flex min-h-12 w-full items-center gap-3 rounded-md border px-3 py-3 text-left text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${rank >= 0 ? "border-primary bg-primary/10" : "border-input hover:bg-muted"}`}
              >
                <span
                  aria-hidden="true"
                  className={`flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${rank >= 0 ? "bg-primary text-primary-foreground" : "border border-input"}`}
                >
                  {rank >= 0 ? rank + 1 : ""}
                </span>
                <span className="min-w-0 break-words">{option.label}</span>
              </button>
            );
          })}
        </div>
      )}
      {type === "rating" && (
        <div role="radiogroup" {...fieldProps} className="flex flex-wrap gap-1">
          {[1, 2, 3, 4, 5].map((score) => (
            <label
              key={score}
              className="relative flex size-11 cursor-pointer items-center justify-center rounded-md hover:bg-muted has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring"
            >
              <input
                type="radio"
                name={labelId}
                checked={value === score}
                aria-label={`${score} 顆星`}
                onChange={() => onChange(score)}
                className="absolute inset-0 size-full cursor-pointer opacity-0"
              />
              <Star
                aria-hidden="true"
                className={`size-8 ${typeof value === "number" && value >= score ? "fill-amber-400 text-amber-600 dark:text-amber-400" : "text-muted-foreground"}`}
              />
            </label>
          ))}
        </div>
      )}
      {type === "scale" && (
        <div className="space-y-3">
          <div role="radiogroup" {...fieldProps} className="flex flex-wrap gap-2">
            {Array.from(
              {
                length: Math.min(
                  101,
                  Math.max(0, (question.scaleMax ?? 10) - (question.scaleMin ?? 0) + 1)
                ),
              },
              (_, index) => index + (question.scaleMin ?? 0)
            ).map((score) => (
              <label
                key={score}
                className={`relative flex min-h-11 min-w-11 cursor-pointer items-center justify-center rounded-md border px-2 text-sm has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring ${value === score ? "border-primary bg-primary text-primary-foreground" : "border-input hover:bg-muted"}`}
              >
                <input
                  type="radio"
                  name={labelId}
                  checked={value === score}
                  aria-label={String(score)}
                  onChange={() => onChange(score)}
                  className="absolute inset-0 size-full cursor-pointer opacity-0"
                />
                {score}
              </label>
            ))}
          </div>
          {(question.scaleMinLabel || question.scaleMaxLabel) && (
            <div className="flex justify-between gap-4 text-xs text-muted-foreground">
              <span className="min-w-0 break-words">{question.scaleMinLabel}</span>
              <span className="min-w-0 break-words text-right">{question.scaleMaxLabel}</span>
            </div>
          )}
        </div>
      )}
      {error && (
        <p id={errorId} role="alert" className="text-sm text-destructive dark:text-red-400">
          {error}
        </p>
      )}
    </fieldset>
  );
}

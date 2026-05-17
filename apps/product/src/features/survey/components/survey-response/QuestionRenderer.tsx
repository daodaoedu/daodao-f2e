"use client"

import { Input } from "@daodao/ui/components/input"
import { Textarea } from "@daodao/ui/components/textarea"
import type { SurveyQuestion, Answer } from "../../types"

interface QuestionRendererProps {
  question: SurveyQuestion
  answer: Answer | undefined
  onAnswer: (questionId: string, value: Answer["value"]) => void
}

export function QuestionRenderer({ question, answer, onAnswer }: QuestionRendererProps) {
  const value = answer?.value

  const handleChange = (v: Answer["value"]) => onAnswer(question.id, v)

  return (
    <div className="space-y-3">
      {question.questionType === "text" && (
        <Textarea
          placeholder="請輸入你的回答..."
          value={(value as string) ?? ""}
          onChange={(e) => handleChange(e.target.value)}
          rows={3}
        />
      )}

      {question.questionType === "yesno" && (
        <div className="flex gap-3">
          {(["是", "否"] as const).map((label) => (
            <button
              key={label}
              type="button"
              onClick={() => handleChange(label === "是")}
              className={`flex-1 py-2 rounded-md border text-sm transition-colors ${
                (label === "是" ? value === true : value === false)
                  ? "bg-primary text-primary-foreground border-primary"
                  : "border-input hover:bg-muted"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      )}

      {(question.questionType === "single_choice" || question.questionType === "ranking") && (
        <div className="space-y-2">
          {question.options.map((opt) => {
            const optId = opt.id ?? opt.order
            const selected = Array.isArray(value) && (value as number[]).includes(optId)
            return (
              <button
                key={optId}
                type="button"
                onClick={() => handleChange([optId])}
                className={`w-full text-left px-4 py-2.5 rounded-md border text-sm transition-colors ${
                  selected
                    ? "bg-primary text-primary-foreground border-primary"
                    : "border-input hover:bg-muted"
                }`}
              >
                {opt.label}
              </button>
            )
          })}
        </div>
      )}

      {question.questionType === "multiple_choice" && (
        <div className="space-y-2">
          {question.options.map((opt) => {
            const optId = opt.id ?? opt.order
            const selected = Array.isArray(value) && (value as number[]).includes(optId)
            return (
              <label
                key={optId}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-md border text-sm cursor-pointer transition-colors ${
                  selected ? "bg-primary/10 border-primary" : "border-input hover:bg-muted"
                }`}
              >
                <span
                  className={`h-4 w-4 rounded shrink-0 border-2 flex items-center justify-center transition-colors ${
                    selected ? "bg-primary border-primary" : "border-muted-foreground"
                  }`}
                >
                  {selected && (
                    <svg viewBox="0 0 10 8" className="h-2.5 w-2.5 fill-primary-foreground">
                      <path d="M1 4l2.5 2.5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                    </svg>
                  )}
                </span>
                <input
                  type="checkbox"
                  className="sr-only"
                  checked={selected}
                  onChange={() => {
                    const current = Array.isArray(value) ? (value as number[]) : []
                    handleChange(selected ? current.filter((v) => v !== optId) : [...current, optId])
                  }}
                />
                {opt.label}
              </label>
            )
          })}
        </div>
      )}

      {(question.questionType === "rating" || question.questionType === "scale") && (
        <div className="flex gap-2 flex-wrap">
          {Array.from(
            { length: question.questionType === "rating" ? 6 : 11 },
            (_, i) => i
          ).map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => handleChange(n)}
              className={`h-10 w-10 rounded-md border text-sm font-medium transition-colors ${
                value === n
                  ? "bg-primary text-primary-foreground border-primary"
                  : "border-input hover:bg-muted"
              }`}
            >
              {n}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

"use client"

import { useState, useRef } from "react"
import { Card, CardContent } from "@daodao/ui/components/card"
import { Button } from "@daodao/ui/components/button"
import { Textarea } from "@daodao/ui/components/textarea"
import { Checkbox } from "@daodao/ui/components/checkbox"
import { Label } from "@daodao/ui/components/label"
import { Separator } from "@daodao/ui/components/separator"
import {
  GripVertical,
  ChevronUp,
  ChevronDown,
  Trash2,
  Settings2,
} from "lucide-react"
import { cn } from "@daodao/ui/lib/utils"
import { QuestionTypeSelect } from "./QuestionTypeSelect"
import { OptionEditor } from "./OptionEditor"
import { ConditionEditor } from "./ConditionEditor"
import type { SurveyQuestion, QuestionType } from "../../types"

const OPTION_QUESTION_TYPES: QuestionType[] = ["multiple_choice", "single_choice", "ranking"]

interface QuestionCardProps {
  question: SurveyQuestion
  index: number
  allQuestions: SurveyQuestion[]
  onUpdate: (updated: SurveyQuestion) => void
  onDelete: () => void
  onMoveUp: () => void
  onMoveDown: () => void
  isFirst: boolean
  isLast: boolean
}

export function QuestionCard({
  question,
  index,
  allQuestions,
  onUpdate,
  onDelete,
  onMoveUp,
  onMoveDown,
  isFirst,
  isLast,
}: QuestionCardProps) {
  const [showConditions, setShowConditions] = useState(false)
  const savedOptionsRef = useRef<import("../../types").QuestionOption[]>(question.options)

  const showOptions = OPTION_QUESTION_TYPES.includes(question.questionType)

  const handleTypeChange = (newType: QuestionType) => {
    const wasOptionType = OPTION_QUESTION_TYPES.includes(question.questionType)
    const isOptionType = OPTION_QUESTION_TYPES.includes(newType)

    if (wasOptionType && !isOptionType) {
      savedOptionsRef.current = question.options
    }

    const restoredOptions = isOptionType
      ? (savedOptionsRef.current.length > 0
          ? savedOptionsRef.current
          : [{ label: "", order: 0 }, { label: "", order: 1 }])
      : question.options

    onUpdate({ ...question, questionType: newType, options: restoredOptions })
  }

  const availableQuestions = allQuestions.map((q) => ({
    id: q.id,
    questionText: q.questionText,
  }))

  return (
    <Card>
      <CardContent className="pt-3 pb-3 space-y-3">
        {/* Header */}
        <div className="flex items-center gap-1.5">
          <GripVertical className="h-4 w-4 text-muted-foreground shrink-0 cursor-grab" />
          <span className="text-xs font-medium text-muted-foreground shrink-0">
            #{index + 1}
          </span>
          <div className="flex-1" />
          <Button
            variant="ghost"
            size="icon"
            className={cn("h-6 w-6", isFirst && "opacity-30 pointer-events-none")}
            onClick={onMoveUp}
            disabled={isFirst}
            tabIndex={isFirst ? -1 : undefined}
          >
            <ChevronUp className="h-3 w-3" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className={cn("h-6 w-6", isLast && "opacity-30 pointer-events-none")}
            onClick={onMoveDown}
            disabled={isLast}
            tabIndex={isLast ? -1 : undefined}
          >
            <ChevronDown className="h-3 w-3" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 text-destructive hover:text-destructive"
            onClick={onDelete}
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>

        {/* Question text */}
        <Textarea
          value={question.questionText}
          onChange={(e) => onUpdate({ ...question, questionText: e.target.value })}
          placeholder="輸入問題內容"
          className="text-sm resize-none min-h-[60px]"
          rows={2}
        />

        {/* Type + Required */}
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <QuestionTypeSelect
              value={question.questionType}
              onChange={handleTypeChange}
            />
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <Checkbox
              id={`required-${question.id}`}
              checked={question.isRequired}
              onCheckedChange={(checked) =>
                onUpdate({ ...question, isRequired: checked === true })
              }
              className="h-3.5 w-3.5"
            />
            <Label htmlFor={`required-${question.id}`} className="text-xs cursor-pointer">
              必填
            </Label>
          </div>
        </div>

        {/* Options (for choice/ranking types) */}
        {showOptions && (
          <OptionEditor
            options={question.options}
            onChange={(options) => onUpdate({ ...question, options })}
          />
        )}

        <Separator />

        {/* Condition toggle */}
        <div className="space-y-2">
          <Button
            variant="ghost"
            size="sm"
            className="h-6 text-xs text-muted-foreground px-0 gap-1"
            onClick={() => setShowConditions((v) => !v)}
          >
            <Settings2 className="h-3 w-3" />
            {showConditions ? "隱藏條件設定" : "顯示條件設定"}
          </Button>

          {showConditions && (
            <ConditionEditor
              conditions={question.conditions}
              onChange={(conditions) => onUpdate({ ...question, conditions })}
              questions={availableQuestions}
              currentQuestionId={question.id}
            />
          )}
        </div>
      </CardContent>
    </Card>
  )
}

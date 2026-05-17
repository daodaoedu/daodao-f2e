"use client"

import { useState } from "react"
import { Button } from "@daodao/ui/components/button"
import { Input } from "@daodao/ui/components/input"
import { Badge } from "@daodao/ui/components/badge"
import { Card, CardContent } from "@daodao/ui/components/card"
import { Trash2, Plus, GripVertical } from "lucide-react"
import type { useSurveyWizard } from "../../hooks/use-survey-wizard"
import type { QuestionType } from "../../types"

const TYPE_LABELS: Record<QuestionType, string> = {
  text: "開放文字",
  single_choice: "單選",
  multiple_choice: "多選",
  yesno: "是否",
  rating: "評分",
  scale: "量表",
  ranking: "排序",
}

export function SurveyEditStep({ wizard }: { wizard: ReturnType<typeof useSurveyWizard> }) {
  const { state, addQuestion, updateQuestion, removeQuestion } = wizard
  const questions = state.survey.questions

  const handleAddQuestion = () => {
    addQuestion({
      questionText: "新問題",
      questionType: "text",
      options: [],
      isRequired: true,
      conditions: [],
    })
  }

  return (
    <div className="space-y-3">
      {questions.length === 0 ? (
        <p className="text-center text-muted-foreground py-8">尚無問題，請新增</p>
      ) : (
        questions.map((q, i) => (
          <Card key={i}>
            <CardContent className="pt-3 pb-3">
              <div className="flex items-start gap-2">
                <GripVertical className="h-4 w-4 text-muted-foreground mt-2 shrink-0 cursor-grab" />
                <div className="flex-1 space-y-2">
                  <Input
                    value={q.questionText}
                    onChange={(e) => updateQuestion(i, { questionText: e.target.value })}
                    className="text-sm"
                  />
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">{TYPE_LABELS[q.questionType]}</Badge>
                    <label className="flex items-center gap-1 text-xs text-muted-foreground cursor-pointer">
                      <input
                        type="checkbox"
                        checked={q.isRequired}
                        onChange={(e) => updateQuestion(i, { isRequired: e.target.checked })}
                        className="h-3 w-3"
                      />
                      必填
                    </label>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-destructive hover:text-destructive shrink-0"
                  onClick={() => removeQuestion(i)}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))
      )}

      <Button variant="outline" className="w-full" onClick={handleAddQuestion}>
        <Plus className="h-4 w-4 mr-2" />
        新增問題
      </Button>
    </div>
  )
}

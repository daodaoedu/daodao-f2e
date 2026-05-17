"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@daodao/ui/components/button"
import { Card, CardContent, CardHeader, CardTitle } from "@daodao/ui/components/card"
import { Badge } from "@daodao/ui/components/badge"
import { Loader2, ArrowLeft } from "lucide-react"
import { getResponse, getSurveyById, type ResponseDetail } from "@/features/survey/services/survey"
import type { SurveyWithQuestions } from "@/features/survey/types"

const TYPE_LABEL: Record<string, string> = {
  text: "文字", yesno: "是/否", single_choice: "單選", multiple_choice: "多選",
  rating: "評分", scale: "量表", ranking: "排序",
}

function AnswerValue({
  answer,
  optionMap,
}: {
  answer: ResponseDetail["answers"][number]
  optionMap: Map<number, string>
}) {
  if (answer.boolean_value != null) {
    return <span>{answer.boolean_value ? "是" : "否"}</span>
  }
  if (answer.rating_value != null) {
    return <span className="font-medium text-primary text-lg">{answer.rating_value}</span>
  }
  if (answer.selected_option_ids.length > 0) {
    return (
      <div className="flex flex-wrap gap-1">
        {answer.selected_option_ids.map((id) => (
          <Badge key={id} variant="secondary" className="text-xs">
            {optionMap.get(id) ?? `選項 #${id}`}
          </Badge>
        ))}
      </div>
    )
  }
  if (answer.answer_text) {
    return <p className="whitespace-pre-wrap text-sm">{answer.answer_text}</p>
  }
  return <span className="text-muted-foreground italic text-sm">未作答</span>
}

export default function ResponseDetailPage() {
  const params = useParams()
  const router = useRouter()
  const surveyId = params?.id as string
  const responseId = params?.responseId as string

  const [response, setResponse] = useState<ResponseDetail | null>(null)
  const [survey, setSurvey] = useState<SurveyWithQuestions | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    Promise.all([getResponse(surveyId, responseId), getSurveyById(surveyId)])
      .then(([r, s]) => { setResponse(r); setSurvey(s) })
      .catch(() => setError("載入失敗"))
      .finally(() => setLoading(false))
  }, [surveyId, responseId])

  // option id → label (global across all questions)
  const optionMap = new Map<number, string>()
  // question numeric id → question text
  const questionTextMap = new Map<number, string>()
  // question numeric id → question type
  const questionTypeMap = new Map<number, string>()

  if (survey) {
    for (const q of survey.questions) {
      const qNumId = Number(q.id)
      questionTextMap.set(qNumId, q.questionText)
      questionTypeMap.set(qNumId, q.questionType)
      for (const o of q.options) {
        if (o.id != null) optionMap.set(o.id, o.label)
      }
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-6">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-xl font-bold">回應詳情</h1>
          {response && (
            <p className="text-xs text-muted-foreground mt-0.5">
              {new Date(response.completed_at).toLocaleString("zh-TW")}
              {response.user_id ? ` · 用戶 #${response.user_id}` : " · 匿名"}
            </p>
          )}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : error ? (
        <p className="text-center text-destructive py-20">{error}</p>
      ) : response ? (
        <div className="space-y-3">
          {response.answers.map((a, i) => (
            <Card key={a.question_id}>
              <CardHeader className="pb-2 flex flex-row items-start justify-between gap-2">
                <div>
                  <p className="text-xs text-muted-foreground mb-0.5">題目 {i + 1}</p>
                  <CardTitle className="text-sm font-medium leading-snug">
                    {questionTextMap.get(a.question_id) ?? `問題 #${a.question_id}`}
                  </CardTitle>
                </div>
                <Badge variant="outline" className="text-xs shrink-0">
                  {TYPE_LABEL[questionTypeMap.get(a.question_id) ?? a.question_type] ?? a.question_type}
                </Badge>
              </CardHeader>
              <CardContent>
                <AnswerValue answer={a} optionMap={optionMap} />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : null}
    </div>
  )
}

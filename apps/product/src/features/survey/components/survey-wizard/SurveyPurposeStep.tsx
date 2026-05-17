"use client"

import { useState } from "react"
import { Button } from "@daodao/ui/components/button"
import { Input } from "@daodao/ui/components/input"
import { Textarea } from "@daodao/ui/components/textarea"
import { Label } from "@daodao/ui/components/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@daodao/ui/components/select"
import { Loader2, Sparkles } from "lucide-react"
import { useSurveyGenerate } from "../../hooks/use-survey-generate"
import type { useSurveyWizard } from "../../hooks/use-survey-wizard"

const TONES = [
  { value: "friendly", label: "友善" },
  { value: "formal", label: "正式" },
  { value: "casual", label: "輕鬆" },
  { value: "professional", label: "專業" },
] as const

export function SurveyPurposeStep({ wizard }: { wizard: ReturnType<typeof useSurveyWizard> }) {
  const { state, setTitle, setPurpose, setTone, setAudience, setQuestionCount, setGeneratedQuestions, setIsGenerating, nextStep } = wizard
  const { generate, loading } = useSurveyGenerate()
  const [error, setError] = useState<string | null>(null)

  const handleGenerate = async () => {
    if (!state.survey.purpose?.trim()) {
      setError("請輸入問卷目的")
      return
    }
    setError(null)
    setIsGenerating(true)
    try {
      const questions = await generate({
        purpose: state.survey.purpose,
        audience: state.survey.audience,
        tone: state.survey.tone,
        questionCount: state.survey.questionCount,
      })
      setGeneratedQuestions(questions)
      nextStep()
    } catch {
      setError("AI 生成失敗，請稍後再試")
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="title">問卷標題</Label>
        <Input
          id="title"
          placeholder="例：2024 課程滿意度調查"
          value={state.survey.title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="purpose">問卷目的 *</Label>
        <Textarea
          id="purpose"
          placeholder="描述這份問卷的目的，例：了解學員對本次課程的滿意度，收集改善建議"
          rows={3}
          value={state.survey.purpose ?? ""}
          onChange={(e) => setPurpose(e.target.value)}
        />
        {error && <p className="text-sm text-destructive">{error}</p>}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label>語氣風格</Label>
          <Select value={state.survey.tone} onValueChange={(v) => setTone(v as typeof state.survey.tone)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TONES.map((t) => (
                <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="count">題目數量</Label>
          <Input
            id="count"
            type="number"
            min={3}
            max={20}
            value={state.survey.questionCount}
            onChange={(e) => setQuestionCount(Number(e.target.value))}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="audience">目標受眾</Label>
        <Input
          id="audience"
          placeholder="例：大學生、企業員工"
          value={state.survey.audience}
          onChange={(e) => setAudience(e.target.value)}
        />
      </div>

      <Button className="w-full" onClick={handleGenerate} disabled={loading || !state.survey.purpose?.trim()}>
        {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Sparkles className="h-4 w-4 mr-2" />}
        AI 智慧生成問題
      </Button>
    </div>
  )
}

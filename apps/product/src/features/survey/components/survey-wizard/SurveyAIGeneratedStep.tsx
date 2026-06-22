"use client";

import { Badge } from "@daodao/ui/components/badge";
import { Button } from "@daodao/ui/components/button";
import { Card, CardContent } from "@daodao/ui/components/card";
import { Loader2, Sparkles } from "lucide-react";
import { useSurveyGenerate } from "../../hooks/use-survey-generate";
import type { useSurveyWizard } from "../../hooks/use-survey-wizard";

export function SurveyAIGeneratedStep({ wizard }: { wizard: ReturnType<typeof useSurveyWizard> }) {
  const { state, setGeneratedQuestions, setIsGenerating, nextStep } = wizard;
  const { generate, loading } = useSurveyGenerate();
  const questions = state.aiGeneratedQuestions ?? [];

  const handleRegenerate = async () => {
    if (!state.survey.purpose) return;
    setIsGenerating(true);
    try {
      const q = await generate({
        purpose: state.survey.purpose,
        audience: state.survey.audience,
        tone: state.survey.tone,
        questionCount: state.survey.questionCount,
      });
      setGeneratedQuestions(q);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAccept = () => {
    // Convert AI questions to survey questions
    questions.forEach((q) => {
      wizard.addQuestion({
        questionText: q.questionText,
        questionType: q.questionType,
        options: q.options ?? [],
        isRequired: true,
        conditions: [],
      });
    });
    nextStep();
  };

  if (state.isGenerating) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">AI 正在生成問題...</p>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-4">
        <p className="text-muted-foreground">尚未生成問題</p>
        <Button onClick={handleRegenerate} disabled={loading}>
          <Sparkles className="h-4 w-4 mr-2" />
          立即生成
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">已生成 {questions.length} 道問題</p>
        <Button variant="ghost" size="sm" onClick={handleRegenerate} disabled={loading}>
          <Sparkles className="h-3 w-3 mr-1" />
          重新生成
        </Button>
      </div>

      <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
        {questions.map((q, i) => (
          <Card key={i}>
            <CardContent className="pt-3 pb-3">
              <div className="flex items-start gap-2">
                <span className="text-xs text-muted-foreground mt-0.5 shrink-0">{i + 1}.</span>
                <div className="space-y-1 flex-1">
                  <p className="text-sm">{q.questionText}</p>
                  <Badge variant="outline-ghost" className="text-xs">
                    {q.questionType}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Button className="w-full" onClick={handleAccept}>
        接受並繼續編輯
      </Button>
    </div>
  );
}

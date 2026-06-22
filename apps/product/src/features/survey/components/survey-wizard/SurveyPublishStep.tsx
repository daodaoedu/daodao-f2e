"use client";

import { Badge } from "@daodao/ui/components/badge";
import { Button } from "@daodao/ui/components/button";
import { Check, Copy, ExternalLink, Loader2 } from "lucide-react";
import { useState } from "react";
import type { useSurveyWizard } from "../../hooks/use-survey-wizard";
import { createSurvey, updateSurveyStatus } from "../../services/survey";
import type { Survey } from "../../types";

export function SurveyPublishStep({ wizard }: { wizard: ReturnType<typeof useSurveyWizard> }) {
  const { state } = wizard;
  const [publishing, setPublishing] = useState(false);
  const [published, setPublished] = useState<Survey | null>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const shareUrl = published
    ? `${typeof window !== "undefined" ? window.location.origin : ""}/survey/r/${published.shareId}`
    : null;

  const handlePublish = async () => {
    setPublishing(true);
    setError(null);
    try {
      const survey = await createSurvey(state.survey);
      const activeSurvey = await updateSurveyStatus(survey.id, "active");
      setPublished(activeSurvey);
    } catch (e) {
      setError((e as Error).message ?? "發佈失敗");
    } finally {
      setPublishing(false);
    }
  };

  const handleCopy = () => {
    if (!shareUrl) return;
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (published) {
    return (
      <div className="space-y-4 text-center">
        <div className="py-4">
          <Badge className="text-sm px-3 py-1">問卷已發佈 🎉</Badge>
        </div>
        <p className="text-sm text-muted-foreground">分享連結：</p>
        <div className="flex items-center gap-2 bg-muted rounded-md px-3 py-2">
          <span className="text-xs flex-1 truncate">{shareUrl}</span>
          <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0" onClick={handleCopy}>
            {copied ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3" />}
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0" asChild>
            <a href={shareUrl!} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-3 w-3" />
            </a>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <p className="font-medium">{state.survey.title || "（未命名問卷）"}</p>
        <p className="text-sm text-muted-foreground">{state.survey.questions.length} 道問題</p>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <Button className="w-full" onClick={handlePublish} disabled={publishing}>
        {publishing ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
        發佈問卷
      </Button>
    </div>
  );
}

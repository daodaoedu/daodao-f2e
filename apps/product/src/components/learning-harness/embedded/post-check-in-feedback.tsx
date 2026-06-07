"use client";

import { useTranslations } from "@daodao/i18n";
import { Brain } from "lucide-react";
import { BuddyEmberStatus } from "./buddy-ember-status";

interface PostCheckInFeedbackProps {
  recentNotes?: string[];
}

export function PostCheckInFeedback({ recentNotes }: PostCheckInFeedbackProps) {
  const _t = useTranslations("learning_harness");
  const hasMultipleNotes = recentNotes && recentNotes.filter(Boolean).length >= 2;

  return (
    <div className="space-y-3 mt-4">
      <BuddyEmberStatus compact />

      {hasMultipleNotes && (
        <div className="bg-[#E6FBF8] rounded-lg p-3">
          <div className="flex items-start gap-2">
            <Brain className="size-4 text-logo-cyan shrink-0 mt-0.5" />
            <p className="text-xs text-text-dark leading-relaxed">
              你最近的反思都提到了類似的主題——也許這正是你目前最關注的方向。
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import {
  addPersonaResonance,
  removePersonaResonance,
  useMutate,
  usePersonaProfileUser,
} from "@daodao/api";
import { Button } from "@daodao/ui/components/button";
import { toast } from "@daodao/ui/components/sonner";
import { cn } from "@daodao/ui/lib/utils";
import { useTranslations } from "next-intl";
import { useState } from "react";

interface PersonaProfileUserProps {
  targetUserId: number;
  viewerUserId?: number;
}

export function PersonaProfileUser({ targetUserId, viewerUserId }: PersonaProfileUserProps) {
  const t = useTranslations("persona");
  const mutate = useMutate();
  const [excludeId, setExcludeId] = useState<number | undefined>(undefined);
  const [resonatingIds, setResonatingIds] = useState<Set<number>>(new Set());

  const { data, isLoading } = usePersonaProfileUser(targetUserId, { exclude: excludeId });

  const questions = data?.data?.questions ?? [];
  const viewerIsLocked = data?.data?.viewerIsLocked;
  const answersNeeded = data?.data?.answersNeeded ?? 0;

  const currentQuestion = questions[0] ?? null;

  const handleSwitchQuestion = () => {
    if (currentQuestion) {
      setExcludeId(currentQuestion.id);
    }
  };

  const handleResonance = async (answerId: number) => {
    if (resonatingIds.has(answerId)) return;
    setResonatingIds((prev) => new Set(prev).add(answerId));
    try {
      const res = await addPersonaResonance({ answerId });
      if (res.error) {
        toast.error(t("resonance.error"));
        setResonatingIds((prev) => {
          const s = new Set(prev);
          s.delete(answerId);
          return s;
        });
        return;
      }
      await mutate(["/api/v1/persona/profile/{userId}"] as const);
    } catch {
      toast.error(t("resonance.error"));
      setResonatingIds((prev) => {
        const s = new Set(prev);
        s.delete(answerId);
        return s;
      });
    }
  };

  if (isLoading) {
    return <div className="py-8 text-center text-gray-400">{t("userProfile.loading")}</div>;
  }

  if (!currentQuestion) {
    return <div className="py-8 text-center text-gray-400">{t("userProfile.noAnswer")}</div>;
  }

  return (
    <div className="py-4">
      <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <p className="text-sm text-gray-500 mb-1">{currentQuestion.prompt}</p>

        {viewerIsLocked && viewerUserId != null ? (
          <div className="mt-2 rounded-lg bg-gray-50 p-3 text-center">
            <p className="text-sm text-gray-500">
              {t("userProfile.lockedMessage", { count: answersNeeded })}
            </p>
          </div>
        ) : (
          <>
            <p className="text-base font-medium text-gray-800">
              {currentQuestion.answer?.selectedValue ?? currentQuestion.answer?.textAnswer ?? ""}
            </p>

            {currentQuestion.answer && (
              <div className="flex items-center justify-between mt-3">
                <button
                  type="button"
                  onClick={() =>
                    currentQuestion.answer && handleResonance(currentQuestion.answer.id)
                  }
                  disabled={resonatingIds.has(currentQuestion.answer.id)}
                  className={cn(
                    "text-xs flex items-center gap-1 transition-colors",
                    resonatingIds.has(currentQuestion.answer.id)
                      ? "text-blue-400 cursor-default"
                      : "text-gray-400 hover:text-blue-400"
                  )}
                >
                  ✦{" "}
                  {currentQuestion.answer.resonanceCount +
                    (resonatingIds.has(currentQuestion.answer.id) ? 1 : 0)}
                </button>
              </div>
            )}
          </>
        )}
      </div>

      <div className="mt-3 flex justify-end">
        <Button variant="ghost" size="sm" onClick={handleSwitchQuestion}>
          {t("userProfile.switchQuestion")}
        </Button>
      </div>
    </div>
  );
}

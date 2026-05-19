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
import { useTranslations } from "@daodao/i18n";
import { useEffect, useState } from "react";

function getResonanceClass(isResonating: boolean, hasResonated: boolean): string {
  if (isResonating) return "text-blue-300";
  if (hasResonated) return "text-blue-500 hover:text-blue-400";
  return "text-gray-400 hover:text-blue-400";
}

interface PersonaProfileUserProps {
  targetUserId: string;
}

export function PersonaProfileUser({ targetUserId }: PersonaProfileUserProps) {
  const t = useTranslations("persona");
  const mutate = useMutate();
  const [excludeId, setExcludeId] = useState<number | undefined>(undefined);
  const [resonatingIds, setResonatingIds] = useState<Set<number>>(new Set());
  const [resonatedIds, setResonatedIds] = useState<Set<number>>(new Set());

  const { data, isLoading } = usePersonaProfileUser(targetUserId, { exclude: excludeId });

  const questions = data?.data?.questions ?? [];
  const viewerIsLocked = data?.data?.viewerIsLocked ?? true;
  const answersNeeded = data?.data?.answersNeeded ?? 0;

  const currentQuestion = questions[0] ?? null;

  // biome-ignore lint/correctness/useExhaustiveDependencies: reset resonated state when displayed question changes
  useEffect(() => {
    setResonatedIds(new Set());
  }, [currentQuestion?.id]);

  const handleSwitchQuestion = () => {
    if (currentQuestion) {
      setExcludeId(currentQuestion.id);
    }
  };

  const handleResonance = async (answerId: number) => {
    if (resonatingIds.has(answerId)) return;
    const hasResonated = resonatedIds.has(answerId);
    setResonatingIds((prev) => new Set(prev).add(answerId));
    try {
      const res = hasResonated
        ? await removePersonaResonance(answerId)
        : await addPersonaResonance({ answerId });
      if (res.error) {
        toast.error(t("resonance.error"));
      } else {
        setResonatedIds((prev) => {
          const s = new Set(prev);
          if (hasResonated) s.delete(answerId);
          else s.add(answerId);
          return s;
        });
        await mutate(["/api/v1/persona/profile/{userId}"] as const);
      }
    } catch {
      toast.error(t("resonance.error"));
    } finally {
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

        {viewerIsLocked ? (
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
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => currentQuestion.answer && handleResonance(currentQuestion.answer.id)}
                  disabled={resonatingIds.has(currentQuestion.answer.id)}
                  className={cn(
                    "text-xs flex items-center gap-1 h-auto p-0",
                    getResonanceClass(
                      resonatingIds.has(currentQuestion.answer.id),
                      resonatedIds.has(currentQuestion.answer.id)
                    )
                  )}
                >
                  ✦{" "}
                  {currentQuestion.answer.resonanceCount}
                </Button>
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

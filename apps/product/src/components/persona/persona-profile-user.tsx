"use client";

import {
  removeReaction,
  type ReactionTypeValue,
  upsertReaction,
  useMutate,
  usePersonaProfileUser,
  useReactions,
} from "@daodao/api";
import { useLocale, useTranslations } from "@daodao/i18n";
import { Button } from "@daodao/ui/components/button";
import { toast } from "@daodao/ui/components/sonner";
import { useState } from "react";
import { ReactionPickerButton } from "@/components/check-in/reactions";
import type { ReactionTypeType } from "@/constants/reaction-type";

interface PersonaProfileUserProps {
  targetUserId: string;
}

export function PersonaProfileUser({ targetUserId }: PersonaProfileUserProps) {
  const t = useTranslations("persona");
  const locale = useLocale();
  const mutate = useMutate();
  const [excludeId, setExcludeId] = useState<number | undefined>(undefined);

  const { data, isLoading } = usePersonaProfileUser(targetUserId, { exclude: excludeId, locale });

  const questions = data?.data?.questions ?? [];
  const viewerIsLocked = data?.data?.viewerIsLocked ?? true;
  const answersNeeded = data?.data?.answersNeeded ?? 0;

  const currentQuestion = questions[0] ?? null;
  const answerId = currentQuestion?.answer?.id;
  const targetId = answerId != null ? String(answerId) : "";

  const { data: reactionsData, mutate: mutateReactions } = useReactions(
    { targetType: "persona_answer", targetId },
    { enabled: answerId != null }
  );
  const currentUserReaction = (reactionsData?.data?.currentUserReaction ??
    null) as ReactionTypeType | null;
  const selectedReactions: ReactionTypeType[] = currentUserReaction ? [currentUserReaction] : [];
  const totalReactionCount = (reactionsData?.data?.reactions ?? []).reduce(
    (sum, r) => sum + r.count,
    0
  );

  const handleSwitchQuestion = () => {
    if (currentQuestion) {
      setExcludeId(currentQuestion.id);
    }
  };

  const handleReactionToggle = async (type: ReactionTypeType) => {
    if (!targetId) return;
    const isSelected = currentUserReaction === type;
    try {
      const res = isSelected
        ? await removeReaction({ targetType: "persona_answer", targetId })
        : await upsertReaction({
            targetType: "persona_answer",
            targetId,
            reactionType: type as ReactionTypeValue,
          });
      if (res.error) {
        toast.error(t("resonance.error"));
        return;
      }
      await mutateReactions();
      await mutate([
        "/api/v1/persona/profile/{userId}",
        { params: { path: { userId: targetUserId } } },
      ] as const);
    } catch {
      toast.error(t("resonance.error"));
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
                <ReactionPickerButton
                  selectedReactions={selectedReactions}
                  onToggle={handleReactionToggle}
                  variant="comment"
                  totalCount={totalReactionCount > 0 ? totalReactionCount : undefined}
                />
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

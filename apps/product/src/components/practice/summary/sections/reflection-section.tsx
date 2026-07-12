"use client";

import { useTranslations } from "@daodao/i18n";
import { Lock } from "lucide-react";
import type { PracticeStage } from "../hooks";
import { isEnded } from "../hooks";
import { ReflectionEditor } from "./reflection-editor";

interface ReflectionSectionProps {
  stage: PracticeStage;
  reflectionText: string;
  onReflectionChange: (text: string) => void;
  practiceId: string;
}

/**
 * 我的反思區塊
 * @description 鎖定（未結束）狀態自行處理；已結束狀態委派給共用的 ReflectionEditor（預覽／編輯／已儲存）
 */
export function ReflectionSection({
  stage,
  reflectionText,
  onReflectionChange,
  practiceId,
}: ReflectionSectionProps) {
  const t = useTranslations("practice");
  const ended = isEnded(stage);

  if (!ended) {
    return (
      <section className="mt-4 rounded-2xl border border-basic-200 bg-white p-5">
        <h2 className="text-[15px] font-semibold text-text-dark">{t("summary_reflection_title")}</h2>
        <div className="mt-3 flex items-start gap-2 text-sm text-logo-gray">
          <Lock className="mt-0.5 size-4 shrink-0" />
          <p>{t("summary_reflection_locked_desc")}</p>
        </div>
      </section>
    );
  }

  return (
    <ReflectionEditor
      reflectionText={reflectionText}
      onReflectionChange={onReflectionChange}
      practiceId={practiceId}
    />
  );
}

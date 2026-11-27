import { useTranslations } from "@daodao/i18n";
import { RefreshCw } from "lucide-react";
import { useReflectionQuestion } from "../hooks/use-reflection-question";

/**
 * 反思問題卡片元件
 * 顯示反思問題與換一題按鈕
 */
export const ReflectionQuestion = () => {
  const t = useTranslations("check_in");
  const { question, nextQuestion } = useReflectionQuestion();

  return (
    <div className="mb-3 rounded-xl bg-very-light-gray/60 p-3">
      <div className="mb-2 text-sm font-medium text-text-dark">{t("reflection_title")}</div>
      <div className="flex items-center justify-between gap-3 rounded-lg border border-gray-200 bg-gray-50 px-4 py-3">
        <p className="text-sm text-text-dark">{question}</p>
        <button
          type="button"
          onClick={nextQuestion}
          className="flex shrink-0 items-center gap-1 text-sm text-gray-400 transition-colors hover:text-gray-600"
        >
          <RefreshCw className="size-3.5" />
          {t("reflection_refresh")}
        </button>
      </div>
    </div>
  );
};

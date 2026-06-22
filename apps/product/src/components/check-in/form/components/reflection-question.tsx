import { useTranslations } from "@daodao/i18n";
import { cn } from "@daodao/ui/lib/utils";
import { RefreshCw } from "lucide-react";
import { useState } from "react";
import { useReflectionQuestion } from "../hooks/use-reflection-question";

/**
 * 反思問題卡片元件
 * 含開關（預設關閉）、問題顯示、換一題按鈕
 */
export const ReflectionQuestion = () => {
  const t = useTranslations("check_in");
  const [enabled, setEnabled] = useState(false);
  const { question, nextQuestion } = useReflectionQuestion();

  return (
    <div className="mb-3">
      {/* 開關列 */}
      <div className="flex items-center gap-2 mb-3">
        <button
          type="button"
          role="switch"
          aria-checked={enabled}
          aria-label={t("reflection_toggle")}
          onClick={() => setEnabled((v) => !v)}
          className={cn(
            "relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors",
            enabled ? "bg-logo-gray" : "bg-gray-200"
          )}
        >
          <span
            className={cn(
              "pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow transition-transform",
              enabled ? "translate-x-4" : "translate-x-0"
            )}
          />
        </button>
        <span className="text-sm text-gray-500">{t("reflection_toggle")}</span>
      </div>

      {/* 問題卡片 */}
      {enabled && (
        <div className="flex items-center justify-between gap-3 rounded-lg border border-gray-200 bg-gray-50 px-4 py-3">
          <p className="text-sm text-text-dark">{question}</p>
          <button
            type="button"
            onClick={nextQuestion}
            className="flex shrink-0 items-center gap-1 text-sm text-gray-400 hover:text-gray-600 transition-colors"
          >
            <RefreshCw className="size-3.5" />
            {t("reflection_refresh")}
          </button>
        </div>
      )}
    </div>
  );
};

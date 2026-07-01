import { createInsightFeedback } from "@daodao/api";
import { toast } from "@daodao/ui/components/sonner";
import { useCallback, useState } from "react";

/**
 * 建立洞察回饋的 Hook
 * @param practiceId 實踐 ID
 */
export function useInsightFeedback(practiceId: string) {
  const [isSaving, setIsSaving] = useState(false);

  const save = useCallback(
    async (type: "positive" | "negative", reasons?: string[]) => {
      setIsSaving(true);
      try {
        await createInsightFeedback(practiceId, type, reasons);
      } catch {
        toast.error("送出回饋失敗");
      } finally {
        setIsSaving(false);
      }
    },
    [practiceId]
  );

  return { save, isSaving };
}

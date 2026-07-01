import { updateNextIntent } from "@daodao/api";
import { toast } from "@daodao/ui/components/sonner";
import { useCallback, useState } from "react";

/**
 * 更新「接下來我想」意圖的 Hook
 * @param practiceId 實踐 ID
 */
export function useNextIntent(practiceId: string) {
  const [isSaving, setIsSaving] = useState(false);

  const save = useCallback(
    async (text: string, saveDraft?: boolean) => {
      setIsSaving(true);
      try {
        await updateNextIntent(practiceId, text, saveDraft);
      } catch {
        toast.error("儲存意圖失敗");
      } finally {
        setIsSaving(false);
      }
    },
    [practiceId]
  );

  return { save, isSaving };
}

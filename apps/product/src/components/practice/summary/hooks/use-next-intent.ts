import { updateNextIntent } from "@daodao/api";
import { useTranslations } from "@daodao/i18n";
import { toast } from "@daodao/ui/components/sonner";
import { useCallback, useState } from "react";

/**
 * 更新「接下來我想」意圖的 Hook
 * @param practiceId 實踐 ID
 */
export function useNextIntent(practiceId: string) {
  const [isSaving, setIsSaving] = useState(false);
  const t = useTranslations("practice");

  const save = useCallback(
    async (text: string, saveDraft?: boolean): Promise<boolean> => {
      setIsSaving(true);
      try {
        await updateNextIntent(practiceId, text, saveDraft);
        return true;
      } catch {
        toast.error(t("summary_s2_save_error"));
        return false;
      } finally {
        setIsSaving(false);
      }
    },
    [practiceId]
  );

  return { save, isSaving };
}

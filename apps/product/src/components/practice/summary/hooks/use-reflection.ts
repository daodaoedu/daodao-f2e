import { updateReflection } from "@daodao/api";
import { useTranslations } from "@daodao/i18n";
import { toast } from "@daodao/ui/components/sonner";
import { useCallback, useState } from "react";

/**
 * 更新實踐反思文字的 Hook
 * @param practiceId 實踐 ID
 */
export function useReflection(practiceId: string) {
  const [isSaving, setIsSaving] = useState(false);
  const t = useTranslations("practice");

  const save = useCallback(
    async (text: string): Promise<boolean> => {
      setIsSaving(true);
      try {
        await updateReflection(practiceId, text);
        return true;
      } catch {
        toast.error(t("summary_reflection_save_error"));
        return false;
      } finally {
        setIsSaving(false);
      }
    },
    [practiceId]
  );

  return { save, isSaving };
}

import { updateSelectedCheckins } from "@daodao/api";
import { useTranslations } from "@daodao/i18n";
import { toast } from "@daodao/ui/components/sonner";
import { useCallback, useState } from "react";

/**
 * 更新已選取用於分享卡的打卡紀錄 Hook
 * @param practiceId 實踐 ID
 */
export function useSelectedCheckins(practiceId: string) {
  const [isSaving, setIsSaving] = useState(false);
  const t = useTranslations("practice");

  const save = useCallback(
    async (checkinIds: string[]): Promise<boolean> => {
      setIsSaving(true);
      try {
        await updateSelectedCheckins(practiceId, checkinIds);
        return true;
      } catch {
        toast.error(t("summary_picker_save_error"));
        return false;
      } finally {
        setIsSaving(false);
      }
    },
    [practiceId]
  );

  return { save, isSaving };
}

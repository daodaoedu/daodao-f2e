import { updateSelectedCheckins } from "@daodao/api";
import { toast } from "@daodao/ui/components/sonner";
import { useCallback, useState } from "react";

/**
 * 更新已選取用於分享卡的打卡紀錄 Hook
 * @param practiceId 實踐 ID
 */
export function useSelectedCheckins(practiceId: string) {
  const [isSaving, setIsSaving] = useState(false);

  const save = useCallback(
    async (checkinIds: string[]) => {
      setIsSaving(true);
      try {
        await updateSelectedCheckins(practiceId, checkinIds);
      } catch {
        toast.error("儲存選取的打卡紀錄失敗");
      } finally {
        setIsSaving(false);
      }
    },
    [practiceId]
  );

  return { save, isSaving };
}

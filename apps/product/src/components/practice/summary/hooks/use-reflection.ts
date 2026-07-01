import { updateReflection } from "@daodao/api";
import { toast } from "@daodao/ui/components/sonner";
import { useCallback, useState } from "react";

/**
 * 更新實踐反思文字的 Hook
 * @param practiceId 實踐 ID
 */
export function useReflection(practiceId: string) {
  const [isSaving, setIsSaving] = useState(false);

  const save = useCallback(
    async (text: string) => {
      setIsSaving(true);
      try {
        await updateReflection(practiceId, text);
      } catch {
        toast.error("儲存反思失敗");
      } finally {
        setIsSaving(false);
      }
    },
    [practiceId]
  );

  return { save, isSaving };
}

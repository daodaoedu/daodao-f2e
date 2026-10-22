export type DeletePracticeFlowResult = "cancelled" | "deleted" | "failed";

export interface DeletePracticeFlowDeps {
  /** 顯示確認框；使用者確定刪除回 true。整個流程只會呼叫一次 */
  confirm: () => Promise<boolean>;
  /** 送出 DELETE；失敗要 throw */
  deletePractice: () => Promise<unknown>;
  /** DELETE 成功後才呼叫（顯示成功提示、跳頁等） */
  onDeleted: () => void;
  /** DELETE 失敗時呼叫（顯示錯誤），不會再呼叫 onDeleted */
  onError: (error: unknown) => void;
}

/**
 * 刪除實踐的單一確認流程（daodao#369）：確認一次 → DELETE → 成功才通知成功。
 */
export async function runDeletePracticeFlow({
  confirm,
  deletePractice,
  onDeleted,
  onError,
}: DeletePracticeFlowDeps): Promise<DeletePracticeFlowResult> {
  const confirmed = await confirm();
  if (!confirmed) {
    return "cancelled";
  }

  try {
    await deletePractice();
  } catch (error) {
    onError(error);
    return "failed";
  }

  onDeleted();
  return "deleted";
}

/**
 * 打卡 sheet 的送出流程（daodao#377）：建立打卡成功才關 sheet、清表單；
 * 失敗時 sheet 留著、已填內容保留，錯誤訊息由建立端顯示。
 */

export interface ICheckInSheetHelpers {
  /** 關閉打卡 sheet；送出流程在建立成功後才呼叫 */
  closeSheet: () => void;
}

/**
 * useCheckInSheet 用：不在送出前關 sheet，把關閉時機交給 onComplete。
 * onComplete 丟出的錯誤會往上傳給表單，表單據此保留內容。
 */
export function createSheetCompleteHandler<T>(
  onComplete: (data: T, helpers: ICheckInSheetHelpers) => Promise<void> | void,
  getClose: () => (() => void) | null | undefined
) {
  return async (data: T) => {
    await onComplete(data, { closeSheet: () => getClose()?.() });
  };
}

/**
 * CheckInSheetContent 用：送出成功才清表單，失敗保留已填內容。
 * 錯誤提示已由送出端處理，這裡不再往上丟（避免 react-hook-form 的 handleSubmit 出現未處理的 rejection）。
 * @returns 是否送出成功
 */
export async function submitKeepingValuesOnError(
  submit: () => Promise<void> | void,
  reset: () => void
): Promise<boolean> {
  try {
    await submit();
  } catch {
    return false;
  }
  reset();
  return true;
}

/**
 * useCheckInSubmit 用：只有「建立打卡」這一步失敗才算打卡失敗（顯示錯誤並往上丟）；
 * 建立成功後先 onCreated（關 sheet），再顯示成功對話框。
 */
export async function runCheckInCreate<R>({
  create,
  onCreated,
  onSuccess,
  onError,
}: {
  create: () => Promise<R>;
  onCreated?: () => void;
  onSuccess: (result: R) => Promise<void> | void;
  onError: (error: unknown) => void;
}): Promise<void> {
  let result: R;
  try {
    result = await create();
  } catch (error) {
    onError(error);
    throw error;
  }
  onCreated?.();
  await onSuccess(result);
}

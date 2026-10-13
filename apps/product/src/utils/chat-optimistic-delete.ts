/**
 * 樂觀刪除：先從畫面拿掉，再打 API；失敗（API 回錯誤或連線失敗）就放回去並回報（daodao#154 J-06d）。
 * 不依賴 React，方便單元測試；畫面狀態由呼叫端的 hide／restore 決定。
 */
export async function runOptimisticDelete(deps: {
  hide: () => void;
  restore: () => void;
  request: () => Promise<{ error?: unknown }>;
  onSuccess?: () => void;
  onError: (error: unknown) => void;
}): Promise<boolean> {
  deps.hide();
  let failure: { error: unknown } | null = null;
  try {
    const response = await deps.request();
    if (response.error) failure = { error: response.error };
  } catch (error) {
    failure = { error };
  }
  if (failure) {
    deps.restore();
    deps.onError(failure.error);
    return false;
  }
  deps.onSuccess?.();
  return true;
}

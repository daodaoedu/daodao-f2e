import { describe, expect, it, vi } from "vitest";
import {
  createSheetCompleteHandler,
  runCheckInCreate,
  submitKeepingValuesOnError,
} from "../check-in-submit-flow";

/**
 * daodao#377 regression guard。
 *
 * 原本打卡 sheet 送出時先關 sheet 再呼叫 API，失敗時錯誤又被 CheckInButton 吞掉，
 * 結果 sheet 關掉、表單（心情／標籤／描述／照片）跟著卸載消失。
 * 這裡把 sheet → 表單 → 建立打卡三層串起來，跑一次「失敗」與「成功」。
 */
function setup(create: () => Promise<{ data: unknown }>) {
  const calls: string[] = [];
  const closeSheet = vi.fn(() => calls.push("closeSheet"));
  const reset = vi.fn(() => calls.push("reset"));
  const onError = vi.fn(() => calls.push("toast.error"));
  const onSuccess = vi.fn(async () => {
    calls.push("successDialog");
  });

  // CheckInButton 傳給 useCheckInSheet 的 onComplete
  const sheetOnComplete = createSheetCompleteHandler<string>(
    (_data, { closeSheet: close }) =>
      runCheckInCreate({ create, onCreated: close, onSuccess, onError }),
    () => closeSheet
  );
  // CheckInSheetContent 的 onSubmit
  const submitForm = () => submitKeepingValuesOnError(() => sheetOnComplete("form-values"), reset);

  return { calls, closeSheet, reset, onError, onSuccess, submitForm };
}

describe("打卡送出失敗保留 sheet 與內容（daodao#377）", () => {
  it("建立打卡失敗（例如 409 實踐已封存）：不關 sheet、不清表單、顯示錯誤", async () => {
    const error = Object.assign(new Error("此實踐狀態不允許打卡"), { status: 409 });
    const { calls, closeSheet, reset, onError, onSuccess, submitForm } = setup(() =>
      Promise.reject(error)
    );

    await expect(submitForm()).resolves.toBe(false);

    expect(closeSheet).not.toHaveBeenCalled();
    expect(reset).not.toHaveBeenCalled();
    expect(onSuccess).not.toHaveBeenCalled();
    expect(onError).toHaveBeenCalledWith(error);
    expect(calls).toEqual(["toast.error"]);
  });

  it("建立打卡成功：先關 sheet 再開成功對話框，最後清空表單", async () => {
    const { calls, submitForm } = setup(() => Promise.resolve({ data: {} }));

    await expect(submitForm()).resolves.toBe(true);

    expect(calls).toEqual(["closeSheet", "successDialog", "reset"]);
  });

  it("失敗後重送成功：sheet 才關閉", async () => {
    const create = vi
      .fn<() => Promise<{ data: unknown }>>()
      .mockRejectedValueOnce(new Error("network"))
      .mockResolvedValueOnce({ data: {} });
    const { calls, closeSheet, submitForm } = setup(create);

    await expect(submitForm()).resolves.toBe(false);
    expect(closeSheet).not.toHaveBeenCalled();

    await expect(submitForm()).resolves.toBe(true);
    expect(closeSheet).toHaveBeenCalledTimes(1);
    expect(calls).toEqual(["toast.error", "closeSheet", "successDialog", "reset"]);
  });

  it("成功對話框之後的錯誤不算建立失敗：不顯示打卡失敗", async () => {
    const onError = vi.fn();
    const closeSheet = vi.fn();
    await expect(
      runCheckInCreate({
        create: () => Promise.resolve("ok"),
        onCreated: closeSheet,
        onSuccess: () => {
          throw new Error("dialog boom");
        },
        onError,
      })
    ).rejects.toThrow("dialog boom");
    expect(closeSheet).toHaveBeenCalledTimes(1);
    expect(onError).not.toHaveBeenCalled();
  });
});

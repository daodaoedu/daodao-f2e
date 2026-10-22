import { describe, expect, it, vi } from "vitest";
import { runDeletePracticeFlow } from "../run-delete-practice-flow";

// daodao#369：詳情頁刪除曾經疊兩層確認框，第一次「確定刪除」不會送出 DELETE；
// 「刪除成功」提示也在 DELETE 送出前就出現。
describe("runDeletePracticeFlow", () => {
  it("只問一次確認，確認後只刪一次，刪除成功後才通知成功", async () => {
    const calls: string[] = [];
    const confirm = vi.fn(async () => {
      calls.push("confirm");
      return true;
    });
    const deletePractice = vi.fn(async () => {
      calls.push("delete");
    });
    const onDeleted = vi.fn(() => {
      calls.push("deleted");
    });
    const onError = vi.fn();

    const result = await runDeletePracticeFlow({ confirm, deletePractice, onDeleted, onError });

    expect(result).toBe("deleted");
    expect(confirm).toHaveBeenCalledTimes(1);
    expect(deletePractice).toHaveBeenCalledTimes(1);
    expect(onDeleted).toHaveBeenCalledTimes(1);
    expect(onError).not.toHaveBeenCalled();
    expect(calls).toEqual(["confirm", "delete", "deleted"]);
  });

  it("取消確認時不刪除、不通知", async () => {
    const deletePractice = vi.fn(async () => {});
    const onDeleted = vi.fn();
    const onError = vi.fn();

    const result = await runDeletePracticeFlow({
      confirm: async () => false,
      deletePractice,
      onDeleted,
      onError,
    });

    expect(result).toBe("cancelled");
    expect(deletePractice).not.toHaveBeenCalled();
    expect(onDeleted).not.toHaveBeenCalled();
    expect(onError).not.toHaveBeenCalled();
  });

  it("刪除失敗時只回報錯誤，不通知成功", async () => {
    const failure = new Error("not found");
    const onDeleted = vi.fn();
    const onError = vi.fn();

    const result = await runDeletePracticeFlow({
      confirm: async () => true,
      deletePractice: async () => {
        throw failure;
      },
      onDeleted,
      onError,
    });

    expect(result).toBe("failed");
    expect(onDeleted).not.toHaveBeenCalled();
    expect(onError).toHaveBeenCalledExactlyOnceWith(failure);
  });
});

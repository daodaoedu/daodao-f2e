import { describe, expect, it, vi } from "vitest";
import { runOptimisticDelete } from "../chat-optimistic-delete";

// daodao#154 regression（J-06d）：刪除要立刻從時間軸拿掉；失敗時要把訊息放回去並告知使用者。
describe("runOptimisticDelete", () => {
  const setup = (request: () => Promise<{ error?: unknown }>) => {
    const calls: string[] = [];
    const deps = {
      hide: vi.fn(() => calls.push("hide")),
      restore: vi.fn(() => calls.push("restore")),
      request: vi.fn(async () => {
        calls.push("request");
        return request();
      }),
      onSuccess: vi.fn(() => calls.push("success")),
      onError: vi.fn((_error: unknown) => calls.push("error")),
    };
    return { calls, deps };
  };

  it("hides the message before the request resolves and keeps it hidden on success", async () => {
    const { calls, deps } = setup(async () => ({}));
    const result = await runOptimisticDelete(deps);
    expect(result).toBe(true);
    expect(calls).toEqual(["hide", "request", "success"]);
    expect(deps.restore).not.toHaveBeenCalled();
  });

  it("restores the message and reports the server error body when the API rejects it", async () => {
    const serverError = { success: false, error: { message: "無權限刪除此訊息" } };
    const { calls, deps } = setup(async () => ({ error: serverError }));
    const result = await runOptimisticDelete(deps);
    expect(result).toBe(false);
    expect(calls).toEqual(["hide", "request", "restore", "error"]);
    expect(deps.onError).toHaveBeenCalledWith(serverError);
    expect(deps.onSuccess).not.toHaveBeenCalled();
  });

  it("restores the message when the request throws (network failure)", async () => {
    const { calls, deps } = setup(async () => {
      throw new TypeError("Failed to fetch");
    });
    const result = await runOptimisticDelete(deps);
    expect(result).toBe(false);
    expect(calls).toEqual(["hide", "request", "restore", "error"]);
    expect(deps.onError).toHaveBeenCalledWith(expect.any(TypeError));
  });
});

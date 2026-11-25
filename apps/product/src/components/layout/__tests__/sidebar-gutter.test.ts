import { describe, expect, it } from "vitest";
import { initialLayoutGuest, resolvedLayoutGuest } from "../sidebar-gutter";

describe("initialLayoutGuest（第一次畫面）", () => {
  it("確定沒有登入 cookie 才當訪客", () => {
    expect(initialLayoutGuest(false)).toBe(true);
  });

  it("有登入 cookie 時先當登入，登入使用者不會被往右推", () => {
    expect(initialLayoutGuest(true)).toBe(false);
  });

  it("不知道有沒有 cookie 時保守當登入", () => {
    expect(initialLayoutGuest(null)).toBe(false);
  });
});

describe("resolvedLayoutGuest（登入檢查完成後）", () => {
  it("檢查中維持目前狀態", () => {
    expect(resolvedLayoutGuest({ isLoading: true, isAuthenticated: false })).toBeNull();
  });

  it("cookie 還在但已失效（未登入）時改成訪客", () => {
    expect(resolvedLayoutGuest({ isLoading: false, isAuthenticated: false })).toBe(true);
  });

  it("確認登入時不是訪客", () => {
    expect(resolvedLayoutGuest({ isLoading: false, isAuthenticated: true })).toBe(false);
  });
});

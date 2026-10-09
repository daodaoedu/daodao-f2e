import { describe, expect, it } from "vitest";
import { resolveMyChallengesView } from "../my-challenges-view";

const base = {
  isAuthLoading: false,
  isAuthenticated: true,
  isLoading: false,
  hasError: false,
  hasData: false,
};

describe("resolveMyChallengesView", () => {
  // daodao#295 AC-01：未登入打開「我的共同挑戰」不可一直轉圈，要顯示需要登入
  it("未登入（登入狀態已確認）時顯示需要登入，即使清單請求還在讀取", () => {
    expect(resolveMyChallengesView({ ...base, isAuthenticated: false, isLoading: true })).toBe(
      "login-required"
    );
  });

  it("未登入且清單 API 回 401（error）時顯示需要登入，不顯示空清單", () => {
    expect(resolveMyChallengesView({ ...base, isAuthenticated: false, hasError: true })).toBe(
      "login-required"
    );
  });

  it("已登入但清單載入失敗時顯示錯誤，不顯示「你還沒有參加任何共同挑戰」", () => {
    expect(resolveMyChallengesView({ ...base, hasError: true })).toBe("error");
  });

  // daodao#295 review 3：背景重新驗證失敗時 SWR 同時有 error 與先前的 data，不可把已載入的清單換成錯誤
  it("已有快取清單時背景重新驗證失敗仍顯示清單", () => {
    expect(resolveMyChallengesView({ ...base, hasError: true, hasData: true })).toBe("ready");
  });

  it("登入狀態確認中顯示讀取", () => {
    expect(resolveMyChallengesView({ ...base, isAuthLoading: true, isAuthenticated: false })).toBe(
      "loading"
    );
  });

  it("已登入且清單讀取中顯示讀取", () => {
    expect(resolveMyChallengesView({ ...base, isLoading: true })).toBe("loading");
  });

  it("已登入且載入完成顯示清單", () => {
    expect(resolveMyChallengesView(base)).toBe("ready");
  });
});

import { describe, expect, it } from "vitest";
import { isPracticePrivacyLocked, withEditablePrivacy } from "../practice-privacy-lock";

describe("isPracticePrivacyLocked", () => {
  it("燈塔本期實踐 → 隱私由教練統一設定", () => {
    expect(isPracticePrivacyLocked({ isChallenge: false, isCohortPrivacyLocked: true })).toBe(true);
  });

  it("共同挑戰實踐 → 隱私由挑戰統一設定", () => {
    expect(isPracticePrivacyLocked({ isChallenge: true })).toBe(true);
  });

  it("個人實踐、或詳情還沒載入 → 可自行設定", () => {
    expect(isPracticePrivacyLocked({ isChallenge: false, isCohortPrivacyLocked: false })).toBe(
      false
    );
    expect(isPracticePrivacyLocked(undefined)).toBe(false);
  });
});

describe("withEditablePrivacy", () => {
  const request = { title: "每日寫作", resources: [{ name: "我的筆記" }] };

  it("燈塔本期實踐：送出內容不帶 privacyStatus（server 會因此回 400）", () => {
    const payload = withEditablePrivacy(
      request,
      "private",
      isPracticePrivacyLocked({ isCohortPrivacyLocked: true })
    );
    expect(payload).toEqual(request);
    expect("privacyStatus" in payload).toBe(false);
  });

  it("個人實踐：照常帶 privacyStatus", () => {
    expect(withEditablePrivacy(request, "public", false)).toEqual({
      ...request,
      privacyStatus: "public",
    });
  });

  // daodao#333：App 編輯頁原本無條件帶 privacyStatus，燈塔本期實踐存檔一律 400
  it("App 編輯燈塔本期實踐：PUT body 不帶 privacyStatus", () => {
    const appRequest = {
      title: "共讀102",
      practiceAction: "dfdf",
      durationDays: 7,
      sessionDurationMinutes: 30,
      tags: [],
      frequencyMinDays: 3,
      frequencyMaxDays: 5,
    };
    const detail = { isChallenge: false, isCohortPrivacyLocked: true };

    expect(
      withEditablePrivacy(appRequest, "private", isPracticePrivacyLocked(detail))
    ).not.toHaveProperty("privacyStatus");
  });
});

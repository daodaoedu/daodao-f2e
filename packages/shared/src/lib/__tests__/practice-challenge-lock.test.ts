import { describe, expect, it } from "vitest";
import { withoutChallengeLockedFields } from "../practice-challenge-lock";
import { isPracticePrivacyLocked, withEditablePrivacy } from "../practice-privacy-lock";

// App 編輯頁送出的整包內容（apps/mobile/app/practices/[id]/edit.tsx）
const appRequest = {
  title: "驗收範本：每週三次運動",
  practiceAction: "改過的說明",
  durationDays: 30,
  sessionDurationMinutes: 30,
  tags: [],
};

describe("withoutChallengeLockedFields", () => {
  it("共同挑戰實踐：送出內容不含 title／startDate／durationDays（值沒變也不能送，daodao#357）", () => {
    const payload = withoutChallengeLockedFields(
      { ...appRequest, startDate: "2026-10-01" },
      true
    ) as Record<string, unknown>;

    expect(payload).toEqual({
      practiceAction: "改過的說明",
      sessionDurationMinutes: 30,
      tags: [],
    });
    for (const field of ["title", "startDate", "durationDays"]) {
      expect(field in payload).toBe(false);
    }
  });

  it("共同挑戰實踐搭配隱私鎖：App 存檔內容不含任何挑戰鎖定欄位", () => {
    const isChallenge = true;
    const payload = withEditablePrivacy(
      withoutChallengeLockedFields(appRequest, isChallenge),
      "public",
      isPracticePrivacyLocked({ isChallenge })
    ) as Record<string, unknown>;

    for (const field of ["title", "startDate", "durationDays", "privacyStatus"]) {
      expect(field in payload).toBe(false);
    }
    expect(payload.practiceAction).toBe("改過的說明");
  });

  it("個人實踐：名稱與天數照常送出", () => {
    const request = { ...appRequest, title: "新名稱", durationDays: 60 };
    expect(withoutChallengeLockedFields(request, false)).toEqual(request);
  });

  it("不改動傳入的物件", () => {
    const request = { ...appRequest };
    withoutChallengeLockedFields(request, true);
    expect(request).toEqual(appRequest);
  });
});

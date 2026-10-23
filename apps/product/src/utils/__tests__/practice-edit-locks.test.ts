import enMessages from "@daodao/i18n/locales/en";
import zhTWMessages from "@daodao/i18n/locales/zh-TW";
import { describe, expect, it } from "vitest";
import { getEditScheduleLocks } from "../practice-schedule-lock";

/**
 * daodao#385：共同挑戰只鎖名稱、期間（開始日、天數）與隱私（server CHALLENGE_LOCKED_UPDATE_FIELDS、FRD FR-CC-10），
 * 頻率跟一般實踐一樣，有打卡才鎖（server stripLockedFields）。網頁原本把頻率跟期間一起鎖，
 * 說明卻寫「可以調整頻率」。
 */
describe("getEditScheduleLocks", () => {
  it("共同挑戰、還沒打卡：只鎖期間，頻率可改", () => {
    expect(getEditScheduleLocks({ isChallenge: true, checkInCount: 0 })).toEqual({
      periodLocked: true,
      frequencyLocked: false,
    });
  });

  it("共同挑戰、已打卡：期間與頻率都鎖", () => {
    expect(getEditScheduleLocks({ isChallenge: true, checkInCount: 2 })).toEqual({
      periodLocked: true,
      frequencyLocked: true,
    });
  });

  it("一般實踐、還沒打卡：都不鎖", () => {
    expect(getEditScheduleLocks({ isChallenge: false, checkInCount: 0 })).toEqual({
      periodLocked: false,
      frequencyLocked: false,
    });
  });

  it("一般實踐、已打卡：期間與頻率都鎖", () => {
    expect(getEditScheduleLocks({ isChallenge: false, checkInCount: 1 })).toEqual({
      periodLocked: true,
      frequencyLocked: true,
    });
  });

  it("資料還沒載入時不鎖", () => {
    expect(getEditScheduleLocks(undefined)).toEqual({
      periodLocked: false,
      frequencyLocked: false,
    });
  });
});

describe("共同挑戰編輯頁說明（edit_challenge_locked）", () => {
  type Messages = { practice: Record<string, string> };
  const copy = (messages: unknown) => (messages as Messages).practice.edit_challenge_locked ?? "";

  it("中文只說明挑戰鎖住的欄位，不承諾頻率可改（已打卡時頻率也鎖）", () => {
    const message = copy(zhTWMessages);
    expect(message).toContain("名稱、期間與隱私");
    expect(message).not.toContain("頻率");
  });

  it("英文同樣不承諾頻率可改，且沒有中文", () => {
    const message = copy(enMessages);
    expect(message).toMatch(/name, period and visibility/);
    expect(message).not.toMatch(/frequency/i);
    expect(message).not.toMatch(/[一-鿿]/);
  });
});

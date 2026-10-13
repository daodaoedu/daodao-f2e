import { describe, expect, it } from "vitest";
import { isPracticeScheduleLocked } from "../practice-schedule-lock";

describe("isPracticeScheduleLocked", () => {
  it("does not lock an active practice that has no check-ins yet (daodao#212)", () => {
    // 開始日為今天的實踐建立即為 active，但還沒打卡，期間與頻率仍可修改
    expect(isPracticeScheduleLocked({ status: "active", checkInCount: 0 })).toBe(false);
  });

  it("locks once the practice has a check-in", () => {
    expect(isPracticeScheduleLocked({ status: "active", checkInCount: 1 })).toBe(true);
  });

  it("does not lock a not_started practice", () => {
    expect(isPracticeScheduleLocked({ status: "not_started", checkInCount: 0 })).toBe(false);
  });

  it("treats a missing check-in count as no check-ins", () => {
    expect(isPracticeScheduleLocked({ status: "active" })).toBe(false);
    expect(isPracticeScheduleLocked(undefined)).toBe(false);
  });
});

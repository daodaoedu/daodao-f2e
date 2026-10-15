import * as shared from "@daodao/shared/lib/practice-period";
import { describe, expect, it } from "vitest";
import { parseLocalDate, practiceEndDate, practiceRemainingDays } from "../practice-period";

// 計算規則與案例（含頭尾天數、時區、剩餘天數）只測一份在 packages/shared/src/lib/__tests__/practice-period.test.ts；
// 這裡只確認 product 用的就是 shared 那一份，避免兩端規則再次分岔（daodao#295）。
describe("practice-period（product）", () => {
  it("直接沿用 @daodao/shared 的實作", () => {
    expect(practiceEndDate).toBe(shared.practiceEndDate);
    expect(practiceRemainingDays).toBe(shared.practiceRemainingDays);
    expect(parseLocalDate).toBe(shared.parseLocalDate);
  });
});

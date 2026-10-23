import { describe, expect, it } from "vitest";
import { getProgressAnimationAction } from "../check-in-progress-animation";

const base = { started: true, finished: false };

describe("getProgressAnimationAction", () => {
  it("文字動畫還沒結束時不動作", () => {
    expect(
      getProgressAnimationAction({ ...base, percentage: 20, from: 20, to: 50, started: false })
    ).toBe("idle");
  });

  it("進度上升時逐步累加，到終點後結束", () => {
    expect(getProgressAnimationAction({ ...base, percentage: 20, from: 20, to: 50 })).toBe("tick");
    expect(getProgressAnimationAction({ ...base, percentage: 50, from: 20, to: 50 })).toBe(
      "finish"
    );
  });

  it("已結束過就不再重複觸發", () => {
    expect(
      getProgressAnimationAction({ ...base, percentage: 50, from: 20, to: 50, finished: true })
    ).toBe("idle");
  });

  // daodao#372：進度封頂 999% 後再打卡，前後進度相同，動畫要直接結束，否則白色覆蓋層會一直蓋住「完成」按鈕
  it("打卡前後進度相同（封頂 999%）時直接結束", () => {
    expect(getProgressAnimationAction({ ...base, percentage: 999, from: 999, to: 999 })).toBe(
      "finish"
    );
  });

  it("打卡後進度比打卡前低時也直接結束", () => {
    expect(getProgressAnimationAction({ ...base, percentage: 60, from: 60, to: 50 })).toBe(
      "finish"
    );
  });
});

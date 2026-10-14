import { describe, expect, it } from "vitest";
import { resolveJoinUnavailableCopy } from "../cohort-join-unavailable";

// daodao#281：截止＋暫停同時成立時，加入頁按鈕前就要看到兩個原因。
describe("resolveJoinUnavailableCopy", () => {
  it("neither: nothing blocks joining", () => {
    expect(
      resolveJoinUnavailableCopy({ unavailableReason: null, unavailableReasons: [] })
    ).toBeNull();
  });

  it("deadline only: expired title with the deadline line", () => {
    expect(
      resolveJoinUnavailableCopy({ unavailableReason: "expired", unavailableReasons: ["expired"] })
    ).toEqual({
      titleKey: "unavailable_expired",
      showDeadline: true,
      alsoKeys: [],
      showPausedCopy: false,
    });
  });

  it("paused only: paused title with the use-your-invitation copy", () => {
    expect(
      resolveJoinUnavailableCopy({ unavailableReason: "paused", unavailableReasons: ["paused"] })
    ).toEqual({
      titleKey: "unavailable_paused",
      showDeadline: false,
      alsoKeys: [],
      showPausedCopy: true,
    });
  });

  it("deadline and paused: shows both reasons, without pointing to the invitation email", () => {
    expect(
      resolveJoinUnavailableCopy({
        unavailableReason: "expired",
        unavailableReasons: ["expired", "paused"],
      })
    ).toEqual({
      titleKey: "unavailable_expired",
      showDeadline: true,
      alsoKeys: ["unavailable_paused"],
      showPausedCopy: false,
    });
  });

  it("falls back to the single reason when the server has not sent the list yet", () => {
    expect(resolveJoinUnavailableCopy({ unavailableReason: "paused" })).toEqual({
      titleKey: "unavailable_paused",
      showDeadline: false,
      alsoKeys: [],
      showPausedCopy: true,
    });
  });
});

import { describe, expect, it } from "vitest";
import { getInvitationSendDisabledReason } from "../cohort-invitation";

describe("getInvitationSendDisabledReason", () => {
  const sendable = { sendableCount: 2, skippedCount: 0, errorCount: 0, blockedReason: null };

  it("allows sending when at least one email is sendable and the cohort is joinable", () => {
    expect(getInvitationSendDisabledReason(sendable)).toBeNull();
  });

  it("blocks sending with the cohort reason once joining is closed (daodao#281)", () => {
    expect(getInvitationSendDisabledReason({ ...sendable, blockedReason: "expired" })).toBe(
      "expired"
    );
    expect(getInvitationSendDisabledReason({ ...sendable, blockedReason: "full" })).toBe("full");
  });

  it("blocks sending when every valid email has already joined (daodao#282)", () => {
    expect(
      getInvitationSendDisabledReason({ ...sendable, sendableCount: 0, skippedCount: 2 })
    ).toBe("all_joined");
  });

  it("blocks sending when nothing in the list is a valid email", () => {
    expect(getInvitationSendDisabledReason({ ...sendable, sendableCount: 0, errorCount: 3 })).toBe(
      "none_sendable"
    );
  });

  it("still allows a mixed list that contains joined members", () => {
    expect(
      getInvitationSendDisabledReason({ ...sendable, sendableCount: 1, skippedCount: 1 })
    ).toBeNull();
  });
});

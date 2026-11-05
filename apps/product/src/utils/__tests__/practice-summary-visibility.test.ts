import { describe, expect, it } from "vitest";
import {
  getPracticeSummaryPrivacyStatus,
  getPracticeSummaryVisibility,
} from "../practice-summary-visibility";

describe("practice summary sharing state", () => {
  it("prevents publishing an already public practice again", () => {
    expect(getPracticeSummaryVisibility("public", "completed")).toEqual({
      isPublished: true,
      notice: "public",
    });
  });

  it("keeps delayed sharing enabled without claiming a not-completed practice is visible", () => {
    expect(getPracticeSummaryVisibility("delayed", "active")).toEqual({
      isPublished: true,
      notice: "delayed",
    });
  });

  it("announces delayed sharing as public only after completion", () => {
    expect(getPracticeSummaryVisibility("delayed", "completed")).toEqual({
      isPublished: true,
      notice: "public",
    });
  });

  it.each([
    "active",
    "archived",
    "not_started",
    "draft",
  ])("does not treat the %s status as completed for delayed sharing", (status) => {
    expect(getPracticeSummaryVisibility("delayed", status).notice).toBe("delayed");
  });

  it.each(["active", "completed"])("allows publishing a private %s practice", (status) => {
    expect(getPracticeSummaryVisibility("private", status)).toEqual({
      isPublished: false,
      notice: null,
    });
  });

  it("does not claim missing privacy is public", () => {
    expect(getPracticeSummaryVisibility(undefined, "completed")).toEqual({
      isPublished: false,
      notice: null,
    });
  });
});

describe("summary privacy from the detail response", () => {
  it.each(["public", "private", "delayed"])("reads the persisted %s setting", (privacyStatus) => {
    expect(getPracticeSummaryPrivacyStatus({ privacyStatus })).toBe(privacyStatus);
  });
  it.each([
    undefined,
    null,
    {},
    { privacyStatus: "unknown" },
    { privacyStatus: null },
  ])("does not claim an absent or invalid setting is public: %j", (detail) => {
    expect(getPracticeSummaryPrivacyStatus(detail)).toBeUndefined();
  });
});

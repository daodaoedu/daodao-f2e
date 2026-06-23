import { describe, expect, it } from "vitest";
import { getCheckInBackPath } from "../get-check-in-back-path";

describe("getCheckInBackPath", () => {
  const practiceDetailPath = "/practices/abc-123";

  it("returns practice detail path when from is null", () => {
    expect(getCheckInBackPath(practiceDetailPath, null)).toBe(practiceDetailPath);
  });

  it("returns inspire feed path when from is 'inspire'", () => {
    expect(getCheckInBackPath(practiceDetailPath, "inspire")).toBe("/");
  });

  it("returns practice detail path when from is an unknown value", () => {
    expect(getCheckInBackPath(practiceDetailPath, "other")).toBe(practiceDetailPath);
  });

  it("returns practice detail path when from is empty string", () => {
    expect(getCheckInBackPath(practiceDetailPath, "")).toBe(practiceDetailPath);
  });
});

import { describe, it, expect } from "vitest";
import { shouldBlockNavigation } from "../nav-blocker-condition";

describe("shouldBlockNavigation", () => {
  it("blocks when form is dirty and save not done", () => {
    expect(shouldBlockNavigation(true, false, false)).toBe(true);
  });

  it("blocks when avatar file is pending and save not done", () => {
    expect(shouldBlockNavigation(false, true, false)).toBe(true);
  });

  it("does not block after successful save even if isDirty is momentarily true", () => {
    expect(shouldBlockNavigation(true, false, true)).toBe(false);
  });

  it("does not block after successful save with pending avatar file", () => {
    expect(shouldBlockNavigation(false, true, true)).toBe(false);
  });

  it("does not block when form is clean and no avatar file", () => {
    expect(shouldBlockNavigation(false, false, false)).toBe(false);
  });
});

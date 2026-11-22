import { describe, expect, it } from "vitest";
import { isPracticeCopyRestricted } from "../practice-copy-policy";

describe("practice copy policy", () => {
  it("blocks detached cohort templates using the server copy restriction", () => {
    expect(
      isPracticeCopyRestricted({
        isCopyRestricted: true,
        isCohortPractice: false,
        isCohortPrivacyLocked: false,
      })
    ).toBe(true);
  });
  it("blocks linked manual practices while an older server lacks the new flag", () => {
    expect(isPracticeCopyRestricted({ isCohortPrivacyLocked: true, isCohortPractice: false })).toBe(
      true
    );
  });
  it("keeps existing cohort and challenge restrictions", () => {
    expect(isPracticeCopyRestricted({ isCohortPractice: true })).toBe(true);
    expect(isPracticeCopyRestricted({ isChallenge: true })).toBe(true);
  });
  it("permits normal personal practice copies", () => {
    expect(isPracticeCopyRestricted({})).toBe(false);
    expect(
      isPracticeCopyRestricted({
        isCopyRestricted: false,
        isCohortPrivacyLocked: false,
        isCohortPractice: false,
        isChallenge: false,
      })
    ).toBe(false);
  });
});

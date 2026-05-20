import { describe, expect, it } from "vitest";
import {
  type LeaveWithDraftChoice,
  shouldNavigateOnLeave,
  shouldSaveDraftOnLeave,
} from "../leave-with-draft-utils";

describe("shouldNavigateOnLeave", () => {
  it("returns true when user chooses to save draft", () => {
    expect(shouldNavigateOnLeave("save-draft")).toBe(true);
  });

  it("returns true when user chooses to leave without saving", () => {
    expect(shouldNavigateOnLeave("leave")).toBe(true);
  });

  it("returns false when user chooses to continue editing", () => {
    expect(shouldNavigateOnLeave("continue")).toBe(false);
  });
});

describe("shouldSaveDraftOnLeave", () => {
  it("returns true only when user explicitly chooses save-draft", () => {
    expect(shouldSaveDraftOnLeave("save-draft")).toBe(true);
  });

  it("returns false when user leaves without saving", () => {
    expect(shouldSaveDraftOnLeave("leave")).toBe(false);
  });

  it("returns false when user continues editing", () => {
    expect(shouldSaveDraftOnLeave("continue")).toBe(false);
  });
});

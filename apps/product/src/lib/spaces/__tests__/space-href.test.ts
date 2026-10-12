import { describe, expect, it } from "vitest";
import { spaceHref } from "../space-href";

const eventCourse = { kind: "event_course" as const, id: "64", programId: 7, isHost: false };

describe("spaceHref", () => {
  it("routes the virtual spaces to their sub-pages", () => {
    expect(spaceHref({ kind: "personal", id: null, programId: null, isHost: true })).toBe(
      "/spaces/personal"
    );
    expect(spaceHref({ kind: "challenge", id: null, programId: null, isHost: false })).toBe(
      "/spaces/challenge"
    );
  });

  it("keeps a learner's event course on the learner cohort page", () => {
    expect(spaceHref(eventCourse)).toBe("/cohorts/64");
  });

  // #201：發起人沒有 enrollment，學員頁會把他導回 /mine，所以改連管理端場次頁
  it("sends the host of an event course to the lighthouse cohort dashboard", () => {
    expect(spaceHref({ ...eventCourse, isHost: true })).toBe(
      "/lighthouse/programs/7/cohorts/64/dashboard"
    );
  });

  it("falls back to the learner page when a host card has no programId", () => {
    expect(spaceHref({ ...eventCourse, isHost: true, programId: null })).toBe("/cohorts/64");
  });

  it("falls back to the space list when an event course has no id", () => {
    expect(spaceHref({ ...eventCourse, id: null })).toBe("/spaces");
  });
});

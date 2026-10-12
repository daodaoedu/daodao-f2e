import { describe, expect, it } from "vitest";
import { spaceHref } from "../space-href";

const eventCourse = { kind: "event_course" as const, id: "64", programId: 7, canManage: false };

describe("spaceHref", () => {
  it("routes the virtual spaces to their sub-pages", () => {
    expect(spaceHref({ kind: "personal", id: null, programId: null, canManage: false })).toBe(
      "/spaces/personal"
    );
    expect(spaceHref({ kind: "challenge", id: null, programId: null, canManage: false })).toBe(
      "/spaces/challenge"
    );
  });

  it("keeps a learner's event course on the learner cohort page", () => {
    expect(spaceHref(eventCourse)).toBe("/cohorts/64");
  });

  // #201：組織成員沒有 enrollment，學員頁會把他導回 /mine，所以改連管理端場次頁
  it("sends an organization member to the lighthouse cohort dashboard", () => {
    expect(spaceHref({ ...eventCourse, canManage: true })).toBe(
      "/lighthouse/programs/7/cohorts/64/dashboard"
    );
  });

  it("falls back to the learner page when a manageable card has no programId", () => {
    expect(spaceHref({ ...eventCourse, canManage: true, programId: null })).toBe("/cohorts/64");
  });

  it("falls back to the space list when an event course has no id", () => {
    expect(spaceHref({ ...eventCourse, id: null })).toBe("/spaces");
  });
});

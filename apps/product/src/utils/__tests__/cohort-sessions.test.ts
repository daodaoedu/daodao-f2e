import { describe, expect, it } from "vitest";
import {
  generateRecurringSessions,
  groupSessionsForDisplay,
  prepareSessionSubmission,
  type SessionEntry,
  updateSessionGroup,
} from "../cohort-sessions";

function requiredAt<T>(items: T[], index: number): T {
  const value = items[index];
  if (value === undefined) throw new Error(`Expected item at ${index}`);
  return value;
}

const rule = { startDate: "2026-11-02", weeks: 2, weekdays: [1, 4] };
const entry = (date: string, id = date, group: string | null = "group-a"): SessionEntry => ({
  id,
  sessionDate: date,
  startTime: "19:00",
  endTime: "20:00",
  recurrenceGroupId: group,
  recurrenceRule: group ? rule : null,
});

describe("recurring cohort sessions", () => {
  it("generates eight Tuesday/Thursday dates with persistent group metadata", () => {
    const result = generateRecurringSessions(
      [],
      { startDate: "2026-11-03", weeks: 4, weekdays: [2, 4] },
      "19:00",
      "20:00",
      "2026-12-01",
      "new-group"
    );
    expect(result.status).toBe("added");
    if (result.status !== "added") return;
    expect(result.sessions.map((s) => s.sessionDate)).toEqual([
      "2026-11-03",
      "2026-11-05",
      "2026-11-10",
      "2026-11-12",
      "2026-11-17",
      "2026-11-19",
      "2026-11-24",
      "2026-11-26",
    ]);
    expect(
      result.sessions.every(
        (s) => s.recurrenceGroupId === "new-group" && s.recurrenceRule?.weeks === 4
      )
    ).toBe(true);
  });
  it("clips at cohort end, deduplicates exact rows and keeps different times", () => {
    const result = generateRecurringSessions(
      [entry("2026-11-03", "old", null)],
      { startDate: "2026-11-03", weeks: 2, weekdays: [2, 4] },
      "19:00",
      "20:00",
      "2026-11-10",
      "new"
    );
    expect(result.status).toBe("added");
    if (result.status === "added")
      expect(result.sessions.map((s) => s.sessionDate)).toEqual([
        "2026-11-03",
        "2026-11-05",
        "2026-11-10",
      ]);
    const different = generateRecurringSessions(
      [entry("2026-11-03", "old", null)],
      { startDate: "2026-11-03", weeks: 1, weekdays: [2] },
      "20:00",
      "21:00",
      "2026-11-10",
      "new"
    );
    if (different.status === "added") expect(different.sessions).toHaveLength(2);
  });
  it("rejects the entire generated batch over capacity and accepts exactly fifty", () => {
    const existing = Array.from({ length: 49 }, (_, i) => entry("2026-10-01", String(i), null));
    const result = generateRecurringSessions(
      existing,
      { startDate: "2026-11-03", weeks: 1, weekdays: [2, 4] },
      "19:00",
      "20:00",
      "2026-12-01",
      "new"
    );
    expect(result).toEqual({ status: "capacity", remaining: 1 });
    expect(existing).toHaveLength(49);
    const accepted = generateRecurringSessions(
      existing,
      { startDate: "2026-11-03", weeks: 1, weekdays: [2] },
      "19:00",
      "20:00",
      "2026-12-01",
      "new"
    );
    if (accepted.status === "added") expect(accepted.sessions).toHaveLength(50);
  });
  it("does not infer a group for manual periodic rows or combine independent groups", () => {
    expect(
      groupSessionsForDisplay(
        [entry("2026-11-02", "a", null), entry("2026-11-09", "b", null)],
        new Set()
      )
    ).toHaveLength(2);
    expect(
      groupSessionsForDisplay([entry("2026-11-02"), entry("2026-11-09", "b", "other")], new Set())
    ).toHaveLength(2);
  });
  it("folds one saved Mon/Thu group into a two-week four-session summary", () => {
    const sessions = ["2026-11-02", "2026-11-05", "2026-11-09", "2026-11-12"].map((d) => entry(d));
    const groups = groupSessionsForDisplay(sessions, new Set());
    expect(groups).toHaveLength(1);
    expect(requiredAt(groups, 0).repeatWeekdays).toEqual([1, 4]);
    expect(requiredAt(groups, 0).repeatWeeks).toBe(2);
    expect(groupSessionsForDisplay(sessions, new Set(sessions.map((s) => s.id)))).toHaveLength(4);
  });
  it("edits one occurrence without changing siblings or losing the saved group", () => {
    const sessions = [entry("2026-11-02"), entry("2026-11-09")];
    const changed = updateSessionGroup(
      sessions,
      [requiredAt(sessions, 1).id],
      "startTime",
      "21:00"
    );
    expect(requiredAt(changed, 0)).toEqual(requiredAt(sessions, 0));
    expect(requiredAt(changed, 1)).toEqual({ ...requiredAt(sessions, 1), startTime: "21:00" });
  });
  it("shifts the full group and its rule together while leaving manual rows alone", () => {
    const sessions = [
      entry("2026-11-02"),
      entry("2026-11-09"),
      entry("2026-11-10", "manual", null),
    ];
    const changed = updateSessionGroup(
      sessions,
      sessions.slice(0, 2).map((s) => s.id),
      "sessionDate",
      "2026-11-03"
    );
    expect(changed.map((s) => s.sessionDate)).toEqual(["2026-11-03", "2026-11-10", "2026-11-10"]);
    expect(requiredAt(changed, 0).recurrenceRule).toEqual({
      startDate: "2026-11-03",
      weeks: 2,
      weekdays: [2, 5],
    });
    expect(requiredAt(changed, 1).recurrenceRule).toEqual(requiredAt(changed, 0).recurrenceRule);
    expect(requiredAt(changed, 2)).toEqual(requiredAt(sessions, 2));
  });
  it("anchors a group date edit to the displayed earliest occurrence after rows reorder", () => {
    const sessions = [entry("2026-11-16", "a"), entry("2026-11-09", "b")];
    const displayed = requiredAt(groupSessionsForDisplay(sessions, new Set()), 0);
    expect(displayed.sessions.map((session) => session.id)).toEqual(["b", "a"]);
    const shifted = updateSessionGroup(
      sessions,
      displayed.sessions.map((session) => session.id),
      "sessionDate",
      "2026-11-10"
    );
    expect(shifted.map((session) => session.sessionDate)).toEqual(["2026-11-17", "2026-11-10"]);
  });
  it("does not submit hidden session drafts or block async-only saving on their blank dates", () => {
    const drafts = [entry("", "blank", null), entry("2026-11-10", "saved")];
    expect(prepareSessionSubmission(drafts, ["async"])).toEqual({
      sessions: [],
      invalidSessionIds: [],
    });
    expect(requiredAt(drafts, 0).sessionDate).toBe("");
    expect(drafts).toHaveLength(2);
  });
  it.each([
    ["sync"],
    ["physical"],
    ["async", "sync"],
  ])("validates visible session drafts for %j", (...modes) => {
    const drafts = [entry("", "blank", null), entry("2026-11-10", "valid", null)];
    expect(prepareSessionSubmission(drafts, modes)).toEqual({
      sessions: drafts,
      invalidSessionIds: ["blank"],
    });
  });
});

it("keeps all occurrence dates when the representative date is unchanged", () => {
  const sessions = [entry("2026-11-02", "first"), entry("2026-11-05", "second")];
  expect(updateSessionGroup(sessions, ["first", "second"], "sessionDate", "2026-11-02")).toEqual(
    sessions
  );
});

it("allows assigning the first date to a new one-off session", () => {
  const sessions = [entry("", "draft", null)];
  expect(
    updateSessionGroup(sessions, ["draft"], "sessionDate", "2026-12-30").map((s) => s.sessionDate)
  ).toEqual(["2026-12-30"]);
});

it("preserves relative occurrence dates when a folded group date is cleared then replaced", () => {
  const sessions = [entry("2026-12-01", "first"), entry("2026-12-03", "second")];
  const cleared = updateSessionGroup(sessions, ["first", "second"], "sessionDate", "");
  const moved = updateSessionGroup(cleared, ["first", "second"], "sessionDate", "2026-12-02");
  expect(moved.map((session) => session.sessionDate)).toEqual(["2026-12-02", "2026-12-04"]);
});

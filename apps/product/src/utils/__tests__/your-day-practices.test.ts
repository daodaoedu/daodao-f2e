import { describe, expect, it } from "vitest";
import { selectYourDayPractices, type YourDayPracticeSource } from "../your-day-practices";

const day = (iso: string) => new Date(`${iso}T00:00:00`);

const personal = (
  id: string,
  startDate: string,
  endDate: string | null,
  extra: Partial<YourDayPracticeSource> = {}
): YourDayPracticeSource => ({
  id,
  status: "active",
  startDate,
  endDate,
  cohortId: null,
  cohortStartDate: null,
  cohortEndDate: null,
  isChallenge: false,
  ...extra,
});

/** 燈塔 cohort 11/10〜11/20；實踐自身日期刻意與 cohort 不同 */
const lighthouse = (
  id: string,
  extra: Partial<YourDayPracticeSource> = {}
): YourDayPracticeSource =>
  personal(id, "2026-11-01", "2026-11-03", {
    cohortId: 12,
    cohortStartDate: "2026-11-10",
    cohortEndDate: "2026-11-20",
    ...extra,
  });

const ids = (practices: YourDayPracticeSource[], today: string) =>
  selectYourDayPractices(practices, day(today)).map((practice) => practice.id);

describe("selectYourDayPractices — cohort window (AC-02)", () => {
  it.each([
    ["2026-11-09", []],
    ["2026-11-10", ["lh"]],
    ["2026-11-15", ["lh"]],
    ["2026-11-20", ["lh"]],
    ["2026-11-21", []],
  ])("on %s shows %j, following cohort dates instead of the practice's own end date", (today, expected) => {
    expect(ids([lighthouse("lh")], today)).toEqual(expected);
  });

  it("gives the check-in button the cohort end date", () => {
    const [row] = selectYourDayPractices([lighthouse("lh")], day("2026-11-15"));
    expect(row?.windowEndDate).toBe("2026-11-20");
  });
});

describe("selectYourDayPractices — personal and challenge window (AC-03)", () => {
  it.each([
    ["2026-11-04", []],
    ["2026-11-05", ["mine"]],
    ["2026-11-08", ["mine"]],
    ["2026-11-09", []],
  ])("personal practice on %s shows %j", (today, expected) => {
    expect(ids([personal("mine", "2026-11-05", "2026-11-08")], today)).toEqual(expected);
  });

  it("challenge uses its own practice dates even though it belongs to a cohort", () => {
    const challenge = personal("ch", "2026-11-05", "2026-11-08", {
      cohortId: 30,
      cohortStartDate: "2026-11-01",
      cohortEndDate: "2026-11-30",
      isChallenge: true,
    });
    expect(ids([challenge], "2026-11-08")).toEqual(["ch"]);
    expect(ids([challenge], "2026-11-09")).toEqual([]);
  });

  it("derives the end date from duration when the practice has none", () => {
    const practice = personal("dur", "2026-11-05", null, { durationDays: 3 });
    expect(ids([practice], "2026-11-07")).toEqual(["dur"]);
    expect(ids([practice], "2026-11-08")).toEqual([]);
  });

  it("hides non-active practices even within their dates", () => {
    expect(
      ids([personal("d", "2026-11-05", "2026-11-08", { status: "draft" })], "2026-11-06")
    ).toEqual([]);
  });
});

describe("selectYourDayPractices — one entry per cohort (AC-04)", () => {
  const today = "2026-11-15";

  it("targets the most recently started practice and keeps other practices", () => {
    const rows = [
      personal("mine", "2026-11-14", "2026-11-30"),
      lighthouse("older", { startDate: "2026-11-10" }),
      lighthouse("newer", { startDate: "2026-11-13" }),
    ];
    expect(ids(rows, today)).toEqual(["mine", "newer"]);
  });

  it("does not let a not-yet-started practice take over the entry", () => {
    const rows = [
      lighthouse("future", { startDate: "2026-11-18" }),
      lighthouse("current", { startDate: "2026-11-12" }),
    ];
    expect(ids(rows, today)).toEqual(["current"]);
  });

  it("breaks same-day ties by the later creation time", () => {
    const rows = [
      lighthouse("first", { startDate: "2026-11-12", createdAt: "2026-11-01T01:00:00.000Z" }),
      lighthouse("second", { startDate: "2026-11-12", createdAt: "2026-11-01T02:00:00.000Z" }),
    ];
    expect(ids(rows, today)).toEqual(["second"]);
  });

  it("ignores inactive practices of the same cohort", () => {
    const rows = [
      lighthouse("draft", { startDate: "2026-11-14", status: "draft" }),
      lighthouse("active", { startDate: "2026-11-11" }),
    ];
    expect(ids(rows, today)).toEqual(["active"]);
  });

  it("picks the earliest upcoming practice when none has started yet", () => {
    const rows = [
      lighthouse("later", { startDate: "2026-11-19" }),
      lighthouse("sooner", { startDate: "2026-11-17" }),
    ];
    expect(ids(rows, today)).toEqual(["sooner"]);
  });

  it("keeps different cohorts as separate entries", () => {
    const rows = [
      lighthouse("a", { startDate: "2026-11-12" }),
      lighthouse("b", { startDate: "2026-11-12", cohortId: 13 }),
    ];
    expect(ids(rows, today)).toEqual(["a", "b"]);
  });
});

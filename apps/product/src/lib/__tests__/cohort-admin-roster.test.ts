import { describe, expect, it } from "vitest";
import { buildCohortAdminRoster, type IRosterOptions } from "../cohort-admin-roster";

const members = [
  { id: 11, userId: 1, nickname: "Amy", email: "amy@example.com", status: "joined" },
  { id: 22, userId: 2, nickname: "Bob", email: "bob@example.com", status: "joined" },
  { id: 33, userId: 3, nickname: "Invited", email: "invited@example.com", status: "invited" },
  { id: 44, userId: 4, nickname: "Exited", email: "exited@example.com", status: "exited" },
];
const practices = [
  { userId: 1, practiceId: 101, practiceTitle: "Yoga", nickname: "Amy", checkinCount: 2 },
  { userId: 1, practiceId: 102, practiceTitle: "Art", nickname: "Amy", checkinCount: 3 },
  { userId: 2, practiceId: 201, practiceTitle: "Yoga", nickname: "Bob", checkinCount: 7 },
  { userId: 3, practiceId: 301, practiceTitle: "Yoga", nickname: "Invited", checkinCount: 10 },
];
const activity = [
  { userId: 1, practiceId: 101, lastActivityAt: "2026-11-01T12:00:00Z" },
  { userId: 1, practiceId: 102, lastActivityAt: "2026-11-02T12:00:00Z" },
  { userId: 2, practiceId: 201, lastActivityAt: "2026-11-03T12:00:00Z" },
];
const base: IRosterOptions = { enrollments: members, practices, activity, practiceStatus: "ready" };

describe("cohort admin roster", () => {
  it("keeps exactly one card per joined enrollment and aggregates all practices", () => {
    const rows = buildCohortAdminRoster(base);
    expect(rows.map((row) => row.userId)).toEqual([1, 2]);
    expect(rows[0]).toMatchObject({
      practiceId: 102,
      checkinCount: 5,
      lastActivityAt: "2026-11-02T12:00:00Z",
      practiceStatus: "ready",
    });
  });
  it.each([
    "loading",
    "error",
  ] as const)("keeps joined members while practice data is %s", (practiceStatus) => {
    expect(
      buildCohortAdminRoster({ ...base, practices: [], activity: [], practiceStatus })
    ).toEqual([
      expect.objectContaining({ userId: 1, practiceId: null, checkinCount: null, practiceStatus }),
      expect.objectContaining({ userId: 2, practiceId: null, checkinCount: null, practiceStatus }),
    ]);
  });
  it("retains unavailable practices and joined identities without a user ID", () => {
    const rows = buildCohortAdminRoster({
      ...base,
      practices: [],
      enrollments: [
        ...members,
        {
          id: 55,
          userId: null,
          nickname: "Pending identity",
          email: "pending@example.com",
          status: "joined",
        },
      ],
    });
    expect(rows).toHaveLength(3);
    expect(rows).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ userId: 1, practiceId: null, practiceStatus: "unavailable" }),
        expect.objectContaining({
          enrollmentId: 55,
          userId: null,
          practiceId: null,
          practiceStatus: "unavailable",
        }),
      ])
    );
  });
  it("composes case-insensitive name/email search, practice filter and count sort", () => {
    const rows = buildCohortAdminRoster({
      ...base,
      search: "  EXAMPLE.COM ",
      selectedPractice: "Yoga",
      sortField: "checkins",
      sortDirection: "desc",
    });
    expect(rows.map((row) => [row.userId, row.practiceId, row.checkinCount])).toEqual([
      [2, 201, 7],
      [1, 101, 2],
    ]);
    expect(
      buildCohortAdminRoster({ ...base, search: "aMy", selectedPractice: "Yoga" }).map(
        (row) => row.userId
      )
    ).toEqual([1]);
  });
  it("filters known nonmatching practices but preserves unknown members", () => {
    const rows = buildCohortAdminRoster({
      ...base,
      practices: practices.slice(0, 1),
      selectedPractice: "Art",
    });
    expect(rows.map((row) => row.userId)).toEqual([2]);
    expect(rows[0]).toMatchObject({ practiceId: null, practiceStatus: "unavailable" });
  });
  it("chooses title ascending when activity ties or all practices have no activity", () => {
    const sameActivity = activity.map((row) => ({
      ...row,
      lastActivityAt: "2026-11-01T12:00:00Z",
    }));
    expect(buildCohortAdminRoster({ ...base, activity: sameActivity })[0]?.practiceId).toBe(102);
    expect(buildCohortAdminRoster({ ...base, activity: [] })[0]?.practiceId).toBe(102);
    expect(
      buildCohortAdminRoster({ ...base, practices: [...practices].reverse(), activity: [] })[0]
        ?.practiceId
    ).toBe(102);
  });
  it("sorts latest activity both ways and puts unknown activity last", () => {
    const extra = { id: 66, userId: 6, nickname: "No activity", email: null, status: "joined" };
    expect(
      buildCohortAdminRoster({
        ...base,
        enrollments: [...members, extra],
        sortField: "activity",
        sortDirection: "desc",
      }).map((row) => row.userId)
    ).toEqual([2, 1, 6]);
    expect(
      buildCohortAdminRoster({
        ...base,
        enrollments: [...members, extra],
        sortField: "activity",
        sortDirection: "asc",
      }).map((row) => row.userId)
    ).toEqual([1, 2, 6]);
  });
  it("does not mutate query data while sorting", () => {
    const before = JSON.stringify(base);
    buildCohortAdminRoster({ ...base, sortField: "checkins", sortDirection: "desc" });
    expect(JSON.stringify(base)).toBe(before);
  });
});

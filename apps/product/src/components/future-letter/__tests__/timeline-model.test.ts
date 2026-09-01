import { describe, expect, it } from "vitest";
import { buildTimelineCoordinates, getTimelineSummary } from "../timeline-model";

describe("future letter timeline model", () => {
  const now = new Date("2026-08-22T08:00:00.000Z");

  it("places past events, today, and future letters on one ascending date axis", () => {
    const coordinates = buildTimelineCoordinates(
      [
        {
          type: "check-in",
          title: "打卡",
          description: null,
          date: "2026-08-20T08:00:00.000Z",
          meta: {},
        },
      ],
      [
        {
          id: "scheduled",
          currentSelf: "",
          message: "",
          status: "scheduled",
          deliverAt: "2026-08-29T08:00:00.000Z",
          sentAt: now.toISOString(),
          deliveredAt: null,
          openedAt: null,
          practiceId: null,
          practice: null,
          createdAt: now.toISOString(),
          updatedAt: now.toISOString(),
        },
      ],
      now
    );

    expect(coordinates.map((node) => node.kind)).toEqual(["check-in", "today", "scheduled"]);
    expect(coordinates[2]).toMatchObject({ letterId: "scheduled", daysRemaining: 7 });
  });

  it("collapses same-day events into a single dot, keeping the most significant kind", () => {
    const coordinates = buildTimelineCoordinates(
      [
        {
          type: "check-in",
          title: "打卡 1",
          description: null,
          date: "2026-06-07T03:39:39.709Z",
          meta: {},
        },
        {
          type: "check-in",
          title: "打卡 2",
          description: null,
          date: "2026-06-07T03:51:42.184Z",
          meta: {},
        },
        {
          type: "milestone",
          title: "里程碑",
          description: null,
          date: "2026-06-07T04:19:24.867Z",
          meta: {},
        },
        {
          type: "check-in",
          title: "隔天打卡",
          description: null,
          date: "2026-06-08T03:00:00.000Z",
          meta: {},
        },
      ],
      [],
      now
    );

    expect(coordinates.map((node) => node.kind)).toEqual(["milestone", "check-in", "today"]);
    expect(coordinates[0]).toMatchObject({ date: "2026-06-07T04:19:24.867Z" });
  });

  it("distinguishes delivered unopened and opened letters", () => {
    const base = {
      currentSelf: "",
      message: "",
      status: "delivered" as const,
      deliverAt: "2026-08-21T08:00:00.000Z",
      sentAt: "2026-08-18T08:00:00.000Z",
      deliveredAt: "2026-08-21T08:00:00.000Z",
      practiceId: null,
      practice: null,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    };
    const letters = [
      { ...base, id: "unopened", openedAt: null },
      { ...base, id: "opened", openedAt: "2026-08-22T07:00:00.000Z" },
    ];

    expect(buildTimelineCoordinates([], letters, now).map((node) => node.kind)).toContain(
      "delivered-unopened"
    );
    expect(buildTimelineCoordinates([], letters, now).map((node) => node.kind)).toContain("opened");
  });

  it("builds privacy-safe letter nodes from timeline metadata without fetching letter content", () => {
    const coordinates = buildTimelineCoordinates(
      [
        {
          type: "letter",
          title: "寫給未來的信",
          description: null,
          date: "2026-08-29T08:00:00.000Z",
          meta: {
            letterId: "scheduled-from-timeline",
            status: "scheduled",
            openedAt: null,
          },
        },
      ],
      [],
      now
    );

    expect(coordinates.find((node) => node.letterId === "scheduled-from-timeline")).toMatchObject({
      id: "letter-scheduled-from-timeline",
      kind: "scheduled",
      daysRemaining: 7,
    });
  });

  it("creates a compact summary centered around today", () => {
    const coordinates = Array.from({ length: 10 }, (_, index) => ({
      id: index === 5 ? "today" : String(index),
      kind: index === 5 ? ("today" as const) : ("check-in" as const),
      date: `2026-08-${String(index + 1).padStart(2, "0")}T00:00:00.000Z`,
      dateLabel: "",
    }));
    expect(getTimelineSummary(coordinates, undefined, 2).map((node) => node.id)).toEqual([
      "3",
      "4",
      "today",
      "6",
      "7",
    ]);
  });
});

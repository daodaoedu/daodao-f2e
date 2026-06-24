import { describe, expect, it } from "vitest";
import { reorderFeedItems } from "../utils/feed-reorder";
import type { FeedItem } from "../services/feed-hooks";

// ============================================================================
// Test helpers
// ============================================================================

function makePractice(
  id: string,
  opts: {
    feedReason?: "new_practice" | "new_release" | "checked_in" | "cheered";
    userId?: string;
    isBrewing?: boolean;
    lastCheckinSummary?: string | null;
  } = {}
): Extract<FeedItem, { type: "practice" }> {
  return {
    type: "practice",
    feed_reason: opts.feedReason ?? "new_practice",
    data: {
      id,
      title: `Practice ${id}`,
      status: "active",
      privacy_status: "public",
      is_brewing: opts.isBrewing ?? false,
      user: { id: opts.userId ?? "other-user", name: "User", photo_url: null },
      last_checkin_summary: opts.lastCheckinSummary !== undefined ? opts.lastCheckinSummary : "Day 1 check-in",
    },
  };
}

function makeCheckin(
  id: string,
  practiceId: string,
  opts: {
    feedReason?: "checked_in" | "cheered";
    userId?: string;
  } = {}
): Extract<FeedItem, { type: "checkin" }> {
  return {
    type: "checkin",
    feed_reason: opts.feedReason ?? "checked_in",
    data: {
      id,
      checkin_date: "2026-06-01",
      mood: "good",
      note: "test",
      tags: [],
      image_urls: [],
      created_at: "2026-06-01T00:00:00Z",
      practice: { id: practiceId, title: `Practice ${practiceId}` },
      user: { id: opts.userId ?? "other-user", name: "User" },
    },
  };
}

function makeActivity(id: string): Extract<FeedItem, { type: "activity" }> {
  return {
    type: "activity",
    activity_type: "community_event",
    event_text: `Activity ${id}`,
    label: "Activity",
    event_id: id,
    event_type: "reaction",
  };
}

// ============================================================================
// Rule ③: 有打卡的實踐不顯示實踐卡
// ============================================================================

describe("Rule ③: suppress practice card when check-in exists for same practice", () => {
  it("removes practice from feed if a check-in with the same practice_id exists", () => {
    const checkin = makeCheckin("ci-1", "p-1");
    const practice = makePractice("p-1");
    const result = reorderFeedItems([checkin, practice]);
    const types = result.map((i) => i.type);
    expect(types).not.toContain("practice");
    expect(types).toContain("checkin");
  });

  it("keeps practice when no check-in for that practice exists", () => {
    const practice = makePractice("p-2");
    const result = reorderFeedItems([practice]);
    expect(result[0]?.type).toBe("practice");
  });

  it("cheered practice is moved to interactions, not filtered by rule ③", () => {
    const checkin = makeCheckin("ci-1", "p-1");
    const cheeredPractice = makePractice("p-1", { feedReason: "cheered" });
    const result = reorderFeedItems([checkin, cheeredPractice]);
    // cheered practice goes into interactions bucket, not suppressed
    expect(result.some((i) => i.type === "practice" && i.feed_reason === "cheered")).toBe(true);
  });
});

// ============================================================================
// Rule ②: 自己的互動不優先
// ============================================================================

describe("Rule ②: deprioritise own interactions", () => {
  it("pushes own cheered checkin to back of interactions bucket", () => {
    const ownCheckin = makeCheckin("ci-own", "p-own", { feedReason: "cheered", userId: "me" });
    const otherActivity = makeActivity("act-1");
    const result = reorderFeedItems([ownCheckin, otherActivity], "me");
    // activity should come before ownCheckin in interactions
    const interactionItems = result.filter(
      (i) => i.type === "activity" || (i.type === "checkin" && i.feed_reason === "cheered")
    );
    const actIdx = interactionItems.findIndex((i) => i.type === "activity");
    const ownIdx = interactionItems.findIndex(
      (i) => i.type === "checkin" && (i as Extract<FeedItem, { type: "checkin" }>).data.user?.id === "me"
    );
    expect(actIdx).toBeLessThan(ownIdx);
  });

  it("does not reorder interactions when currentUserId is not provided", () => {
    const activity1 = makeActivity("act-1");
    const activity2 = makeActivity("act-2");
    const result = reorderFeedItems([activity1, activity2]);
    expect(result[0]).toEqual(activity1);
    expect(result[1]).toEqual(activity2);
  });
});

// ============================================================================
// Rule ⑤: 1:1:1 cycle
// ============================================================================

describe("Rule ⑤: 1:1:1 interleave cycle", () => {
  it("interleaves checkin, interaction, practice in 1:1:1 order", () => {
    const checkin = makeCheckin("ci-1", "p-ci");
    const activity = makeActivity("act-1");
    const practice = makePractice("p-1");
    const result = reorderFeedItems([checkin, activity, practice]);
    expect(result[0]?.type).toBe("checkin");
    expect(result[1]?.type).toBe("activity");
    expect(result[2]?.type).toBe("practice");
  });

  it("continues the cycle when one bucket runs out first", () => {
    const ci1 = makeCheckin("ci-1", "p-ci-1");
    const ci2 = makeCheckin("ci-2", "p-ci-2");
    const act1 = makeActivity("act-1");
    const p1 = makePractice("p-1");
    const result = reorderFeedItems([ci1, ci2, act1, p1]);
    // expected: ci1, act1, p1, ci2
    expect(result[0]?.type).toBe("checkin");
    expect(result[1]?.type).toBe("activity");
    expect(result[2]?.type).toBe("practice");
    expect(result[3]?.type).toBe("checkin");
  });
});

// ============================================================================
// Rule ④: 主題實踐要有一定內容（filter no-content practices）
// ============================================================================

describe("Rule ④: filter practices with no content", () => {
  it("excludes non-brewing practice with null last_checkin_summary", () => {
    const emptyPractice = makePractice("p-empty", { lastCheckinSummary: null });
    const result = reorderFeedItems([emptyPractice]);
    expect(result).toHaveLength(0);
  });

  it("keeps practice with non-null last_checkin_summary", () => {
    const contentPractice = makePractice("p-content", { lastCheckinSummary: "Day 1 done!" });
    const result = reorderFeedItems([contentPractice]);
    expect(result).toHaveLength(1);
  });

  it("keeps brewing practice even if last_checkin_summary is null", () => {
    const brewingPractice = makePractice("p-brewing", { isBrewing: true, lastCheckinSummary: null });
    const result = reorderFeedItems([brewingPractice]);
    expect(result).toHaveLength(1);
    expect((result[0] as Extract<FeedItem, { type: "practice" }>).data.is_brewing).toBe(true);
  });
});

import type { ActivityCardItem, FeedItem } from "../services/feed-hooks";

/**
 * Reorders feed items into a 1:1:1 cycle: [打卡] → [互動] → [實踐] → repeat.
 *
 * Rules applied in order:
 * ① API provides items sorted by recency; bucket-internal order is preserved.
 * ② Own interactions (currentUserId) are pushed to the back of the interactions bucket.
 * ③ If a check-in exists for a practice, the practice card is suppressed.
 * ④ Non-brewing practices with no content (last_checkin_summary === null) are excluded.
 * ⑤ Final output cycles checkins → interactions → practices at a 1:1:1 ratio.
 */
export function reorderFeedItems(items: FeedItem[], currentUserId?: string | null): FeedItem[] {
  // Rule ③: collect practice_ids that have at least one check-in
  const practiceIdsWithCheckins = new Set<string>();
  for (const item of items) {
    if (item.type === "checkin" && item.data.practice?.id) {
      practiceIdsWithCheckins.add(item.data.practice.id);
    }
  }

  const checkins: Extract<FeedItem, { type: "checkin" }>[] = [];
  const interactions: FeedItem[] = [];
  const practices: Extract<FeedItem, { type: "practice" }>[] = [];

  for (const item of items) {
    if (item.type === "checkin") {
      if (item.feed_reason === "cheered") {
        interactions.push(item);
      } else {
        checkins.push(item);
      }
    } else if (item.type === "practice") {
      if (item.feed_reason === "cheered") {
        interactions.push(item);
      } else if (!practiceIdsWithCheckins.has(item.data.id)) {
        // Rule ③: suppress practice card when a check-in exists for the same practice
        // Rule ④: exclude non-brewing practices that have no content (no check-ins ever recorded)
        const hasContent = item.data.last_checkin_summary != null;
        const isBrewing = item.data.is_brewing === true;
        if (hasContent || isBrewing) {
          practices.push(item);
        }
      }
    } else if (item.type === "activity") {
      interactions.push(item as ActivityCardItem);
    }
  }

  // Rule ②: push own interactions to the back of the interactions bucket
  if (currentUserId) {
    const isOwn = (item: FeedItem): boolean =>
      (item.type === "checkin" || item.type === "practice") && item.data.user?.id === currentUserId;
    const others = interactions.filter((i) => !isOwn(i));
    const own = interactions.filter((i) => isOwn(i));
    interactions.length = 0;
    interactions.push(...others, ...own);
  }

  // Rule ⑤: interleave in 1:1:1 cycle
  const result: FeedItem[] = [];
  let ci = 0;
  let ii = 0;
  let pi = 0;

  while (ci < checkins.length || ii < interactions.length || pi < practices.length) {
    if (ci < checkins.length) result.push(checkins[ci++]!);
    if (ii < interactions.length) result.push(interactions[ii++]!);
    if (pi < practices.length) result.push(practices[pi++]!);
  }

  return result;
}

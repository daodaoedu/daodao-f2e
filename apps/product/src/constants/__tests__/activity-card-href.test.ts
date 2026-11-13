import { describe, expect, it } from "vitest";
import { resolveActivityCardHref } from "../activity-card-href";

describe("resolveActivityCardHref", () => {
  it("joined and non-joined users both open the activity detail page first", () => {
    expect(resolveActivityCardHref({ id: 150, isJoined: true })).toBe("/activities/150");
    expect(resolveActivityCardHref({ id: 150, isJoined: false })).toBe("/activities/150");
  });
});

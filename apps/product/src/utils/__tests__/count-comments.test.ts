import { describe, expect, it } from "vitest";
import { countTotalComments } from "../count-comments";

describe("countTotalComments", () => {
  it("returns 0 for empty array", () => {
    expect(countTotalComments([])).toBe(0);
  });

  it("counts only first-level comments when there are no replies", () => {
    const comments = [{ id: 1 }, { id: 2 }, { id: 3 }];
    expect(countTotalComments(comments)).toBe(3);
  });

  it("includes second-level reply comments in total", () => {
    const comments = [
      { id: 1, replies: [{ id: 10 }, { id: 11 }] },
      { id: 2, replies: [{ id: 12 }] },
    ];
    expect(countTotalComments(comments)).toBe(5); // 2 top + 3 replies
  });

  it("handles comments with empty replies array", () => {
    const comments = [{ id: 1, replies: [] }, { id: 2 }];
    expect(countTotalComments(comments)).toBe(2);
  });

  it("handles comments with no replies field", () => {
    const comments = [{ id: 1 }, { id: 2, replies: [{ id: 20 }] }];
    expect(countTotalComments(comments)).toBe(3); // 2 top + 1 reply
  });

  it("handles mixed comments with and without replies", () => {
    const comments = [
      { id: 1, replies: [{ id: 10 }, { id: 11 }, { id: 12 }] },
      { id: 2 },
      { id: 3, replies: [{ id: 13 }] },
    ];
    expect(countTotalComments(comments)).toBe(7); // 3 top + 3 + 0 + 1 replies
  });
});

import { describe, expect, it } from "vitest";
import {
  filterActivityNotifications,
  isActivityNotification,
} from "../filter-notifications";

describe("isActivityNotification", () => {
  it("returns true for ConnectRequestActivity", () => {
    expect(isActivityNotification("ConnectRequestActivity")).toBe(true);
  });

  it("returns true for UserFollowActivity", () => {
    expect(isActivityNotification("UserFollowActivity")).toBe(true);
  });

  it("returns false for Connect (direct request to current user)", () => {
    expect(isActivityNotification("Connect")).toBe(false);
  });

  it("returns false for UserFollowed", () => {
    expect(isActivityNotification("UserFollowed")).toBe(false);
  });

  it("returns false for reaction", () => {
    expect(isActivityNotification("reaction")).toBe(false);
  });

  it("returns false for PracticeCreated", () => {
    expect(isActivityNotification("PracticeCreated")).toBe(false);
  });
});

describe("filterActivityNotifications", () => {
  it("removes ConnectRequestActivity items from the list", () => {
    const items = [
      { type: "ConnectRequestActivity", id: 1 },
      { type: "Connect", id: 2 },
    ];
    expect(filterActivityNotifications(items)).toEqual([{ type: "Connect", id: 2 }]);
  });

  it("removes UserFollowActivity items from the list", () => {
    const items = [
      { type: "UserFollowActivity", id: 1 },
      { type: "UserFollowed", id: 2 },
    ];
    expect(filterActivityNotifications(items)).toEqual([{ type: "UserFollowed", id: 2 }]);
  });

  it("removes both activity types when mixed", () => {
    const items = [
      { type: "ConnectRequestActivity", id: 1 },
      { type: "reaction", id: 2 },
      { type: "UserFollowActivity", id: 3 },
      { type: "Connect", id: 4 },
    ];
    expect(filterActivityNotifications(items)).toEqual([
      { type: "reaction", id: 2 },
      { type: "Connect", id: 4 },
    ]);
  });

  it("returns all items when none are activity types", () => {
    const items = [
      { type: "reaction", id: 1 },
      { type: "comment", id: 2 },
      { type: "PracticeCreated", id: 3 },
    ];
    expect(filterActivityNotifications(items)).toEqual(items);
  });

  it("returns empty array when all items are activity types", () => {
    const items = [
      { type: "ConnectRequestActivity", id: 1 },
      { type: "UserFollowActivity", id: 2 },
    ];
    expect(filterActivityNotifications(items)).toEqual([]);
  });

  it("returns empty array for empty input", () => {
    expect(filterActivityNotifications([])).toEqual([]);
  });
});

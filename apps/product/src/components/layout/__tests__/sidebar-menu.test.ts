import { describe, expect, it } from "vitest";
import { menuItems } from "../sidebar/constant";

const spaces = menuItems.find((item) => item.labelKey === "nav_spaces");

describe("sidebar 空間 nav item", () => {
  it("is active on space pages", () => {
    expect(spaces?.isMatch("/spaces/challenge", "")).toBe(true);
  });

  // daodao#181：探索共同挑戰頁從「共同挑戰」空間進入，POC 側邊導覽在這頁標示「空間」
  it("is active on the explore challenges page", () => {
    expect(spaces?.isMatch("/challenges", "")).toBe(true);
  });

  it("is not active on unrelated pages", () => {
    expect(spaces?.isMatch("/messages", "")).toBe(false);
  });
});

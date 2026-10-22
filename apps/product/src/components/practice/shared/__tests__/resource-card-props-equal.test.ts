import { describe, expect, it } from "vitest";
import { areResourceCardPropsEqual } from "../resource-card-props-equal";

const resource = { id: "r1", name: "整段期間參考", url: "https://example.com/all" };

describe("areResourceCardPropsEqual", () => {
  it("skips re-render when nothing changed", () => {
    const onRemove = () => {};
    expect(areResourceCardPropsEqual({ resource, onRemove }, { resource, onRemove })).toBe(true);
  });

  // 編輯頁先新增資源再移除另一筆，新增的那筆一起消失：卡片沒重繪，移除鈕仍拿著新增前的資源清單
  it("re-renders when onRemove changes so the remove button sees the latest list", () => {
    expect(
      areResourceCardPropsEqual({ resource, onRemove: () => {} }, { resource, onRemove: () => {} })
    ).toBe(false);
  });

  it("re-renders when onClick changes", () => {
    expect(
      areResourceCardPropsEqual({ resource, onClick: () => {} }, { resource, onClick: () => {} })
    ).toBe(false);
  });

  it("re-renders when resource content changes", () => {
    expect(
      areResourceCardPropsEqual({ resource }, { resource: { ...resource, name: "改名" } })
    ).toBe(false);
  });
});

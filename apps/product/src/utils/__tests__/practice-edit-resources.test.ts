import { describe, expect, it } from "vitest";
import { toEditFormResources, toUpdateResourcesPayload } from "../practice-edit-resources";

describe("practice edit resources (daodao#332)", () => {
  const apiResources = [
    { id: "r1", name: "覆盤模板", url: "https://example.com/a", dayNumber: 2 },
    { id: "r2", name: "整段可用", url: "https://example.com/b", dayNumber: null },
    { id: "r3", name: "純名稱", isLocked: true },
  ];

  it("keeps dayNumber when loading resources into the form", () => {
    expect(toEditFormResources(apiResources)).toEqual([
      { id: "r1", name: "覆盤模板", url: "https://example.com/a", isLocked: false, dayNumber: 2 },
      {
        id: "r2",
        name: "整段可用",
        url: "https://example.com/b",
        isLocked: false,
        dayNumber: null,
      },
      { id: "r3", name: "純名稱", url: "", isLocked: true, dayNumber: null },
    ]);
  });

  it("round-trips untouched resources without dropping dayNumber", () => {
    expect(toUpdateResourcesPayload(toEditFormResources(apiResources))).toEqual([
      { name: "覆盤模板", url: "https://example.com/a", dayNumber: 2 },
      { name: "整段可用", url: "https://example.com/b" },
      { name: "純名稱", url: undefined },
    ]);
  });

  it("keeps other resources' dayNumber when one is added and one is removed", () => {
    const formResources = toEditFormResources(apiResources).filter((r) => r.id !== "r2");
    formResources.push({ id: "new", name: "新資源", url: "https://example.com/new" });

    expect(toUpdateResourcesPayload(formResources)).toEqual([
      { name: "覆盤模板", url: "https://example.com/a", dayNumber: 2 },
      { name: "純名稱", url: undefined },
      { name: "新資源", url: "https://example.com/new" },
    ]);
  });
});

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
      {
        id: "r1",
        persistedId: "r1",
        name: "覆盤模板",
        url: "https://example.com/a",
        isLocked: false,
        dayNumber: 2,
      },
      {
        id: "r2",
        persistedId: "r2",
        name: "整段可用",
        url: "https://example.com/b",
        isLocked: false,
        dayNumber: null,
      },
      {
        id: "r3",
        persistedId: "r3",
        name: "純名稱",
        url: "",
        isLocked: true,
        dayNumber: null,
        relevantDate: null,
      },
    ]);
  });

  it("round-trips untouched resources without dropping dayNumber", () => {
    expect(toUpdateResourcesPayload(toEditFormResources(apiResources))).toEqual([
      { id: "r1", name: "覆盤模板", url: "https://example.com/a", dayNumber: 2 },
      { id: "r2", name: "整段可用", url: "https://example.com/b" },
      { id: "r3", name: "純名稱", url: undefined, relevantDate: null },
    ]);
  });

  it("keeps other resources' dayNumber when one is added and one is removed", () => {
    const formResources = toEditFormResources(apiResources).filter((r) => r.id !== "r2");
    formResources.push({ id: "new", name: "新資源", url: "https://example.com/new" });

    expect(toUpdateResourcesPayload(formResources)).toEqual([
      { id: "r1", name: "覆盤模板", url: "https://example.com/a", dayNumber: 2 },
      { id: "r3", name: "純名稱", url: undefined, relevantDate: null },
      { name: "新資源", url: "https://example.com/new" },
    ]);
  });
});

describe("shared cohort resource round-trip (#401)", () => {
  it("keeps the shared UUID and optional activity date without assigning it to personal resources", () => {
    const values = toUpdateResourcesPayload(
      toEditFormResources([
        {
          id: "shared-uuid",
          name: "活動講義",
          url: "http://example.com/",
          isLocked: true,
          relevantDate: "2027-01-01",
        },
        {
          id: "personal-uuid",
          name: "個人筆記",
          url: "https://example.com/personal",
          isLocked: false,
        },
      ])
    );
    expect(values).toEqual([
      {
        id: "shared-uuid",
        name: "活動講義",
        url: "http://example.com/",
        relevantDate: "2027-01-01",
      },
      { id: "personal-uuid", name: "個人筆記", url: "https://example.com/personal" },
    ]);
  });
});

it("preserves persisted personal IDs in API order while omitting client draft IDs", () => {
  const original = toEditFormResources([
    { id: "uuid-newer", name: "X", url: "https://example.com/x" },
    { id: "uuid-older", name: "W", url: "https://example.com/w" },
  ]);
  expect(
    toUpdateResourcesPayload([
      ...original,
      { id: "1793000123000", name: "Y", url: "https://example.com/y" },
    ])
  ).toEqual([
    { id: "uuid-newer", name: "X", url: "https://example.com/x" },
    { id: "uuid-older", name: "W", url: "https://example.com/w" },
    { name: "Y", url: "https://example.com/y" },
  ]);
});

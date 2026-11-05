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
      { id: "r2", name: "整段可用", url: "https://example.com/b", dayNumber: null },
      { id: "r3", name: "純名稱", url: undefined, relevantDate: null },
    ]);
  });

  it("keeps other resources' dayNumber when one is added and one is removed", () => {
    const formResources = toEditFormResources(apiResources).filter((r) => r.id !== "r2");
    formResources.push({ id: "new", name: "新資源", url: "https://example.com/new" });

    expect(toUpdateResourcesPayload(formResources)).toEqual([
      { id: "r1", name: "覆盤模板", url: "https://example.com/a", dayNumber: 2 },
      { id: "r3", name: "純名稱", url: undefined, relevantDate: null },
      { name: "新資源", url: "https://example.com/new", dayNumber: null },
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
      {
        id: "personal-uuid",
        name: "個人筆記",
        url: "https://example.com/personal",
        dayNumber: null,
      },
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
    { id: "uuid-newer", name: "X", url: "https://example.com/x", dayNumber: null },
    { id: "uuid-older", name: "W", url: "https://example.com/w", dayNumber: null },
    { name: "Y", url: "https://example.com/y", dayNumber: null },
  ]);
});

it("explicitly clears a persisted personal date while preserving its identity (#376/#401)", () => {
  const original = toEditFormResources([
    { id: "personal-date", name: "日期資源", dayNumber: 7, isLocked: false },
    { id: "shared-date", name: "共享資源", relevantDate: "2027-01-01", isLocked: true },
  ]);
  const changed = original.map((resource) =>
    resource.id === "personal-date" ? { ...resource, dayNumber: null } : resource
  );
  expect(toUpdateResourcesPayload(changed)).toEqual([
    { id: "personal-date", name: "日期資源", url: undefined, dayNumber: null },
    { id: "shared-date", name: "共享資源", url: undefined, relevantDate: "2027-01-01" },
  ]);
});

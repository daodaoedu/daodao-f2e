import { describe, expect, it } from "vitest";
import {
  buildHomeFeedQuery,
  buildSpaceFilterOptions,
  getSpaceFilterSummary,
  parseSpaceFilterParams,
  sanitizeSpaceSelection,
  toggleSpaceFilter,
} from "../feed-space-filter";

describe("parseSpaceFilterParams", () => {
  it("keeps valid values in order and drops duplicates", () => {
    expect(parseSpaceFilterParams(["challenge", "personal", "cohort:12", "challenge"])).toEqual([
      "challenge",
      "personal",
      "cohort:12",
    ]);
  });

  it("drops unknown or malformed values so a bad URL never reaches the API", () => {
    expect(
      parseSpaceFilterParams(["all", "cohort:", "cohort:abc", "cohort:0", "Personal", ""])
    ).toEqual([]);
  });
});

describe("buildSpaceFilterOptions", () => {
  it("always offers personal and challenge, then each joined event course", () => {
    const options = buildSpaceFilterOptions([
      { kind: "personal", id: null, name: "個人實踐" },
      { kind: "challenge", id: null, name: "共同挑戰" },
      { kind: "event_course", id: "12", name: "自我覺察練習" },
      { kind: "event_course", id: "3", name: "線上讀書會" },
    ]);
    expect(options).toEqual([
      { value: "personal", kind: "personal" },
      { value: "challenge", kind: "challenge" },
      { value: "cohort:12", kind: "event_course", name: "自我覺察練習" },
      { value: "cohort:3", kind: "event_course", name: "線上讀書會" },
    ]);
  });

  it("offers only the fixed spaces when the user has no spaces (or is logged out)", () => {
    expect(buildSpaceFilterOptions(undefined)).toEqual([
      { value: "personal", kind: "personal" },
      { value: "challenge", kind: "challenge" },
    ]);
  });

  it("skips event courses without an id", () => {
    expect(
      buildSpaceFilterOptions([{ kind: "event_course", id: null, name: "壞資料" }]).map(
        (o) => o.value
      )
    ).toEqual(["personal", "challenge"]);
  });
});

describe("toggleSpaceFilter", () => {
  it("adds an unselected space and removes a selected one", () => {
    expect(toggleSpaceFilter([], "personal")).toEqual(["personal"]);
    expect(toggleSpaceFilter(["personal", "cohort:3"], "personal")).toEqual(["cohort:3"]);
  });
});

describe("sanitizeSpaceSelection", () => {
  const options = buildSpaceFilterOptions([{ kind: "event_course", id: "12", name: "A" }]);

  it("drops courses the user no longer belongs to", () => {
    expect(sanitizeSpaceSelection(["personal", "cohort:99", "cohort:12"], options)).toEqual([
      "personal",
      "cohort:12",
    ]);
  });
});

describe("getSpaceFilterSummary", () => {
  const options = buildSpaceFilterOptions([{ kind: "event_course", id: "12", name: "A" }]);

  it("is 'all' when nothing is selected", () => {
    expect(getSpaceFilterSummary([], options)).toEqual({ type: "all" });
  });

  it("names the single selected option", () => {
    expect(getSpaceFilterSummary(["cohort:12"], options)).toEqual({
      type: "single",
      option: { value: "cohort:12", kind: "event_course", name: "A" },
    });
  });

  it("counts multiple selections", () => {
    expect(getSpaceFilterSummary(["personal", "challenge"], options)).toEqual({
      type: "multiple",
      count: 2,
    });
  });
});

describe("buildHomeFeedQuery", () => {
  it("serialises keyword, tags and spaces", () => {
    expect(
      buildHomeFeedQuery({ keyword: "讀書", tags: ["a"], spaces: ["personal", "cohort:3"] })
    ).toBe("keyword=%E8%AE%80%E6%9B%B8&tags%5B%5D=a&spaces=personal&spaces=cohort%3A3");
  });

  it("is empty when nothing is set", () => {
    expect(buildHomeFeedQuery({ keyword: "", tags: [], spaces: [] })).toBe("");
  });
});

import { describe, expect, it } from "vitest";
import {
  extractCreatedNames,
  getStepForServerPath,
  mapServerPathToFormField,
  parseServerError,
} from "../submit-utils";

describe("parseServerError", () => {
  it("unwraps nested { error: { message, details[] } }", () => {
    const parsed = parseServerError({
      error: {
        message: "驗證失敗",
        details: [{ path: "title", message: "太長" }, { path: "tags" }],
      },
    });
    expect(parsed.message).toBe("驗證失敗");
    expect(parsed.details).toEqual([
      { path: "title", message: "太長" },
      { path: "tags", message: undefined },
    ]);
  });

  it("accepts flat { message, details: { path: message } } objects", () => {
    const parsed = parseServerError({
      message: "VALIDATION",
      details: { durationDays: "超出範圍", ignored: 1 },
    });
    expect(parsed.message).toBe("VALIDATION");
    expect(parsed.details).toEqual([{ path: "durationDays", message: "超出範圍" }]);
  });

  it("returns empty result for non-object errors", () => {
    expect(parseServerError("boom")).toEqual({ message: null, details: [] });
    expect(parseServerError(null)).toEqual({ message: null, details: [] });
  });
});

describe("getStepForServerPath", () => {
  it.each([
    ["title", 1],
    ["practiceAction", 1],
    ["startDate", 2],
    ["durationDays", 2],
    ["frequencyMinDays", 2],
    ["frequencyMaxDays", 2],
    ["sessionDurationMinutes", 2],
    ["practiceTimePeriods", 2],
    ["otherContext", 2],
    ["segments", 2],
    ["segments.1.startDate", 2],
    ["segments.0.title", 2],
    ["tags", 3],
    ["suggestedTags", 3],
    ["resources", 3],
    ["resources.0.url", 3],
  ])("%s → step %i", (path, step) => {
    expect(getStepForServerPath(path)).toBe(step);
  });

  it("returns null for unknown paths", () => {
    expect(getStepForServerPath("privacyStatus")).toBeNull();
    expect(getStepForServerPath("")).toBeNull();
  });
});

describe("mapServerPathToFormField", () => {
  it.each([
    ["title", "name"],
    ["practiceAction", "action"],
    ["startDate", "startDate"],
    ["durationDays", "durationDays"],
    ["frequencyMinDays", "frequency"],
    ["frequencyMaxDays", "frequency"],
    ["sessionDurationMinutes", "sessionMinutes"],
    ["practiceTimePeriods", "timings"],
    ["otherContext", "customTimings"],
    ["tags", "tags"],
    ["suggestedTags", "tags"],
    ["resources", "resources"],
    ["resources.2.url", "resources.2.url"],
    ["segments", "segments"],
    ["segments.1", "segments"],
    ["segments.1.title", "segments.1.name"],
    ["segments.1.practiceAction", "segments.1.action"],
    ["segments.1.durationDays", "segments.1.days"],
    ["segments.2.frequencyMinDays", "segments.2.frequency"],
    ["segments.0.sessionDurationMinutes", "segments.0.minutes"],
    ["segments.0.startDate", "startDate"],
  ])("%s → %s", (path, field) => {
    expect(mapServerPathToFormField(path)).toBe(field);
  });

  it("returns null for unmapped paths", () => {
    expect(mapServerPathToFormField("privacyStatus")).toBeNull();
    expect(mapServerPathToFormField("segments.1.privacyStatus")).toBeNull();
  });
});

describe("extractCreatedNames", () => {
  it("reads a single practice / template title", () => {
    expect(extractCreatedNames({ success: true, data: { id: "1", title: "晨讀" } })).toEqual([
      "晨讀",
    ]);
  });

  it("reads batch practices in order", () => {
    expect(
      extractCreatedNames({
        data: { practices: [{ title: "A (1)" }, { title: "A (2)" }, { title: "A (3)" }] },
      })
    ).toEqual(["A (1)", "A (2)", "A (3)"]);
  });

  it("reads batch templates in order", () => {
    expect(
      extractCreatedNames({ data: { templates: [{ title: "T1" }, { title: "T2" }] } })
    ).toEqual(["T1", "T2"]);
  });

  it("skips malformed items and returns [] for unknown shapes", () => {
    expect(
      extractCreatedNames({ data: { practices: [{ title: 1 }, null, { title: "ok" }] } })
    ).toEqual(["ok"]);
    expect(extractCreatedNames(undefined)).toEqual([]);
    expect(extractCreatedNames({ data: null })).toEqual([]);
  });
});

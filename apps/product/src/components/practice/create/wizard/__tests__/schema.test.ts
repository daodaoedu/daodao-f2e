import { addDays, format } from "date-fns";
import { describe, expect, it } from "vitest";
import {
  defaultWizardValues,
  emptySegmentOverride,
  SEGMENTS_MAX,
  type WizardFormValues,
  WizardMode,
  wizardFormSchema,
} from "../schema";

const today = format(new Date(), "yyyy-MM-dd");

const base = (overrides: Partial<WizardFormValues> = {}): WizardFormValues => ({
  ...defaultWizardValues(WizardMode.personal, today),
  action: "每天閱讀 30 頁",
  durationDays: 14,
  frequency: "3-5",
  ...overrides,
});

const issuesOf = (values: WizardFormValues) => {
  const result = wizardFormSchema.safeParse(values);
  return result.success
    ? []
    : result.error.issues.map((i) => ({ path: i.path.join("."), message: i.message }));
};

describe("wizardFormSchema — Step 2 驗證彙總", () => {
  it("accepts a minimal valid personal practice", () => {
    expect(issuesOf(base())).toEqual([]);
  });

  it("requires action (blank → wizard_validation_action_required)", () => {
    const issues = issuesOf(base({ action: "   " }));
    expect(
      issues.some((i) => i.path === "action" && i.message === "wizard_validation_action_required")
    ).toBe(true);
  });

  it("caps action at 50 chars", () => {
    expect(issuesOf(base({ action: "字".repeat(50) }))).toEqual([]);
    expect(issuesOf(base({ action: "字".repeat(51) })).some((i) => i.path === "action")).toBe(true);
  });

  it("personal mode requires startDate; template mode does not", () => {
    expect(
      issuesOf(base({ startDate: "" })).some(
        (i) => i.path === "startDate" && i.message === "validation_start_date_required"
      )
    ).toBe(true);
    expect(issuesOf(base({ mode: WizardMode.template, startDate: "" }))).toEqual([]);
  });

  it("startDate must be within today..+14", () => {
    expect(issuesOf(base({ startDate: format(addDays(new Date(), 14), "yyyy-MM-dd") }))).toEqual(
      []
    );
    expect(
      issuesOf(base({ startDate: format(addDays(new Date(), 15), "yyyy-MM-dd") })).some(
        (i) => i.path === "startDate"
      )
    ).toBe(true);
    expect(
      issuesOf(base({ startDate: format(addDays(new Date(), -1), "yyyy-MM-dd") })).some(
        (i) => i.path === "startDate" && i.message === "validation_start_date_too_early"
      )
    ).toBe(true);
  });

  it("requires durationDays (null → validation_duration_required) and bounds 1–90", () => {
    expect(
      issuesOf(base({ durationDays: null })).some(
        (i) => i.path === "durationDays" && i.message === "validation_duration_required"
      )
    ).toBe(true);
    expect(issuesOf(base({ durationDays: 90 }))).toEqual([]);
    expect(issuesOf(base({ durationDays: 91 })).some((i) => i.path === "durationDays")).toBe(true);
    expect(issuesOf(base({ durationDays: 0 })).some((i) => i.path === "durationDays")).toBe(true);
  });

  it("unsegmented requires frequency", () => {
    expect(
      issuesOf(base({ frequency: "" })).some(
        (i) => i.path === "frequency" && i.message === "validation_frequency_required"
      )
    ).toBe(true);
  });

  it("segmented: every segment needs a frequency (override or inherited)", () => {
    const values = base({
      durationDays: 60,
      frequency: "",
      isSegmented: true,
      segments: [emptySegmentOverride(), { ...emptySegmentOverride(), frequency: "2-4" }],
    });
    const issues = issuesOf(values);
    expect(
      issues.some(
        (i) =>
          i.path === "segments.0.frequency" &&
          i.message === "wizard_validation_segment_frequency_required"
      )
    ).toBe(true);
    expect(issues.some((i) => i.path === "segments.1.frequency")).toBe(false);
  });

  it("segmented: inherited global frequency satisfies every segment", () => {
    const values = base({
      durationDays: 60,
      frequency: "3-5",
      isSegmented: true,
      segments: [emptySegmentOverride(), emptySegmentOverride()],
    });
    expect(issuesOf(values)).toEqual([]);
  });

  it("segmented: days must add up (auto allocation passes, override mismatch fails with totals)", () => {
    const ok = base({
      durationDays: 40,
      isSegmented: true,
      segments: [emptySegmentOverride(), emptySegmentOverride(), emptySegmentOverride()],
    });
    expect(issuesOf(ok)).toEqual([]);

    const bad = base({
      durationDays: 40,
      isSegmented: true,
      segments: [
        { ...emptySegmentOverride(), days: 10 },
        emptySegmentOverride(),
        emptySegmentOverride(),
      ],
    });
    const issue = issuesOf(bad).find((i) => i.path === "segments");
    expect(issue?.message).toBe("wizard_validation_segment_days_sum");
  });

  it("segmented: 2–3 segments only", () => {
    const one = base({ durationDays: 40, isSegmented: true, segments: [emptySegmentOverride()] });
    expect(
      issuesOf(one).some(
        (i) => i.path === "segments" && i.message === "wizard_validation_segment_count"
      )
    ).toBe(true);
    const four = base({
      durationDays: 40,
      isSegmented: true,
      segments: Array.from({ length: SEGMENTS_MAX + 1 }, emptySegmentOverride),
    });
    expect(issuesOf(four).some((i) => i.path === "segments")).toBe(true);
  });

  it("sessionMinutes bounds 1–999", () => {
    expect(issuesOf(base({ sessionMinutes: 999 }))).toEqual([]);
    expect(issuesOf(base({ sessionMinutes: 1000 })).some((i) => i.path === "sessionMinutes")).toBe(
      true
    );
  });

  it("resources: name required, url must be https or empty", () => {
    const named = base({
      resources: [{ id: "1", name: "圖書館的書", url: "", segmentIndexes: [] }],
    });
    expect(issuesOf(named)).toEqual([]);
    const http = base({
      resources: [{ id: "1", name: "x", url: "http://example.com", segmentIndexes: [] }],
    });
    expect(
      issuesOf(http).some(
        (i) => i.path === "resources.0.url" && i.message === "wizard_resource_url_https"
      )
    ).toBe(true);
    const unnamed = base({ resources: [{ id: "1", name: " ", url: "", segmentIndexes: [] }] });
    expect(issuesOf(unnamed).some((i) => i.path === "resources.0.name")).toBe(true);
  });
});

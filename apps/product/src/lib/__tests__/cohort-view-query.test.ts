import { describe, expect, it, vi } from "vitest";

vi.mock("@daodao/i18n/navigation", () => ({ useSearchParams: () => new URLSearchParams() }));

import { buildCohortViewQuery } from "../cohort-view-query";

const params = (query: string) => new URLSearchParams(query);

describe("buildCohortViewQuery", () => {
  it("keeps visitor preview across practice and check-in navigation, dropping other params", () => {
    expect(buildCohortViewQuery(params("view=visitor"))).toBe("?view=visitor");
    expect(buildCohortViewQuery(params("view=visitor&tab=resources&cohortId=7"))).toBe(
      "?view=visitor"
    );
  });

  it("keeps only cohort context keys for cohort views", () => {
    expect(
      buildCohortViewQuery(params("view=cohort-admin&programId=1&cohortId=2&tab=checkins"))
    ).toBe("?view=cohort-admin&programId=1&cohortId=2");
  });

  it("returns an empty query for the normal view or unknown views", () => {
    expect(buildCohortViewQuery(params(""))).toBe("");
    expect(buildCohortViewQuery(params("tab=resources"))).toBe("");
    expect(buildCohortViewQuery(params("view=owner"))).toBe("");
  });
});

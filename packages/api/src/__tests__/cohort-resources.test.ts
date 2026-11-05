import { beforeEach, describe, expect, it, vi } from "vitest";

const api = vi.hoisted(() => ({ GET: vi.fn(), PUT: vi.fn() }));
vi.mock("../client", () => ({ client: api }));

import {
  getCoachResourceBindings,
  getCohortTemplateResources,
  saveCohortTemplateResources,
} from "../services/cohort";

describe("cohort resources API contract", () => {
  beforeEach(() => vi.clearAllMocks());
  it("loads the exact binding without replacing its organization", async () => {
    api.GET.mockResolvedValue({ data: { data: [] } });
    await getCohortTemplateResources(8, 10, 20);
    expect(api.GET).toHaveBeenCalledWith(
      "/api/v1/lighthouse/organizations/{organizationId}/templates/{templateId}/cohorts/{cohortId}/resources",
      { params: { path: { organizationId: 8, templateId: 10, cohortId: 20 } } }
    );
  });
  it("retains stable IDs and dates while adding new resources", async () => {
    const resources = [
      { id: 31, name: "講義", url: "http://example.com/", relevantDate: "2027-01-01" },
      { name: "課堂筆記", url: "", relevantDate: null },
    ];
    const failure = { error: { message: "儲存失敗" } };
    api.PUT.mockResolvedValue(failure);
    expect(await saveCohortTemplateResources(8, 10, 20, resources)).toBe(failure);
    expect(api.PUT).toHaveBeenCalledWith(
      "/api/v1/lighthouse/organizations/{organizationId}/templates/{templateId}/cohorts/{cohortId}/resources",
      { params: { path: { organizationId: 8, templateId: 10, cohortId: 20 } }, body: { resources } }
    );
  });
  it("loads the authenticated leader's bindings without a client-supplied user", async () => {
    api.GET.mockResolvedValue({ data: { data: [] } });
    await getCoachResourceBindings();
    expect(api.GET).toHaveBeenCalledWith("/api/v1/lighthouse/my-cohort-resource-bindings");
  });
});

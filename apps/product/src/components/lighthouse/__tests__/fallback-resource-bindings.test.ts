import { describe, expect, it } from "vitest";
import { getFallbackResourceBindings } from "../fallback-resource-bindings";

const bindings = [
  { organizationId: 1, templateId: 10, cohortId: 100 },
  { organizationId: 1, templateId: 20, cohortId: 200 },
  { organizationId: 2, templateId: 10, cohortId: 300 },
];

describe("coach resource entry fallback (#401 review)", () => {
  it("keeps same-organization archived templates when they are absent from the actual template list", () => {
    expect(getFallbackResourceBindings(bindings, 1, [{ id: 10 }])).toEqual([
      bindings[1],
      bindings[2],
    ]);
  });
  it("does not duplicate a reachable template entry, including when its card is temporarily hidden by search", () => {
    const actualTemplates = [{ id: 10 }, { id: 20 }];
    // The source is the API list, not the search-filtered card list.
    expect(getFallbackResourceBindings(bindings, 1, actualTemplates)).toEqual([bindings[2]]);
  });
  it("keeps all authorized bindings when there is no organization or no reachable template", () => {
    expect(getFallbackResourceBindings(bindings, undefined, [])).toEqual(bindings);
    expect(getFallbackResourceBindings(bindings, 1, [])).toEqual(bindings);
  });
});

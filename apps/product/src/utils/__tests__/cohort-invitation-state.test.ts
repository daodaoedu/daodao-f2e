import { describe, expect, it } from "vitest";
import { resolveCohortInvitationState } from "../cohort-invitation-state";

const ready = { isLoading: false, isValidating: false, data: { data: [] } };
const input = { isAuthenticated: true, isAuthLoading: false, cohortId: 547, membership: ready };

describe("cohort invitation state", () => {
  it.each(["published", "archived", "draft"])("recognizes membership in a %s cohort", (status) => {
    expect(
      resolveCohortInvitationState({
        ...input,
        membership: { ...ready, data: { data: [{ cohortId: 547, status }] } },
      })
    ).toBe("joined");
  });
  it("keeps the consent flow for a non-member", () => {
    expect(resolveCohortInvitationState(input)).toBe("consent");
  });
  it("does not use membership of another cohort", () => {
    expect(
      resolveCohortInvitationState({
        ...input,
        membership: { ...ready, data: { data: [{ cohortId: 548, status: "published" }] } },
      })
    ).toBe("consent");
  });
  it("waits for authentication even with cached membership", () => {
    expect(
      resolveCohortInvitationState({
        ...input,
        isAuthLoading: true,
        membership: { ...ready, data: { data: [{ cohortId: 547, status: "published" }] } },
      })
    ).toBe("loading");
  });
  it("waits for the first membership response", () => {
    expect(
      resolveCohortInvitationState({ ...input, membership: { ...ready, data: undefined } })
    ).toBe("loading");
  });
  it("waits during revalidation rather than trusting cached membership", () => {
    expect(
      resolveCohortInvitationState({
        ...input,
        membership: {
          ...ready,
          isValidating: true,
          data: { data: [{ cohortId: 547, status: "published" }] },
        },
      })
    ).toBe("loading");
  });
  it.each([
    "error",
    "validationError",
  ])("shows retry for %s even with stale member data", (field) => {
    expect(
      resolveCohortInvitationState({
        ...input,
        membership: {
          ...ready,
          data: { data: [{ cohortId: 547, status: "joined" }] },
          [field]: new Error("query failed"),
        },
      })
    ).toBe("error");
  });
  it("preserves the anonymous invitation flow without consulting member data", () => {
    expect(
      resolveCohortInvitationState({
        ...input,
        isAuthenticated: false,
        membership: { ...ready, isLoading: true, error: new Error("disabled") },
      })
    ).toBe("consent");
  });
});

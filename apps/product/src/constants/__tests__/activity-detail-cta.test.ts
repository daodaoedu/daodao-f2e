import { describe, expect, it } from "vitest";
import { resolveActivityDetailCta } from "../activity-detail-cta";

type Input = Parameters<typeof resolveActivityDetailCta>[0];

const base: Input = {
  id: 22,
  isJoined: false,
  canJoin: true,
  runStatus: "upcoming",
  unavailableReason: null,
  joinToken: "tok-abc",
  signupMethod: "island_form",
  externalSignupUrl: null,
};

const make = (patch: Partial<Input>): Input => ({ ...base, ...patch });

describe("resolveActivityDetailCta", () => {
  it("joined user goes to the cohort page, even when the activity has ended", () => {
    expect(resolveActivityDetailCta(make({ isJoined: true }))).toEqual({
      kind: "joined",
      href: "/cohorts/22",
    });
    expect(
      resolveActivityDetailCta(
        make({ isJoined: true, canJoin: false, runStatus: "ended", unavailableReason: "ended" })
      )
    ).toEqual({ kind: "joined", href: "/cohorts/22" });
  });

  it("joinable activity links to the join flow", () => {
    expect(resolveActivityDetailCta(base)).toEqual({
      kind: "join",
      href: "/cohorts/join/tok-abc",
    });
  });

  it("joinable activity with external signup links to the external url", () => {
    expect(
      resolveActivityDetailCta(
        make({ signupMethod: "external", externalSignupUrl: "https://example.org/signup" })
      )
    ).toEqual({ kind: "external", href: "https://example.org/signup" });
  });

  // Regression: daodao#152 dev smoke — /activities/22 (canJoin=false, signup closed)
  // rendered no CTA and no reason at all.
  it.each([
    ["expired", "detail_cta_expired"],
    ["full", "detail_cta_full"],
    ["paused", "detail_cta_paused"],
  ] as const)("closed signup (%s) shows a disabled CTA with the reason", (reason, key) => {
    expect(
      resolveActivityDetailCta(make({ canJoin: false, unavailableReason: reason, joinToken: null }))
    ).toEqual({ kind: "disabled", reasonKey: key });
  });

  it("ended activity shows a disabled 'ended' CTA regardless of other flags", () => {
    expect(
      resolveActivityDetailCta(
        make({ canJoin: false, runStatus: "ended", unavailableReason: "ended", joinToken: null })
      )
    ).toEqual({ kind: "disabled", reasonKey: "detail_cta_ended" });
    expect(resolveActivityDetailCta(make({ runStatus: "ended", unavailableReason: null }))).toEqual(
      { kind: "disabled", reasonKey: "detail_cta_ended" }
    );
  });

  it("renders nothing when there is no usable action or reason", () => {
    expect(resolveActivityDetailCta(make({ joinToken: null }))).toEqual({ kind: "none" });
    expect(
      resolveActivityDetailCta(make({ canJoin: false, unavailableReason: null, joinToken: null }))
    ).toEqual({ kind: "none" });
  });
});

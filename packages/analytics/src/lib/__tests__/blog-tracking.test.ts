import { describe, expect, it } from "vitest";
import { type ActivationInputType, evaluateLeaderActivation } from "../blog-activation";
import { classifyBlogSource, createBlogTracker, sanitizeBlogAnalyticsEvent } from "../blog-events";

const interaction = {
  event: "blog_beta_interest_clicked",
  interaction_id: "a8e6bfc4-bcea-4cb3-b5bd-a69d055cb3a0",
  article_id: "learning-check-in",
  article_slug: "learning-check-in",
  locale: "zh-TW",
  source: "unknown",
  cta_target: "beta-interest",
};
const complete = { publications: true, invitations: true, joins: true, participation: true };
function fixture(): ActivationInputType {
  const scope = { leaderId: "leader1", organizationId: "org1", cohortId: "cohort1" };
  return {
    asOf: "2026-11-13T00:00:00Z",
    registrations: [
      {
        leaderId: "leader1",
        registeredAt: "2026-10-01T00:00:00Z",
        audience: "leader",
        source: "unknown",
      },
    ],
    coverage: complete,
    events: [
      { ...scope, eventId: "p1", occurredAt: "2026-10-02T00:00:00Z", kind: "published" },
      {
        ...scope,
        eventId: "i1",
        occurredAt: "2026-10-03T00:00:00Z",
        kind: "invited",
        enrollmentId: "enrollment1",
      },
      {
        ...scope,
        eventId: "j1",
        occurredAt: "2026-10-04T00:00:00Z",
        kind: "joined",
        enrollmentId: "enrollment1",
        participantId: "member1",
        role: "member",
        isManager: false,
      },
      {
        ...scope,
        eventId: "c1",
        occurredAt: "2026-10-05T00:00:00Z",
        kind: "participated",
        participantId: "member1",
        isManager: false,
      },
    ],
  };
}

describe("Blog browser events", () => {
  it("queues a confirmed external click exactly once without claiming form submission", () => {
    const recorded: { event: string; properties: Record<string, unknown> }[] = [];
    const track = createBlogTracker((event, properties) => recorded.push({ event, properties }));
    expect(track(interaction)).toBe("queued");
    expect(track(interaction)).toBe("duplicate");
    expect(recorded).toEqual([
      {
        event: "blog_beta_interest_clicked",
        properties: {
          event: "blog_beta_interest_clicked",
          interaction_id: interaction.interaction_id,
          article_id: "learning-check-in",
          locale: "zh-TW",
          source: "unknown",
          cta_target: "beta-interest",
          route: "/blog/learning-check-in",
          $current_url: "https://daodao.so/blog/learning-check-in",
          $process_person_profile: false,
        },
      },
    ]);
    expect(JSON.stringify(recorded)).not.toContain("submitted");
  });
  it("rejects private/unknown fields and distinguishes unavailable transport", () => {
    expect(createBlogTracker(undefined)(interaction)).toBe("unavailable");
    expect(
      createBlogTracker(() => undefined)({ ...interaction, email: "private@example.com" })
    ).toBe("invalid");
    expect(
      createBlogTracker(() => undefined)({ ...interaction, article_id: "private@example.com" })
    ).toBe("invalid");
    expect(createBlogTracker(() => undefined)({ ...interaction, cta_target: "instant-demo" })).toBe(
      "invalid"
    );
  });
  it("allows retry after transport failure rather than marking it delivered", () => {
    let attempts = 0;
    const track = createBlogTracker(() => {
      attempts++;
      if (attempts === 1) throw new Error("not ready");
    });
    expect(track(interaction)).toBe("failed");
    expect(track(interaction)).toBe("queued");
    expect(attempts).toBe(2);
  });
  it("classifies source without returning referrer paths or arbitrary campaigns", () => {
    expect(classifyBlogSource("https://google.com/search?q=private")).toBe("search");
    expect(classifyBlogSource("https://google.com.evil.test/search")).toBe("unknown");
    expect(classifyBlogSource("https://app.daodao.so/private?email=x")).toBe("internal");
    expect(classifyBlogSource("", "private@example.com")).toBe("unknown");
    expect(classifyBlogSource("", "LinkedIn")).toBe("social");
    expect(classifyBlogSource("")).toBe("direct");
  });
  it("uses the actual self-contained SDK hook to suppress automatic Blog events and remove query/profile data", () => {
    const hook = Function(
      `return (${sanitizeBlogAnalyticsEvent.toString()})`
    )() as typeof sanitizeBlogAnalyticsEvent;
    const safe = hook({
      event: "blog_article_viewed",
      properties: {
        token: "public_project_key",
        distinct_id: "anonymous",
        article_id: "learning-check-in",
        $current_url: "https://daodao.so/blog/learning-check-in?email=private@example.com#secret",
        $referrer: "https://private.test/user",
        note: "private lesson",
        email: "private@example.com",
      },
      $set: { email: "private@example.com" },
    });
    expect(safe?.properties).toEqual({
      token: "public_project_key",
      distinct_id: "anonymous",
      article_id: "learning-check-in",
      $current_url: "https://daodao.so/blog/learning-check-in",
    });
    expect(safe?.$set).toBeUndefined();
    expect(
      hook({
        event: "$autocapture",
        properties: {
          $current_url: "https://daodao.so/en/blog/learning-check-in",
          text: "private",
        },
      })
    ).toBeNull();
    const other = {
      event: "existing_product_event",
      properties: { $current_url: "https://app.daodao.so/lighthouse" },
    };
    expect(hook(other)).toBe(other);
  });
});

describe("30-day leader activation", () => {
  it("requires published activity plus a genuinely invited nonleader's real participation", () => {
    const result = evaluateLeaderActivation(fixture());
    expect(result.counts).toEqual({
      leaders: 1,
      learners: 0,
      unclassified: 0,
      activated: 1,
      observing: 0,
      unknown: 0,
      organizations: 1,
      cohorts: 1,
    });
    expect(result.rows[0]?.source).toBe("unknown");
    expect(result.matureCohort).toEqual({ denominator: 1, activated: 1, rate: 1 });
  });
  it.each([
    "published",
    "invited",
    "joined",
    "participated",
  ])("does not activate without %s proof", (kind) => {
    const input = fixture();
    input.events = input.events.filter((event) => event.kind !== kind);
    expect(evaluateLeaderActivation(input).rows[0]?.status).toBe("not_activated");
  });
  it("does not substitute incomplete data with a zero conversion", () => {
    const input = fixture();
    input.events = [];
    input.coverage = { ...complete, invitations: false };
    expect(evaluateLeaderActivation(input).rows[0]?.status).toBe("unknown");
    expect(evaluateLeaderActivation(input).matureCohort).toEqual({
      denominator: 0,
      activated: 0,
      rate: null,
    });
  });
  it("keeps immature cohorts observing and excludes them from the mature denominator", () => {
    const input = fixture();
    input.events = [];
    input.asOf = "2026-10-10T00:00:00Z";
    expect(evaluateLeaderActivation(input).rows[0]?.status).toBe("observing");
    expect(evaluateLeaderActivation(input).matureCohort.rate).toBeNull();
  });
  it("uses a half-open30day elapsed-time window and refuses future participation", () => {
    const input = fixture();
    const participation = input.events.find((event) => event.kind === "participated");
    if (!participation) throw Error("fixture");
    participation.occurredAt = "2026-10-31T00:00:00Z";
    expect(evaluateLeaderActivation(input).rows[0]?.status).toBe("not_activated");
    participation.occurredAt = "2026-10-30T23:59:59Z";
    expect(evaluateLeaderActivation(input).rows[0]?.status).toBe("activated");
    input.asOf = "2026-10-29T00:00:00Z";
    expect(evaluateLeaderActivation(input).rows[0]?.status).toBe("observing");
  });
  it("excludes leaders/assistants, public join without invite proof, and cross-cohort evidence", () => {
    const input = fixture();
    const joined = input.events.find((event) => event.kind === "joined");
    if (!joined || joined.kind !== "joined") throw Error("fixture");
    joined.role = "assistant";
    expect(evaluateLeaderActivation(input).counts.activated).toBe(0);
    joined.role = "member";
    joined.participantId = "leader1";
    expect(evaluateLeaderActivation(input).counts.activated).toBe(0);
    joined.participantId = "member1";
    joined.cohortId = "other";
    expect(evaluateLeaderActivation(input).counts.activated).toBe(0);
  });
  it("deduplicates leader, organization and session independently and refuses conflicting IDs", () => {
    const input = fixture();
    input.registrations.push({ ...input.registrations[0]! });
    input.events.push({ ...input.events[0]! });
    expect(evaluateLeaderActivation(input).counts.leaders).toBe(1);
    input.registrations.push({
      leaderId: "learner1",
      registeredAt: "2026-10-01T00:00:00Z",
      audience: "learner",
      source: "blog",
    });
    expect(evaluateLeaderActivation(input).counts.learners).toBe(1);
    input.events.push({ ...input.events[0]!, occurredAt: "2026-10-03T00:00:00Z" });
    expect(() => evaluateLeaderActivation(input)).toThrow("Conflicting duplicate eventId");
  });
  it("refuses another organization manager even when their cohort enrollment says member", () => {
    const input = fixture();
    const joined = input.events.find((event) => event.kind === "joined");
    if (!joined || joined.kind !== "joined") throw Error("fixture");
    joined.isManager = true;
    expect(evaluateLeaderActivation(input).counts.activated).toBe(0);
    joined.isManager = false;
    const checkin = input.events.find((event) => event.kind === "participated");
    if (!checkin || checkin.kind !== "participated") throw Error("fixture");
    checkin.isManager = true;
    expect(evaluateLeaderActivation(input).counts.activated).toBe(0);
  });
  it("keeps unclassified registrations separate from observed platform leaders", () => {
    const input = fixture();
    input.registrations.push({
      leaderId: "unknown1",
      registeredAt: "2026-10-01T00:00:00Z",
      audience: "unclassified",
      source: "unknown",
    });
    const result = evaluateLeaderActivation(input);
    expect(result.counts.unclassified).toBe(1);
    expect(result.matureCohort.denominator).toBe(1);
  });
  it("runtime rejects PII identifiers, malformed instants and unknown fields", () => {
    expect(() =>
      evaluateLeaderActivation({ ...fixture(), email: "private@example.com" })
    ).toThrow();
    const input = fixture();
    input.registrations[0]!.leaderId = "private@example.com";
    expect(() => evaluateLeaderActivation(input)).toThrow();
    expect(() => evaluateLeaderActivation({ ...fixture(), asOf: "2026-02-30" })).toThrow();
  });
});

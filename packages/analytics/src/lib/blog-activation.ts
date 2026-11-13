import {
  type BlogSourceReportContext,
  blogSourceReportContextSchema,
} from "@daodao/shared/lib/blog-source-context";
import { addMilliseconds, getTime, isValid, parseISO } from "date-fns";
import { z } from "zod";

const id = z
  .string()
  .regex(/^[A-Za-z0-9_-]+$/)
  .max(128);
const instant = z
  .string()
  .datetime({ offset: true })
  .refine((value) => isValid(parseISO(value)));
const base = z.object({
  eventId: id,
  occurredAt: instant,
  leaderId: id,
  organizationId: id,
  cohortId: id,
});
export const activationEventSchema = z.discriminatedUnion("kind", [
  base.extend({ kind: z.literal("published") }).strict(),
  base.extend({ kind: z.literal("invited"), enrollmentId: id }).strict(),
  base
    .extend({
      kind: z.literal("joined"),
      enrollmentId: id,
      participantId: id,
      role: z.enum(["owner", "assistant", "member"]),
      isManager: z.boolean(),
    })
    .strict(),
  base
    .extend({
      kind: z.literal("participated"),
      participantId: id,
      isManager: z.boolean(),
      role: z.enum(["owner", "assistant", "member"]),
    })
    .strict(),
]);
export const activationInputSchema = z
  .object({
    asOf: instant,
    capturedAt: instant,
    evidenceMode: z.enum(["observed", "fixture"]),
    registrations: z.array(
      z
        .object({
          leaderId: id,
          registeredAt: instant,
          audience: z.enum(["leader", "learner", "unclassified"]),
          source: z.enum(["blog", "other", "unknown"]),
          sourceContext: blogSourceReportContextSchema.optional(),
        })
        .strict()
    ),
    events: z.array(activationEventSchema),
    coverage: z
      .object({
        publications: z.boolean(),
        invitations: z.boolean(),
        joins: z.boolean(),
        participation: z.boolean(),
      })
      .strict(),
  })
  .strict();
export type ActivationInputType = z.infer<typeof activationInputSchema>;
export type ActivationEventType = z.infer<typeof activationEventSchema>;
export type LeaderActivationType = {
  leaderId: string;
  source: "blog" | "other" | "unknown";
  sourceContext?: BlogSourceReportContext;
  registeredAt: string;
  windowEnd: string;
  status: "activated" | "observing" | "not_activated" | "unknown";
  firstActivatedAt: string | null;
  timeToActivationMs: number | null;
  activatedOrganizations: string[];
  activatedCohorts: string[];
};
const WINDOW_MS = 30 * 24 * 60 * 60 * 1000;

function compareOpaqueIds(left: string, right: string): number {
  if (left < right) return -1;
  if (left > right) return 1;
  return 0;
}

/** Inputs must come from trusted durable sources; this evaluator cannot authenticate event producers. */
export function evaluateLeaderActivation(input: unknown) {
  const data = activationInputSchema.parse(input);
  const registrations = new Map<string, ActivationInputType["registrations"][number]>();
  for (const registration of data.registrations) {
    const previous = registrations.get(registration.leaderId);
    if (previous && JSON.stringify(previous) !== JSON.stringify(registration))
      throw new Error("Conflicting registration for the same person");
    registrations.set(registration.leaderId, registration);
  }
  const events = new Map<string, ActivationEventType>();
  for (const event of data.events) {
    const previous = events.get(event.eventId);
    if (previous && JSON.stringify(previous) !== JSON.stringify(event))
      throw new Error("Conflicting duplicate eventId");
    events.set(event.eventId, event);
  }
  const asOf = getTime(parseISO(data.asOf));
  const capturedAt = getTime(parseISO(data.capturedAt));
  if (asOf > capturedAt) throw new Error("asOf exceeds captured observation coverage");
  if (data.evidenceMode === "observed" && capturedAt > getTime(new Date()))
    throw new Error(
      "Observed capture time is in the future; only declared fixtures may use a synthetic clock"
    );
  const rows: LeaderActivationType[] = [];
  for (const registration of registrations.values()) {
    if (registration.audience !== "leader") continue;
    const start = getTime(parseISO(registration.registeredAt));
    if (start > asOf) throw new Error("Registration is after asOf");
    const deadline = getTime(addMilliseconds(parseISO(registration.registeredAt), WINDOW_MS));
    const eligible = [...events.values()].filter(
      (event) =>
        event.leaderId === registration.leaderId &&
        ((event.kind !== "published" && event.kind !== "participated") ||
          getTime(parseISO(event.occurredAt)) >= start) &&
        getTime(parseISO(event.occurredAt)) < deadline &&
        getTime(parseISO(event.occurredAt)) <= asOf
    );
    let firstActivationTime: number | null = null;
    const organizations = new Set<string>();
    const cohorts = new Set<string>();
    for (const publication of eligible.filter((event) => event.kind === "published")) {
      const scoped = eligible.filter(
        (event) =>
          event.organizationId === publication.organizationId &&
          event.cohortId === publication.cohortId
      );
      const publicationAt = getTime(parseISO(publication.occurredAt));
      for (const participation of scoped) {
        if (
          participation.kind !== "participated" ||
          participation.participantId === registration.leaderId ||
          participation.isManager ||
          participation.role !== "member" ||
          getTime(parseISO(participation.occurredAt)) < publicationAt
        )
          continue;
        const participatedAt = getTime(parseISO(participation.occurredAt));
        const joined = scoped.find(
          (event) =>
            event.kind === "joined" &&
            event.role === "member" &&
            !event.isManager &&
            event.participantId === participation.participantId &&
            getTime(parseISO(event.occurredAt)) <= participatedAt &&
            scoped.some(
              (invitation) =>
                invitation.kind === "invited" &&
                invitation.enrollmentId === event.enrollmentId &&
                getTime(parseISO(invitation.occurredAt)) <= getTime(parseISO(event.occurredAt))
            )
        );
        if (!joined) continue;
        firstActivationTime =
          firstActivationTime === null
            ? participatedAt
            : Math.min(firstActivationTime, participatedAt);
        organizations.add(publication.organizationId);
        cohorts.add(publication.cohortId);
      }
    }
    let status: LeaderActivationType["status"] = "not_activated";
    if (cohorts.size) status = "activated";
    else if (!Object.values(data.coverage).every(Boolean)) status = "unknown";
    else if (asOf < deadline) status = "observing";
    rows.push({
      leaderId: registration.leaderId,
      source: registration.source,
      ...(registration.sourceContext ? { sourceContext: registration.sourceContext } : {}),
      registeredAt: registration.registeredAt,
      windowEnd: new Date(deadline).toISOString(),
      status,
      firstActivatedAt:
        firstActivationTime === null ? null : new Date(firstActivationTime).toISOString(),
      timeToActivationMs: firstActivationTime === null ? null : firstActivationTime - start,
      activatedOrganizations: [...organizations].sort(compareOpaqueIds),
      activatedCohorts: [...cohorts].sort(compareOpaqueIds),
    });
  }
  const mature = rows.filter((row) => getTime(parseISO(row.windowEnd)) <= asOf);
  const matureUnknown = mature.filter((row) => row.status === "unknown").length;
  const organizations = new Set(rows.flatMap((row) => row.activatedOrganizations));
  const cohorts = new Set(rows.flatMap((row) => row.activatedCohorts));
  return {
    asOf: data.asOf,
    capturedAt: data.capturedAt,
    evidenceMode: data.evidenceMode,
    coverage: data.coverage,
    rows: rows.sort((a, b) => a.leaderId.localeCompare(b.leaderId)),
    counts: {
      leaders: rows.length,
      unclassified: [...registrations.values()].filter((row) => row.audience === "unclassified")
        .length,
      learners: [...registrations.values()].filter((row) => row.audience === "learner").length,
      activated: rows.filter((row) => row.status === "activated").length,
      observing: rows.filter((row) => row.status === "observing").length,
      unknown: rows.filter((row) => row.status === "unknown").length,
      organizations: organizations.size,
      cohorts: cohorts.size,
    },
    matureCohort: {
      denominator: mature.length,
      known: mature.length - matureUnknown,
      unknown: matureUnknown,
      activated: mature.filter((row) => row.status === "activated").length,
      rate:
        mature.length && matureUnknown === 0
          ? mature.filter((row) => row.status === "activated").length / mature.length
          : null,
    },
  };
}

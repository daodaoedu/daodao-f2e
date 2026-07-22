import { z } from "zod";
import { client } from "../client";
import type { paths } from "../types";

type OrganizationListResponse =
  paths["/api/v1/lighthouse/organizations"]["get"]["responses"][200]["content"]["application/json"];
type ProgramListResponse =
  paths["/api/v1/lighthouse/programs"]["get"]["responses"][200]["content"]["application/json"];
type CohortListResponse =
  paths["/api/v1/lighthouse/programs/{programId}/cohorts"]["get"]["responses"][200]["content"]["application/json"];
type CreateProgramBody = NonNullable<
  paths["/api/v1/lighthouse/programs"]["post"]["requestBody"]
>["content"]["application/json"];
type UpdateProgramBody = NonNullable<
  paths["/api/v1/lighthouse/programs/{programId}"]["patch"]["requestBody"]
>["content"]["application/json"];
type CreateCohortBody = NonNullable<
  paths["/api/v1/lighthouse/programs/{programId}/cohorts"]["post"]["requestBody"]
>["content"]["application/json"];
type UpdateCohortBody = NonNullable<
  paths["/api/v1/lighthouse/programs/{programId}/cohorts/{cohortId}"]["patch"]["requestBody"]
>["content"]["application/json"];
type InviteCohortMembersBody = NonNullable<
  paths["/api/v1/lighthouse/programs/{programId}/cohorts/{cohortId}/invitations"]["post"]["requestBody"]
>["content"]["application/json"];
type UpdateOrganizationBody = NonNullable<
  paths["/api/v1/lighthouse/organizations/{organizationId}"]["patch"]["requestBody"]
>["content"]["application/json"];
type CreateOrganizationTemplateBody = NonNullable<
  paths["/api/v1/lighthouse/organizations/{organizationId}/templates"]["post"]["requestBody"]
>["content"]["application/json"];
type UpdateOrganizationTemplateBody = NonNullable<
  paths["/api/v1/lighthouse/organizations/{organizationId}/templates/{templateId}"]["patch"]["requestBody"]
>["content"]["application/json"];
type AddOrganizationMemberBody = NonNullable<
  paths["/api/v1/lighthouse/organizations/{organizationId}/members"]["post"]["requestBody"]
>["content"]["application/json"];

export type LighthouseOrganizationType = OrganizationListResponse["data"][number];
export type LighthouseProgramType = ProgramListResponse["data"][number];
export type LighthouseCohortType = CohortListResponse["data"][number];

const nullableDateTimeSchema = z.string().datetime().nullable();
const responseMetaSchema = z.record(z.string(), z.unknown()).optional();
const apiSuccessSchema = <T extends z.ZodTypeAny>(data: T) =>
  z.object({
    success: z.literal(true),
    data,
    timestamp: z.string().datetime(),
    meta: responseMetaSchema,
  });

export const lighthouseOrganizationSchema: z.ZodType<LighthouseOrganizationType> = z.object({
  id: z.number().int().positive(),
  name: z.string(),
  bio: z.string().nullable(),
  externalLink: z.string().nullable(),
  status: z.enum(["active", "suspended"]),
  approvedBy: z.number().int().nullable(),
  approvedAt: nullableDateTimeSchema,
  createdAt: z.string().datetime(),
});

export const lighthouseProgramSchema: z.ZodType<LighthouseProgramType> = z.object({
  id: z.number().int().positive(),
  organizationId: z.number().int().positive(),
  name: z.string(),
  description: z.string().nullable(),
  deletedAt: nullableDateTimeSchema,
  createdAt: z.string().datetime(),
  updatedAt: nullableDateTimeSchema,
});

export const lighthouseCohortSchema: z.ZodType<LighthouseCohortType> = z.object({
  id: z.number().int().positive(),
  programId: z.number().int().positive(),
  slug: z.string(),
  displayName: z.string(),
  startDate: z.string(),
  endDate: z.string(),
  joinToken: z.string().nullable(),
  joinDeadline: z.string().nullable(),
  capacity: z.number().int().nullable(),
  inviteMessage: z.string().nullable(),
  status: z.enum(["draft", "published", "archived"]),
  createdAt: z.string().datetime(),
  updatedAt: nullableDateTimeSchema,
});

export const lighthouseOrganizationListResponseSchema: z.ZodType<OrganizationListResponse> =
  apiSuccessSchema(z.array(lighthouseOrganizationSchema));

export const lighthouseProgramListResponseSchema: z.ZodType<ProgramListResponse> = apiSuccessSchema(
  z.array(lighthouseProgramSchema)
);

export const lighthouseCohortListResponseSchema: z.ZodType<CohortListResponse> = apiSuccessSchema(
  z.array(lighthouseCohortSchema)
);

export const lighthouseCohortResponseSchema = apiSuccessSchema(lighthouseCohortSchema);

export const lighthouseCohortMembersResponseSchema = apiSuccessSchema(
  z.array(
    z.object({
      id: z.number().int().positive(),
      nickname: z.string().nullable(),
      avatar: z.string().nullable(),
      joinedAt: z.string().datetime(),
    })
  )
);

export const lighthouseCohortEnrollmentsResponseSchema = apiSuccessSchema(
  z.array(
    z.object({
      id: z.number().int().positive(),
      email: z.string().email().nullable(),
      userId: z.number().int().positive().nullable(),
      nickname: z.string().nullable(),
      role: z.enum(["owner", "assistant", "member"]),
      status: z.enum(["invited", "joined", "exited", "removed"]),
      invitedAt: z.string().datetime(),
      joinedAt: nullableDateTimeSchema,
      exitedAt: nullableDateTimeSchema,
      exportOptIn: z.boolean(),
    })
  )
);

export const lighthouseDashboardResponseSchema = apiSuccessSchema(
  z.object({
    snapshotKind: z.enum(["weekly", "realtime"]),
    computedAt: z.string().datetime(),
    rhythmHeatmap: z.record(z.string(), z.number().nonnegative()),
    tagDistribution: z.array(z.object({ tag: z.string(), count: z.number().int().nonnegative() })),
    commonBlockers: z.record(z.string(), z.number().int().nonnegative()),
    funnel: z.object({
      enrolled: z.number().int().nonnegative(),
      activated: z.number().int().nonnegative(),
      activeMembers: z.number().int().nonnegative(),
    }),
    timeRhythm: z.record(z.string(), z.number().int().nonnegative()),
    checkins: z.number().int().nonnegative(),
    exited: z.number().int().nonnegative(),
  })
);

const lighthouseFocusPersonSchema = z.object({
  userId: z.number().int().positive(),
  nickname: z.string().nullable(),
  avatar: z.string().nullable(),
});

export const lighthouseFocusResponseSchema = apiSuccessSchema(
  z.object({
    needsEncouragement: z.array(
      lighthouseFocusPersonSchema.extend({
        lastCheckinAt: z.string().datetime(),
        lastCheckinPreview: z.string().nullable(),
        interruptedDays: z.number().int().nonnegative(),
      })
    ),
    celebrations: z.array(
      lighthouseFocusPersonSchema.extend({
        moment: z.enum(["first_checkin", "return_after_break", "month_milestone"]),
        occurredAt: z.string().datetime(),
      })
    ),
  })
);

export const lighthouseOutcomeResponseSchema = apiSuccessSchema(
  z.object({
    cohortId: z.number().int().positive(),
    completedCount: z.number().int().nonnegative(),
    enrolledCount: z.number().int().nonnegative(),
    sustainedParticipationCount: z.number().int().nonnegative(),
    sustainedParticipationRate: z.number().min(0).max(1),
    computedAt: z.string().datetime(),
  })
);

const cohortFeedCommentPreviewUserSchema = z.object({
  id: z.string(),
  name: z.string(),
  photoUrl: z.string().nullable(),
  customId: z.string().nullable(),
});

const cohortFeedCommentPreviewSchema = z.object({
  id: z.string(),
  content: z.string(),
  createdAt: z.string(),
  user: cohortFeedCommentPreviewUserSchema.optional(),
});

const cohortFeedItemSchema = z.object({
  id: z.string(),
  checkinDate: z.string(),
  mood: z.string().nullable(),
  note: z.string(),
  tags: z.array(z.string()),
  imageUrls: z.array(z.string()),
  createdAt: z.string(),
  practice: z.object({ id: z.string(), title: z.string() }),
  user: z
    .object({
      id: z.string(),
      name: z.string(),
      photoUrl: z.string().nullable(),
      customId: z.string().nullable(),
    })
    .optional(),
  commentCount: z.number().int().nonnegative(),
  commentPreview: z.array(cohortFeedCommentPreviewSchema),
});

const cohortFeedDataSchema = z.object({
  perspective: z.enum(["coach", "learner"]),
  items: z.array(cohortFeedItemSchema),
  total: z.number().int().nonnegative(),
  pendingResponseCount: z.number().int().nonnegative(),
});

export const lighthouseCoachFeedResponseSchema = apiSuccessSchema(cohortFeedDataSchema);
export const learnerCohortFeedResponseSchema = apiSuccessSchema(cohortFeedDataSchema);

export const lighthouseOrganizationResponseSchema = apiSuccessSchema(lighthouseOrganizationSchema);

export const lighthouseOrganizationMembersResponseSchema = apiSuccessSchema(
  z.array(
    z.object({
      id: z.number().int().positive(),
      userId: z.number().int().positive(),
      nickname: z.string().nullable(),
      role: z.literal("owner"),
      createdAt: z.string().datetime(),
    })
  )
);

export const lighthouseTemplatesResponseSchema = apiSuccessSchema(
  z.array(
    z.object({
      id: z.number().int().positive(),
      externalId: z.string().uuid(),
      organizationId: z.number().int().positive(),
      title: z.string(),
      practiceAction: z.string().nullable(),
      durationDays: z.number().int().nullable(),
      frequencyMinDays: z.number().int().nullable(),
      frequencyMaxDays: z.number().int().nullable(),
      sessionDurationMinutes: z.number().int().nullable(),
      practiceTimePeriods: z.array(z.string()),
      boundCohortIds: z.array(z.number().int().positive()),
      generatedDraftCount: z.number().int().nonnegative(),
      createdAt: nullableDateTimeSchema,
      updatedAt: nullableDateTimeSchema,
    })
  )
);

export const cohortJoinInfoResponseSchema = apiSuccessSchema(
  z.object({
    cohortId: z.number().int().positive(),
    displayName: z.string(),
    startDate: z.string().datetime(),
    endDate: z.string().datetime(),
    inviteMessage: z.string().nullable(),
    canJoin: z.boolean(),
    unavailableReason: z.enum(["not_published", "expired", "full"]).nullable(),
    visibilityNotice: z.string(),
    organization: z.object({
      name: z.string(),
      bio: z.string().nullable(),
      externalLink: z.string().nullable(),
    }),
  })
);

export const myCohortsResponseSchema = apiSuccessSchema(
  z.array(
    z.object({
      cohortId: z.number().int().positive(),
      displayName: z.string(),
      startDate: z.string().datetime(),
      endDate: z.string().datetime(),
      status: z.string(),
      joinedAt: z.string().datetime().nullable(),
      programName: z.string(),
      organizationName: z.string(),
    })
  )
);

export const cohortMemberHomeResponseSchema = apiSuccessSchema(
  z.object({
    cohortId: z.number().int().positive(),
    displayName: z.string(),
    startDate: z.string().datetime(),
    endDate: z.string().datetime(),
    exportOptIn: z.boolean(),
    organization: z.object({
      name: z.string(),
      bio: z.string().nullable(),
      externalLink: z.string().nullable(),
    }),
    practices: z.array(
      z.object({
        id: z.string().uuid(),
        title: z.string(),
        practiceAction: z.string().nullable(),
        status: z.enum(["draft", "not_started", "active", "completed", "archived"]),
        creationSource: z.string().nullable(),
      })
    ),
  })
);

export const getLighthouseOrganizations = async () =>
  client.GET("/api/v1/lighthouse/organizations");

export const getLighthousePrograms = async (organizationId: number) =>
  client.GET("/api/v1/lighthouse/programs", {
    params: { query: { organizationId } },
  });

export const getLighthouseCohorts = async (programId: number) =>
  client.GET("/api/v1/lighthouse/programs/{programId}/cohorts", {
    params: { path: { programId } },
  });

export const createLighthouseProgram = async (body: CreateProgramBody) =>
  client.POST("/api/v1/lighthouse/programs", { body });

export const updateLighthouseProgram = async (programId: number, body: UpdateProgramBody) =>
  client.PATCH("/api/v1/lighthouse/programs/{programId}", {
    params: { path: { programId } },
    body,
  });

export const archiveLighthouseProgram = async (programId: number) =>
  client.DELETE("/api/v1/lighthouse/programs/{programId}", {
    params: { path: { programId } },
  });

export const createLighthouseCohort = async (programId: number, body: CreateCohortBody) =>
  client.POST("/api/v1/lighthouse/programs/{programId}/cohorts", {
    params: { path: { programId } },
    body,
  });

export const updateLighthouseCohort = async (
  programId: number,
  cohortId: number,
  body: UpdateCohortBody
) =>
  client.PATCH("/api/v1/lighthouse/programs/{programId}/cohorts/{cohortId}", {
    params: { path: { programId, cohortId } },
    body,
  });

export const archiveLighthouseCohort = async (programId: number, cohortId: number) =>
  client.DELETE("/api/v1/lighthouse/programs/{programId}/cohorts/{cohortId}", {
    params: { path: { programId, cohortId } },
  });

export const inviteLighthouseCohortMembers = async (
  programId: number,
  cohortId: number,
  body: InviteCohortMembersBody
) =>
  client.POST("/api/v1/lighthouse/programs/{programId}/cohorts/{cohortId}/invitations", {
    params: { path: { programId, cohortId } },
    body,
  });

export const resendLighthouseCohortInvitation = async (
  programId: number,
  cohortId: number,
  enrollmentId: number
) =>
  client.POST(
    "/api/v1/lighthouse/programs/{programId}/cohorts/{cohortId}/invitations/{enrollmentId}/resend",
    { params: { path: { programId, cohortId, enrollmentId } } }
  );

export const removeLighthouseCohortMember = async (
  programId: number,
  cohortId: number,
  enrollmentId: number
) =>
  client.DELETE(
    "/api/v1/lighthouse/programs/{programId}/cohorts/{cohortId}/members/{enrollmentId}",
    { params: { path: { programId, cohortId, enrollmentId } } }
  );

export const rotateLighthouseJoinToken = async (programId: number, cohortId: number) =>
  client.POST("/api/v1/lighthouse/programs/{programId}/cohorts/{cohortId}/join-token/rotate", {
    params: { path: { programId, cohortId } },
  });

export const pauseLighthouseJoining = async (programId: number, cohortId: number) =>
  client.DELETE("/api/v1/lighthouse/programs/{programId}/cohorts/{cohortId}/join-token", {
    params: { path: { programId, cohortId } },
  });

export const updateLighthouseOrganization = async (
  organizationId: number,
  body: UpdateOrganizationBody
) =>
  client.PATCH("/api/v1/lighthouse/organizations/{organizationId}", {
    params: { path: { organizationId } },
    body,
  });

export const exportLighthouseOutcome = async (programId: number, cohortId: number) =>
  client.POST("/api/v1/lighthouse/programs/{programId}/cohorts/{cohortId}/outcome/export", {
    params: { path: { programId, cohortId } },
  });

export const createLighthouseEncouragementDraft = async (
  programId: number,
  cohortId: number,
  checkinId: number
) =>
  client.POST(
    "/api/v1/lighthouse/programs/{programId}/cohorts/{cohortId}/checkins/{checkinId}/encouragement-draft",
    { params: { path: { programId, cohortId, checkinId } } }
  );

export const sendLighthouseEncouragement = async (
  programId: number,
  cohortId: number,
  checkinId: number,
  content: string
) =>
  client.POST(
    "/api/v1/lighthouse/programs/{programId}/cohorts/{cohortId}/checkins/{checkinId}/encouragement",
    { params: { path: { programId, cohortId, checkinId } }, body: { content } }
  );

export const createLighthouseTemplate = async (
  organizationId: number,
  body: CreateOrganizationTemplateBody
) =>
  client.POST("/api/v1/lighthouse/organizations/{organizationId}/templates", {
    params: { path: { organizationId } },
    body,
  });

export const updateLighthouseTemplate = async (
  organizationId: number,
  templateId: number,
  body: UpdateOrganizationTemplateBody
) =>
  client.PATCH("/api/v1/lighthouse/organizations/{organizationId}/templates/{templateId}", {
    params: { path: { organizationId, templateId } },
    body,
  });

export const deleteLighthouseTemplate = async (organizationId: number, templateId: number) =>
  client.DELETE("/api/v1/lighthouse/organizations/{organizationId}/templates/{templateId}", {
    params: { path: { organizationId, templateId } },
  });

export const setLighthouseTemplateBinding = async (
  organizationId: number,
  templateId: number,
  cohortId: number,
  bound: boolean
) => {
  const params = { params: { path: { organizationId, templateId, cohortId } } };
  return bound
    ? client.PUT(
        "/api/v1/lighthouse/organizations/{organizationId}/templates/{templateId}/cohorts/{cohortId}",
        params
      )
    : client.DELETE(
        "/api/v1/lighthouse/organizations/{organizationId}/templates/{templateId}/cohorts/{cohortId}",
        params
      );
};

export const addLighthouseOrganizationMember = async (
  organizationId: number,
  body: AddOrganizationMemberBody
) =>
  client.POST("/api/v1/lighthouse/organizations/{organizationId}/members", {
    params: { path: { organizationId } },
    body,
  });

export const removeLighthouseOrganizationMember = async (organizationId: number, userId: number) =>
  client.DELETE("/api/v1/lighthouse/organizations/{organizationId}/members/{userId}", {
    params: { path: { organizationId, userId } },
  });

export const joinCohort = async (joinToken: string) =>
  client.POST("/api/v1/cohorts/join/{joinToken}", {
    params: { path: { joinToken } },
    body: { consent: true },
  });

export const exitCohort = async (cohortId: number) =>
  client.POST("/api/v1/cohorts/{cohortId}/exit", { params: { path: { cohortId } } });

export const setCohortExportConsent = async (cohortId: number, consent: boolean) =>
  client.PUT("/api/v1/cohorts/{cohortId}/export-consent", {
    params: { path: { cohortId } },
    body: { consent },
  });

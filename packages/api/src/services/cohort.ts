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
export type CreateOrganizationTemplateBody = NonNullable<
  paths["/api/v1/lighthouse/organizations/{organizationId}/templates"]["post"]["requestBody"]
>["content"]["application/json"];
export type UpdateOrganizationTemplateBody = NonNullable<
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
  timezone: z.string(),
  createdAt: z.string().datetime(),
  updatedAt: nullableDateTimeSchema,
});

export const lighthouseProgramSchema: z.ZodType<LighthouseProgramType> = z.object({
  id: z.number().int().positive(),
  organizationId: z.number().int().positive(),
  name: z.string(),
  description: z.string().nullable(),
  archivedAt: nullableDateTimeSchema,
  deletedAt: nullableDateTimeSchema,
  createdAt: z.string().datetime(),
  updatedAt: nullableDateTimeSchema,
});

const cohortSessionShape = {
  id: z.number().int(),
  sessionDate: z.string(),
  startTime: z.string().nullable(),
  endTime: z.string().nullable(),
} satisfies z.ZodRawShape;

const lighthouseCohortShape = {
  id: z.number().int().positive(),
  programId: z.number().int().positive(),
  slug: z.string(),
  displayName: z.string(),
  tagline: z.string().nullable(),
  startDate: z.string(),
  endDate: z.string(),
  joinToken: z.string().nullable(),
  joinPaused: z.boolean(),
  joinDeadline: z.string().nullable(),
  capacity: z.number().int().nullable(),
  inviteMessage: z.string().nullable(),
  showInviteMessageOnSignup: z.boolean(),
  interactionModes: z.array(z.enum(["sync", "async", "physical"])),
  meetingUrl: z.string().nullable(),
  location: z.string().nullable(),
  sessions: z.array(z.object(cohortSessionShape)),
  feeType: z.enum(["free", "paid"]),
  feeAmount: z.number().nullable(),
  signupMethod: z.enum(["island_form", "external"]),
  externalSignupUrl: z.string().nullable(),
  isPrivate: z.boolean(),
  checkinDefaultPrivate: z.boolean(),
  hostCommentDefaultPrivate: z.boolean(),
  hasHomePage: z.boolean(),
  signupQuestionCount: z.number().int(),
  status: z.enum(["draft", "published", "archived"]),
  visibility: z.enum(["private", "public"]),
  createdAt: z.string().datetime(),
  updatedAt: nullableDateTimeSchema,
} satisfies z.ZodRawShape;
export const lighthouseCohortSchema: z.ZodType<LighthouseCohortType> =
  z.object(lighthouseCohortShape);

export const lighthouseOrganizationListResponseSchema: z.ZodType<OrganizationListResponse> =
  apiSuccessSchema(z.array(lighthouseOrganizationSchema));

export const lighthouseProgramListResponseSchema: z.ZodType<ProgramListResponse> = apiSuccessSchema(
  z.array(lighthouseProgramSchema)
);

export const lighthouseCohortListResponseSchema: z.ZodType<CohortListResponse> = apiSuccessSchema(
  z.array(lighthouseCohortSchema)
);

export const lighthouseCohortResponseSchema = apiSuccessSchema(lighthouseCohortSchema);
/** 總覽用：組織底下所有系列的全部場次，附系列名稱、已加入人數與焦點摘要（FR-OV-02） */
export const lighthouseOrganizationCohortSchema = z.object({
  ...lighthouseCohortShape,
  programName: z.string(),
  joinedCount: z.number().int().nonnegative(),
  encourageCount: z.number().int().nonnegative(),
  celebrateCount: z.number().int().nonnegative(),
});
export const lighthouseOrganizationCohortListResponseSchema = apiSuccessSchema(
  z.array(lighthouseOrganizationCohortSchema)
);
export type LighthouseOrganizationCohortType = z.infer<typeof lighthouseOrganizationCohortSchema>;

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

const dateOnlySchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);
const nonNegativeInt = z.number().int().nonnegative();
/** 儀表板（FRD 3.3）：即時查詢，所有區塊都吃 practiceTitle / from / to 篩選 */
export const lighthouseDashboardResponseSchema = apiSuccessSchema(
  z.object({
    computedAt: z.string().datetime(),
    range: z.object({ from: dateOnlySchema, to: dateOnlySchema }),
    practiceTitle: z.string().nullable(),
    practices: z.array(
      z.object({
        title: z.string(),
        startDate: z.string().nullable(),
        endDate: z.string().nullable(),
      })
    ),
    kpi: z.object({
      enrolled: nonNegativeInt,
      activated: nonNegativeInt,
      activeThisWeek: nonNegativeInt,
    }),
    checkins: nonNegativeInt,
    practiceOverview: z.array(
      z.object({
        title: z.string(),
        startDate: z.string().nullable(),
        endDate: z.string().nullable(),
        startedCount: nonNegativeInt,
        checkinCount: nonNegativeInt,
        avgCheckinPeople: z.number().nonnegative(),
        avgCheckinLength: z.number().nonnegative(),
      })
    ),
    heatmap: z.record(z.string(), nonNegativeInt),
    tagDistribution: z.array(z.object({ tag: z.string(), count: nonNegativeInt })),
    moodDistribution: z.array(
      z.object({
        mood: z.enum(["happy", "good", "neutral", "bored", "frustrated", "give_up"]),
        count: nonNegativeInt,
      })
    ),
    trend: z.object({
      days: z.array(z.object({ date: dateOnlySchema, count: nonNegativeInt })),
      thisWeek: nonNegativeInt,
      lastWeek: nonNegativeInt,
      delta: z.number().int(),
    }),
    hourHistogram: z.record(z.string(), nonNegativeInt),
  })
);
export type LighthouseDashboardQuery = { practiceTitle?: string; from?: string; to?: string };
export type LighthouseParticipantsSort =
  | "nickname"
  | "startDate"
  | "checkinCount"
  | "commentCount"
  | "viewCount"
  | "reactionCount";
export type LighthouseParticipantsQuery = LighthouseDashboardQuery & {
  search?: string;
  sort?: LighthouseParticipantsSort;
  order?: "asc" | "desc";
};
/** 參與者明細表（FR-DB-09）：一列＝參與者 × 實踐 */
export const lighthouseParticipantsResponseSchema = apiSuccessSchema(
  z.object({
    range: z.object({ from: dateOnlySchema, to: dateOnlySchema }),
    total: nonNegativeInt,
    items: z.array(
      z.object({
        userId: z.number().int(),
        nickname: z.string().nullable(),
        email: z.string().nullable(),
        practiceId: z.number().int(),
        practiceTitle: z.string(),
        startDate: z.string().nullable(),
        checkinCount: nonNegativeInt,
        commentCount: nonNegativeInt,
        viewCount: nonNegativeInt,
        reactionCount: nonNegativeInt,
      })
    ),
  })
);

const lighthouseFocusPersonSchema = z.object({
  userId: z.number().int().positive(),
  nickname: z.string().nullable(),
  avatar: z.string().nullable(),
  practiceId: z.number().int().positive(),
  practiceTitle: z.string(),
  messageCount: z.number().int().nonnegative(),
});

/** 今日焦點（FRD 3.5）：以參與者 × 實踐為列 */
export const lighthouseFocusResponseSchema = apiSuccessSchema(
  z.object({
    needsEncouragement: z.array(
      lighthouseFocusPersonSchema.extend({
        lastCheckinAt: z.string().datetime(),
        lastCheckinDate: z.string(),
        lastCheckinPreview: z.string().nullable(),
        interruptedDays: z.number().int().nonnegative(),
      })
    ),
    celebrations: z.array(
      lighthouseFocusPersonSchema.extend({
        moment: z.enum(["first_checkin", "return_after_break", "month_milestone"]),
        momentDescription: z.string(),
        occurredAt: z.string().datetime(),
        firstCheckinAt: z.string().datetime(),
      })
    ),
  })
);
export type LighthouseFocusEncouragementType = z.infer<
  typeof lighthouseFocusResponseSchema
>["data"]["needsEncouragement"][number];
export type LighthouseFocusCelebrationType = z.infer<
  typeof lighthouseFocusResponseSchema
>["data"]["celebrations"][number];

const lighthouseParticipantSchema = z.object({
  userId: z.number().int().positive(),
  nickname: z.string().nullable(),
  avatar: z.string().nullable(),
});
/** 打卡紀錄抽屜（FR-TF-04） */
export const lighthouseParticipantCheckinsResponseSchema = apiSuccessSchema(
  z.object({
    participant: lighthouseParticipantSchema,
    practice: z.object({
      id: z.number().int(),
      title: z.string(),
      startDate: z.string().nullable(),
      endDate: z.string().nullable(),
    }),
    total: z.number().int().nonnegative(),
    items: z.array(
      z.object({
        id: z.number().int(),
        checkinDate: z.string(),
        mood: z.string().nullable(),
        note: z.string().nullable(),
        imageUrls: z.array(z.string()),
        createdAt: z.string().datetime().nullable(),
      })
    ),
  })
);
export const lighthouseMessageCategorySchema = z.enum(["encourage", "celebrate"]);
export type LighthouseMessageCategory = z.infer<typeof lighthouseMessageCategorySchema>;
export const lighthouseMessageSchema = z.object({
  id: z.number().int(),
  cohortId: z.number().int(),
  recipientUserId: z.number().int().nullable(),
  senderUserId: z.number().int().nullable(),
  senderNickname: z.string().nullable(),
  practiceId: z.number().int().nullable(),
  practiceTitle: z.string().nullable(),
  templateId: z.number().int().nullable(),
  category: lighthouseMessageCategorySchema,
  body: z.string(),
  sentAt: z.string().datetime(),
});
/** 訊息紀錄（FR-TF-05） */
export const lighthouseMessageListResponseSchema = apiSuccessSchema(
  z.object({
    participant: lighthouseParticipantSchema,
    total: z.number().int().nonnegative(),
    items: z.array(lighthouseMessageSchema),
  })
);
export const lighthouseMessageResponseSchema = apiSuccessSchema(lighthouseMessageSchema);
export const lighthouseMessageTemplateSchema = z.object({
  id: z.number().int(),
  organizationId: z.number().int(),
  createdBy: z.number().int().nullable(),
  category: lighthouseMessageCategorySchema,
  title: z.string(),
  body: z.string(),
  createdAt: z.string().datetime(),
  updatedAt: nullableDateTimeSchema,
});
/** 訊息範本（FR-TF-06） */
export const lighthouseMessageTemplateListResponseSchema = apiSuccessSchema(
  z.array(lighthouseMessageTemplateSchema)
);
export const lighthouseMessageTemplateResponseSchema = apiSuccessSchema(
  lighthouseMessageTemplateSchema
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
  note: z.string().nullable(),
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

export const LIGHTHOUSE_TEMPLATE_STATUSES = ["draft", "ready"] as const;
export type LighthouseTemplateStatus = (typeof LIGHTHOUSE_TEMPLATE_STATUSES)[number];
export const lighthouseTemplateBindingSchema = z.object({
  cohortId: z.number().int().positive(),
  cohortName: z.string(),
  cohortStatus: z.string(),
  cohortStartDate: z.string().datetime(),
  startDate: nullableDateTimeSchema,
  endDate: nullableDateTimeSchema,
  locked: z.boolean(),
});
export const lighthouseTemplateSchema = z.object({
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
  timingOther: z.string().nullable(),
  status: z.enum(LIGHTHOUSE_TEMPLATE_STATUSES),
  archivedAt: nullableDateTimeSchema,
  tags: z.array(z.string()),
  boundCohortIds: z.array(z.number().int().positive()),
  bindings: z.array(lighthouseTemplateBindingSchema),
  resources: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      url: z.string().nullable(),
      dayNumber: z.number().int().nullish(),
    })
  ),
  generatedDraftCount: z.number().int().nonnegative(),
  createdAt: nullableDateTimeSchema,
  updatedAt: nullableDateTimeSchema,
});
export type LighthouseTemplate = z.infer<typeof lighthouseTemplateSchema>;
export type LighthouseTemplateBinding = z.infer<typeof lighthouseTemplateBindingSchema>;
export const lighthouseTemplatesResponseSchema = apiSuccessSchema(
  z.array(lighthouseTemplateSchema)
);
export const lighthouseTemplateResponseSchema = apiSuccessSchema(lighthouseTemplateSchema);

export const cohortJoinInfoResponseSchema = apiSuccessSchema(
  z.object({
    cohortId: z.number().int().positive(),
    displayName: z.string(),
    startDate: z.string().datetime(),
    endDate: z.string().datetime(),
    tagline: z.string().nullable(),
    interactionModes: z.array(z.enum(["sync", "async", "physical"])),
    location: z.string().nullable(),
    sessions: z.array(z.object(cohortSessionShape)),
    feeType: z.enum(["free", "paid"]),
    feeAmount: z.number().nullable(),
    signupMethod: z.enum(["island_form", "external"]),
    externalSignupUrl: z.string().nullable(),
    capacity: z.number().int().nullable(),
    joinDeadline: z.string().datetime().nullable(),
    participantCount: z.number().int(),
    inviteMessage: z.string().nullable(),
    canJoin: z.boolean(),
    unavailableReason: z.enum(["not_published", "expired", "full", "paused"]).nullable(),
    privacy: z.object({
      isPrivate: z.boolean(),
      checkinDefaultPrivate: z.boolean(),
      hostCommentDefaultPrivate: z.boolean(),
    }),
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
    tagline: z.string().nullable(),
    interactionModes: z.array(z.enum(["sync", "async", "physical"])),
    meetingUrl: z.string().nullable(),
    location: z.string().nullable(),
    sessions: z.array(z.object(cohortSessionShape)),
    feeType: z.enum(["free", "paid"]),
    privacy: z.object({
      isPrivate: z.boolean(),
      checkinDefaultPrivate: z.boolean(),
      hostCommentDefaultPrivate: z.boolean(),
    }),
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
        startDate: nullableDateTimeSchema.optional(),
        endDate: nullableDateTimeSchema.optional(),
        progressPercentage: z.number().optional(),
        checkInCount: z.number().int().nonnegative().optional(),
        lastCheckinAt: nullableDateTimeSchema.optional(),
        themeColor: z.string().nullable().optional(),
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

export const duplicateLighthouseProgram = async (programId: number) =>
  client.POST("/api/v1/lighthouse/programs/{programId}/duplicate", {
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

/** 複製場次為草稿（含模板綁定，不含名單；FR-OV-03） */
export const duplicateLighthouseCohort = async (programId: number, cohortId: number) =>
  client.POST("/api/v1/lighthouse/programs/{programId}/cohorts/{cohortId}/duplicate", {
    params: { path: { programId, cohortId } },
  });

/** 重新開放透過連結加入；沿用原連結（FR-RS-02） */
export const resumeLighthouseJoining = async (programId: number, cohortId: number) =>
  client.POST("/api/v1/lighthouse/programs/{programId}/cohorts/{cohortId}/join-token/resume", {
    params: { path: { programId, cohortId } },
  });

type SendCohortMessageBody = NonNullable<
  paths["/api/v1/lighthouse/programs/{programId}/cohorts/{cohortId}/participants/{userId}/messages"]["post"]["requestBody"]
>["content"]["application/json"];
type CreateMessageTemplateBody = NonNullable<
  paths["/api/v1/lighthouse/organizations/{organizationId}/message-templates"]["post"]["requestBody"]
>["content"]["application/json"];

/** 送出鼓勵／慶祝訊息給參與者（FR-TF-06） */
export const sendLighthouseMessage = async (
  programId: number,
  cohortId: number,
  userId: number,
  body: SendCohortMessageBody
) =>
  client.POST(
    "/api/v1/lighthouse/programs/{programId}/cohorts/{cohortId}/participants/{userId}/messages",
    { params: { path: { programId, cohortId, userId } }, body }
  );

export const createLighthouseMessageTemplate = async (
  organizationId: number,
  body: CreateMessageTemplateBody
) =>
  client.POST("/api/v1/lighthouse/organizations/{organizationId}/message-templates", {
    params: { path: { organizationId } },
    body,
  });

export const deleteLighthouseMessageTemplate = async (organizationId: number, templateId: number) =>
  client.DELETE(
    "/api/v1/lighthouse/organizations/{organizationId}/message-templates/{templateId}",
    {
      params: { path: { organizationId, templateId } },
    }
  );

export const getLighthouseOrganizationCohorts = async (organizationId: number) =>
  client.GET("/api/v1/lighthouse/organizations/{organizationId}/cohorts", {
    params: { path: { organizationId } },
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
  bound: boolean,
  /** 該期草稿的開始日（YYYY-MM-DD）；不帶就沿用既有值，null 則清除改用期程開始日 */
  startDate?: string | null
) => {
  const params = { params: { path: { organizationId, templateId, cohortId } } };
  return bound
    ? client.PUT(
        "/api/v1/lighthouse/organizations/{organizationId}/templates/{templateId}/cohorts/{cohortId}",
        { ...params, body: startDate === undefined ? {} : { startDate } }
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

// ---------------------------------------------------------------------------
// 封存區（FRD frd-templates-org-archive.md §3.3）
// ---------------------------------------------------------------------------
export const LIGHTHOUSE_ARCHIVE_TYPES = ["templates", "cohorts", "programs"] as const;
export type LighthouseArchiveType = (typeof LIGHTHOUSE_ARCHIVE_TYPES)[number];

export const lighthouseArchiveItemSchema = z.object({
  type: z.enum(["template", "cohort", "program"]),
  id: z.number().int().positive(),
  name: z.string(),
  archivedAt: nullableDateTimeSchema,
  archivedBy: z.object({ id: z.number().int(), name: z.string() }).nullable(),
  archivedFromStatus: z.string().nullable(),
  archivedReason: z.string().nullable(),
  parentName: z.string().nullable(),
  parentArchived: z.boolean(),
});
export type LighthouseArchiveItem = z.infer<typeof lighthouseArchiveItemSchema>;
export const lighthouseArchiveResponseSchema = apiSuccessSchema(
  z.object({ type: z.enum(LIGHTHOUSE_ARCHIVE_TYPES), items: z.array(lighthouseArchiveItemSchema) })
);

export const getLighthouseArchive = async (organizationId: number, type: LighthouseArchiveType) =>
  client.GET("/api/v1/lighthouse/organizations/{organizationId}/archive", {
    params: { path: { organizationId }, query: { type } },
  });

export const restoreLighthouseArchiveItem = async (
  organizationId: number,
  type: LighthouseArchiveType,
  itemId: number
) =>
  client.POST("/api/v1/lighthouse/organizations/{organizationId}/archive/{type}/{itemId}/restore", {
    params: { path: { organizationId, type, itemId } },
  });

export const deleteLighthouseArchiveItem = async (
  organizationId: number,
  type: LighthouseArchiveType,
  itemId: number
) =>
  client.DELETE("/api/v1/lighthouse/organizations/{organizationId}/archive/{type}/{itemId}", {
    params: { path: { organizationId, type, itemId } },
  });

export const duplicateLighthouseTemplate = async (organizationId: number, templateId: number) =>
  client.POST(
    "/api/v1/lighthouse/organizations/{organizationId}/templates/{templateId}/duplicate",
    { params: { path: { organizationId, templateId } } }
  );

export const archiveLighthouseTemplate = async (organizationId: number, templateId: number) =>
  client.POST("/api/v1/lighthouse/organizations/{organizationId}/templates/{templateId}/archive", {
    params: { path: { organizationId, templateId } },
  });

// ---------------------------------------------------------------------------
// 組織自帶 AI API key（FR-ORG-03、FR-OUT-02/08）；API 永遠不回明文 key
// ---------------------------------------------------------------------------
export const LIGHTHOUSE_AI_PROVIDERS = [
  "openai",
  "anthropic",
  "gemini",
  "groq",
  "openrouter",
] as const;
export type LighthouseAiProvider = (typeof LIGHTHOUSE_AI_PROVIDERS)[number];
export const lighthouseAiCredentialStatusSchema = z.enum([
  "unset",
  "set",
  "verified",
  "invalid",
  "disabled",
]);
export type LighthouseAiCredentialStatus = z.infer<typeof lighthouseAiCredentialStatusSchema>;

export const lighthouseAiCredentialSchema = z.object({
  organizationId: z.number().int().positive(),
  provider: z.enum(LIGHTHOUSE_AI_PROVIDERS),
  status: lighthouseAiCredentialStatusSchema,
  keyLast4: z.string().nullable(),
  lastTestedAt: nullableDateTimeSchema,
  lastTestError: z.string().nullable(),
  updatedAt: nullableDateTimeSchema,
  updatedBy: z.number().int().nullable(),
});
export type LighthouseAiCredential = z.infer<typeof lighthouseAiCredentialSchema>;
export const lighthouseAiCredentialResponseSchema = apiSuccessSchema(lighthouseAiCredentialSchema);
export const lighthouseAiCredentialTestResponseSchema = apiSuccessSchema(
  lighthouseAiCredentialSchema.extend({ ok: z.boolean(), message: z.string() })
);

export const LIGHTHOUSE_OUTCOME_PHASES = ["not_started", "in_progress", "ended"] as const;
export type LighthouseOutcomePhase = (typeof LIGHTHOUSE_OUTCOME_PHASES)[number];
export const LIGHTHOUSE_SUMMARY_MODES = ["platform", "own"] as const;
export type LighthouseSummaryMode = (typeof LIGHTHOUSE_SUMMARY_MODES)[number];
export const lighthouseOutcomeSummaryVersionSchema = z.object({
  id: z.number().int(),
  version: z.number().int().positive(),
  source: z.enum(["platform_ai", "own_ai", "manual"]),
  content: z.string(),
  provider: z.string().nullable(),
  modelName: z.string().nullable(),
  generatedAt: nullableDateTimeSchema,
  createdBy: z.object({ id: z.number().int(), nickname: z.string().nullable() }).nullable(),
  createdAt: z.string().datetime(),
  isCurrent: z.boolean(),
});
export type LighthouseOutcomeSummaryVersion = z.infer<typeof lighthouseOutcomeSummaryVersionSchema>;
export const lighthouseOutcomeSchema = z.object({
  cohortId: z.number().int().positive(),
  cohort: z.object({
    displayName: z.string(),
    programName: z.string(),
    startDate: z.string().datetime(),
    endDate: z.string().datetime(),
  }),
  phase: z.enum(LIGHTHOUSE_OUTCOME_PHASES),
  finalizedAt: nullableDateTimeSchema,
  overview: z.object({
    participants: z.number().int().nonnegative(),
    activatedPractices: z.number().int().nonnegative(),
    checkins: z.number().int().nonnegative(),
    comments: z.number().int().nonnegative(),
  }),
  ai: z.object({
    platformAvailable: z.boolean(),
    ownKey: z.object({
      status: lighthouseAiCredentialStatusSchema,
      provider: z.enum(LIGHTHOUSE_AI_PROVIDERS),
      keyLast4: z.string().nullable(),
    }),
    platformDailyLimit: z.number().int().positive(),
    platformUsedToday: z.number().int().nonnegative(),
  }),
  summary: z.object({
    current: lighthouseOutcomeSummaryVersionSchema.nullable(),
    versions: z.array(lighthouseOutcomeSummaryVersionSchema),
  }),
  practiceOutcomes: z.array(
    z.object({
      title: z.string(),
      participants: z.number().int().nonnegative(),
      started: z.number().int().nonnegative(),
      completed: z.number().int().nonnegative(),
      checkins: z.number().int().nonnegative(),
      comments: z.number().int().nonnegative(),
    })
  ),
  participantProgress: z.array(
    z.object({
      userId: z.number().int(),
      nickname: z.string().nullable(),
      avatar: z.string().nullable(),
      practiceId: z.number().int(),
      practiceTitle: z.string(),
      practiceStatus: z.string(),
      completedCount: z.number().int().nonnegative(),
      targetCount: z.number().int().nonnegative(),
      progressPercentage: z.number().int().nonnegative(),
      checkinCount: z.number().int().nonnegative(),
      responseCount: z.number().int().nonnegative(),
      lastActivityAt: nullableDateTimeSchema,
    })
  ),
  generatedAt: z.string().datetime(),
});
export type LighthouseOutcome = z.infer<typeof lighthouseOutcomeSchema>;
export const lighthouseOutcomeResponseSchema = apiSuccessSchema(lighthouseOutcomeSchema);
export const lighthouseOutcomeSummaryResponseSchema = apiSuccessSchema(
  lighthouseOutcomeSummaryVersionSchema
);

export const getLighthouseAiCredential = async (organizationId: number) =>
  client.GET("/api/v1/lighthouse/organizations/{organizationId}/ai-credentials", {
    params: { path: { organizationId } },
  });

export const setLighthouseAiCredential = async (
  organizationId: number,
  body: { provider: LighthouseAiProvider; apiKey: string }
) =>
  client.PUT("/api/v1/lighthouse/organizations/{organizationId}/ai-credentials", {
    params: { path: { organizationId } },
    body,
  });

export const clearLighthouseAiCredential = async (organizationId: number) =>
  client.DELETE("/api/v1/lighthouse/organizations/{organizationId}/ai-credentials", {
    params: { path: { organizationId } },
  });

export const testLighthouseAiCredential = async (organizationId: number) =>
  client.POST("/api/v1/lighthouse/organizations/{organizationId}/ai-credentials/test", {
    params: { path: { organizationId } },
  });

// ---------------------------------------------------------------------------
// 成果摘要與匯出稽核（FR-OUT-03/04/07）
// ---------------------------------------------------------------------------
export const generateLighthouseOutcomeSummary = async (
  programId: number,
  cohortId: number,
  mode: LighthouseSummaryMode
) =>
  client.POST("/api/v1/lighthouse/programs/{programId}/cohorts/{cohortId}/outcome/summary", {
    params: { path: { programId, cohortId } },
    body: { mode },
  });

export const saveLighthouseOutcomeSummary = async (
  programId: number,
  cohortId: number,
  content: string
) =>
  client.PUT("/api/v1/lighthouse/programs/{programId}/cohorts/{cohortId}/outcome/summary", {
    params: { path: { programId, cohortId } },
    body: { content },
  });

export const recordLighthouseOutcomeExport = async (
  programId: number,
  cohortId: number,
  filename?: string
) =>
  client.POST(
    "/api/v1/lighthouse/programs/{programId}/cohorts/{cohortId}/outcome/report-exported",
    { params: { path: { programId, cohortId } }, body: filename ? { filename } : {} }
  );

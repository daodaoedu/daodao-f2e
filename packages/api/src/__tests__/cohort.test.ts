import { describe, expect, it } from "vitest";
import {
  cohortJoinInfoResponseSchema,
  cohortMemberHomeResponseSchema,
  learnerCohortFeedResponseSchema,
  lighthouseActivityResponseSchema,
  lighthouseCoachFeedResponseSchema,
  lighthouseCohortListResponseSchema,
  lighthouseCohortMembersResponseSchema,
  lighthouseDashboardResponseSchema,
  lighthouseFocusResponseSchema,
  lighthouseOrganizationListResponseSchema,
  lighthouseOrganizationMembersResponseSchema,
  lighthouseOutcomeResponseSchema,
  lighthouseProgramListResponseSchema,
  lighthouseTemplatesResponseSchema,
} from "../services/cohort";

const timestamp = "2026-07-22T08:00:00.000Z";

const organizationSummary = { name: "島島", bio: null, externalLink: null };
const privacy = {
  isPrivate: true,
  checkinDefaultPrivate: false,
  hostCommentDefaultPrivate: false,
};

const validOutcome = {
  cohortId: 20,
  cohort: {
    displayName: "夏季同行",
    programName: "持續行動系列",
    startDate: timestamp,
    endDate: timestamp,
  },
  phase: "in_progress",
  finalizedAt: null,
  overview: { participants: 10, activatedPractices: 8, checkins: 12, comments: 5 },
  ai: {
    platformAvailable: true,
    ownKey: { status: "unset", provider: "gemini", keyLast4: null },
    platformDailyLimit: 3,
    platformUsedToday: 1,
  },
  summary: {
    current: {
      id: 1,
      version: 1,
      source: "platform_ai",
      content: "本期學員穩定行動。",
      provider: "gemini",
      modelName: "gemini-2.5-flash",
      generatedAt: timestamp,
      createdBy: { id: 7, nickname: "教練" },
      createdAt: timestamp,
      isCurrent: true,
    },
    versions: [],
  },
  practiceOutcomes: [
    { title: "每日覆盤", participants: 10, started: 8, completed: 3, checkins: 12, comments: 5 },
  ],
  participantProgress: [
    {
      userId: 7,
      nickname: "小島",
      avatar: null,
      practiceId: 100,
      practiceTitle: "每日覆盤",
      practiceStatus: "active",
      completedCount: 3,
      targetCount: 10,
      progressPercentage: 30,
      checkinCount: 3,
      responseCount: 1,
      lastActivityAt: timestamp,
    },
  ],
  generatedAt: timestamp,
};

describe("Lighthouse API runtime schemas", () => {
  it("parses an organization list response", () => {
    const result = lighthouseOrganizationListResponseSchema.safeParse({
      success: true,
      data: [
        {
          id: 1,
          name: "島島學習社群",
          bio: "陪伴學習者持續行動",
          externalLink: "https://example.com",
          status: "active",
          approvedBy: 42,
          approvedAt: timestamp,
          timezone: "Asia/Taipei",
          createdAt: timestamp,
          updatedAt: null,
        },
      ],
      timestamp,
    });

    expect(result.success).toBe(true);
  });

  it("rejects an unknown organization status", () => {
    const result = lighthouseOrganizationListResponseSchema.safeParse({
      success: true,
      data: [
        {
          id: 1,
          name: "島島學習社群",
          bio: null,
          externalLink: null,
          status: "pending",
          approvedBy: null,
          approvedAt: null,
          timezone: "Asia/Taipei",
          createdAt: timestamp,
          updatedAt: null,
        },
      ],
      timestamp,
    });

    expect(result.success).toBe(false);
  });

  it("parses program and cohort list responses", () => {
    const programResult = lighthouseProgramListResponseSchema.safeParse({
      success: true,
      data: [
        {
          id: 10,
          organizationId: 1,
          name: "持續行動系列",
          description: null,
          archivedAt: null,
          deletedAt: null,
          createdAt: timestamp,
          updatedAt: null,
        },
      ],
      timestamp,
    });
    const cohortResult = lighthouseCohortListResponseSchema.safeParse({
      success: true,
      data: [
        {
          id: 20,
          programId: 10,
          slug: "summer-2026",
          displayName: "夏季同行",
          tagline: null,
          startDate: "2026-07-01",
          endDate: "2026-08-31",
          joinToken: null,
          joinPaused: false,
          joinDeadline: null,
          capacity: 30,
          inviteMessage: null,
          showInviteMessageOnSignup: false,
          interactionModes: ["async"],
          meetingUrl: null,
          location: null,
          sessions: [{ id: 1, sessionDate: "2026-07-05", startTime: "19:00", endTime: null }],
          feeType: "free",
          feeAmount: null,
          signupMethod: "island_form",
          externalSignupUrl: null,
          isPrivate: true,
          checkinDefaultPrivate: false,
          hostCommentDefaultPrivate: false,
          hasHomePage: false,
          signupQuestionCount: 0,
          status: "published",
          visibility: "private",
          createdAt: timestamp,
          updatedAt: null,
        },
      ],
      timestamp,
    });

    expect(programResult.success).toBe(true);
    expect(cohortResult.success).toBe(true);
  });

  it("requires the real pending-response count in a cohort feed", () => {
    const feed = {
      success: true,
      data: {
        perspective: "coach",
        items: [],
        total: 12,
        pendingResponseCount: 3,
      },
      timestamp,
    };

    expect(lighthouseCoachFeedResponseSchema.safeParse(feed).success).toBe(true);
    expect(learnerCohortFeedResponseSchema.safeParse(feed).success).toBe(true);
    expect(
      lighthouseCoachFeedResponseSchema.safeParse({
        ...feed,
        data: { perspective: "coach", items: [], total: 12 },
      }).success
    ).toBe(false);
  });

  it("validates dashboard, focus, outcome, template, and participant responses", () => {
    const responses = [
      lighthouseDashboardResponseSchema.safeParse({
        success: true,
        data: {
          computedAt: timestamp,
          range: { from: "2026-07-01", to: "2026-07-22" },
          practiceTitle: null,
          practices: [{ title: "每日覆盤", startDate: "2026-07-01", endDate: null }],
          kpi: { enrolled: 10, activated: 8, activeThisWeek: 7 },
          checkins: 12,
          practiceOverview: [
            {
              title: "每日覆盤",
              startDate: "2026-07-01",
              endDate: null,
              startedCount: 8,
              checkinCount: 12,
              avgCheckinPeople: 1.5,
              avgCheckinLength: 42.5,
            },
          ],
          heatmap: { "2026-07-22": 2 },
          tagDistribution: [{ tag: "行動", count: 2 }],
          moodDistribution: [{ mood: "happy", count: 3 }],
          trend: {
            days: [{ date: "2026-07-22", count: 2 }],
            thisWeek: 5,
            lastWeek: 7,
            delta: -2,
          },
          hourHistogram: { "08": 2 },
        },
        timestamp,
      }),
      lighthouseFocusResponseSchema.safeParse({
        success: true,
        data: {
          needsEncouragement: [
            {
              userId: 7,
              nickname: "小島",
              avatar: null,
              practiceId: 100,
              practiceTitle: "每日覆盤",
              messageCount: 0,
              lastCheckinAt: timestamp,
              lastCheckinDate: "2026-07-22",
              lastCheckinPreview: "今天先做十分鐘",
              interruptedDays: 3,
            },
          ],
          celebrations: [
            {
              userId: 8,
              nickname: null,
              avatar: null,
              practiceId: 100,
              practiceTitle: "每日覆盤",
              messageCount: 1,
              moment: "first_checkin",
              momentDescription: "完成第一次打卡",
              occurredAt: timestamp,
              firstCheckinAt: timestamp,
            },
          ],
        },
        timestamp,
      }),
      lighthouseOutcomeResponseSchema.safeParse({
        success: true,
        data: validOutcome,
        timestamp,
      }),
      lighthouseTemplatesResponseSchema.safeParse({
        success: true,
        data: [
          {
            id: 1,
            externalId: "550e8400-e29b-41d4-a716-446655440000",
            organizationId: 1,
            title: "每日覆盤",
            practiceAction: null,
            durationDays: 30,
            frequencyMinDays: 3,
            frequencyMaxDays: 5,
            sessionDurationMinutes: 10,
            practiceTimePeriods: ["evening"],
            timingOther: null,
            status: "ready",
            archivedAt: null,
            tags: ["覆盤"],
            boundCohortIds: [20],
            bindings: [
              {
                cohortId: 20,
                cohortName: "夏季同行",
                cohortStatus: "published",
                cohortStartDate: timestamp,
                startDate: timestamp,
                endDate: null,
                locked: false,
              },
            ],
            resources: [{ id: "r1", name: "覆盤模板", url: "https://example.com", dayNumber: 1 }],
            generatedDraftCount: 4,
            createdAt: timestamp,
            updatedAt: null,
          },
        ],
        timestamp,
      }),
      cohortJoinInfoResponseSchema.safeParse({
        success: true,
        data: {
          cohortId: 20,
          displayName: "夏季同行",
          startDate: timestamp,
          endDate: timestamp,
          tagline: null,
          interactionModes: ["async"],
          location: null,
          sessions: [],
          feeType: "free",
          feeAmount: null,
          signupMethod: "island_form",
          externalSignupUrl: null,
          capacity: 30,
          joinDeadline: null,
          participantCount: 8,
          inviteMessage: null,
          canJoin: true,
          unavailableReason: null,
          privacy,
          visibilityNotice: "打卡對教練與同期學員可見",
          organization: organizationSummary,
        },
        timestamp,
      }),
      cohortMemberHomeResponseSchema.safeParse({
        success: true,
        data: {
          cohortId: 20,
          displayName: "夏季同行",
          startDate: timestamp,
          endDate: timestamp,
          tagline: null,
          interactionModes: ["async"],
          meetingUrl: null,
          location: null,
          sessions: [],
          feeType: "free",
          privacy,
          exportOptIn: false,
          organization: organizationSummary,
          practices: [
            {
              id: "550e8400-e29b-41d4-a716-446655440000",
              title: "每日覆盤",
              practiceAction: null,
              status: "draft",
              creationSource: "cohort_template",
            },
          ],
        },
        timestamp,
      }),
    ];

    expect(responses.every((result) => result.success)).toBe(true);
  });

  it("parses a full outcome payload and rejects null outcome data", () => {
    const valid = lighthouseOutcomeResponseSchema.safeParse({
      success: true,
      data: validOutcome,
      timestamp,
    });
    const nullData = lighthouseOutcomeResponseSchema.safeParse({
      success: true,
      data: null,
      timestamp,
    });

    expect(valid.success).toBe(true);
    expect(nullData.success).toBe(false);
  });

  it("parses a cohort activity feed response", () => {
    const result = lighthouseActivityResponseSchema.safeParse({
      success: true,
      data: {
        range: {
          from: "2026-07-01",
          to: "2026-07-22",
          min: "2026-07-01",
          max: "2026-08-31",
          timezone: "Asia/Taipei",
        },
        filters: { type: null, practiceTitle: null, q: null, hasText: false },
        practices: [{ title: "每日覆盤" }],
        stats: { checkins: 2, comments: 1, rhythm: 1, total: 4 },
        total: 3,
        items: [
          {
            id: "checkin:1",
            type: "checkin",
            typeLabel: "打卡",
            occurredAt: timestamp,
            member: { userId: 7, nickname: "小島", avatar: null },
            practice: { id: 100, title: "每日覆盤" },
            summary: "今天先做十分鐘",
            hasText: true,
            meta: {},
          },
          {
            id: "comment:1",
            type: "comment",
            typeLabel: "留言回應",
            occurredAt: timestamp,
            member: { userId: 8, nickname: null, avatar: null },
            practice: { id: 100, title: "每日覆盤" },
            summary: "加油！",
            hasText: true,
            meta: { checkinId: 1 },
          },
          {
            id: "rhythm:1",
            type: "rhythm",
            typeLabel: "節奏變化",
            occurredAt: timestamp,
            member: { userId: 7, nickname: "小島", avatar: null },
            practice: { id: 100, title: "每日覆盤" },
            summary: "連續 3 天未打卡",
            hasText: false,
            meta: { interruptedDays: 3 },
          },
        ],
      },
      timestamp,
    });

    expect(result.success).toBe(true);
    expect(
      lighthouseActivityResponseSchema.safeParse({
        success: true,
        data: { range: { from: "2026-07-01" }, items: [] },
        timestamp,
      }).success
    ).toBe(false);
  });

  it("whitelists learner and organization-member response fields", () => {
    const learners = lighthouseCohortMembersResponseSchema.parse({
      success: true,
      data: [
        {
          id: 7,
          nickname: "小島",
          avatar: null,
          joinedAt: timestamp,
          email: "private@example.com",
        },
      ],
      timestamp,
    });
    const organizationMembers = lighthouseOrganizationMembersResponseSchema.parse({
      success: true,
      data: [
        {
          id: 1,
          userId: 7,
          nickname: "教練",
          role: "owner",
          createdAt: timestamp,
          email: "private@example.com",
        },
      ],
      timestamp,
    });

    expect(learners.data[0]).not.toHaveProperty("email");
    expect(organizationMembers.data[0]).not.toHaveProperty("email");
  });
});

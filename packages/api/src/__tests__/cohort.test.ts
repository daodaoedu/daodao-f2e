import { describe, expect, it } from "vitest";
import {
  cohortJoinInfoResponseSchema,
  cohortMemberHomeResponseSchema,
  learnerCohortFeedResponseSchema,
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
          createdAt: timestamp,
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
          createdAt: timestamp,
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
          startDate: "2026-07-01",
          endDate: "2026-08-31",
          joinToken: null,
          joinDeadline: null,
          capacity: 30,
          inviteMessage: null,
          status: "published",
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
          snapshotKind: "weekly",
          computedAt: timestamp,
          rhythmHeatmap: { "2026-07-22": 2 },
          tagDistribution: [{ tag: "行動", count: 2 }],
          commonBlockers: { stuck: 1 },
          funnel: { enrolled: 10, activated: 8, activeMembers: 7 },
          timeRhythm: { "08": 2 },
          checkins: 12,
          exited: 1,
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
              lastCheckinAt: timestamp,
              lastCheckinPreview: "今天先做十分鐘",
              interruptedDays: 3,
            },
          ],
          celebrations: [
            {
              userId: 8,
              nickname: null,
              avatar: null,
              moment: "first_checkin",
              occurredAt: timestamp,
            },
          ],
        },
        timestamp,
      }),
      lighthouseOutcomeResponseSchema.safeParse({
        success: true,
        data: {
          cohortId: 20,
          completedCount: 8,
          enrolledCount: 10,
          sustainedParticipationCount: 7,
          sustainedParticipationRate: 0.7,
          computedAt: timestamp,
        },
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
            boundCohortIds: [20],
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
          inviteMessage: null,
          canJoin: true,
          unavailableReason: null,
          visibilityNotice: "打卡對教練與同期學員可見",
          organization: { name: "島島", bio: null, externalLink: null },
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
          exportOptIn: false,
          organization: { name: "島島", bio: null, externalLink: null },
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

  it("accepts null outcome data when snapshot has not been generated", () => {
    const result = lighthouseOutcomeResponseSchema.safeParse({
      success: true,
      data: null,
      timestamp,
    });
    expect(result.success).toBe(true);
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

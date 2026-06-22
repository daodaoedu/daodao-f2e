export interface IChallengeParticipant {
  id: string;
  avatarColor: string;
  name: string;
}

export interface IChallenge {
  id: string;
  title: string;
  description: string;
  status: "draft" | "active" | "completed";
  statusLabel: string;
  period: {
    start: string;
    end: string;
  };
  participantCount: number;
  participants: IChallengeParticipant[];
}

export interface IExploreTopicRecommendation {
  id: string;
  title: string;
  description: string;
  tags: string[];
  reason: string;
  authorName: string;
  authorAvatarChar: string;
  authorAvatarColor: string;
  templateId?: string;
  practiceId?: string;
}

export function useChallenges() {
  const t = useTranslations("app_product");

  return {
    challenges: [
      {
        id: "challenge-1",
        title: t("mock_challenge_title"),
        description: t("mock_challenge_description"),
        status: "draft",
        statusLabel: t("mock_challenge_status"),
        period: { start: "5/1", end: "5/21" },
        participantCount: 142,
        participants: [
          { id: "p1", avatarColor: "#93C5FD", name: t("mock_participant_1") },
          { id: "p2", avatarColor: "#86EFAC", name: t("mock_participant_2") },
          { id: "p3", avatarColor: "#C4B5FD", name: t("mock_participant_3") },
        ],
      },
    ] satisfies IChallenge[],
    isLoading: false,
  };
}

export function useExploreTopics() {
  const t = useTranslations("app_product");

  return {
    topics: [
      {
        id: "explore-1",
        title: t("mock_explore_1_title"),
        description: t("mock_explore_1_description"),
        tags: [
          t("mock_explore_tag_english"),
          t("mock_explore_tag_exam"),
          t("mock_explore_tag_listening"),
        ],
        reason: t("mock_explore_1_reason"),
        authorName: t("mock_explore_1_author"),
        authorAvatarChar: t("mock_explore_1_avatar"),
        authorAvatarColor: "#16B9B3",
      },
      {
        id: "explore-2",
        title: t("mock_explore_2_title"),
        description: t("mock_explore_2_description"),
        tags: [t("mock_explore_tag_reading"), t("mock_explore_tag_growth")],
        reason: t("mock_explore_2_reason"),
        authorName: t("mock_explore_2_author"),
        authorAvatarChar: t("mock_explore_2_avatar"),
        authorAvatarColor: "#16B9B3",
      },
      {
        id: "explore-3",
        title: t("mock_explore_3_title"),
        description: t("mock_explore_3_description"),
        tags: ["Podcast", t("mock_explore_tag_creation")],
        reason: t("mock_explore_3_reason"),
        authorName: t("mock_explore_3_author"),
        authorAvatarChar: t("mock_explore_3_avatar"),
        authorAvatarColor: "#16B9B3",
      },
    ] satisfies IExploreTopicRecommendation[],
    isLoading: false,
  };
}

import { useTranslations } from "@daodao/i18n";

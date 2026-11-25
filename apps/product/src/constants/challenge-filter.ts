export const CHALLENGE_STATUS_FILTERS = ["all", "upcoming", "ongoing", "ended"] as const;
export type ChallengeStatusFilter = (typeof CHALLENGE_STATUS_FILTERS)[number];

interface SearchableChallenge {
  displayName: string;
  description?: string | null;
  runStatus: string;
}

const normalize = (s: string) => s.toLocaleLowerCase("zh-TW").trim();

/** 探索共同挑戰的搜尋（名稱、介紹）與狀態篩選（daodao#567） */
export const searchChallenges = <T extends SearchableChallenge>(
  challenges: T[],
  query: string,
  statusFilter: ChallengeStatusFilter
): T[] => {
  const q = normalize(query);
  return challenges.filter((challenge) => {
    if (statusFilter !== "all" && challenge.runStatus !== statusFilter) return false;
    if (!q) return true;
    return [challenge.displayName, challenge.description].some(
      (field) => field && normalize(field).includes(q)
    );
  });
};

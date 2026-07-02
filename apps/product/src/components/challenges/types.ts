/** 共同挑戰 POC 型別定義（對應 docs/b2b/FRD-共同挑戰.md 資料模型） */

export type ChallengeCategory = "exam" | "book" | "sport" | "certification" | "other";

export type SeasonStatus = "upcoming" | "active" | "ended";

export interface ChallengeSeason {
  id: string;
  seasonNumber: number;
  title?: string;
  targetDescription: string;
  startDate: string;
  endDate: string;
  status: SeasonStatus;
  memberCount: number;
  totalCheckins: number;
}

export interface Challenge {
  id: string;
  title: string;
  description: string;
  coverEmoji: string;
  category: ChallengeCategory;
  isRecurring: boolean;
  checkinPrompt?: string;
  hasRanking: boolean;
  allTimeParticipants: number;
  seasons: ChallengeSeason[];
}

export interface SeasonCheckin {
  id: string;
  userId: string;
  displayName: string;
  avatarEmoji: string;
  content: string;
  checkinDate: string;
  streak: number;
}

export interface SeasonRankingEntry {
  rank: number;
  userId: string;
  displayName: string;
  avatarEmoji: string;
  totalCheckins: number;
  currentStreak: number;
  isMe?: boolean;
}

export interface MySeasonHistory {
  seasonId: string;
  seasonNumber: number;
  checkinCount: number;
  streak: number;
}

export interface MyChallengeProgress {
  challengeId: string;
  seasonId: string;
  joined: boolean;
  todayCheckedIn: boolean;
  myCheckinCount: number;
  myStreak: number;
  myRank: number | null;
}

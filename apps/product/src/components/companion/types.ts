/** 陪伴計畫 POC 型別定義（對應 docs/b2b/PRD-陪伴計畫.md Phase 1 輕量陪伴） */

export type PartnerStatus = "active" | "quiet" | "shining";

export interface CompanionProgram {
  id: string;
  title: string;
  description: string;
  visibility: "public" | "private";
  ownerName: string;
  partnerCount: number;
  createdAt: string;
}

export interface PartnerCheckin {
  id: string;
  partnerId: string;
  displayName: string;
  content: string;
  checkinDate: string;
  streak: number;
  /** 老師是否已回應過這則打卡 */
  responded: boolean;
}

export interface Partner {
  id: string;
  displayName: string;
  joinedAt: string;
  totalCheckins: number;
  currentStreak: number;
  /** 距離上次打卡的天數 */
  daysSinceLastCheckin: number;
  status: PartnerStatus;
}

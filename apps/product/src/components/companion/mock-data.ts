/** 陪伴計畫 POC 假資料 */

import type { CompanionProgram, Partner, PartnerCheckin } from "./types";

export const MOCK_PROGRAM: CompanionProgram = {
  id: "writing-circle",
  title: "寫作陪伴圈",
  description: "不趕進度、不比較。每天寫一點，把「想寫」變成「有在寫」。我會看見你的每一步。",
  visibility: "private",
  ownerName: "阿島老師",
  partnerCount: 18,
  createdAt: "2026-03-01",
};

export const MOCK_RECENT_CHECKINS: PartnerCheckin[] = [
  {
    id: "pc1",
    partnerId: "p1",
    displayName: "王小明",
    content: "今天寫了 500 字，寫到主角離家那段居然哭了。好像抓到什麼了。",
    checkinDate: "2026-07-02",
    streak: 45,
    responded: false,
  },
  {
    id: "pc2",
    partnerId: "p2",
    displayName: "李小華",
    content: "卡住了…開頭改了三次還是不滿意，今天只寫了 100 字。",
    checkinDate: "2026-07-02",
    streak: 8,
    responded: false,
  },
  {
    id: "pc3",
    partnerId: "p3",
    displayName: "陳美玲",
    content: "把上週的草稿重寫了一遍，這次用第一人稱，感覺流暢多了。",
    checkinDate: "2026-07-01",
    streak: 22,
    responded: true,
  },
];

export const MOCK_PARTNERS: Partner[] = [
  {
    id: "p1",
    displayName: "王小明",
    joinedAt: "2026-03-05",
    totalCheckins: 98,
    currentStreak: 45,
    daysSinceLastCheckin: 0,
    status: "shining",
  },
  {
    id: "p2",
    displayName: "李小華",
    joinedAt: "2026-04-12",
    totalCheckins: 41,
    currentStreak: 8,
    daysSinceLastCheckin: 0,
    status: "active",
  },
  {
    id: "p3",
    displayName: "陳美玲",
    joinedAt: "2026-03-20",
    totalCheckins: 67,
    currentStreak: 22,
    daysSinceLastCheckin: 1,
    status: "active",
  },
  {
    id: "p4",
    displayName: "張大同",
    joinedAt: "2026-05-01",
    totalCheckins: 12,
    currentStreak: 0,
    daysSinceLastCheckin: 7,
    status: "quiet",
  },
  {
    id: "p5",
    displayName: "林小茜",
    joinedAt: "2026-04-02",
    totalCheckins: 25,
    currentStreak: 0,
    daysSinceLastCheckin: 10,
    status: "quiet",
  },
];

/** 一段時間沒動靜、可能需要老師關心的夥伴 */
export function getQuietPartners(): Partner[] {
  return MOCK_PARTNERS.filter((p) => p.status === "quiet");
}

/** 持續力特別強、值得被看見的夥伴 */
export function getShiningPartners(): Partner[] {
  return MOCK_PARTNERS.filter((p) => p.status === "shining");
}

/**
 * entities 模組邊界（tasks 3.6/3.7 實作）
 *
 * 職責：islandData → 島上物件的映射
 * - 實踐 → 營地建築（active 帳篷＋營火 / completed 小木屋，theme_color 配色）
 * - 打卡 → 植栽（checkin id 種子、InstancedMesh）與生態熱鬧度
 * 互動：走近/點擊建築發出 IIslandObjectClickPayload
 */

import type { IIslandPractice } from "../types";

export const BuildingKind = {
  tent: "tent",
  cabin: "cabin",
} as const;
export type BuildingKindType = (typeof BuildingKind)[keyof typeof BuildingKind];

/** 實踐 → 建築的映射結果（純資料，three.js 建構層另行實作） */
export interface IBuildingSpec {
  practiceId: string;
  kind: BuildingKindType;
  themeColor: string | null;
  campfireLit: boolean;
}

/**
 * 實踐狀態 → 建築種類映射（task 3.6 於此擴充擺位與 three.js 建構）
 */
export const mapPracticeToBuilding = (practice: IIslandPractice): IBuildingSpec => ({
  practiceId: practice.id,
  kind: practice.status === "completed" ? BuildingKind.cabin : BuildingKind.tent,
  themeColor: practice.themeColor,
  campfireLit: practice.status === "active",
});

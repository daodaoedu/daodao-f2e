/**
 * IslandEngine 對外型別
 *
 * 結構鏡射 server `GET /api/v1/users/:identifier/island` 的 islandData payload，
 * 但刻意不依賴 @daodao/api——engine 保持零 React、零 app 依賴，
 * React 殼負責把 API 回應餵進來。
 */

export const PersonaType = {
  D: "D",
  A: "A",
  O: "O",
  L: "L",
  C: "C",
} as const;
export type PersonaTypeType = (typeof PersonaType)[keyof typeof PersonaType];

export const IslandPracticeStatus = {
  active: "active",
  completed: "completed",
} as const;
export type IslandPracticeStatusType =
  (typeof IslandPracticeStatus)[keyof typeof IslandPracticeStatus];

export const ViewerRelation = {
  self: "self",
  connection: "connection",
  visitor: "visitor",
} as const;
export type ViewerRelationType = (typeof ViewerRelation)[keyof typeof ViewerRelation];

export interface IIslandProfile {
  id: string;
  customId: string | null;
  name: string | null;
  photoURL: string | null;
}

export interface IIslandPractice {
  id: string;
  title: string;
  status: IslandPracticeStatusType;
  themeColor: string | null;
  checkinCount: number;
  /** 打卡 id 清單（升冪），作為植栽種類/位置的 deterministic 種子 */
  checkinIds: number[];
}

export interface IIslandData {
  profile: IIslandProfile;
  /** quiz 人格單字母代碼（D/A/O/L/C）；null 渲染中性預設島 */
  personaType: string | null;
  practices: IIslandPractice[];
  /** 近 30 天打卡總量，決定生態熱鬧度 */
  recentCheckinCount: number;
  viewerRelation: ViewerRelationType;
}

export interface IIslandDestination {
  identifier: string;
  name: string;
  photoUrl: string | null;
}

/** 島上物件被點擊/互動時的事件 payload */
export type IIslandObjectClickPayload =
  | {
      kind: "practice";
      practiceId: string;
    }
  | {
      kind: "harbor";
    }
  | {
      kind: "owner";
    }
  | {
      kind: "destination";
      identifier: string;
    };

export interface IIslandEngineEvents {
  onObjectClick?: (payload: IIslandObjectClickPayload) => void;
  /** 首幀渲染完成 */
  onReady?: () => void;
  /** 角色與操控就緒，可開始走動（React 殼可據此收掉載入畫面） */
  onWalkable?: () => void;
  /** 環島空拍 intro 結束或被跳過（React 殼可據此收掉跳過按鈕） */
  onIntroEnd?: () => void;
}

export interface IIslandEngineOptions {
  container: HTMLElement;
  islandData: IIslandData;
  /**
   * deterministic 生成種子；預設用 profile.id（島主 external_id），
   * 保證同一島主的島在任何裝置、任何觀看者眼中一致
   */
  seed?: string;
  /** 品質分級；預設 "auto" 依裝置偵測 */
  quality?: "auto" | import("./core/quality").QualityTierType;
  /** GLB 資產 base URL（task 3.3/5.2 接上正式素材） */
  assetBaseUrl?: string;
  /** 可由島岸航線前往的其他島嶼 */
  destinations?: readonly IIslandDestination[];
  events?: IIslandEngineEvents;
}

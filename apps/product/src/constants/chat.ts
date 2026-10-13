/** 聊天室圖示底色（POC 訊息.dc.html 的三種 cover：米黃／淺青／杏色），依 colorSeed 輪替 */
export const CHAT_ROOM_COVERS = [
  "bg-[oklch(0.97_0.045_85)]",
  "bg-[oklch(0.962_0.032_211.1)]",
  "bg-[oklch(0.93_0.06_60)]",
] as const;

export const getChatRoomCover = (colorSeed: number): string =>
  CHAT_ROOM_COVERS[Math.abs(colorSeed) % CHAT_ROOM_COVERS.length] ?? CHAT_ROOM_COVERS[0];

export const CHAT_GROUP_GAP_MS = 5 * 60 * 1000;

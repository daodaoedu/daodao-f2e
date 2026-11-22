/**
 * 聊天室訊息數變動時要捲到哪裡（daodao#555「定位到第一則未讀」）。
 *
 * - 第一次載入：有第一則未讀且已載入 → 停在該則；否則捲到底
 * - 停在未讀後，使用者還沒自己捲回底部前，輪詢補進來的新訊息不把畫面拉走；
 *   自己送出訊息時才捲到底並解除停留
 * - 其他情況維持原本行為：有新訊息就捲到底
 */
export type ChatScrollAction = "none" | "bottom" | "first-unread";

export interface ChatScrollInput {
  prevCount: number;
  nextCount: number;
  /** 進入聊天室當下的第一則未讀 ID；沒有未讀時 null */
  firstUnreadMessageId: number | null;
  /** 第一則未讀是否已在時間軸上 */
  firstUnreadLoaded: boolean;
  /** 目前是否停在第一則未讀、使用者尚未捲回底部 */
  anchored: boolean;
  /** 最新一則訊息是本人送出的 */
  lastIsOwn: boolean;
}

export function decideChatScroll(input: ChatScrollInput): ChatScrollAction {
  const { prevCount, nextCount, firstUnreadMessageId, firstUnreadLoaded, anchored, lastIsOwn } =
    input;
  if (nextCount === 0 || nextCount === prevCount) return "none";
  if (prevCount === 0) {
    return firstUnreadMessageId !== null && firstUnreadLoaded ? "first-unread" : "bottom";
  }
  if (anchored) return lastIsOwn ? "bottom" : "none";
  return "bottom";
}

/** 捲動容器距底部在這個距離內，視為使用者已回到底部 */
export const CHAT_NEAR_BOTTOM_PX = 80;

export function isNearBottom(el: {
  scrollHeight: number;
  scrollTop: number;
  clientHeight: number;
}) {
  return el.scrollHeight - el.scrollTop - el.clientHeight <= CHAT_NEAR_BOTTOM_PX;
}

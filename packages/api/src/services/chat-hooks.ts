"use client";

/** 群組聊天 SWR hooks。 */

import { EMPTY_QUERY_INIT, useQuery } from "../hooks";

// ============================================================================
// Query Hooks
// ============================================================================

/** 我的聊天室列表；30 秒輪詢保持未讀計數新鮮 */
export const useMyChatRooms = () =>
  useQuery("/api/v1/me/chat-rooms", EMPTY_QUERY_INIT, {
    revalidateOnFocus: true,
    refreshInterval: 30_000,
  });

/** 聊天室詳情 */
export const useChatRoom = (roomId: number | null) =>
  useQuery(
    "/api/v1/chat-rooms/{roomId}",
    roomId ? { params: { path: { roomId } } } : null,
    { revalidateOnFocus: false }
  );

/** 聊天室成員列表 */
export const useChatMembers = (roomId: number | null) =>
  useQuery(
    "/api/v1/chat-rooms/{roomId}/members",
    roomId ? { params: { path: { roomId } } } : null,
    { revalidateOnFocus: false }
  );

/** 歷史訊息（初始載入，不帶 after/since） */
export const useChatMessageHistory = (roomId: number | null) =>
  useQuery(
    "/api/v1/chat-rooms/{roomId}/messages",
    roomId ? { params: { path: { roomId } } } : null,
    { revalidateOnFocus: false }
  );

/** 增量輪詢（5 秒，after + since 模式）；三個參數齊備才啟用 */
export const useChatMessageDelta = (
  roomId: number | null,
  after: number | null,
  since: string | null
) =>
  useQuery(
    "/api/v1/chat-rooms/{roomId}/messages",
    roomId && after && since
      ? { params: { path: { roomId }, query: { after, since } } }
      : null,
    { refreshInterval: 5_000, refreshWhenHidden: false, revalidateOnFocus: true }
  );

/** 釘選訊息列表 */
export const useChatPins = (roomId: number | null) =>
  useQuery(
    "/api/v1/chat-rooms/{roomId}/pins",
    roomId ? { params: { path: { roomId } } } : null,
    { revalidateOnFocus: false }
  );

/** 訊息搜尋；roomId 與 q 齊備才啟用 */
export const useChatSearch = (roomId: number | null, q: string | null) =>
  useQuery(
    "/api/v1/chat-rooms/{roomId}/messages/search",
    roomId && q ? { params: { path: { roomId }, query: { q } } } : null,
    { revalidateOnFocus: false }
  );

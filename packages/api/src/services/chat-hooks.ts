"use client";

/** 群組聊天 SWR hooks。 */

import { EMPTY_QUERY_INIT, useQuery } from "../hooks";

// ============================================================================
// Query Hooks
// ============================================================================

/** 我的聊天室列表；5 秒輪詢保持未讀計數新鮮 */
export const useMyChatRooms = () =>
  useQuery("/api/v1/me/chat-rooms", EMPTY_QUERY_INIT, {
    revalidateOnFocus: true,
    refreshInterval: 5_000,
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

/** 聊天訊息列表（初始載入） */
export const useChatMessages = (roomId: number | null) =>
  useQuery(
    "/api/v1/chat-rooms/{roomId}/messages",
    roomId ? { params: { path: { roomId } } } : null,
    { revalidateOnFocus: false }
  );

/** 釘選訊息列表 */
export const useChatPins = (roomId: number | null) =>
  useQuery(
    "/api/v1/chat-rooms/{roomId}/pins",
    roomId ? { params: { path: { roomId } } } : null,
    { revalidateOnFocus: false }
  );

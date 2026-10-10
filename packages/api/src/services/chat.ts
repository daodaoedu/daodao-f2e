/** 群組聊天 API service。 */

import { client } from "../client";
import type { paths } from "../types";

// ============================================================================
// Types
// ============================================================================

type JsonBody<T> = T extends { content: { "application/json": infer B } } ? B : never;

// server 回應一律包在 { success, data, ... } 外層；以下型別取 data 內的實際內容
type ChatRoomListResponse = JsonBody<paths["/api/v1/me/chat-rooms"]["get"]["responses"][200]>;
type ChatRoomDetailResponse = JsonBody<
  paths["/api/v1/chat-rooms/{roomId}"]["get"]["responses"][200]
>;
type ChatMemberListResponse = JsonBody<
  paths["/api/v1/chat-rooms/{roomId}/members"]["get"]["responses"][200]
>;
/** 歷史分頁（data 為訊息陣列）或增量輪詢（data 為 delta 物件） */
type ChatMessagesResponse = JsonBody<
  paths["/api/v1/chat-rooms/{roomId}/messages"]["get"]["responses"][200]
>;
type ChatPinnedMessageListResponse = JsonBody<
  paths["/api/v1/chat-rooms/{roomId}/pins"]["get"]["responses"][200]
>;
type ChatSearchResponse = JsonBody<
  paths["/api/v1/chat-rooms/{roomId}/messages/search"]["get"]["responses"][200]
>;

type ChatMessageHistoryResponse = Extract<ChatMessagesResponse, { data: unknown[] }>;
type ChatMessageDeltaResponse = Exclude<ChatMessagesResponse, { data: unknown[] }>;

export type ChatRoomListType = ChatRoomListResponse["data"];
export type ChatRoomType = ChatRoomListType["items"][number];
export type ChatRoomDetailType = ChatRoomDetailResponse["data"];
export type ChatMemberType = ChatMemberListResponse["data"][number];
export type ChatMessageType = ChatMessageHistoryResponse["data"][number];
export type ChatMessageDeltaType = Pick<
  ChatMessageDeltaResponse["data"],
  "messages" | "changed" | "deletedIds"
>;
export type ChatPinnedMessageType = ChatPinnedMessageListResponse["data"][number];
export type ChatSearchResultType = ChatSearchResponse["data"];

// ============================================================================
// Response Selectors — 從 SWR 拿到的 envelope 取出畫面要用的資料（daodao#154）
// ============================================================================

/** 聊天室列表與總未讀；未載入時回空列表 */
export const selectChatRoomList = (res: ChatRoomListResponse | undefined): ChatRoomListType =>
  res?.data ?? { totalUnread: 0, items: [] };

/** 聊天室詳情；未載入或失敗時回 undefined */
export const selectChatRoom = (
  res: ChatRoomDetailResponse | undefined
): ChatRoomDetailType | undefined => res?.data;

/** 成員列表 */
export const selectChatMembers = (res: ChatMemberListResponse | undefined): ChatMemberType[] =>
  res?.data ?? [];

/**
 * 歷史訊息，排成舊到新（server 分頁是新到舊）；body 不是歷史分頁形狀時回空陣列。
 * 頁面用最後一筆當增量輪詢的 after，所以順序不能直接沿用 server 的。
 */
export const selectChatHistory = (res: ChatMessagesResponse | undefined): ChatMessageType[] =>
  res && Array.isArray(res.data) ? [...res.data].sort((a, b) => a.id - b.id) : [];

/** 增量輪詢結果；body 不是 delta 形狀時回 null */
export const selectChatDelta = (
  res: ChatMessagesResponse | undefined
): ChatMessageDeltaType | null => {
  if (!res || Array.isArray(res.data)) return null;
  const { messages, changed, deletedIds } = res.data;
  return { messages: messages ?? [], changed: changed ?? [], deletedIds: deletedIds ?? [] };
};

/** 置頂訊息列表 */
export const selectChatPins = (
  res: ChatPinnedMessageListResponse | undefined
): ChatPinnedMessageType[] => res?.data ?? [];

/** 室內搜尋結果 */
export const selectChatSearch = (res: ChatSearchResponse | undefined): ChatSearchResultType =>
  res?.data ?? { total: 0, items: [] };

/** 失敗回應的 server 訊息（{ success: false, error: { message } }）；取不到時用 fallback */
export const selectChatErrorMessage = (error: unknown, fallback: string): string => {
  if (!error || typeof error !== "object" || !("error" in error)) return fallback;
  const inner = (error as { error?: unknown }).error;
  if (!inner || typeof inner !== "object" || !("message" in inner)) return fallback;
  const message = (inner as { message?: unknown }).message;
  return typeof message === "string" && message.trim() ? message : fallback;
};

// ============================================================================
// Client Functions
// ============================================================================

/** 我的聊天室列表 */
export const getMyChatRooms = async () => client.GET("/api/v1/me/chat-rooms");

/** 聊天室詳情 */
export const getChatRoom = async (roomId: number) =>
  client.GET("/api/v1/chat-rooms/{roomId}", {
    params: { path: { roomId } },
  });

/** 聊天室成員列表 */
export const getChatMembers = async (roomId: number) =>
  client.GET("/api/v1/chat-rooms/{roomId}/members", {
    params: { path: { roomId } },
  });

/** 聊天訊息列表（分頁） */
export const getChatMessages = async (
  roomId: number,
  query?: { before?: number; after?: number; since?: string; limit?: number }
) =>
  client.GET("/api/v1/chat-rooms/{roomId}/messages", {
    params: { path: { roomId }, query },
  });

/** 發送訊息 */
export const sendChatMessage = async (roomId: number, body: string, replyToMessageId?: number) =>
  client.POST("/api/v1/chat-rooms/{roomId}/messages", {
    params: { path: { roomId } },
    body: { body, replyToMessageId },
  });

/** 編輯訊息 */
export const editChatMessage = async (roomId: number, messageId: number, body: string) =>
  client.PATCH("/api/v1/chat-rooms/{roomId}/messages/{messageId}", {
    params: { path: { roomId, messageId } },
    body: { body },
  });

/** 刪除訊息 */
export const deleteChatMessage = async (roomId: number, messageId: number) =>
  client.DELETE("/api/v1/chat-rooms/{roomId}/messages/{messageId}", {
    params: { path: { roomId, messageId } },
  });

/** 按讚訊息 */
export const likeChatMessage = async (roomId: number, messageId: number) =>
  client.PUT("/api/v1/chat-rooms/{roomId}/messages/{messageId}/like", {
    params: { path: { roomId, messageId } },
  });

/** 取消按讚 */
export const unlikeChatMessage = async (roomId: number, messageId: number) =>
  client.DELETE("/api/v1/chat-rooms/{roomId}/messages/{messageId}/like", {
    params: { path: { roomId, messageId } },
  });

/** 置頂訊息 */
export const pinChatMessage = async (roomId: number, messageId: number) =>
  client.PUT("/api/v1/chat-rooms/{roomId}/messages/{messageId}/pin", {
    params: { path: { roomId, messageId } },
  });

/** 取消置頂 */
export const unpinChatMessage = async (roomId: number, messageId: number) =>
  client.DELETE("/api/v1/chat-rooms/{roomId}/messages/{messageId}/pin", {
    params: { path: { roomId, messageId } },
  });

/** 釘選訊息列表 */
export const getChatPins = async (roomId: number) =>
  client.GET("/api/v1/chat-rooms/{roomId}/pins", {
    params: { path: { roomId } },
  });

/** 搜尋訊息 */
export const searchChatMessages = async (roomId: number, q: string) =>
  client.GET("/api/v1/chat-rooms/{roomId}/messages/search", {
    params: { path: { roomId }, query: { q } },
  });

/** 標記已讀 */
export const markChatRoomRead = async (roomId: number, lastReadMessageId?: number) =>
  client.PUT("/api/v1/chat-rooms/{roomId}/read", {
    params: { path: { roomId } },
    ...(lastReadMessageId != null && { body: { lastReadMessageId } }),
  });

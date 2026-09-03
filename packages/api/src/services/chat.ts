/** 群組聊天 API service。 */

import { client } from "../client";
import type { paths } from "../types";

// ============================================================================
// Types
// ============================================================================

type ChatRoomListResponse =
  paths["/api/v1/me/chat-rooms"]["get"]["responses"][200]["content"]["application/json"];
type ChatRoomDetailResponse =
  paths["/api/v1/chat-rooms/{roomId}"]["get"]["responses"][200]["content"]["application/json"];
type ChatMemberListResponse =
  paths["/api/v1/chat-rooms/{roomId}/members"]["get"]["responses"][200]["content"]["application/json"];
type ChatMessageListResponse =
  paths["/api/v1/chat-rooms/{roomId}/messages"]["get"]["responses"][200]["content"]["application/json"];
type ChatPinnedMessageListResponse =
  paths["/api/v1/chat-rooms/{roomId}/pins"]["get"]["responses"][200]["content"]["application/json"];

export type ChatRoomType = ChatRoomListResponse["items"][number];
export type ChatRoomDetailType = ChatRoomDetailResponse;
export type ChatMemberType = ChatMemberListResponse[number];
export type ChatMessageType = ChatMessageListResponse["messages"][number];
export type ChatPinnedMessageType = ChatPinnedMessageListResponse[number];

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
export const sendChatMessage = async (
  roomId: number,
  body: string,
  replyToMessageId?: number
) =>
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

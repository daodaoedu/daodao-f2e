/** Future letter API service. */

import { client } from "../client";
import type { components, paths } from "../types";

// ============================================================================
// Types
// ============================================================================

export type FutureLetterType = components["schemas"]["FutureLetter"];
export type CreateFutureLetterRequestType = components["schemas"]["CreateFutureLetter"];
export type UpdateFutureLetterRequestType = components["schemas"]["UpdateFutureLetter"];
export type SendFutureLetterRequestType = components["schemas"]["SendFutureLetter"];
export type IGetMyFutureLettersParams = NonNullable<
  paths["/api/v1/me/future-letters"]["get"]["parameters"]["query"]
>;

// ============================================================================
// Client Functions
// ============================================================================

export const createFutureLetter = async (data: CreateFutureLetterRequestType) =>
  client.POST("/api/v1/me/future-letters", { body: data });

export const getMyFutureLetters = async (params: IGetMyFutureLettersParams = {}) =>
  client.GET("/api/v1/me/future-letters", {
    params: { query: params },
  });

export const getFutureLetter = async (id: string) =>
  client.GET("/api/v1/me/future-letters/{id}", {
    params: { path: { id } },
  });

export const updateFutureLetter = async (id: string, data: UpdateFutureLetterRequestType) =>
  client.PATCH("/api/v1/me/future-letters/{id}", {
    params: { path: { id } },
    body: data,
  });

export const deleteFutureLetter = async (id: string) =>
  client.DELETE("/api/v1/me/future-letters/{id}", {
    params: { path: { id } },
  });

export const sendFutureLetter = async (id: string, data: SendFutureLetterRequestType) =>
  client.POST("/api/v1/me/future-letters/{id}/send", {
    params: { path: { id } },
    body: data,
  });

export const openFutureLetter = async (id: string) =>
  client.POST("/api/v1/me/future-letters/{id}/open", {
    params: { path: { id } },
  });

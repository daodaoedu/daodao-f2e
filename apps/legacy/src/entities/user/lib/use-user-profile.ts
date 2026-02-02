"use client";

import { useUserByCustomId, useUserById } from "@daodao/api";
import type { UserIdObject } from "../model";

/**
 * 統一的用戶資料 Hook
 * 根據 UserIdObject 自動選擇使用 id 或 customId 來獲取用戶資料
 */
export const useUserProfile = (userIdObject: UserIdObject) => {
  const { customId, id } = userIdObject;

  const resultByUserId = useUserById(id ?? "");
  const resultByCustomId = useUserByCustomId(customId ?? "");

  return customId ? resultByCustomId : resultByUserId;
};

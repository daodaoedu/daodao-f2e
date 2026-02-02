import { getUserByCustomId, getUserById } from "@daodao/api";
import type { UserIdObject } from "../model";

/**
 * 統一的用戶資料獲取函數 (Server 端)
 */
export const getUserData = async ({ customId, id }: UserIdObject) => {
  if (customId) {
    return getUserByCustomId(customId);
  }
  if (id) {
    return getUserById(id);
  }
  throw new Error("Either customId or id must be provided");
};

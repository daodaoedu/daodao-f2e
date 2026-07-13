import { getApiBaseUrl, unauthorizedHandler } from "../client";
import { extractApiErrorMessage } from "./check-in-form-data";

// ============================================================================
// Types
// (Follow/Connection API は types.ts 生成前のため手動定義)
// ============================================================================

export interface IFollowTarget {
  targetType: "user" | "practice";
  targetId: string;
}

export interface IFollowUserProfile {
  id: string;
  name: string;
  photoURL?: string;
  bio?: string;
  identifier?: string;
}

export interface IFollowPracticeProfile {
  id: string;
  title: string;
  ownerName: string;
  ownerPhotoURL?: string;
}

export interface IFollowingItem {
  targetType: "user" | "practice";
  user?: IFollowUserProfile;
  practice?: IFollowPracticeProfile;
}

export interface IPaginatedFollowers {
  data: IFollowUserProfile[];
  total: number;
  page: number;
  limit: number;
}

export interface IPaginatedFollowing {
  data: IFollowingItem[];
  total: number;
  page: number;
  limit: number;
}

export interface IGetFollowParams {
  userId: string;
  page?: number;
  limit?: number;
}

// ============================================================================
// API Functions
// ============================================================================

const getBaseUrl = () => getApiBaseUrl();

export const followTarget = async (body: IFollowTarget): Promise<void> => {
  const res = await unauthorizedHandler.wrapFetch(`${getBaseUrl()}/api/v1/follows`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    credentials: "include",
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(extractApiErrorMessage(err, "關注失敗"));
  }
};

export const unfollowTarget = async (
  targetType: "user" | "practice",
  targetId: string
): Promise<void> => {
  const res = await unauthorizedHandler.wrapFetch(
    `${getBaseUrl()}/api/v1/follows/${targetType}/${targetId}`,
    { method: "DELETE", credentials: "include" }
  );
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(extractApiErrorMessage(err, "取消關注失敗"));
  }
};

export const checkFollowStatus = async (
  targetType: "user" | "practice",
  targetId: string
): Promise<{ data: { isFollowing: boolean } }> => {
  const res = await unauthorizedHandler.wrapFetch(
    `${getBaseUrl()}/api/v1/follows/check/${targetType}/${targetId}`,
    { credentials: "include" }
  );
  if (!res.ok) throw new Error("查詢關注狀態失敗");
  return res.json();
};

export const getFollowers = async (params: IGetFollowParams): Promise<IPaginatedFollowers> => {
  const query = new URLSearchParams();
  if (params.page) query.set("page", String(params.page));
  if (params.limit) query.set("limit", String(params.limit));
  const res = await unauthorizedHandler.wrapFetch(
    `${getBaseUrl()}/api/v1/users/${params.userId}/followers?${query}`,
    { credentials: "include" }
  );
  if (!res.ok) throw new Error("載入關注者失敗");
  return res.json();
};

export const getFollowing = async (params: IGetFollowParams): Promise<IPaginatedFollowing> => {
  const query = new URLSearchParams();
  if (params.page) query.set("page", String(params.page));
  if (params.limit) query.set("limit", String(params.limit));
  const res = await unauthorizedHandler.wrapFetch(
    `${getBaseUrl()}/api/v1/users/${params.userId}/following?${query}`,
    { credentials: "include" }
  );
  if (!res.ok) throw new Error("載入關注中失敗");
  return res.json();
};
